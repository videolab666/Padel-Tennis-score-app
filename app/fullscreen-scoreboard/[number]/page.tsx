"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { getMatchByCourtNumber } from "@/lib/court-utils"
import { getTennisPointName } from "@/lib/tennis-utils"
import { logEvent } from "@/lib/error-logger"
import { subscribeToMatchUpdates } from "@/lib/match-storage"
import { Maximize2, Minimize2 } from "lucide-react"

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
  const searchParams = useSearchParams()
  const containerRef = useRef(null)
  const courtNumber = Number.parseInt(params.number)

  // Параметры отображения из URL
  const theme = searchParams.get("theme") || "default"
  const showNames = searchParams.get("showNames") !== "false"
  const showPoints = searchParams.get("showPoints") !== "false"
  const showSets = searchParams.get("showSets") !== "false"
  const showServer = searchParams.get("showServer") !== "false"
  const showCountry = searchParams.get("showCountry") !== "false"
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
            console.error(`Ошибка при переходе в полноэкранный режим: ${err.message}`)
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
            console.error(`Ошибка при выходе из полноэкранного режима: ${err.message}`)
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
    const loadMatch = async () => {
      try {
        if (isNaN(courtNumber) || courtNumber < 1 || courtNumber > 10) {
          setError("Некорректный номер корта")
          setLoading(false)
          logEvent("error", "Fullscreen Scoreboard: некорректный номер корта", "fullscreen-scoreboard")
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
          logEvent("info", `Fullscreen Scoreboard: матч загружен: ${courtNumber}`, "fullscreen-scoreboard")

          // Подписываемся на обновления матча
          const unsubscribe = subscribeToMatchUpdates(matchData.id, (updatedMatch) => {
            if (updatedMatch) {
              console.log("Match update received:", JSON.stringify(updatedMatch, null, 2))
              setMatch(updatedMatch)
              setError("")
              logEvent("debug", "Fullscreen Scoreboard: получено обновление матча", "fullscreen-scoreboard", {
                matchId: updatedMatch.id,
                scoreA: updatedMatch.score.teamA,
                scoreB: updatedMatch.score.teamB,
              })
            } else {
              setError("Матч не найден или был удален")
              logEvent("warn", "Fullscreen Scoreboard: матч не найден при обновлении", "fullscreen-scoreboard", {
                courtNumber,
              })
            }
          })

          return () => {
            if (unsubscribe) {
              unsubscribe()
            }
          }
        } else {
          setError(`На корте ${courtNumber} нет активных матчей`)
          logEvent(
            "warn",
            `Fullscreen Scoreboard: на корте ${courtNumber} нет активных матчей`,
            "fullscreen-scoreboard",
          )
        }
      } catch (err) {
        setError("Ошибка загрузки матча")
        logEvent("error", "Ошибка загрузки матча для Fullscreen Scoreboard", "fullscreen-scoreboard", err)
      } finally {
        setLoading(false)
      }
    }

    loadMatch()
  }, [courtNumber])

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

  // Определяем важные события (game point, set point, match point)
  const getImportantEvent = () => {
    if (!match || !match.score || !match.score.currentSet) return null

    const currentSet = match.score.currentSet
    const setsWonA = (match.score.sets || []).filter((set) => set.teamA > set.teamB).length
    const setsWonB = (match.score.sets || []).filter((set) => set.teamB > set.teamA).length
    const setsToWin = match.bestOf === 3 ? 2 : 3

    // Проверка на match point
    if (
      (setsWonA === setsToWin - 1 && currentSet.teamA > currentSet.teamB) ||
      (setsWonB === setsToWin - 1 && currentSet.teamB > currentSet.teamA)
    ) {
      if (
        (currentSet.teamA >= 5 && currentSet.teamA - currentSet.teamB >= 1) ||
        (currentSet.teamB >= 5 && currentSet.teamB - currentSet.teamA >= 1) ||
        (currentSet.isTiebreak &&
          ((currentSet.currentGame.teamA >= 6 && currentSet.currentGame.teamA - currentSet.currentGame.teamB >= 1) ||
            (currentSet.currentGame.teamB >= 6 && currentSet.currentGame.teamB - currentSet.currentGame.teamA >= 1)))
      ) {
        return "MATCH POINT"
      }
    }

    // Проверка на set point
    if (!currentSet.isTiebreak) {
      if (
        (currentSet.teamA >= 5 &&
          currentSet.teamA - currentSet.teamB >= 1 &&
          currentSet.currentGame.teamA === 40 &&
          currentSet.currentGame.teamB !== 40) ||
        (currentSet.teamB >= 5 &&
          currentSet.teamB - currentSet.teamA >= 1 &&
          currentSet.currentGame.teamB === 40 &&
          currentSet.currentGame.teamA !== 40) ||
        (currentSet.teamA >= 5 && currentSet.teamA - currentSet.teamB >= 1 && currentSet.currentGame.teamA === "Ad") ||
        (currentSet.teamB >= 5 && currentSet.teamB - currentSet.teamA >= 1 && currentSet.currentGame.teamB === "Ad")
      ) {
        return "SET POINT"
      }
    } else if (
      (currentSet.currentGame.teamA >= 6 && currentSet.currentGame.teamA - currentSet.currentGame.teamB >= 1) ||
      (currentSet.currentGame.teamB >= 6 && currentSet.currentGame.teamB - currentSet.currentGame.teamA >= 1)
    ) {
      return "SET POINT"
    }

    // Проверка на game point
    if (!currentSet.isTiebreak) {
      if (
        (currentSet.currentGame.teamA === 40 &&
          currentSet.currentGame.teamB !== 40 &&
          currentSet.currentGame.teamB !== "Ad") ||
        (currentSet.currentGame.teamB === 40 &&
          currentSet.currentGame.teamA !== 40 &&
          currentSet.currentGame.teamA !== "Ad") ||
        currentSet.currentGame.teamA === "Ad" ||
        currentSet.currentGame.teamB === "Ad"
      ) {
        return "GAME POINT"
      }
    }

    // Проверка на тайбрейк (самый низкий приоритет)
    if (currentSet.isTiebreak) {
      return "TIE BREAK"
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-black text-white">
        <div className="text-center">
          <div className="mb-4 text-xl">Загрузка данных матча на корте {courtNumber}...</div>
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
        }

        .team-row {
          display: grid;
          grid-template-columns: ${showNames ? "5fr " : ""}${showCountry ? "1fr " : ""}${showServer ? "0.5fr " : ""}${showSets ? `repeat(${(match.score.sets?.length || 0) + (match.score.currentSet ? 1 : 0)}, 1fr) ` : ""}${showPoints ? "1.5fr" : ""};
          height: 100%;
          gap: 2px;
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
        }

        .points-cell {
          font-weight: bold;
          font-size: 19.2vh; /* Уменьшено на 40% от 32vh */
          width: 100%;
          text-align: center;
          display: flex;
          justify-content: space-between;
          padding: 0 2vw; /* Добавляем отступы по бокам */
          letter-spacing: -0.02em; /* Небольшое уменьшение расстояния между буквами */
        }

        .important-event {
          background-color: #ff0000;
          color: white;
          font-weight: bold;
          text-align: center;
          padding: 3px;
          font-size: 4vh;
          max-height: 6vh;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.5s ease; /* Добавлен плавный переход */
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
            font-size: 14.4vh; /* Уменьшено на 40% ��т 24vh */
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
          <div className="text-2xl font-bold">
            {match.type === "tennis" ? "Теннис" : "Падел"} -{" "}
            {match.format === "singles" ? "Одиночная игра" : "Парная игра"}
          </div>
          <div className="flex items-center">
            <div className="text-xl">
              Корт {courtNumber} - {new Date().toLocaleTimeString()}
            </div>
            <button
              className="fullscreen-button"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Выйти из полноэкранного режима" : "Перейти в полноэкранный режим"}
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
                    <div className="player-name" title={player.name}>
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
                  {tiebreakScores[idx] ? formatSetScore(set.teamA, tiebreakScores[idx].teamA) : set.teamA}
                </div>
              ))}

            {showSets && match.score.currentSet && (
              <div
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
                {match.score.currentSet.teamA}
              </div>
            )}

            {showPoints && match.score.currentSet && (
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
                <span
                  style={{
                    width: "100%",
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    fontSize: "0.9em", // Уменьшено на 10% от родительского размера
                  }}
                >
                  {getCurrentGameScore("teamA")}
                </span>
              </div>
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
                    <div className="player-name" title={player.name}>
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
                  {tiebreakScores[idx] ? formatSetScore(set.teamB, tiebreakScores[idx].teamB) : set.teamB}
                </div>
              ))}

            {showSets && match.score.currentSet && (
              <div
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
                {match.score.currentSet.teamB}
              </div>
            )}

            {showPoints && match.score.currentSet && (
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
                <span
                  style={{
                    width: "100%",
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    fontSize: "0.9em", // Уменьшено на 10% от родительского размера
                  }}
                >
                  {getCurrentGameScore("teamB")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Строка важных событий - всегда видима, но прозрачна когда нет событий */}
        <div className="important-event" style={{ opacity: getImportantEvent() ? 1 : 0 }}>
          {getImportantEvent() || "PLAY"}
        </div>
      </div>
    </>
  )
}
