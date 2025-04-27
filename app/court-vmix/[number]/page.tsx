"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { getMatchByCourtNumber } from "@/lib/court-utils"
import { getTennisPointName } from "@/lib/tennis-utils"
import { logEvent } from "@/lib/error-logger"
import { subscribeToMatchUpdates } from "@/lib/match-storage"

// Функция для преобразования параметра цвета из URL
const parseColorParam = (param, defaultColor) => {
  if (!param) return defaultColor
  // Если параметр не содержит #, добавляем его
  return param.startsWith("#") ? param : `#${param}`
}

// Функция для определения game point
const isGamePoint = (match) => {
  if (!match || !match.score || !match.score.currentSet) return false

  const currentSet = match.score.currentSet
  const currentGame = currentSet.currentGame

  if (!currentGame) return false

  // Для тай-брейка
  if (currentSet.isTiebreak) {
    // В тай-брейке обычно нужно набрать 7 очков с разницей в 2 очка
    if (currentGame.teamA >= 6 && currentGame.teamA >= currentGame.teamB + 1) {
      return "teamA"
    }
    if (currentGame.teamB >= 6 && currentGame.teamB >= currentGame.teamA + 1) {
      return "teamB"
    }
    return false
  }

  // Для обычного гейма
  // Если команда A ведет 40-0, 40-15, 40-30
  if (currentGame.teamA === 3 && currentGame.teamB < 3) {
    return "teamA"
  }
  // Если команда A ведет Ad
  if (currentGame.teamA === 4 && currentGame.teamB === 3) {
    return "teamA"
  }

  // Если команда B ведет 0-40, 15-40, 30-40
  if (currentGame.teamB === 3 && currentGame.teamA < 3) {
    return "teamB"
  }
  // Если команда B ведет Ad
  if (currentGame.teamB === 4 && currentGame.teamA === 3) {
    return "teamB"
  }

  return false
}

// Функция для определения set point
const isSetPoint = (match) => {
  if (!match || !match.score || !match.score.currentSet) return false

  const currentSet = match.score.currentSet
  const gamePoint = isGamePoint(match)

  if (!gamePoint) return false

  // Проверяем, может ли текущий гейм быть решающим для сета
  // В теннисе/падел-теннисе обычно нужно выиграть 6 геймов с разницей в 2 гейма
  const teamAGames = currentSet.teamA
  const teamBGames = currentSet.teamB

  // Для команды A
  if (gamePoint === "teamA") {
    // Если команда A ведет 5-x и выиграет этот гейм, то счет станет 6-x
    if (teamAGames === 5 && teamBGames <= 4) {
      return "teamA"
    }
    // Если команда A ведет 6-5 и выиграет этот гейм, то счет станет 7-5
    if (teamAGames === 6 && teamBGames === 5) {
      return "teamA"
    }
    // Другие случаи, когда команда A может выиграть сет
    if (teamAGames >= 6 && teamAGames === teamBGames) {
      return "teamA"
    }
  }

  // Для команды B
  if (gamePoint === "teamB") {
    // Если команда B ведет 5-x и выиграет этот гейм, то счет станет 6-x
    if (teamBGames === 5 && teamAGames <= 4) {
      return "teamB"
    }
    // Если команда B ведет 6-5 и выиграет этот гейм, то счет станет 7-5
    if (teamBGames === 6 && teamAGames === 5) {
      return "teamB"
    }
    // Другие случаи, когда команда B может выиграть сет
    if (teamBGames >= 6 && teamBGames === teamAGames) {
      return "teamB"
    }
  }

  return false
}

// Функция для определения match point
const isMatchPoint = (match) => {
  if (!match || !match.score || !match.score.currentSet) return false

  // Определяем, сколько сетов нужно для победы (обычно 2 из 3)
  const setsToWin = match.setsToWin || 2

  // Получаем текущий счет по сетам
  const teamASets = match.score.sets ? match.score.sets.filter((set) => set.teamA > set.teamB).length : 0
  const teamBSets = match.score.sets ? match.score.sets.filter((set) => set.teamB > set.teamA).length : 0

  // Проверяем, является ли текущий гейм сет-поинтом
  const setPoint = isSetPoint(match)

  // Если нет сет-поинта, то не может быть и матч-поинта
  if (!setPoint) return false

  // Для команды A
  if (setPoint === "teamA" && teamASets === setsToWin - 1) {
    return "teamA"
  }

  // Для команды B
  if (setPoint === "teamB" && teamBSets === setsToWin - 1) {
    return "teamB"
  }

  return false
}

