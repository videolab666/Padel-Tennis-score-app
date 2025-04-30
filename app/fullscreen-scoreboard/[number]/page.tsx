"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { getMatchByCourtNumber } from "@/lib/court-utils"
import { getTennisPointName } from "@/lib/tennis-utils"
import { logEvent } from "@/lib/error-logger"
import { subscribeToMatchUpdates } from "@/lib/match-storage"

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
        html, body {
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
          grid-template-rows: auto 1fr;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5vh 2vw;
          background-color: rgba(0, 0, 0, 0.8);
          color: white;
          border-bottom: 1px solid #333;
        }

        .scoreboard {
          display: grid;
          grid-template-rows: 1fr 1fr;
          height: 100%;
          width: 100%;
          gap: 0.5vh;
        }

        .team-row {
          display: grid;
          grid-template-columns: ${showNames ? "5fr " : ""}${showCountry ? "1fr " : ""}${showServer ? "0.5fr " : ""}${showSets ? `repeat(${(match.score.sets?.length || 0) + (match.score.currentSet ? 1 : 0)}, 1fr) ` : ""}${showPoints ? "1.5fr" : ""};
          height: 100%;
          gap: 0.5vh;
        }

        .cell {
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }

        .names-cell {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 1vh 2vw;
        }

        .player-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: bold;
          width: 100%;
          text-align: left;
        }

        .country-cell {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .server-cell {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          align-items: center;
        }

        .server-indicator {
          font-size: 5vh;
          line-height: 1;
        }

        .set-cell {
          font-weight: bold;
          font-size: 5vh;
        }

        .points-cell {
          font-weight: bold;
          font-size: 8vh;
        }

        /* Responsive font sizes */
        @media (max-width: 768px) {
          .player-name {
            font-size: 3vh;
          }
          .server-indicator {
            font-size: 4vh;
          }
          .set-cell {
            font-size: 4vh;
          }
          .points-cell {
            font-size: 6vh;
          }
        }

        @media (min-width: 769px) and (max-width: 1200px) {
          .player-name {
            font-size: 4vh;
          }
          .server-indicator {
            font-size: 5vh;
          }
          .set-cell {
            font-size: 5vh;
          }
          .points-cell {
            font-size: 7vh;
          }
        }

        @media (min-width: 1201px) {
          .player-name {
            font-size: 5vh;
          }
          .server-indicator {
            font-size: 6vh;
          }
          .set-cell {
            font-size: 6vh;
          }
          .points-cell {
            font-size: 9vh;
          }
        }
      `}</style>

      <div className="fullscreen-container" ref={containerRef}>
        <div className="header">
          <div className="text-2xl font-bold">
            {match.type === "tennis" ? "Теннис" : "Падел"} -{" "}
            {match.format === "singles" ? "Одиночная игра" : "Парная игра"}
          </div>
          <div className="text-xl">
            Корт {courtNumber} - {new Date().toLocaleTimeString()}
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
                  <div key={idx} className="player-name">
                    {player.name}
                  </div>
                ))}
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
                {getCurrentGameScore("teamA")}
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
                  <div key={idx} className="player-name">
                    {player.name}
                  </div>
                ))}
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
                {getCurrentGameScore("teamB")}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
