"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { getMatchByCourtNumber } from "@/lib/court-utils"
import { getTennisPointName } from "@/lib/tennis-utils"
import { logEvent } from "@/lib/error-logger"
import { subscribeToMatchUpdates } from "@/lib/match-storage"
import { Maximize2, Minimize2, ArrowLeft, Clock } from "lucide-react"
import { translations, type Language } from "@/lib/translations"

type FullscreenScoreboardParams = {
  params: {
    number: string
  }
}

// Функция для преобразования параметра цвета из URL
const parseColorParam = (param, defaultColor) => {
  if (!param) return defaultColor
  // Если параметр не содержит #, добавляем его
  return param.startsWith("#") ? param : `#${param}`
}

// Получаем страну игрока
const getPlayerCountryDisplay = (team, playerIndex, matchData) => {
  if (!matchData) return " "
  const player = matchData[team]?.players[playerIndex]
  return player?.country || " "
}

export default function FullscreenScoreboard({ params }: FullscreenScoreboardParams) {
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isCompletedMatch, setIsCompletedMatch] = useState(false)
  const searchParams = useSearchParams()
  const containerRef = useRef(null)
  const courtNumber = Number.parseInt(params.number)

  // Параметры отображения из URL
  const theme = searchParams.get("theme") || "default"
  const showNames = searchParams.get("showNames") !== "false"
  const showPoints = searchParams.get("showPoints") !== "false"
  const showSets = searchParams.get("showSets") !== "false"
  const showServer = searchParams.get("showServer") !== "false"
  const showCountry = searchParams.get("showCountry") === "true"
  const textColor = parseColorParam(searchParams.get("textColor"), "#ffffff")
  const accentColor = parseColorParam(searchParams.get("accentColor"), "#a4fb23")
  const showDebug = searchParams.get("debug") === "true"

  // Цвета с правильной обработкой параметров
  const namesBgColor = parseColorParam(searchParams.get("namesBgColor"), "#0369a1")
  const countryBgColor = parseColorParam(searchParams.get("countryBgColor"), "#0369a1")
  const pointsBgColor = parseColorParam(searchParams.get("pointsBgColor"), "#0369a1")
  const setsBgColor = parseColorParam(searchParams.get("setsBgColor"), "#ffffff")
  const setsTextColor = parseColorParam(searchParams.get("setsTextColor"), "#000000")
  const serveBgColor = parseColorParam(searchParams.get("serveBgColor"), "#000000")

  // Параметры градиентов
  const namesGradient = searchParams.get("namesGradient") === "true"
  const namesGradientFrom = parseColorParam(searchParams.get("namesGradientFrom"), "#0369a1")
  const namesGradientTo = parseColorParam(searchParams.get("namesGradientTo"), "#0284c7")
  const countryGradient = searchParams.get("countryGradient") === "true"
  const countryGradientFrom = parseColorParam(searchParams.get("countryGradientFrom"), "#0369a1")
  const countryGradientTo = parseColorParam(searchParams.get("countryGradientTo"), "#0284c7")
  const pointsGradient = searchParams.get("pointsGradient") === "true"
  const pointsGradientFrom = parseColorParam(searchParams.get("pointsGradientFrom"), "#0369a1")
  const pointsGradientTo = parseColorParam(searchParams.get("pointsGradientTo"), "#0284c7")
  const setsGradient = searchParams.get("setsGradient") === "true"
  const setsGradientFrom = parseColorParam(searchParams.get("setsGradientFrom"), "#ffffff")
  const setsGradientTo = parseColorParam(searchParams.get("setsGradientTo"), "#f0f0f0")
  const serveGradient = searchParams.get("serveGradient") === "true"
  const serveGradientFrom = parseColorParam(searchParams.get("serveGradientFrom"), "#000000")
  const serveGradientTo = parseColorParam(searchParams.get("serveGradientTo"), "#1e1e1e")

  // Параметры для индикатора важных событий
  const indicatorBgColor = parseColorParam(searchParams.get("indicatorBgColor"), "#7c2d12")
  const indicatorTextColor = parseColorParam(searchParams.get("indicatorTextColor"), "#ffffff")
  const indicatorGradient = searchParams.get("indicatorGradient") === "true"
  const indicatorGradientFrom = parseColorParam(searchParams.get("indicatorGradientFrom"), "#7c2d12")
  const indicatorGradientTo = parseColorParam(searchParams.get("indicatorGradientTo"), "#991b1b")

  // Заменить эту строку:
  // const language = (searchParams.get("language") as Language) || "ru"
  // На следующую, которая будет проверять параметр URL, а затем использовать localStorage:
  const [language, setLanguage] = useState<Language>("ru")

  useEffect(() => {
    // Сначала проверяем URL параметр
    const urlLang = searchParams.get("language") as Language
    if (urlLang && Object.keys(translations).includes(urlLang)) {
      setLanguage(urlLang)
      return
    }

    // Затем проверяем localStorage
    try {
      const storedLang = localStorage.getItem("language") as Language
      if (storedLang && Object.keys(translations).includes(storedLang)) {
        setLanguage(storedLang)
      }
    } catch (e) {
      // Игнорируем ошибки localStorage (например, в режиме инкогнито)
      console.error("Error accessing localStorage:", e)
    }
  }, [searchParams])

  // Функция для переключения полноэкранного режима
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Входим в полноэкранный режим
      if (containerRef.current?.requestFullscreen) {
        containerRef.current
          .requestFullscreen()
          .then(() => {
            setIsFullscreen(true)
          })
          .catch((err) => {
            console.error(`${translations[language].common.error}: ${err.message}`)
          })
      }
    } else {
      // Выходим из полноэкранного режима
      if (document.exitFullscreen) {
        document
          .exitFullscreen()
          .then(() => {
            setIsFullscreen(false)
          })
          .catch((err) => {
            console.error(`${translations[language].common.error}: ${err.message}`)
          })
      }
    }
  }

  // Слушаем изменения состояния полноэкранного режима
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Загрузка матча
  useEffect(() => {
    let pollingInterval = null

    const loadMatch = async () => {
      try {
        if (isNaN(courtNumber) || courtNumber < 1 || courtNumber > 10) {
          setError(
            translations[language].common.error +
              ": " +
              (translations[language].scoreboard.invalidCourt || "Invalid court number"),
          )
          setLoading(false)
          logEvent("error", "Fullscreen Scoreboard: invalid court number", "fullscreen-scoreboard")
          return
        }

        logEvent(
          "info",
          `Fullscreen Scoreboard: начало загрузки матча на корте ${courtNumber}`,
          "fullscreen-scoreboard",
        )

        // Получаем матч по номеру корта
        const matchData = await getMatchByCourtNumber(courtNumber)

        if (matchData) {
          console.log("Loaded match data:", JSON.stringify(matchData, null, 2))
          setMatch(matchData)
          setError("")

          // Отмечаем, если это завершенный матч
          setIsCompletedMatch(matchData.isCompleted === true)

          logEvent("info", `Fullscreen Scoreboard: матч загружен: ${courtNumber}`, "fullscreen-scoreboard", {
            isCompleted: matchData.isCompleted,
          })

          // Подписываемся на обновления матча
          const unsubscribe = subscribeToMatchUpdates(matchData.id, (updatedMatch) => {
            if (updatedMatch) {
              console.log("Match update received:", JSON.stringify(updatedMatch, null, 2))
              setMatch(updatedMatch)
              setError("")

              // Обновляем статус завершения
              setIsCompletedMatch(updatedMatch.isCompleted === true)

              logEvent("debug", "Fullscreen Scoreboard: получено обновление матча", "fullscreen-scoreboard", {
                matchId: updatedMatch.id,
                scoreA: updatedMatch.score.teamA,
                scoreB: updatedMatch.score.teamB,
                isCompleted: updatedMatch.isCompleted,
              })
            } else {
              // Не показываем ошибку, если матч был удален
              // Вместо этого попробуем загрузить новый матч
              loadMatch()
            }
          })

          // Если матч завершен, настраиваем периодическую проверку нового матча
          if (matchData.isCompleted) {
            // Очищаем предыдущий интервал, если он был
            if (pollingInterval) {
              clearInterval(pollingInterval)
            }

            // Устанавливаем новый интервал для проверки новых матчей
            pollingInterval = setInterval(async () => {
              try {
                const newMatchData = await getMatchByCourtNumber(courtNumber)

                // Если найден новый матч с другим ID и он не завершен
                if (newMatchData && newMatchData.id !== matchData.id && !newMatchData.isCompleted) {
                  console.log("New match detected on court:", courtNumber)

                  // Обновляем матч в состоянии
                  setMatch(newMatchData)
                  setIsCompletedMatch(false)

                  // Очищаем интервал, так как нашли новый матч
                  clearInterval(pollingInterval)
                  pollingInterval = null

                  // Отписываемся от старого матча
                  if (unsubscribe) {
                    unsubscribe()
                  }

                  // Загружаем матч заново для настройки новой подписки
                  loadMatch()
                }
              } catch (err) {
                console.error("Error checking for new match:", err)
              }
            }, 10000) // Проверяем каждые 10 секунд
          } else {
            // Если матч не завершен, очищаем интервал проверки
            if (pollingInterval) {
              clearInterval(pollingInterval)
              pollingInterval = null
            }
          }

          return () => {
            if (unsubscribe) {
              unsubscribe()
            }
            if (pollingInterval) {
              clearInterval(pollingInterval)
            }
          }
        } else {
          setError(
            translations[language].scoreboard.noActiveMatches?.replace("{number}", courtNumber) ||
              `No active matches on court ${courtNumber}`,
          )
          logEvent("warn", `Fullscreen Scoreboard: no active matches on court ${courtNumber}`, "fullscreen-scoreboard")

          // Если матч не найден, настраиваем периодическую проверку
          if (pollingInterval) {
            clearInterval(pollingInterval)
          }

          pollingInterval = setInterval(async () => {
            try {
              const newMatchData = await getMatchByCourtNumber(courtNumber)
              if (newMatchData) {
                console.log("New match found on court:", courtNumber)
                clearInterval(pollingInterval)
                pollingInterval = null
                loadMatch()
              }
            } catch (err) {
              console.error("Error checking for new match:", err)
            }
          }, 10000) // Проверяем каждые 10 секунд
        }
      } catch (err) {
        setError(
          translations[language].common.error +
            ": " +
            (translations[language].scoreboard.loadError || "Error loading match"),
        )
        logEvent("error", "Ошибка загрузки матча для Fullscreen Scoreboard", "fullscreen-scoreboard", err)
      } finally {
        setLoading(false)
      }
    }

    loadMatch()

    // Очистка при размонтировании компонента
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [courtNumber, language])

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
    return (
      <span>
        {score}
        <sup>{tiebreakScore}</sup>
      </span>
    )
  }

  // Получаем данные о тай-брейках
  const getTiebreakScores = () => {
    if (!match || !match.score || !match.score.sets || match.score.sets.length === 0) return {}

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

  // Заменим функции определения важных событий на более надежные версии

  // Заменить функции isMatchPoint, isSetPoint, isGamePoint и getImportantEvent на следующие:

  // Функция для преобразования числового значения очков в теннисе в индекс
  const getPointIndex = (point) => {
    // Обработка строкового значения "Ad" (преимущество)
    if (point === "Ad") return 4

    // Преобразуем числовые значения очков (0, 15, 30, 40) в индексы (0, 1, 2, 3)
    if (point === 0) return 0
    if (point === 15) return 1
    if (point === 30) return 2
    if (point === 40) return 3

    // Если значение больше 40, считаем это преимуществом (Ad)
    if (typeof point === "number" && point > 40) return 4

    // Если это числовое значение, но не стандартное, возвращаем его как есть
    // (это может быть счет в тай-брейке)
    return point
  }

  // Улучшенная функция для определения game point с подробным логированием
  const isGamePoint = (match) => {
    console.log("=== CHECKING GAME POINT ===")

    if (!match || !match.score || !match.score.currentSet) {
      console.log("No match data or current set")
      return false
    }

    const currentSet = match.score.currentSet
    const currentGame = currentSet.currentGame

    if (!currentGame) {
      console.log("No current game data")
      return false
    }

    console.log("Current game score:", JSON.stringify(currentGame))
    console.log("Is tiebreak:", currentSet.isTiebreak)
    console.log("Team A points:", currentGame.teamA, "Team B points:", currentGame.teamB)
    console.log("Team A points name:", getTennisPointName(currentGame.teamA))
    console.log("Team B points name:", getTennisPointName(currentGame.teamB))

    // Получаем индексы очков для правильного сравнения
    const teamAIndex = getPointIndex(currentGame.teamA)
    const teamBIndex = getPointIndex(currentGame.teamB)

    console.log("Team A points index:", teamAIndex, "Team B points index:", teamBIndex)

    // Для тай-брейка
    if (currentSet.isTiebreak) {
      console.log("Tiebreak logic")
      // В тай-брейке обычно нужно набрать 7 очков с разницей в 2 очка
      // Если команда A имеет 6 очков и ведет, это game point
      if (currentGame.teamA >= 6 && currentGame.teamA >= currentGame.teamB + 1) {
        console.log("Game point for teamA in tiebreak")
        return "teamA"
      }
      // Если команда B имеет 6 очков и ведет, это game point
      if (currentGame.teamB >= 6 && currentGame.teamB >= currentGame.teamA + 1) {
        console.log("Game point for teamB in tiebreak")
        return "teamB"
      }
      console.log("No game point in tiebreak")
      return false
    }

    // Для обычного гейма - исправленная логика с использованием индексов

    // Если у команды A преимущество (Ad)
    if (teamAIndex === 4 && teamBIndex <= 3) {
      console.log("Game point for teamA: Ad")
      return "teamA"
    }

    // Если команда A имеет 40 (индекс 3) и команда B имеет меньше или равно 30 (индекс <= 2)
    if (teamAIndex === 3 && teamBIndex <= 2) {
      console.log("Game point for teamA: 40-x")
      return "teamA"
    }

    // Если у команды B преимущество (Ad)
    if (teamBIndex === 4 && teamAIndex <= 3) {
      console.log("Game point for teamB: Ad")
      return "teamB"
    }

    // Если команда B имеет 40 (индекс 3) и команда A имеет меньше или равно 30 (индекс <= 2)
    if (teamBIndex === 3 && teamAIndex <= 2) {
      console.log("Game point for teamB: 40-x")
      return "teamB"
    }

    console.log("No game point detected")
    return false
  }

  // Улучшенная функция для определения set point с подробным логированием
  const isSetPoint = (match) => {
    console.log("=== CHECKING SET POINT ===")

    if (!match || !match.score || !match.score.currentSet) {
      console.log("No match data or current set")
      return false
    }

    const currentSet = match.score.currentSet
    const teamAGames = currentSet.teamA
    const teamBGames = currentSet.teamB

    console.log("Current set score - Team A:", teamAGames, "Team B:", teamBGames)

    // Если идет тай-брейк, проверяем особым образом
    if (currentSet.isTiebreak) {
      // Получаем, кто имеет гейм-поинт в тай-брейке
      const gamePoint = isGamePoint(match)
      console.log("Game point in tiebreak result:", gamePoint)

      // Если есть гейм-поинт в тай-брейке, то это также и сет-поинт
      if (gamePoint) {
        console.log("Set point in tiebreak for", gamePoint)
        return gamePoint
      }

      console.log("No set point in tiebreak")
      return false
    }

    // Для обычного гейма
    // Получаем, кто имеет гейм-поинт
    const gamePoint = isGamePoint(match)
    console.log("Game point result:", gamePoint)

    if (!gamePoint) {
      console.log("No game point, so no set point")
      return false
    }

    // Для команды A
    if (gamePoint === "teamA") {
      // Если команда A ведет 5-x и выиграет этот гейм, то счет станет 6-x
      if (teamAGames === 5 && teamBGames <= 4) {
        console.log("Set point for teamA: 5-x")
        return "teamA"
      }
      // Если команда A ведет 6-5 и выиграет этот гейм, то счет станет 7-5
      if (teamAGames === 6 && teamBGames === 5) {
        console.log("Set point for teamA: 6-5")
        return "teamA"
      }
    }

    // Для команды B
    if (gamePoint === "teamB") {
      // Если команда B ведет 5-x и выиграет этот гейм, то счет станет 6-x
      if (teamBGames === 5 && teamAGames <= 4) {
        console.log("Set point for teamB: 5-x")
        return "teamB"
      }
      // Если команда B ведет 6-5 и выиграет этот гейм, то счет станет 7-5
      if (teamBGames === 6 && teamAGames === 5) {
        console.log("Set point for teamB: 6-5")
        return "teamB"
      }
    }

    console.log("No set point detected")
    return false
  }

  // Улучшенная функция для определения match point с подробным логированием
  const isMatchPoint = (match) => {
    console.log("=== CHECKING MATCH POINT ===")

    if (!match || !match.score || !match.score.currentSet) {
      console.log("No match data or current set")
      return false
    }

    // Определяем, сколько сетов нужно для победы (обычно 2 из 3)
    const setsToWin = match.setsToWin || 2
    console.log("Sets to win:", setsToWin)

    // Получаем текущий счет по сетам
    const teamASets = match.score.sets ? match.score.sets.filter((set) => set.teamA > set.teamB).length : 0
    const teamBSets = match.score.sets ? match.score.sets.filter((set) => set.teamB > set.teamA).length : 0
    console.log("Sets won - Team A:", teamASets, "Team B:", teamBSets)

    // Проверяем, является ли текущий гейм сет-поинтом
    const setPoint = isSetPoint(match)
    console.log("Set point result:", setPoint)

    // Если нет сет-поинта, то не может быть и матч-поинта
    if (!setPoint) {
      console.log("No set point, so no match point")
      return false
    }

    // Для команды A
    if (setPoint === "teamA" && teamASets === setsToWin - 1) {
      console.log("Match point for teamA")
      return "teamA"
    }

    // Для команды B
    if (setPoint === "teamB" && teamBSets === setsToWin - 1) {
      console.log("Match point for teamB")
      return "teamB"
    }

    console.log("No match point detected")
    return false
  }

  // Улучшенная функция для определения важного момента с подробным логированием
  const getImportantPoint = (match) => {
    console.log("=== GETTING IMPORTANT POINT ===")

    // Для отладки - выводим текущий счет
    if (match && match.score && match.score.currentSet) {
      console.log("Current game score:", JSON.stringify(match.score.currentSet.currentGame))
      console.log("Current set score:", {
        teamA: match.score.currentSet.teamA,
        teamB: match.score.currentSet.teamB,
        isTiebreak: match.score.currentSet.isTiebreak,
      })
      if (match.score.sets) {
        console.log("Sets:", JSON.stringify(match.score.sets))
      }
    } else {
      console.log("No match data available")
    }

    // Проверяем, идет ли тай-брейк
    const isTiebreak = match?.score?.currentSet?.isTiebreak || false

    // Сначала проверяем match point (самый приоритетный)
    const matchPoint = isMatchPoint(match)
    if (matchPoint) {
      console.log("MATCH POINT detected for", matchPoint)
      return { type: "MATCH POINT", team: matchPoint }
    }

    // Затем проверяем set point
    const setPoint = isSetPoint(match)
    if (setPoint) {
      console.log("SET POINT detected for", setPoint)
      return { type: "SET POINT", team: setPoint }
    }

    // Затем проверяем game point
    const gamePoint = isGamePoint(match)
    if (gamePoint) {
      console.log("GAME POINT detected for", gamePoint)
      // Если идет тай-брейк, показываем "TIEBREAK POINT" вместо "GAME POINT"
      if (isTiebreak) {
        return { type: "TIEBREAK POINT", team: gamePoint }
      }
      return { type: "GAME POINT", team: gamePoint }
    }

    console.log("No important point detected")
    // Если нет важного момента, возвращаем тип индикатора в зависимости от того, идет ли тай-брейк
    return { type: isTiebreak ? "TIEBREAK" : "GAME", team: null }
  }

  // Обновленная функция getImportantEvent, которая использует логику из vMix
  const getImportantEvent = () => {
    if (!match || !match.score) return null

    // Проверяем, завершен ли матч
    if (match.isCompleted) {
      return translations[language].scoreboard.matchCompleted || "MATCH IS OVER"
    }

    const importantPoint = getImportantPoint(match)

    // Возвращаем тип важного события, если оно есть и это не обычный гейм
    if (importantPoint.type && importantPoint.type !== "GAME") {
      return importantPoint.type
    }

    return null
  }

  // Получаем стиль градиента для фона
  const getGradientStyle = (useGradient, fromColor, toColor) => {
    if (!useGradient) return {}
    return {
      background: `linear-gradient(to bottom, ${fromColor}, ${toColor})`,
    }
  }

  // Определяем победителя матча
  const getMatchWinner = () => {
    if (!match || !match.isCompleted || !match.score || !match.score.sets) return null

    const setsWonA = match.score.sets.filter((set) => set.teamA > set.teamB).length
    const setsWonB = match.score.sets.filter((set) => set.teamB > set.teamA).length

    if (setsWonA > setsWonB) return "teamA"
    if (setsWonB > setsWonA) return "teamB"
    return null // ничья (не должно происходить в теннисе/паделе)
  }

  // Добавить в начало функции render (перед return)
  if (showDebug) {
    console.log("Current language:", language)
    console.log("Available translations:", Object.keys(translations))
    console.log("Checking translations for current language:")
    const translationsToCheck = [
      "common.back",
      "common.loading",
      "common.error",
      "common.exitFullscreen",
      "common.enterFullscreen",
      "scoreboard.tennis",
      "scoreboard.padel",
      "scoreboard.singles",
      "scoreboard.doubles",
      "scoreboard.court",
      "scoreboard.invalidCourt",
      "scoreboard.noActiveMatches",
      "scoreboard.loadError",
      "scoreboard.matchCompleted",
    ]

    translationsToCheck.forEach((key) => {
      const parts = key.split(".")
      let result = translations[language]
      let exists = true

      for (const part of parts) {
        if (!result || !result[part]) {
          exists = false
          break
        }
        result = result[part]
      }

      console.log(`Translation '${key}': ${exists ? "EXISTS" : "MISSING"}`)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-black text-white">
        <div className="text-center">
          <div className="mb-4 text-xl">{getTranslation("common.loading", "Loading...", language)}</div>
          <div className="w-16 h-16 border-4 border-gray-300 border-t-white rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-black">
        <div className="text-red-500 text-2xl p-8 text-center">{error}</div>
      </div>
    )
  }

  if (!match) return null

  const tiebreakScores = getTiebreakScores()

  return (
    <>
      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
          background-color: black;
          font-family: Arial, sans-serif;
        }

        * {
          box-sizing: border-box;
        }

        .fullscreen-container {
          display: grid;
          grid-template-rows: auto 1fr auto;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          position: relative;
          margin: 0;
          padding: 0;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5vh 1vw;
          background-color: rgba(0, 0, 0, 0.8);
          color: white;
          border-bottom: 1px solid #333;
          max-height: 5vh;
        }

        .fullscreen-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          margin-left: 10px;
          transition: background 0.2s;
        }

        .fullscreen-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .scoreboard {
          display: grid;
          grid-template-rows: 1fr 1fr;
          height: 100%;
          width: 100%;
          gap: 2px;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }

        .team-row {
          display: grid;
          grid-template-columns: ${showNames ? "5fr " : ""}${showCountry ? "1fr " : ""}${showServer ? "0.5fr " : ""}${showSets ? `repeat(${(match.score.sets?.length || 0) + (match.score.currentSet ? 1 : 0)}, 0.8fr) ` : ""}${showPoints ? "1fr 0fr" : ""};
          height: 100%;
          gap: 0;
          width: 100%;
          max-width: 100vw;
          margin: 0;
          padding: 0;
        }

        .cell {
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          padding: 0;
        }

        .player-name-container {
          width: 100%;
          height: ${match.format === "doubles" ? "50%" : "100%"};
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 1;
        }

        .player-divider {
          height: 1px;
          background-color: rgba(192, 192, 192, 0.5);
          width: 100%;
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          margin: 0;
        }

        .names-cell {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          padding: 3px;
          height: 100%;
          position: relative;
        }

        .player-name {
          white-space: normal;
          overflow: hidden;
          word-wrap: break-word;
          font-weight: bold;
          width: 100%;
          text-align: left;
          font-size: clamp(1.9vh, 9.5vh, 19vh); /* Увеличено в 1.9 раза */
          line-height: 1.1;
          display: -webkit-box;
          -webkit-line-clamp: ${match.format === "doubles" ? "2" : "3"}; /* Ограничение количества строк */
          -webkit-box-orient: vertical;
        }

        .server-cell {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          align-items: center;
          padding: 0;
          margin: 0;
        }

        .server-indicator {
          font-size: 15vh; /* Увеличено в 3 раза */
          line-height: 1;
          padding: 0;
          margin: 0;
        }

        .set-cell {
          font-weight: bold;
          font-size: 10vh; /* Увеличено в 2 раза */
          padding: 0 0.5vw; /* Уменьшенные отступы по бокам */
        }

        .points-cell {
          font-weight: bold;
          font-size: 19.2vh;
          width: 100%;
          text-align: center;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0;
          margin: 0;
          flex-grow: 1;
          box-sizing: border-box;
          min-width: 0;
        }

        .points-cell span {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 0.9em;
        }

        .points-cell .trophy-icon {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
        }

        .important-event {
          color: ${indicatorTextColor};
          font-weight: bold;
          text-align: center;
          padding: 3px;
          font-size: 4vh;
          height: 6vh;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.5s ease; /* Добавлен плавный переход */
          z-index: 10;
          ${
            indicatorGradient
              ? `background: linear-gradient(to bottom, ${indicatorGradientFrom}, ${indicatorGradientTo});`
              : `background-color: ${indicatorBgColor};`
          }
        }

        /* Responsive font sizes */
        @media (max-width: 768px) {
          .server-indicator {
            font-size: 12vh; /* Увеличено в 3 раза */
          }
          .set-cell {
            font-size: 8vh; /* Увеличено в 2 раза */
          }
          .points-cell {
            font-size: 14.4vh; /* Уменьшено на 40% от 24vh */
          }
          .important-event {
            font-size: 3vh;
          }
        }

        @media (min-width: 769px) and (max-width: 1200px) {
          .server-indicator {
            font-size: 15vh; /* Увеличено в 3 раза */
          }
          .set-cell {
            font-size: 10vh; /* Увеличено в 2 раза */
          }
          .points-cell {
            font-size: 16.8vh; /* Уменьшено на 40% от 28vh */
          }
          .important-event {
            font-size: 3.5vh;
          }
        }

        @media (min-width: 1201px) {
          .server-indicator {
            font-size: 18vh; /* Увеличено в 3 раза */
          }
          .set-cell {
            font-size: 12vh; /* Увеличено в 2 раза */
          }
          .points-cell {
            font-size: 21.6vh; /* Уменьшено на 40% от 36vh */
          }
          .important-event {
            font-size: 4vh;
          }
        }
      `}</style>

      <div className="fullscreen-container" ref={containerRef}>
        <div className="header">
          <div className="flex items-center">
            <Link href="/" className="mr-4 text-white hover:text-gray-300 transition-colors flex items-center">
              <ArrowLeft size={24} />
            </Link>
            <div className="text-2xl font-bold">
              {match.type === "tennis"
                ? getTranslation("scoreboard.tennis", "Tennis", language)
                : getTranslation("scoreboard.padel", "Padel", language)}{" "}
              -{" "}
              {match.format === "singles"
                ? getTranslation("scoreboard.singles", "Singles", language)
                : getTranslation("scoreboard.doubles", "Doubles", language)}
              {isCompletedMatch && (
                <span className="ml-2 inline-flex items-center text-amber-400">
                  <Clock size={20} />
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <div className="text-xl">
              {getTranslation("scoreboard.court", "Court", language)} {courtNumber} - {new Date().toLocaleTimeString()}
            </div>
            <button
              className="fullscreen-button"
              onClick={toggleFullscreen}
              title={
                isFullscreen
                  ? getTranslation("common.exitFullscreen", "Exit fullscreen", language)
                  : getTranslation("common.enterFullscreen", "Enter fullscreen", language)
              }
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        <div className="scoreboard">
          {/* Команда A */}
          <div className="team-row">
            {showNames && (
              <div
                className="cell names-cell"
                style={{
                  color: theme === "transparent" ? textColor : "white",
                  ...(theme === "transparent"
                    ? { background: "transparent" }
                    : namesGradient
                      ? getGradientStyle(true, namesGradientFrom, namesGradientTo)
                      : { background: namesBgColor }),
                }}
              >
                {match.teamA.players.map((player, idx) => (
                  <div key={idx} className="player-name-container">
                    <div className="player-name pl-6" title={player.name}>
                      {player.name}
                    </div>
                  </div>
                ))}
                {match.format === "doubles" && <div className="player-divider"></div>}
              </div>
            )}

            {showCountry && (
              <div
                className="cell country-cell"
                style={{
                  color: theme === "transparent" ? textColor : "white",
                  ...(theme === "transparent"
                    ? { background: "transparent" }
                    : countryGradient
                      ? getGradientStyle(true, countryGradientFrom, countryGradientTo)
                      : { background: countryBgColor }),
                }}
              >
                {match.teamA.players.map((player, idx) => (
                  <div
                    key={idx}
                    style={{ height: `${100 / match.teamA.players.length}%`, display: "flex", alignItems: "center" }}
                  >
                    {getPlayerCountryDisplay("teamA", idx, match)}
                  </div>
                ))}
              </div>
            )}

            {showServer && (
              <div
                className="cell server-cell"
                style={{
                  color: theme === "transparent" ? accentColor : accentColor,
                  ...(theme === "transparent"
                    ? { background: "transparent" }
                    : serveGradient
                      ? getGradientStyle(true, serveGradientFrom, serveGradientTo)
                      : { background: serveBgColor }),
                }}
              >
                {match.teamA.players.map((player, idx) => (
                  <div
                    key={idx}
                    className="server-indicator"
                    style={{ visibility: isServing("teamA", idx) ? "visible" : "hidden" }}
                  >
                    •
                  </div>
                ))}
              </div>
            )}

            {showSets &&
              match.score.sets &&
              match.score.sets.map((set, idx) => (
                <div
                  key={idx}
                  className="cell set-cell"
                  style={{
                    ...(theme === "transparent"
                      ? { background: "transparent" }
                      : setsGradient
                        ? getGradientStyle(true, setsGradientFrom, setsGradientTo)
                        : { background: setsBgColor }),
                    color: theme === "transparent" ? textColor : setsTextColor,
                  }}
                >
                  <span style={{ fontWeight: set.teamA > set.teamB ? "bold" : "normal" }}>
                    {tiebreakScores[idx] ? formatSetScore(set.teamA, tiebreakScores[idx].teamA) : set.teamA}
                  </span>
                </div>
              ))}

            {showSets && match.score.currentSet && !match.isCompleted && (
              <div
                className="cell set-cell"
                style={{
                  ...(theme === "transparent"
                    ? { background: "transparent" }
                    : setsGradient
                      ? getGradientStyle(true, setsGradientFrom, setsGradientTo)
                      : { background: setsBgColor }),
                  color: theme === "transparent" ? textColor : setsTextColor,
                  fontWeight: "normal", // Explicitly set to normal
                }}
              >
                {match.score.currentSet.teamA}
              </div>
            )}

            {showPoints && (
              <>
                <div
                  className="cell points-cell"
                  style={{
                    color: theme === "transparent" ? textColor : "white",
                    ...(theme === "transparent"
                      ? { background: "transparent" }
                      : pointsGradient
                        ? getGradientStyle(true, pointsGradientFrom, pointsGradientTo)
                        : { background: pointsBgColor }),
                  }}
                >
                  {!match.isCompleted ? (
                    <span>{getCurrentGameScore("teamA")}</span>
                  ) : getMatchWinner() === "teamA" ? (
                    <div className="trophy-icon">
                      <span style={{ color: accentColor, fontSize: "0.8em" }}>🏆</span>
                    </div>
                  ) : null}
                </div>
                <div style={{ width: 0, padding: 0, margin: 0 }}></div>
              </>
            )}
          </div>

          {/* Команда B */}
          <div className="team-row">
            {showNames && (
              <div
                className="cell names-cell"
                style={{
                  color: theme === "transparent" ? textColor : "white",
                  ...(theme === "transparent"
                    ? { background: "transparent" }
                    : namesGradient
                      ? getGradientStyle(true, namesGradientFrom, namesGradientTo)
                      : { background: namesBgColor }),
                }}
              >
                {match.teamB.players.map((player, idx) => (
                  <div key={idx} className="player-name-container">
                    <div className="player-name pl-6" title={player.name}>
                      {player.name}
                    </div>
                  </div>
                ))}
                {match.format === "doubles" && <div className="player-divider"></div>}
              </div>
            )}

            {showCountry && (
              <div
                className="cell country-cell"
                style={{
                  color: theme === "transparent" ? textColor : "white",
                  ...(theme === "transparent"
                    ? { background: "transparent" }
                    : countryGradient
                      ? getGradientStyle(true, countryGradientFrom, countryGradientTo)
                      : { background: countryBgColor }),
                }}
              >
                {match.teamB.players.map((player, idx) => (
                  <div
                    key={idx}
                    style={{ height: `${100 / match.teamB.players.length}%`, display: "flex", alignItems: "center" }}
                  >
                    {getPlayerCountryDisplay("teamB", idx, match)}
                  </div>
                ))}
              </div>
            )}

            {showServer && (
              <div
                className="cell server-cell"
                style={{
                  color: theme === "transparent" ? accentColor : accentColor,
                  ...(theme === "transparent"
                    ? { background: "transparent" }
                    : serveGradient
                      ? getGradientStyle(true, serveGradientFrom, serveGradientTo)
                      : { background: serveBgColor }),
                }}
              >
                {match.teamB.players.map((player, idx) => (
                  <div
                    key={idx}
                    className="server-indicator"
                    style={{ visibility: isServing("teamB", idx) ? "visible" : "hidden" }}
                  >
                    •
                  </div>
                ))}
              </div>
            )}

            {showSets &&
              match.score.sets &&
              match.score.sets.map((set, idx) => (
                <div
                  key={idx}
                  className="cell set-cell"
                  style={{
                    ...(theme === "transparent"
                      ? { background: "transparent" }
                      : setsGradient
                        ? getGradientStyle(true, setsGradientFrom, setsGradientTo)
                        : { background: setsBgColor }),
                    color: theme === "transparent" ? textColor : setsTextColor,
                  }}
                >
                  <span style={{ fontWeight: set.teamB > set.teamA ? "bold" : "normal" }}>
                    {tiebreakScores[idx] ? formatSetScore(set.teamB, tiebreakScores[idx].teamB) : set.teamB}
                  </span>
                </div>
              ))}

            {showSets && match.score.currentSet && !match.isCompleted && (
              <div
                className="cell set-cell"
                style={{
                  ...(theme === "transparent"
                    ? { background: "transparent" }
                    : setsGradient
                      ? getGradientStyle(true, setsGradientFrom, setsGradientTo)
                      : { background: setsBgColor }),
                  color: theme === "transparent" ? textColor : setsTextColor,
                  fontWeight: "normal", // Explicitly set to normal
                }}
              >
                {match.score.currentSet.teamB}
              </div>
            )}

            {showPoints && (
              <>
                <div
                  className="cell points-cell"
                  style={{
                    color: theme === "transparent" ? textColor : "white",
                    ...(theme === "transparent"
                      ? { background: "transparent" }
                      : pointsGradient
                        ? getGradientStyle(true, pointsGradientFrom, pointsGradientTo)
                        : { background: pointsBgColor }),
                  }}
                >
                  {!match.isCompleted ? (
                    <span>{getCurrentGameScore("teamB")}</span>
                  ) : getMatchWinner() === "teamB" ? (
                    <div className="trophy-icon">
                      <span style={{ color: accentColor, fontSize: "0.8em" }}>🏆</span>
                    </div>
                  ) : null}
                </div>
                <div style={{ width: 0, padding: 0, margin: 0 }}></div>
              </>
            )}
          </div>
        </div>

        {/* Строка важных событий - всегда видима, но прозрачна когда нет событий */}
        <div
          className="important-event"
          style={{ opacity: getImportantEvent() ? 1 : 0, display: getImportantEvent() ? "flex" : "flex" }}
        >
          {getImportantEvent() || ""}
        </div>
      </div>
    </>
  )
}

// Добавить эту функцию после объявления компонента FullscreenScoreboard
const getTranslation = (path: string, fallback: string, lang: Language): string => {
  const parts = path.split(".")
  let result = translations[lang]

  for (const part of parts) {
    if (!result || !result[part]) {
      console.warn(`Missing translation: ${path} for language ${lang}`)
      return fallback
    }
    result = result[part]
  }

  return result as string
}