// Функция для проверки, является ли текущий гейм тай-брейком
const isTiebreak = (match) => {
  if (!match || !match.score || !match.score.currentSet) return false
  return match.score.currentSet.isTiebreak
}

// Функция для определения важного момента матча (game point, set point, match point)
const getImportantPoint = (match) => {
  // Сначала проверяем match point (самый приоритетный)
  const matchPoint = isMatchPoint(match)
  if (matchPoint) {
    return { type: "MATCH POINT", team: matchPoint }
  }

  // Затем проверяем set point
  const setPoint = isSetPoint(match)
  if (setPoint) {
    return { type: "SET POINT", team: setPoint }
  }

  // Наконец, проверяем game point
  const gamePoint = isGamePoint(match)
  if (gamePoint) {
    return { type: "GAME POINT", team: gamePoint }
  }

  // Проверяем тай-брейк
  if (isTiebreak(match)) {
    return { type: "TIE-BREAK", team: null }
  }

  return null
}

export default function CourtVmixPage({ params }) {
  const [match, setMatch] = useState(null)
  const [prevMatch, setPrevMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const searchParams = useSearchParams()
  const [jsonOutput, setJsonOutput] = useState("")
  const courtNumber = Number.parseInt(params.number)
  const animationTimeoutRef = useRef(null)

  // Состояния для анимаций
  const [animatingElements, setAnimatingElements] = useState({
    teamA: {
      sets: Array(5).fill(false),
      currentSet: false,
      gameScore: false,
    },
    teamB: {
      sets: Array(5).fill(false),
      currentSet: false,
      gameScore: false,
    },
  })

  // Параметры отображения из URL
  const theme = searchParams.get("theme") || "default"
  const showNames = searchParams.get("showNames") !== "false"
  const showPoints = searchParams.get("showPoints") !== "false"
  const showSets = searchParams.get("showSets") !== "false"
  const showServer = searchParams.get("showServer") !== "false"
  const fontSize = searchParams.get("fontSize") || "normal"
  const bgOpacity = Number.parseFloat(searchParams.get("bgOpacity") || "0.5")
  const textColor = parseColorParam(searchParams.get("textColor"), "#ffffff")
  const accentColor = parseColorParam(searchParams.get("accentColor"), "#fbbf24")
  const outputFormat = searchParams.get("format") || "html"

  // Цвета с правильной обработкой параметров
  const namesBgColor = parseColorParam(searchParams.get("namesBgColor"), "#0369a1")
  const pointsBgColor = parseColorParam(searchParams.get("pointsBgColor"), "#0369a1")
  const setsBgColor = parseColorParam(searchParams.get("setsBgColor"), "#ffffff")
  const setsTextColor = parseColorParam(searchParams.get("setsTextColor"), "#000000")

  // Параметры градиентов
  const namesGradient = searchParams.get("namesGradient") === "true"
  const namesGradientFrom = parseColorParam(searchParams.get("namesGradientFrom"), "#0369a1")
  const namesGradientTo = parseColorParam(searchParams.get("namesGradientTo"), "#0284c7")
  const pointsGradient = searchParams.get("pointsGradient") === "true"
  const pointsGradientFrom = parseColorParam(searchParams.get("pointsGradientFrom"), "#0369a1")
  const pointsGradientTo = parseColorParam(searchParams.get("pointsGradientTo"), "#0284c7")
  // Новые параметры для градиента счета в сетах
  const setsGradient = searchParams.get("setsGradient") === "true"
  const setsGradientFrom = parseColorParam(searchParams.get("setsGradientFrom"), "#ffffff")
  const setsGradientTo = parseColorParam(searchParams.get("setsGradientTo"), "#f0f0f0")

  // Параметры анимации
  const animationType = searchParams.get("animationType") || "fade"
  const animationDuration = Number.parseInt(searchParams.get("animationDuration") || "500")

  // Загрузка сохраненных настроек из localStorage
  useEffect(() => {
    // Проверяем, есть ли параметры в URL
    const hasUrlParams = searchParams.toString() !== ""

    // Если в URL нет параметров, пробуем загрузить из localStorage
    if (!hasUrlParams && typeof window !== "undefined") {
      try {
        const savedSettings = localStorage.getItem("vmix_settings")
        if (savedSettings) {
          const settings = JSON.parse(savedSettings)

          // Обновляем URL с сохраненными настройками
          const newParams = new URLSearchParams()
          if (settings.theme) newParams.set("theme", settings.theme)
          if (settings.showNames !== undefined) newParams.set("showNames", settings.showNames.toString())
          if (settings.showPoints !== undefined) newParams.set("showPoints", settings.showPoints.toString())
          if (settings.showSets !== undefined) newParams.set("showSets", settings.showSets.toString())
          if (settings.showServer !== undefined) newParams.set("showServer", settings.showServer.toString())
          if (settings.fontSize) newParams.set("fontSize", settings.fontSize)
          if (settings.bgOpacity !== undefined) newParams.set("bgOpacity", settings.bgOpacity.toString())
          if (settings.textColor) newParams.set("textColor", settings.textColor.replace("#", ""))
          if (settings.accentColor) newParams.set("accentColor", settings.accentColor.replace("#", ""))
          if (settings.namesBgColor) newParams.set("namesBgColor", settings.namesBgColor.replace("#", ""))
          if (settings.pointsBgColor) newParams.set("pointsBgColor", settings.pointsBgColor.replace("#", ""))
          if (settings.setsBgColor) newParams.set("setsBgColor", settings.setsBgColor.replace("#", ""))
          if (settings.setsTextColor) newParams.set("setsTextColor", settings.setsTextColor.replace("#", ""))
          if (settings.namesGradient !== undefined) newParams.set("namesGradient", settings.namesGradient.toString())
          if (settings.namesGradientFrom)
            newParams.set("namesGradientFrom", settings.namesGradientFrom.replace("#", ""))
          if (settings.namesGradientTo) newParams.set("namesGradientTo", settings.namesGradientTo.replace("#", ""))
          if (settings.pointsGradient !== undefined) newParams.set("pointsGradient", settings.pointsGradient.toString())
          if (settings.pointsGradientFrom)
            newParams.set("pointsGradientFrom", settings.pointsGradientFrom.replace("#", ""))
          if (settings.pointsGradientTo) newParams.set("pointsGradientTo", settings.pointsGradientTo.replace("#", ""))
          if (settings.setsGradient !== undefined) newParams.set("setsGradient", settings.setsGradient.toString())
          if (settings.setsGradientFrom) newParams.set("setsGradientFrom", settings.setsGradientFrom.replace("#", ""))
          if (settings.setsGradientTo) newParams.set("setsGradientTo", settings.setsGradientTo.replace("#", ""))
          if (settings.animationType) newParams.set("animationType", settings.animationType)
          if (settings.animationDuration !== undefined)
            newParams.set("animationDuration", settings.animationDuration.toString())

          const newUrl = `${window.location.pathname}?${newParams.toString()}`
          window.history.replaceState({}, "", newUrl)
        }
      } catch (error) {
        console.error("Ошибка при загрузке сохраненных настроек:", error)
      }
    }
  }, [searchParams])

  // Для отладки - выводим параметры в консоль
  useEffect(() => {
    console.log("Параметры отображения корта:", {
      theme,
      namesBgColor,
      pointsBgColor,
      setsBgColor,
      setsTextColor,
      namesGradient,
      namesGradientFrom,
      namesGradientTo,
      pointsGradient,
      pointsGradientFrom,
      pointsGradientTo,
      setsGradient,
      setsGradientFrom,
      setsGradientTo,
    })
  }, [
    theme,
    namesBgColor,
    pointsBgColor,
    setsBgColor,
    setsTextColor,
    namesGradient,
    namesGradientFrom,
    namesGradientTo,
    pointsGradient,
    pointsGradientFrom,
    pointsGradientTo,
    setsGradient,
    setsGradientFrom,
    setsGradientTo,
  ])

  useEffect(() => {
    const loadMatch = async () => {
      try {
        if (isNaN(courtNumber) || courtNumber < 1 || courtNumber > 10) {
          setError("Некорректный номер корта")
          setLoading(false)
          logEvent("error", "vMix страница корта: некорректный номер корта", "court-vmix-page")
          return
        }

        logEvent("info", `vMix страница корта: начало загрузки матча на корте ${courtNumber}`, "court-vmix-page")

        // Получаем матч по номеру корта
        const matchData = await getMatchByCourtNumber(courtNumber)

        if (matchData) {
          setMatch(matchData)
          setPrevMatch(matchData) // Инициализируем prevMatch

          // Подготавливаем JSON для vMix
          if (outputFormat === "json") {
            const vmixData = {
              id: matchData.id,
              courtNumber: courtNumber,
              teamA: {
                name: matchData.teamA.players.map((p) => p.name).join(" / "),
                score: matchData.score.teamA,
                currentGameScore: matchData.score.currentSet
                  ? matchData.score.currentSet.isTiebreak
                    ? matchData.score.currentSet.currentGame.teamA
                    : getTennisPointName(matchData.score.currentSet.currentGame.teamA)
                  : "0",
                sets: matchData.score.sets ? matchData.score.sets.map((set) => set.teamA) : [],
                currentSet: matchData.score.currentSet ? matchData.score.currentSet.teamA : 0,
                serving: matchData.currentServer && matchData.currentServer.team === "teamA",
              },
              teamB: {
                name: matchData.teamB.players.map((p) => p.name).join(" / "),
                score: matchData.score.teamB,
                currentGameScore: matchData.score.currentSet
                  ? matchData.score.currentSet.isTiebreak
                    ? matchData.score.currentSet.currentGame.teamB
                    : getTennisPointName(matchData.score.currentSet.currentGame.teamB)
                  : "0",
                sets: matchData.score.sets ? matchData.score.sets.map((set) => set.teamB) : [],
                currentSet: matchData.score.currentSet ? matchData.score.currentSet.teamB : 0,
                serving: matchData.currentServer && matchData.currentServer.team === "teamB",
              },
              isTiebreak: matchData.score.currentSet ? matchData.score.currentSet.isTiebreak : false,
              isCompleted: matchData.isCompleted || false,
              winner: matchData.winner || null,
              timestamp: new Date().toISOString(),
            }
            setJsonOutput(JSON.stringify(vmixData, null, 2))
          }

          setError("")
          logEvent("info", `vMix страница корта загружена: ${courtNumber}`, "court-vmix-page")

          // Подписываемся на обновления матча
          const unsubscribe = subscribeToMatchUpdates(matchData.id, (updatedMatch) => {
            if (updatedMatch) {
              // Сохраняем предыдущее состояние матча перед обновлением
              setPrevMatch(match)
              setMatch(updatedMatch)

              // Обновляем JSON при получении обновлений
              if (outputFormat === "json") {
                const vmixData = {
                  id: updatedMatch.id,
                  courtNumber: courtNumber,
                  teamA: {
                    name: updatedMatch.teamA.players.map((p) => p.name).join(" / "),
                    score: updatedMatch.score.teamA,
                    currentGameScore: updatedMatch.score.currentSet
                      ? updatedMatch.score.currentSet.isTiebreak
                        ? updatedMatch.score.currentSet.currentGame.teamA
                        : getTennisPointName(updatedMatch.score.currentSet.currentGame.teamA)
                      : "0",
                    sets: updatedMatch.score.sets ? updatedMatch.score.sets.map((set) => set.teamA) : [],
                    currentSet: updatedMatch.score.currentSet ? updatedMatch.score.currentSet.teamA : 0,
                    serving: updatedMatch.currentServer && updatedMatch.currentServer.team === "teamA",
                  },
                  teamB: {
                    name: updatedMatch.teamB.players.map((p) => p.name).join(" / "),
                    score: updatedMatch.score.teamB,
                    currentGameScore: updatedMatch.score.currentSet
                      ? updatedMatch.score.currentSet.isTiebreak
                        ? updatedMatch.score.currentSet.currentGame.teamB
                        : getTennisPointName(updatedMatch.score.currentSet.currentGame.teamB)
                      : "0",
                    sets: updatedMatch.score.sets ? updatedMatch.score.sets.map((set) => set.teamB) : [],
                    currentSet: updatedMatch.score.currentSet ? updatedMatch.score.currentSet.teamB : 0,
                    serving: updatedMatch.currentServer && updatedMatch.currentServer.team === "teamB",
                  },
                  isTiebreak: updatedMatch.score.currentSet ? updatedMatch.score.currentSet.isTiebreak : false,
                  isCompleted: updatedMatch.isCompleted || false,
                  winner: updatedMatch.winner || null,
                  timestamp: new Date().toISOString(),
                }
                setJsonOutput(JSON.stringify(vmixData, null, 2))
              }

              setError("")
            } else {
              setError("Матч не найден или был удален")
            }
          })

          return () => {
            if (unsubscribe) {
              unsubscribe()
            }
            // Очищаем таймаут при размонтировании компонента
            if (animationTimeoutRef.current) {
              clearTimeout(animationTimeoutRef.current)
            }
          }
        } else {
          setError(`На корте ${courtNumber} нет активных матчей`)
          logEvent("warn", `vMix страница корта: на корте ${courtNumber} нет активных матчей`, "court-vmix-page")
        }
      } catch (err) {
        setError("Ошибка загрузки матча")
        logEvent("error", "Ошибка загрузки матча для vMix корта", "court-vmix-page", err)
      } finally {
        setLoading(false)
      }
    }

    loadMatch()
  }, [courtNumber, outputFormat])

  // Эффект для отслеживания изменений счета и запуска анимаций
  useEffect(() => {
    if (!match || !prevMatch) return

    const newAnimatingElements = {
      teamA: {
        sets: Array(5).fill(false),
        currentSet: false,
        gameScore: false,
      },
      teamB: {
        sets: Array(5).fill(false),
        currentSet: false,
        gameScore: false,
      },
    }

    // Проверяем изменения в счете сетов
    if (match.score.sets && prevMatch.score.sets) {
      match.score.sets.forEach((set, idx) => {
        if (idx < prevMatch.score.sets.length) {
          if (set.teamA !== prevMatch.score.sets[idx].teamA) {
            newAnimatingElements.teamA.sets[idx] = true
          }
          if (set.teamB !== prevMatch.score.sets[idx].teamB) {
            newAnimatingElements.teamB.sets[idx] = true
          }
        } else {
          // Новый сет
          newAnimatingElements.teamA.sets[idx] = true
          newAnimatingElements.teamB.sets[idx] = true
        }
      })
    }

    // Проверяем изменения в текущем сете
    if (match.score.currentSet && prevMatch.score.currentSet) {
      if (match.score.currentSet.teamA !== prevMatch.score.currentSet.teamA) {
        newAnimatingElements.teamA.currentSet = true
      }
      if (match.score.currentSet.teamB !== prevMatch.score.currentSet.teamB) {
        newAnimatingElements.teamB.currentSet = true
      }
    }

    // Проверяем изменения в текущем гейме
    if (match.score.currentSet && prevMatch.score.currentSet) {
      const currentGameA = match.score.currentSet.currentGame?.teamA
      const prevGameA = prevMatch.score.currentSet.currentGame?.teamA
      const currentGameB = match.score.currentSet.currentGame?.teamB
      const prevGameB = prevMatch.score.currentSet.currentGame?.teamB

      if (currentGameA !== prevGameA) {
        newAnimatingElements.teamA.gameScore = true
      }
      if (currentGameB !== prevGameB) {
        newAnimatingElements.teamB.gameScore = true
      }
    }

    // Устанавливаем анимирующиеся элементы
    setAnimatingElements(newAnimatingElements)

    // Сбрасываем анимации через заданное время
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    animationTimeoutRef.current = setTimeout(() => {
      setAnimatingElements({
        teamA: {
          sets: Array(5).fill(false),
          currentSet: false,
          gameScore: false,
        },
        teamB: {
          sets: Array(5).fill(false),
          currentSet: false,
          gameScore: false,
        },
      })
    }, animationDuration + 100) // Добавляем небольшой запас времени
  }, [match, prevMatch, animationDuration])

  // Получаем текущий счет в виде строки (0, 15, 30, 40, Ad)
  const getCurrentGameScore = (team) => {
    if (!match || !match.score || !match.score.currentSet) return ""

    const currentSet = match.score.currentSet

    if (currentSet.isTiebreak) {
      return currentSet.currentGame[team]
    }

    return getTennisPointName(currentSet.currentGame[team])
  }

  // Определяем, кто подает
  const isServing = (team, playerIndex) => {
    if (!match || !match.currentServer) return false
    return match.currentServer.team === team && match.currentServer.playerIndex === playerIndex
  }

  // Форматируем счет сета с верхним индексом для тай-брейка
  const formatSetScore = (score, tiebreakScore = null) => {
    if (tiebreakScore !== null) {
      return (
        <span>
          {score}
          <sup>{tiebreakScore}</sup>
        </span>
      )
    }
    return score
  }

  // Стили в зависимости от темы и параметров
  const getStyles = () => {
    const fontSizeMap = {
      small: {
        container: "text-sm",
        score: "text-xl",
        point: "text-lg",
      },
      normal: {
        container: "text-base",
        score: "text-2xl",
        point: "text-xl",
      },
      large: {
        container: "text-lg",
        score: "text-3xl",
        point: "text-2xl",
      },
      xlarge: {
        container: "text-xl",
        score: "text-4xl",
        point: "text-3xl",
      },
    }

    const sizes = fontSizeMap[fontSize] || fontSizeMap.normal

    const themeStyles = {
      default: {
        bg: `rgba(0, 0, 0, ${bgOpacity})`,
        text: textColor,
        accent: accentColor,
      },
      light: {
        bg: `rgba(255, 255, 255, ${bgOpacity})`,
        text: "#000000",
        accent: "#2563eb",
      },
      dark: {
        bg: `rgba(0, 0, 0, ${bgOpacity})`,
        text: "#ffffff",
        accent: "#f59e0b",
      },
      transparent: {
        bg: "transparent",
        text: textColor,
        accent: accentColor,
      },
    }

    const currentTheme = themeStyles[theme] || themeStyles.default

    return {
      container: `${sizes.container}`,
      score: `${sizes.score} font-bold`,
      point: `${sizes.point} font-bold`,
      bg: currentTheme.bg,
      text: currentTheme.text,
      accent: currentTheme.accent,
    }
  }

  const styles = getStyles()

  // Получаем стили для анимации
  const getAnimationStyle = (isAnimating) => {
    if (!isAnimating) return {}

    const animationStyles = {
      fade: {
        animation: `fade-animation ${animationDuration}ms ease-in-out`,
      },
      zoom: {
        animation: `zoom-animation ${animationDuration}ms ease-in-out`,
      },
      pulse: {
        animation: `pulse-animation ${animationDuration}ms ease-in-out`,
      },
    }

    return animationStyles[animationType] || animationStyles.fade
  }

  // Получаем стиль градиента для фона
  const getGradientStyle = (useGradient, fromColor, toColor) => {
    if (!useGradient) return {}
    return {
      background: `linear-gradient(to bottom, ${fromColor}, ${toColor})`,
    }
  }

  if (loading) {
    return (
      <div
        style={{
          background: "transparent",
          color: "#ffffff",
          padding: "10px",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>
          <div style={{ marginBottom: "10px" }}>Загрузка данных матча на корте {courtNumber}...</div>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid rgba(255,255,255,0.3)",
              borderTop: "4px solid #ffffff",
              borderRadius: "50%",
              margin: "0 auto",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  if (error) {
    return <div style={{ color: "red", padding: "20px", background: "transparent" }}>Ошибка: {error}</div>
  }

  if (!match) return null

  // Если запрошен JSON формат, возвращаем только JSON
  if (outputFormat === "json") {
    return (
      <pre
        style={{
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          padding: "20px",
          background: "#f5f5f5",
          color: "#333",
          fontFamily: "monospace",
          fontSize: "14px",
          borderRadius: "4px",
          overflow: "auto",
        }}
      >
        {jsonOutput}
      </pre>
    )
  }

  // Получаем данные о тай-брейках
  const getTiebreakScores = () => {
    if (!match.score.sets || match.score.sets.length === 0) return {}

    const tiebreakScores = {}
    match.score.sets.forEach((set, index) => {
      if (set.tiebreak) {
        tiebreakScores[index] = {
          teamA: set.tiebreak.teamA,
          teamB: set.tiebreak.teamB,
        }
      }
    })

    return tiebreakScores
  }

  const tiebreakScores = getTiebreakScores()

  // Получаем информацию о важном моменте матча
  const importantPoint = getImportantPoint(match)

  // Для отладки - выводим информацию о важных моментах
  console.log("Важный момент матча:", importantPoint)
  console.log("Game Point:", isGamePoint(match))
  console.log("Set Point:", isSetPoint(match))
  console.log("Match Point:", isMatchPoint(match))
  console.log("Tie-break:", isTiebreak(match))

  // Иначе возвращаем HTML интерфейс в стиле скриншота
  return (
    <>
      {/* Добавляем стиль для всей страницы */}
      <style jsx global>{`
        html, body {
          background-color: transparent !important;
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
        }
      `}</style>

      <div
        style={{
          background: "transparent",
          color: styles.text,
          padding: "0",
          fontFamily: "Arial, sans-serif",
          width: "auto",
          height: "auto",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
        className={styles.container}
      >
        {/* CSS для анимаций */}
        <style>{`
          @keyframes fade-animation {
            0% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 1; }
          }
          @keyframes zoom-animation {
            0% { transform: scale(1.3); opacity: 0; }
            50% { transform: scale(1.1); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes pulse-animation {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
        `}</style>

        {/* Контейнер для счета */}
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          {/* Строка для первого игрока/команды */}
          <div style={{ display: "flex", width: "100%", marginBottom: "1px" }}>
            {/* Имя первого игрока/команды */}
            <div
              style={{
                color: theme === "transparent" ? textColor : "white",
                padding: "10px",
                flex: "0 0 auto",
                minWidth: "200px",
                display: "flex",
                alignItems: "center",
                ...(theme === "transparent"
                  ? { background: "transparent" }
                  : namesGradient
                    ? getGradientStyle(true, namesGradientFrom, namesGradientTo)
                    : { background: namesBgColor }),
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ flex: 1 }}>{match.teamA.players[0]?.name}</span>
                  {showServer && isServing("teamA", 0) && (
                    <span
                      style={{
                        color: accentColor,
                        marginLeft: "5px",
                        fontSize: "2em", // Увеличиваем размер в 3 раза
                        lineHeight: 1,
                      }}
                    >
                      •
                    </span>
                  )}
                </div>
                {match.teamA.players.length > 1 && (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ flex: 1 }}>{match.teamA.players[1]?.name}</span>
                    {showServer && isServing("teamA", 1) && (
                      <span
                        style={{
                          color: accentColor,
                          marginLeft: "5px",
                          fontSize: "2em", // Увеличиваем размер в 3 раза
                          lineHeight: 1,
                        }}
                      >
                        •
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Счет сетов для первого игрока */}
            {showSets && match.score.sets && (
              <>
                {match.score.sets.map((set, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...(theme === "transparent"
                        ? { background: "transparent" }
                        : setsGradient
                          ? getGradientStyle(true, setsGradientFrom, setsGradientTo)
                          : { background: setsBgColor }),
                      color: theme === "transparent" ? textColor : setsTextColor,
                      padding: "10px",
                      flex: "0 0 auto",
                      minWidth: "40px",
                      textAlign: "center",
                      borderLeft: theme === "transparent" ? "none" : "1px solid #e5e5e5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      ...getAnimationStyle(animatingElements.teamA.sets[idx]),
                    }}
                  >
                    {tiebreakScores[idx] ? formatSetScore(set.teamA, tiebreakScores[idx].teamA) : set.teamA}
                  </div>
                ))}

                {/* Текущий сет */}
                {match.score.currentSet && (
                  <div
                    style={{
                      ...(theme === "transparent"
                        ? { background: "transparent" }
                        : setsGradient
                          ? getGradientStyle(true, setsGradientFrom, setsGradientTo)
                          : { background: setsBgColor }),
                      color: theme === "transparent" ? textColor : setsTextColor,
                      padding: "10px",
                      flex: "0 0 auto",
                      minWidth: "40px",
                      textAlign: "center",
                      borderLeft: theme === "transparent" ? "none" : "1px solid #e5e5e5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      ...getAnimationStyle(animatingElements.teamA.currentSet),
                    }}
                  >
                    {match.score.currentSet.teamA}
                  </div>
                )}
              </>
            )}

            {/* Текущий счет в гейме для первого игрока */}
            {showPoints && match.score.currentSet && (
              <div
                style={{
                  color: theme === "transparent" ? textColor : "white",
                  padding: "10px",
                  flex: "0 0 auto",
                  minWidth: "60px",
                  textAlign: "center",
                  borderLeft: theme === "transparent" ? "none" : "1px solid #e5e5e5",
                  fontSize: "1.25em",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ...(theme === "transparent"
                    ? { background: "transparent" }
                    : pointsGradient
                      ? getGradientStyle(true, pointsGradientFrom, pointsGradientTo)
                      : { background: pointsBgColor }),
                  ...getAnimationStyle(animatingElements.teamA.gameScore),
                }}
              >
                {getCurrentGameScore("teamA")}
              </div>
            )}
          </div>

          {/* Строка для второго игрока/команды */}
          <div style={{ display: "flex", width: "100%" }}>
            {/* Имя второго игрока/команды */}
            <div
              style={{
                color: theme === "transparent" ? textColor : "white",
                padding: "10px",
                flex: "0 0 auto",
                minWidth: "200px",
                display: "flex",
                alignItems: "center",
                ...(theme === "transparent"
                  ? { background: "transparent" }
                  : namesGradient
                    ? getGradientStyle(true, namesGradientFrom, namesGradientTo)
                    : { background: namesBgColor }),
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ flex: 1 }}>{match.teamB.players[0]?.name}</span>
                  {showServer && isServing("teamB", 0) && (
                    <span
                      style={{
                        color: accentColor,
                        marginLeft: "5px",
                        fontSize: "2em", // Увеличиваем размер в 3 раза
                        lineHeight: 1,
                      }}
                    >
                      •
                    </span>
                  )}
                </div>
                {match.teamB.players.length > 1 && (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ flex: 1 }}>{match.teamB.players[1]?.name}</span>
                    {showServer && isServing("teamB", 1) && (
                      <span
                        style={{
                          color: accentColor,
                          marginLeft: "5px",
                          fontSize: "2em", // Увеличиваем размер в 3 раза
                          lineHeight: 1,
                        }}
                      >
                        •
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Счет сетов для второго игрока */}
            {showSets && match.score.sets && (
              <>
                {match.score.sets.map((set, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...(theme === "transparent"
                        ? { background: "transparent" }
                        : setsGradient
                          ? getGradientStyle(true, setsGradientFrom, setsGradientTo)
                          : { background: setsBgColor }),
                      color: theme === "transparent" ? textColor : setsTextColor,
                      padding: "10px",
                      flex: "0 0 auto",
                      minWidth: "40px",
                      textAlign: "center",
                      borderLeft: theme === "transparent" ? "none" : "1px solid #e5e5e5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      ...getAnimationStyle(animatingElements.teamB.sets[idx]),
                    }}
                  >
                    {tiebreakScores[idx] ? formatSetScore(set.teamB, tiebreakScores[idx].teamB) : set.teamB}
                  </div>
                ))}

                {/* Текущий сет */}
                {match.score.currentSet && (
                  <div
                    style={{
                      ...(theme === "transparent"
                        ? { background: "transparent" }
                        : setsGradient
                          ? getGradientStyle(true, setsGradientFrom, setsGradientTo)
                          : { background: setsBgColor }),
                      color: theme === "transparent" ? textColor : setsTextColor,
                      padding: "10px",
                      flex: "0 0 auto",
                      minWidth: "40px",
                      textAlign: "center",
                      borderLeft: theme === "transparent" ? "none" : "1px solid #e5e5e5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      ...getAnimationStyle(animatingElements.teamB.currentSet),
                    }}
                  >
                    {match.score.currentSet.teamB}
                  </div>
                )}
              </>
            )}

            {/* Текущий счет в гейме для второго игрока */}
            {showPoints && match.score.currentSet && (
              <div
                style={{
                  color: theme === "transparent" ? textColor : "white",
                  padding: "10px",
                  flex: "0 0 auto",
                  minWidth: "60px",
                  textAlign: "center",
                  borderLeft: theme === "transparent" ? "none" : "1px solid #e5e5e5",
                  fontSize: "1.25em",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ...(theme === "transparent"
                    ? { background: "transparent" }
                    : pointsGradient
                      ? getGradientStyle(true, pointsGradientFrom, pointsGradientTo)
                      : { background: pointsBgColor }),
                  ...getAnimationStyle(animatingElements.teamB.gameScore),
                }}
              >
                {getCurrentGameScore("teamB")}
              </div>
            )}
          </div>

          {/* Индикатор особой ситуации (game point, set point, match point или tie-break) */}
          {importantPoint && (
            <div
              style={{
                color: theme === "transparent" ? accentColor : "white",
                padding: "5px 10px",
                width: "100%",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "1.1em",
                ...(theme === "transparent"
                  ? { background: "transparent" }
                  : { background: accentColor === "#fbbf24" ? "#7c2d12" : "#991b1b" }),
              }}
            >
              {importantPoint.type}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
