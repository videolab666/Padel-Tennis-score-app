"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getTennisPointName } from "@/lib/tennis-utils"
import { useState, useEffect } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useLanguage } from "@/contexts/language-context"
import { Trophy } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function ScoreBoard({ match, updateMatch }) {
  const [showMatchEndDialog, setShowMatchEndDialog] = useState(false)
  const [pendingMatchUpdate, setPendingMatchUpdate] = useState(null)
  const [previousMatchState, setPreviousMatchState] = useState(null)
  const [fixedSides, setFixedSides] = useState(() => {
    // Try to get the saved preference from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("fixedSidesPreference")
      return saved ? saved === "true" : true
    }
    return true // Default to fixed sides
  })
  const { t } = useLanguage()

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fixedSidesPreference", fixedSides.toString())
    }
  }, [fixedSides])

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "fixedSidesPreference") {
        setFixedSides(e.newValue === "true")
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  if (!match) return null

  const { teamA, teamB } = match
  const currentSet = match.score.currentSet

  // Оптимизируем обработчик нажатия на счет для более быстрой работы
  const handleScoreClick = (team) => {
    if (!updateMatch || match.isCompleted) {
      console.log("Cannot update: updateMatch function missing or match completed")
      return
    }

    // Save the current match state before any changes
    const previousState = JSON.parse(JSON.stringify(match))

    // Create a copy of the match
    const updatedMatch = { ...match }

    // Clear history to save space
    updatedMatch.history = []

    const otherTeam = team === "teamA" ? "teamB" : "teamA"

    // Check if sides need to be changed
    if (updatedMatch.shouldChangeSides) {
      // Change sides
      updatedMatch.courtSides = {
        teamA: updatedMatch.courtSides.teamA === "left" ? "right" : "left",
        teamB: updatedMatch.courtSides.teamB === "left" ? "right" : "left",
      }

      // Reset the flag
      updatedMatch.shouldChangeSides = false
    }

    if (currentSet.isTiebreak) {
      // Tiebreak logic
      updatedMatch.score.currentSet.currentGame[team]++

      // Определяем количество очков для победы в тай-брейке в зависимости от типа
      let pointsToWin = 7 // Обычный тай-брейк по умолчанию

      // Если это супер-тай-брейк в решающем сете
      if (
        currentSet.isSuperTiebreak ||
        (updatedMatch.settings.finalSetTiebreak && updatedMatch.score.sets.length + 1 === updatedMatch.settings.sets)
      ) {
        // Используем длину тай-брейка из настроек финального сета
        pointsToWin = updatedMatch.settings.finalSetTiebreakLength || 10
        console.log("Using final set tiebreak length:", pointsToWin)
      }
      // Если это обычный тай-брейк, но выбран тип "championship"
      else if (updatedMatch.settings.tiebreakType === "championship") {
        pointsToWin = 10 // Чемпионский тай-брейк всегда до 10 очков
        console.log("Using championship tiebreak (10 points)")
      } else {
        console.log("Using regular tiebreak (7 points)")
      }

      console.log("Tiebreak settings:", {
        type: updatedMatch.settings.tiebreakType,
        finalSetTiebreak: updatedMatch.settings.finalSetTiebreak,
        finalSetTiebreakLength: updatedMatch.settings.finalSetTiebreakLength,
        pointsToWin: pointsToWin,
      })

      // Check for tiebreak win
      if (
        updatedMatch.score.currentSet.currentGame[team] >= pointsToWin &&
        updatedMatch.score.currentSet.currentGame[team] - updatedMatch.score.currentSet.currentGame[otherTeam] >= 2
      ) {
        // Increase set score
        updatedMatch.score.currentSet[team]++

        // Win set
        return winSet(team, updatedMatch, previousState)
      }

      // Switch server in tiebreak (every 2 points, except first)
      const totalPoints =
        updatedMatch.score.currentSet.currentGame.teamA + updatedMatch.score.currentSet.currentGame.teamB
      if (totalPoints % 2 === 1) {
        switchServer(updatedMatch)
      }

      // Check if sides need to be changed in tiebreak (every 6 points)
      if (totalPoints > 0 && totalPoints % 6 === 0) {
        updatedMatch.shouldChangeSides = true
      }
    } else {
      // Regular game logic
      const currentGame = updatedMatch.score.currentSet.currentGame
      const scoringSystem = updatedMatch.settings.scoringSystem || "classic"

      if (scoringSystem === "classic") {
        // Классическая система счета (с преимуществом)
        if (currentGame[team] === 0) {
          currentGame[team] = 15
        } else if (currentGame[team] === 15) {
          currentGame[team] = 30
        } else if (currentGame[team] === 30) {
          currentGame[team] = 40
        } else if (currentGame[team] === 40) {
          if (currentGame[otherTeam] < 40) {
            // Win game
            return winGame(team, updatedMatch, previousState)
          } else if (currentGame[otherTeam] === 40) {
            // Проверяем, используется ли золотой мяч при ровно
            if (updatedMatch.settings.goldenPoint) {
              // Если золотой мяч, то сразу выигрываем гейм при счете 40-40
              return winGame(team, updatedMatch, previousState)
            } else {
              // Advantage
              currentGame[team] = "Ad"
            }
          } else if (currentGame[otherTeam] === "Ad") {
            // Deuce
            currentGame[team] = 40
            currentGame[otherTeam] = 40
          }
        } else if (currentGame[team] === "Ad") {
          // Win game after advantage
          return winGame(team, updatedMatch, previousState)
        }
      } else if (scoringSystem === "no-ad") {
        // No-Ad система (решающий мяч при ровно)
        if (currentGame[team] === 0) {
          currentGame[team] = 15
        } else if (currentGame[team] === 15) {
          currentGame[team] = 30
        } else if (currentGame[team] === 30) {
          currentGame[team] = 40
        } else if (currentGame[team] === 40) {
          // В No-Ad при счете 40-40 следующее очко решающее
          return winGame(team, updatedMatch, previousState)
        }
      } else if (scoringSystem === "fast4") {
        // Fast4 система (до 4 геймов)
        if (currentGame[team] === 0) {
          currentGame[team] = 15
        } else if (currentGame[team] === 15) {
          currentGame[team] = 30
        } else if (currentGame[team] === 30) {
          currentGame[team] = 40
        } else if (currentGame[team] === 40) {
          // В Fast4 при счете 40-40 следующее очко решающее (как в No-Ad)
          return winGame(team, updatedMatch, previousState)
        }
      }
    }

    // Оптимизация: обновляем UI немедленно, не дожидаясь завершения операции сохранения
    updateMatch(updatedMatch)
  }

  // Helper functions from ScoreControls
  const winGame = (team, updatedMatch, previousState) => {
    const otherTeam = team === "teamA" ? "teamB" : "teamA"
    const currentSet = updatedMatch.score.currentSet

    // Increase set score
    currentSet[team]++

    // Save minimal game info
    currentSet.games.push({
      winner: team,
    })

    // Reset current game
    currentSet.currentGame = {
      teamA: 0,
      teamB: 0,
    }

    // Switch server
    if (!updatedMatch.settings.windbreak) {
      // Стандартное поведение - смена подающего после каждого гейма
      switchServer(updatedMatch)
    } else {
      // Виндрейк - подача через гейм (смена подающего через гейм)
      const totalGames = currentSet.teamA + currentSet.teamB
      if (totalGames % 2 === 1) {
        // Меняем подающего только после нечетного количества геймов
        switchServer(updatedMatch)
      }
    }

    // Check if sides need to be changed (after odd number of games)
    const totalGames = currentSet.teamA + currentSet.teamB
    if (totalGames % 2 === 1) {
      updatedMatch.shouldChangeSides = true
    }

    // Handle Super Set rules
    if (updatedMatch.settings.isSuperSet) {
      const teamAScore = currentSet.teamA
      const teamBScore = currentSet.teamB

      // Check if we've reached 8-8, start tiebreak
      if (teamAScore === 8 && teamBScore === 8) {
        currentSet.isTiebreak = true
        console.log("Starting tiebreak at 8-8 in Super Set")
        updateMatch(updatedMatch)
        return
      }

      // Check if we've reached 7-7, continue to 9
      if (teamAScore === 7 && teamBScore === 7) {
        // Continue playing to 9
        updateMatch(updatedMatch)
        return
      }

      // Check for win with 2 game difference
      if (
        (teamAScore >= 8 && teamAScore - teamBScore >= 2) ||
        (teamBScore >= 8 && teamBScore - teamAScore >= 2) ||
        (teamAScore === 9 && teamBScore < 8) ||
        (teamBScore === 9 && teamAScore < 8)
      ) {
        return winSet(team, updatedMatch, previousState)
      }

      // Check for win at 9-7 or 7-9
      if ((teamAScore === 9 && teamBScore === 7) || (teamBScore === 9 && teamAScore === 7)) {
        return winSet(team, updatedMatch, previousState)
      }

      // Continue normal play
      updateMatch(updatedMatch)
      return
    }

    // Проверяем, нужно ли использовать Fast4 правила
    const scoringSystem = updatedMatch.settings.scoringSystem || "classic"
    const gamesNeededToWin = scoringSystem === "fast4" ? 4 : 6
    const tiebreakAt = Number.parseInt(updatedMatch.settings.tiebreakAt.split("-")[0])

    // Проверка на финальный сет и тайбрейк в финальном сете
    const isDecidingSet = updatedMatch.score.sets.length + 1 === updatedMatch.settings.sets
    const isTwoSetsMatch =
      updatedMatch.settings.sets === 2 && updatedMatch.score.teamA === 1 && updatedMatch.score.teamB === 1

    // Проверяем, нужно ли начать тайбрейк в финальном сете
    if (updatedMatch.settings.finalSetTiebreak && (isDecidingSet || isTwoSetsMatch)) {
      // Если это финальный сет и включен тайбрейк в финальном сете
      if (currentSet.teamA === tiebreakAt && currentSet.teamB === tiebreakAt) {
        // Начинаем тайбрейк в финальном сете
        currentSet.isTiebreak = true
        currentSet.isSuperTiebreak = true // Отмечаем, что это супер-тайбрейк
        console.log("Starting final set tiebreak at", tiebreakAt, "all")
      }
    }
    // Обычный тайбрейк для нефинальных сетов
    else if (
      updatedMatch.settings.tiebreakEnabled &&
      currentSet.teamA === tiebreakAt &&
      currentSet.teamB === tiebreakAt
    ) {
      // Start tiebreak
      currentSet.isTiebreak = true
      console.log("Starting regular tiebreak at", tiebreakAt, "all")
    }

    // Проверяем на золотой гейм (падел)
    if (updatedMatch.settings.goldenGame) {
      // Если включен золотой гейм и один из игроков достиг 6 геймов, а другой имеет 5
      if ((currentSet.teamA === 6 && currentSet.teamB === 5) || (currentSet.teamA === 5 && currentSet.teamB === 6)) {
        // Определяем победителя сета
        const setWinner = currentSet.teamA > currentSet.teamB ? "teamA" : "teamB"
        return winSet(setWinner, updatedMatch, previousState)
      }
    }

    // Check for set win
    if (currentSet.teamA >= gamesNeededToWin && currentSet.teamA - currentSet.teamB >= 2) {
      return winSet("teamA", updatedMatch, previousState)
    } else if (currentSet.teamB >= gamesNeededToWin && currentSet.teamB - currentSet.teamA >= 2) {
      return winSet("teamB", updatedMatch, previousState)
    }

    // Проверка на победу в сете по правилам Fast4
    if (scoringSystem === "fast4") {
      if (currentSet.teamA >= gamesNeededToWin && currentSet.teamA - currentSet.teamB >= 1) {
        return winSet("teamA", updatedMatch, previousState)
      } else if (currentSet.teamB >= gamesNeededToWin && currentSet.teamB - currentSet.teamA >= 1) {
        return winSet("teamB", updatedMatch, previousState)
      }
    }

    // Update match
    updateMatch(updatedMatch)
  }

  const winSet = (team, updatedMatch, previousState) => {
    // Increase match score
    updatedMatch.score[team]++

    // Save current set to set history
    updatedMatch.score.sets.push({
      teamA: updatedMatch.score.currentSet.teamA,
      teamB: updatedMatch.score.currentSet.teamB,
      winner: team,
    })

    // Check for match win
    const totalSets = updatedMatch.settings.sets

    // Special handling for 2-set matches
    if (totalSets === 2) {
      // If a team has won 2 sets, the match is over
      if (updatedMatch.score[team] === 2) {
        // Store the pending update and previous state
        setPendingMatchUpdate(updatedMatch)
        setPreviousMatchState(previousState)

        // Show the confirmation dialog
        setShowMatchEndDialog(true)

        // Don't update the match yet
        return
      }
      // If the score is 1-1, we continue to a deciding tiebreak
      // Do not end the match here
    } else {
      // For matches with 1, 3, or 5 sets, use the standard logic
      const setsToWin = Math.ceil(updatedMatch.settings.sets / 2)
      if (updatedMatch.score[team] >= setsToWin) {
        // Store the pending update and previous state
        setPendingMatchUpdate(updatedMatch)
        setPreviousMatchState(previousState)

        // Show the confirmation dialog
        setShowMatchEndDialog(true)

        // Don't update the match yet
        return
      }
    }

    // Проверяем, нужно ли использовать супер-тай-брейк вместо третьего сета
    const isDecidingSet = updatedMatch.score.sets.length + 1 === updatedMatch.settings.sets
    const isTwoSetsMatch = updatedMatch.settings.sets === 2
    const isThirdSetTiebreak =
      updatedMatch.settings.finalSetTiebreak &&
      (isDecidingSet || (isTwoSetsMatch && updatedMatch.score.teamA === 1 && updatedMatch.score.teamB === 1))

    // Start new set
    if (isThirdSetTiebreak) {
      // Если это решающий сет и включен тайбрейк в решающем сете
      // Сразу начинаем с тайбрейка вместо обычного сета
      updatedMatch.score.currentSet = {
        teamA: 0,
        teamB: 0,
        games: [],
        currentGame: {
          teamA: 0,
          teamB: 0,
        },
        isTiebreak: true,
        isSuperTiebreak: true,
      }
      console.log("Starting super tiebreak for deciding set instead of regular set")
    } else {
      // Обычный сет
      updatedMatch.score.currentSet = {
        teamA: 0,
        teamB: 0,
        games: [],
        currentGame: {
          teamA: 0,
          teamB: 0,
        },
        isTiebreak: false,
      }
    }

    // Change sides after odd number of sets
    if (updatedMatch.score.sets.length % 2 === 1) {
      // Change sides automatically when changing set
      updatedMatch.courtSides = {
        teamA: updatedMatch.courtSides.teamA === "left" ? "right" : "left",
        teamB: updatedMatch.courtSides.teamB === "left" ? "right" : "left",
      }
    }

    // Update match
    updateMatch(updatedMatch)
  }

  const handleCompleteMatch = () => {
    if (pendingMatchUpdate) {
      // Complete the match
      const finalMatch = { ...pendingMatchUpdate }
      finalMatch.isCompleted = true
      finalMatch.winner = finalMatch.score.teamA > finalMatch.score.teamB ? "teamA" : "teamB"

      // Update the match
      updateMatch(finalMatch)

      // Reset the pending state
      setPendingMatchUpdate(null)
      setPreviousMatchState(null)
    }

    // Close the dialog
    setShowMatchEndDialog(false)
  }

  const handleCancelMatchCompletion = () => {
    // Revert to the previous state if available
    if (previousMatchState) {
      updateMatch(previousMatchState)
    }

    // Reset the pending state
    setPendingMatchUpdate(null)
    setPreviousMatchState(null)

    // Close the dialog
    setShowMatchEndDialog(false)
  }

  const switchServer = (updatedMatch) => {
    const currentTeam = updatedMatch.currentServer.team
    const otherTeam = currentTeam === "teamA" ? "teamB" : "teamA"

    // For singles, just switch team
    if (updatedMatch.format === "singles") {
      updatedMatch.currentServer.team = otherTeam
      updatedMatch.currentServer.playerIndex = 0
    } else {
      // For doubles - after each game, service passes to the next player in order
      // Order: A1 -> B1 -> A2 -> B2 -> A1 etc.
      if (currentTeam === "teamA") {
        // If team A was serving, switch to team B
        updatedMatch.currentServer.team = "teamB"
        // Keep the same player index
      } else {
        // If team B was serving, switch to team A and change player
        updatedMatch.currentServer.team = "teamA"
        // Switch to next player in team A
        updatedMatch.currentServer.playerIndex = updatedMatch.currentServer.playerIndex === 0 ? 1 : 0
      }
    }

    return updatedMatch
  }

  const isServing = (team, playerIndex) => {
    return match.currentServer.team === team && match.currentServer.playerIndex === playerIndex
  }

  // Получаем текущий счет в виде строки (0, 15, 30, 40, Ad)
  const getCurrentGameScore = (team) => {
    if (currentSet.isTiebreak) {
      return currentSet.currentGame[team]
    }

    return getTennisPointName(currentSet.currentGame[team])
  }

  // Определяем общее количество сетов в матче
  const totalSets = match.settings.sets
  const currentSetIndex = match.score.sets.length

  // Создаем массив всех сетов (включая будущие)
  const allSets = []

  // Добавляем прошедшие сеты
  for (let i = 0; i < match.score.sets.length; i++) {
    allSets.push(match.score.sets[i])
  }

  // Добавляем текущий сет, если матч не завершен
  if (!match.isCompleted && currentSet) {
    allSets.push({
      teamA: currentSet.teamA,
      teamB: currentSet.teamB,
      isCurrent: true,
    })
  }

  // Добавляем будущие сеты
  while (allSets.length < totalSets) {
    allSets.push({ teamA: "-", teamB: "-", isFuture: true })
  }

  const isGamePoint = (team) => {
    const currentGame = match.score.currentSet.currentGame
    const otherTeam = team === "teamA" ? "teamB" : "teamA"
    const teamAIndex = currentGame.teamA
    const teamBIndex = currentGame.teamB

    if (match.settings.scoringSystem === "classic") {
      if (currentGame[team] === 40 && currentGame[otherTeam] < 40) {
        return team
      } else if (currentGame[team] === "Ad") {
        return team
      }
    } else if (match.settings.scoringSystem === "no-ad" || match.settings.scoringSystem === "fast4") {
      if (currentGame[team] === 40) {
        return team
      }
    }

    // Add this to the isGamePoint function or similar logic
    if (match.settings.isSuperSet) {
      const teamAScore = match.score.currentSet.teamA
      const teamBScore = match.score.currentSet.teamB

      // Special case for 7-7 in Super Set
      if (teamAScore === 7 && teamBScore === 7) {
        // Check if this point would make it 8-7
        if (currentGame.teamA > currentGame.teamB && teamAIndex >= 3 && teamBIndex <= 2) {
          return "teamA"
        }
        // Check if this point would make it 7-8
        if (currentGame.teamB > currentGame.teamA && teamBIndex >= 3 && teamAIndex <= 2) {
          return "teamB"
        }
      }

      // Special case for 8-7 or 7-8 in Super Set
      if ((teamAScore === 8 && teamBScore === 7) || (teamAScore === 7 && teamBScore === 8)) {
        // Check if this point would make it 9-7 or 7-9 (winning the set)
        if (teamAScore > teamBScore && teamAIndex >= 3 && teamBIndex <= 2) {
          return "teamA"
        }
        if (teamBScore > teamAScore && teamBIndex >= 3 && teamAIndex <= 2) {
          return "teamB"
        }
      }
    }

    return null
  }

  return (
    <div className="space-y-4">
      <AlertDialog open={showMatchEndDialog} onOpenChange={setShowMatchEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("match.finishMatch")}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingMatchUpdate &&
                t("match.teamWonMatch", {
                  team:
                    pendingMatchUpdate.winner === "teamA"
                      ? pendingMatchUpdate.teamA.players.map((p) => p.name).join(" & ")
                      : pendingMatchUpdate.teamB.players.map((p) => p.name).join(" & "),
                })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelMatchCompletion}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => setShowMatchEndDialog(false)}>{t("common.continue")}</AlertDialogAction>
            <AlertDialogAction onClick={handleCompleteMatch}>{t("match.finishMatch")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-end mb-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="fixed-sides-scoreboard"
            checked={fixedSides}
            onCheckedChange={setFixedSides}
            disabled={match.isCompleted}
          />
          <Label htmlFor="fixed-sides-scoreboard" className="text-sm">
            {fixedSides ? t("match.fixedSides") : t("match.fixedPlayers")}
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-0 items-center w-full">
        <div className="text-right space-y-1 pr-3 border-r border-gray-200">
          <div className="text-sm text-muted-foreground mb-1 text-right">
            {fixedSides
              ? t("match.leftSide")
              : match.courtSides?.teamA === "left"
                ? t("match.teamA")
                : t("match.teamB")}
          </div>
          {fixedSides
            ? match.courtSides?.teamA === "left"
              ? // Команда A на левой стороне
                teamA.players.map((player, idx) => (
                  <div key={idx} className="flex items-center justify-end w-full">
                    {isServing("teamA", idx) && (
                      <Badge
                        variant="outline"
                        className="mr-2 w-3 h-3 rounded-full bg-lime-400 border-lime-600 p-0 flex items-center justify-center flex-shrink-0"
                      >
                        <span className="sr-only">{t("match.serving")}</span>
                      </Badge>
                    )}
                    <div className="w-full overflow-hidden max-w-full">
                      <p className="font-medium text-right truncate text-[10px] sm:text-[14px] md:text-[16px]">
                        {player.name}
                      </p>
                    </div>
                  </div>
                ))
              : // Команда B на левой стороне
                teamB.players.map((player, idx) => (
                  <div key={idx} className="flex items-center justify-end w-full">
                    {isServing("teamB", idx) && (
                      <Badge
                        variant="outline"
                        className="mr-2 w-3 h-3 rounded-full bg-lime-400 border-lime-600 p-0 flex items-center justify-center flex-shrink-0"
                      >
                        <span className="sr-only">{t("match.serving")}</span>
                      </Badge>
                    )}
                    <div className="w-full overflow-hidden max-w-full">
                      <p className="font-medium text-right truncate text-[10px] sm:text-[14px] md:text-[16px]">
                        {player.name}
                      </p>
                    </div>
                  </div>
                ))
            : // Fixed players mode - always show Team A on left
              teamA.players.map((player, idx) => (
                <div key={idx} className="flex items-center justify-end w-full">
                  {isServing("teamA", idx) && (
                    <Badge
                      variant="outline"
                      className="mr-2 w-3 h-3 rounded-full bg-lime-400 border-lime-600 p-0 flex items-center justify-center flex-shrink-0"
                    >
                      <span className="sr-only">{t("match.serving")}</span>
                    </Badge>
                  )}
                  <div className="w-full overflow-hidden max-w-full">
                    <p className="font-medium text-right truncate text-[10px] sm:text-[14px] md:text-[16px]">
                      {player.name}
                    </p>
                  </div>
                </div>
              ))}
        </div>
        <div className="text-left space-y-1 pl-3">
          <div className="text-sm text-muted-foreground mb-1 text-left">
            {fixedSides
              ? t("match.rightSide")
              : match.courtSides?.teamA === "right"
                ? t("match.teamA")
                : t("match.teamB")}
          </div>
          {fixedSides
            ? match.courtSides?.teamA === "right"
              ? // Команда A на правой стороне
                teamA.players.map((player, idx) => (
                  <div key={idx} className="flex items-center w-full">
                    <div className="w-full overflow-hidden max-w-full">
                      <p className="font-medium text-left truncate text-[10px] sm:text-[14px] md:text-[16px]">
                        {player.name}
                      </p>
                    </div>
                    {isServing("teamA", idx) && (
                      <Badge
                        variant="outline"
                        className="ml-2 w-3 h-3 rounded-full bg-lime-400 border-lime-600 p-0 flex items-center justify-center flex-shrink-0"
                      >
                        <span className="sr-only">{t("match.serving")}</span>
                      </Badge>
                    )}
                  </div>
                ))
              : // Команда B на правой стороне
                teamB.players.map((player, idx) => (
                  <div key={idx} className="flex items-center w-full">
                    <div className="w-full overflow-hidden max-w-full">
                      <p className="font-medium text-left truncate text-[10px] sm:text-[14px] md:text-[16px]">
                        {player.name}
                      </p>
                    </div>
                    {isServing("teamB", idx) && (
                      <Badge
                        variant="outline"
                        className="ml-2 w-3 h-3 rounded-full bg-lime-400 border-lime-600 p-0 flex items-center justify-center flex-shrink-0"
                      >
                        <span className="sr-only">{t("match.serving")}</span>
                      </Badge>
                    )}
                  </div>
                ))
            : // Fixed players mode - always show Team B on right
              teamB.players.map((player, idx) => (
                <div key={idx} className="flex items-center w-full">
                  <div className="w-full overflow-hidden max-w-full">
                    <p className="font-medium text-left truncate text-[10px] sm:text-[14px] md:text-[16px]">
                      {player.name}
                    </p>
                  </div>
                  {isServing("teamB", idx) && (
                    <Badge
                      variant="outline"
                      className="ml-2 w-3 h-3 rounded-full bg-lime-400 border-lime-600 p-0 flex items-center justify-center flex-shrink-0"
                    >
                      <span className="sr-only">{t("match.serving")}</span>
                    </Badge>
                  )}
                </div>
              ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-3">
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="text-center">
              <button
                className={`text-6xl font-bold px-8 py-4 rounded-md transition-all transform active:scale-95 active:translate-y-1 active:shadow-inner ${
                  currentSet.isTiebreak
                    ? "bg-red-50 hover:bg-red-100 active:bg-red-200"
                    : "bg-blue-50 hover:bg-blue-100 active:bg-blue-200"
                }`}
                onClick={() =>
                  handleScoreClick(fixedSides ? (match.courtSides?.teamA === "left" ? "teamA" : "teamB") : "teamA")
                }
              >
                {fixedSides
                  ? match.courtSides?.teamA === "left"
                    ? getCurrentGameScore("teamA")
                    : getCurrentGameScore("teamB")
                  : getCurrentGameScore("teamA")}
              </button>
            </div>
            <div className="text-center">
              <button
                className={`text-6xl font-bold px-8 py-4 rounded-md transition-all transform active:scale-95 active:translate-y-1 active:shadow-inner ${
                  currentSet.isTiebreak
                    ? "bg-red-50 hover:bg-red-100 active:bg-red-200"
                    : "bg-blue-50 hover:bg-blue-100 active:bg-blue-200"
                }`}
                onClick={() =>
                  handleScoreClick(fixedSides ? (match.courtSides?.teamA === "right" ? "teamA" : "teamB") : "teamB")
                }
              >
                {fixedSides
                  ? match.courtSides?.teamA === "right"
                    ? getCurrentGameScore("teamA")
                    : getCurrentGameScore("teamB")
                  : getCurrentGameScore("teamB")}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <div className="text-center">
          <span className="text-xl font-bold">
            {fixedSides ? (match.courtSides?.teamA === "left" ? currentSet.teamA : currentSet.teamB) : currentSet.teamA}
            {match.isCompleted &&
              match.winner === (fixedSides ? (match.courtSides?.teamA === "left" ? "teamA" : "teamB") : "teamA") && (
                <Trophy size={20} className="ml-1 text-yellow-500 inline-block" />
              )}
          </span>
        </div>
        <div className="text-center text-muted-foreground">
          {`${t("match.set")} ${currentSetIndex + 1} ${t("match.of")} ${totalSets}`}
          {currentSet.isTiebreak && currentSet.isSuperTiebreak && (
            <span className="ml-2 text-red-600 font-medium">(Финальный тайбрейк)</span>
          )}
        </div>
        <div className="text-center">
          <span className="text-xl font-bold">
            {fixedSides
              ? match.courtSides?.teamA === "right"
                ? currentSet.teamA
                : currentSet.teamB
              : currentSet.teamB}
            {match.isCompleted &&
              match.winner === (fixedSides ? (match.courtSides?.teamA === "right" ? "teamA" : "teamB") : "teamB") && (
                <Trophy size={20} className="ml-1 text-yellow-500 inline-block" />
              )}
          </span>
        </div>
      </div>

      {allSets.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-[auto_1fr_1fr] gap-2 text-sm">
            <div></div>
            <div className="text-center font-medium">{t("match.teamA")}</div>
            <div className="text-center font-medium">{t("match.teamB")}</div>

            {allSets.map((set, index) => {
              // Skip rendering the current set if the match is completed
              if (match.isCompleted && set.isCurrent) {
                return null
              }

              return (
                <div key={index} className="contents">
                  <div className="font-medium flex items-center">
                    {t("match.setX").replace("{{number}}", (index + 1).toString())}
                    {set.isCurrent && (
                      <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">
                        {t("match.current")}
                      </Badge>
                    )}
                  </div>
                  <div className={`text-center ${set.isFuture ? "text-muted-foreground" : ""}`}>{set.teamA}</div>
                  <div className={`text-center ${set.isFuture ? "text-muted-foreground" : ""}`}>{set.teamB}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
