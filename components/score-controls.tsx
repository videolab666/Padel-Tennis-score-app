"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MinusIcon, PlusIcon, ArrowLeftRightIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { shouldChangeSides } from "@/lib/tennis-utils"
import { useSoundEffects } from "@/hooks/use-sound-effects"
import { SoundToggle } from "@/components/sound-toggle"
import { useLanguage } from "@/contexts/language-context"

export function ScoreControls({ match, updateMatch }) {
  // Используем хук для звуковых эффектов
  const { soundsEnabled, playSound, toggleSounds } = useSoundEffects()
  const { t } = useLanguage()

  if (!match) return null

  // Извлекаем текущий сет из объекта match
  const currentSet = match.score.currentSet

  // Изменяем функцию changeSides, чтобы она автоматически меняла стороны
  const changeSides = (updatedMatch = null) => {
    const matchToUpdate = updatedMatch || { ...match, history: [] }

    // Меняем стороны
    matchToUpdate.courtSides = {
      teamA: matchToUpdate.courtSides.teamA === "left" ? "right" : "left",
      teamB: matchToUpdate.courtSides.teamB === "left" ? "right" : "left",
    }

    // Сбрасываем флаг необходимости смены сторон
    matchToUpdate.shouldChangeSides = false

    if (!updatedMatch) {
      updateMatch(matchToUpdate)
    }

    return matchToUpdate
  }

  // Изменяем функцию addPoint, чтобы автоматически менять стороны
  const addPoint = (team) => {
    // Создаем новый объект матча
    const updatedMatch = { ...match }

    // Полностью отключаем историю для экономии места
    updatedMatch.history = []

    const otherTeam = team === "teamA" ? "teamB" : "teamA"
    const currentSet = updatedMatch.score.currentSet

    // Если есть флаг необходимости смены сторон, меняем стороны автоматически
    if (updatedMatch.shouldChangeSides) {
      changeSides(updatedMatch)
    }

    if (currentSet.isTiebreak) {
      // Логика для тай-брейка
      currentSet.currentGame[team]++

      // Определяем количество очков для победы в тай-брейке в зависимости от типа
      let pointsToWin = 7 // Обычный тай-брейк по умолчанию

      // Если это супер-тай-брейк в решающем сете
      if (currentSet.isSuperTiebreak) {
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
        isSuperTiebreak: currentSet.isSuperTiebreak,
      })

      // Проверка на победу в тай-брейке
      if (
        currentSet.currentGame[team] >= pointsToWin &&
        currentSet.currentGame[team] - currentSet.currentGame[otherTeam] >= 2
      ) {
        // Победа в тай-брейке = победа в сете
        // Увеличиваем счет в сете для победителя тай-брейка
        currentSet[team]++
        // Воспроизводим звук выигрыша сета
        playSound("set")
        return winSet(team, updatedMatch)
      }

      // Смена подающего в тай-брейке (каждые 2 очка, кроме первого)
      const totalPoints = currentSet.currentGame.teamA + currentSet.currentGame.teamB
      if (totalPoints % 2 === 1) {
        switchServer(updatedMatch)
      }

      // Проверка необходимости смены сторон в тай-брейке (каждые 6 очков)
      if (totalPoints > 0 && totalPoints % 6 === 0) {
        updatedMatch.shouldChangeSides = true
      }

      // Воспроизводим звук очка
      playSound("point")
    } else {
      // Обычный гейм
      const currentGame = currentSet.currentGame

      // Логика тенниса: 0, 15, 30, 40, гейм
      if (currentGame[team] === 0) {
        currentGame[team] = 15
        playSound("point")
      } else if (currentGame[team] === 15) {
        currentGame[team] = 30
        playSound("point")
      } else if (currentGame[team] === 30) {
        currentGame[team] = 40
        playSound("point")
      } else if (currentGame[team] === 40) {
        if (currentGame[otherTeam] < 40) {
          // Победа в гейме
          playSound("game")
          return winGame(team, updatedMatch)
        } else if (currentGame[otherTeam] === 40) {
          // Преимущество
          currentGame[team] = "Ad"
          playSound("point")
        } else if (currentGame[otherTeam] === "Ad") {
          // Ровно
          currentGame[team] = 40
          currentGame[otherTeam] = 40
          playSound("point")
        }
      } else if (currentGame[team] === "Ad") {
        // Победа в гейме после преимущества
        playSound("game")
        return winGame(team, updatedMatch)
      }
    }

    try {
      updateMatch(updatedMatch)
    } catch (error) {
      console.error("Ошибка при обновлении счета:", error)

      // Если произошла ошибка, пробуем упростить объект матча
      const minimalMatch = {
        ...updatedMatch,
        history: [],
      }

      // Удаляем историю геймов для экономии места
      if (minimalMatch.score && minimalMatch.score.currentSet) {
        minimalMatch.score.currentSet.games = []
      }

      if (minimalMatch.score && minimalMatch.score.sets) {
        minimalMatch.score.sets = minimalMatch.score.sets.map((set) => ({
          teamA: set.teamA,
          teamB: set.teamB,
          winner: set.winner,
        }))
      }

      updateMatch(minimalMatch)
    }
  }

  // Изменяем функцию removePoint, чтобы автоматически менять стороны
  const removePoint = (team) => {
    // Создаем новый объект матча
    const updatedMatch = { ...match }

    // Полностью отключаем историю для экономии места
    updatedMatch.history = []

    // Если есть флаг необходимости смены сторон, меняем стороны автоматически
    if (updatedMatch.shouldChangeSides) {
      changeSides(updatedMatch)
    }

    const otherTeam = team === "teamA" ? "teamB" : "teamA"
    const currentSet = updatedMatch.score.currentSet

    if (currentSet.isTiebreak) {
      // Логика для тай-брейка
      if (currentSet.currentGame[team] > 0) {
        currentSet.currentGame[team]--
        // Воспроизводим звук отмены
        playSound("undo")
      }
    } else {
      // Обычный гейм
      const currentGame = currentSet.currentGame

      // Логика тенниса: 0, 15, 30, 40, гейм (в обратном порядке)
      if (currentGame[team] === "Ad") {
        currentGame[team] = 40
        playSound("undo")
      } else if (currentGame[team] === 40) {
        currentGame[team] = 30
        playSound("undo")
      } else if (currentGame[team] === 30) {
        currentGame[team] = 15
        playSound("undo")
      } else if (currentGame[team] === 15) {
        currentGame[team] = 0
        playSound("undo")
      }
    }

    try {
      updateMatch(updatedMatch)
    } catch (error) {
      console.error("Ошибка при обновлении счета:", error)
      // Если произошла ошибка, пробуем упростить объект матча
      updateMatch({
        ...updatedMatch,
        history: [],
      })
    }
  }

  // Изменим функции обработчиков, чтобы они не использовали состояния
  // Заменим функцию handleAddPointTeamA:
  const handleAddPointTeamA = () => {
    addPoint("teamA")
  }

  // Заменим функцию handleAddPointTeamB:
  const handleAddPointTeamB = () => {
    addPoint("teamB")
  }

  // Заменим функцию handleRemovePointTeamA:
  const handleRemovePointTeamA = () => {
    removePoint("teamA")
  }

  // Заменим функцию handleRemovePointTeamB:
  const handleRemovePointTeamB = () => {
    removePoint("teamB")
  }

  const winGame = (team, updatedMatch) => {
    const otherTeam = team === "teamA" ? "teamB" : "teamA"
    const currentSet = updatedMatch.score.currentSet

    // Увеличиваем счет в сете
    currentSet[team]++

    // Сохраняем минимальную информацию о гейме
    currentSet.games.push({
      winner: team,
    })

    // Сбрасываем текущий гейм
    currentSet.currentGame = {
      teamA: 0,
      teamB: 0,
    }

    // Смена подающего
    switchServer(updatedMatch)

    // Проверка на необходимость смены сторон (после нечетного количества геймов)
    const totalGames = currentSet.teamA + currentSet.teamB
    if (shouldChangeSides(totalGames)) {
      updatedMatch.shouldChangeSides = true
    }

    // Проверка на финальный сет и тайбрейк в финальном сете
    const isDecidingSet = updatedMatch.score.sets.length + 1 === updatedMatch.settings.sets
    const isTwoSetsMatch =
      updatedMatch.settings.sets === 2 && updatedMatch.score.teamA === 1 && updatedMatch.score.teamB === 1

    // Проверяем, нужно ли начать тайбрейк в финальном сете
    if (updatedMatch.settings.finalSetTiebreak && (isDecidingSet || isTwoSetsMatch)) {
      // Если это финальный сет и включен тайбрейк в финальном сете
      const tiebreakAt = Number.parseInt(match.settings.tiebreakAt.split("-")[0])
      if (currentSet.teamA === tiebreakAt && currentSet.teamB === tiebreakAt) {
        // Начинаем тайбрейк в финальном сете
        currentSet.isTiebreak = true
        currentSet.isSuperTiebreak = true // Отмечаем, что это супер-тайбрейк
        console.log("Starting final set tiebreak at", tiebreakAt, "all")
      }
    }
    // Обычный тайбрейк для нефинальных сетов
    else if (match.settings.tiebreakEnabled) {
      const tiebreakAt = Number.parseInt(match.settings.tiebreakAt.split("-")[0])
      if (currentSet.teamA === tiebreakAt && currentSet.teamB === tiebreakAt) {
        // Начинаем тай-брейк
        currentSet.isTiebreak = true
        console.log("Starting regular tiebreak at", tiebreakAt, "all")
      }
    }

    // Проверка на победу в сете
    if (currentSet.teamA >= 6 && currentSet.teamA - currentSet.teamB >= 2) {
      playSound("set")
      return winSet("teamA", updatedMatch)
    } else if (currentSet.teamB >= 6 && currentSet.teamB - currentSet.teamA >= 2) {
      playSound("set")
      return winSet("teamB", updatedMatch)
    }

    try {
      updateMatch(updatedMatch)
    } catch (error) {
      console.error("Ошибка при обновлении после выигрыша гейма:", error)

      // Если произошла ошибка, пробуем упростить объект матча
      const minimalMatch = {
        ...updatedMatch,
        history: [],
      }

      // Удаляем историю геймов для экономии места
      if (minimalMatch.score && minimalMatch.score.currentSet) {
        minimalMatch.score.currentSet.games = []
      }

      if (minimalMatch.score && minimalMatch.score.sets) {
        minimalMatch.score.sets = minimalMatch.score.sets.map((set) => ({
          teamA: set.teamA,
          teamB: set.teamB,
          winner: set.winner,
        }))
      }

      updateMatch(minimalMatch)
    }
  }

  const winSet = (team, updatedMatch) => {
    // Увеличиваем счет матча
    updatedMatch.score[team]++

    // Сохраняем текущий сет в историю сетов
    updatedMatch.score.sets.push({
      teamA: updatedMatch.score.currentSet.teamA,
      teamB: updatedMatch.score.currentSet.teamB,
      winner: team,
    })

    // Проверка на победу в матче
    const totalSets = match.settings.sets

    // Special handling for 2-set matches
    if (totalSets === 2) {
      // If a team has won 2 sets, the match is over
      if (updatedMatch.score[team] === 2) {
        // Воспроизводим звук победы в матче
        playSound("match")

        // Запрашиваем подтверждение перед завершением матча
        if (confirm(`Команда ${team === "teamA" ? "A" : "B"} выиграла матч! Завершить матч?`)) {
          updatedMatch.isCompleted = true
          updatedMatch.winner = team
          updateMatch(updatedMatch)
          return
        }
      }
      // If the score is 1-1, we continue to a deciding tiebreak
      // Do not end the match here
    } else {
      // For matches with 1, 3, or 5 sets, use the standard logic
      const setsToWin = Math.ceil(match.settings.sets / 2)
      if (updatedMatch.score[team] >= setsToWin) {
        // Воспроизводим звук победы в матче
        playSound("match")

        // Запрашиваем подтверждение перед завершением матча
        if (confirm(`Команда ${team === "teamA" ? "A" : "B"} выиграла матч! Завершить матч?`)) {
          updatedMatch.isCompleted = true
          updatedMatch.winner = team
          updateMatch(updatedMatch)
          return
        }
      }
    }

    // Проверяем, нужно ли использовать супер-тай-брейк вместо третьего сета
    const isDecidingSet = updatedMatch.score.sets.length + 1 === updatedMatch.settings.sets
    const isTwoSetsMatch = updatedMatch.settings.sets === 2
    const isThirdSetTiebreak =
      updatedMatch.settings.finalSetTiebreak &&
      (isDecidingSet || (isTwoSetsMatch && updatedMatch.score.teamA === 1 && updatedMatch.score.teamB === 1))

    // Start new set
    let newSet
    if (isThirdSetTiebreak) {
      // Если это решающий сет и включен тай-брейк в решающем сете
      // Сразу начинаем с тайбрейка вместо обычного сета
      const tiebreakLength = updatedMatch.settings.finalSetTiebreakLength || 10

      newSet = {
        teamA: 0,
        teamB: 0,
        games: [],
        currentGame: {
          teamA: 0,
          teamB: 0,
        },
        isTiebreak: true,
        isSuperTiebreak: true,
        tiebreakLength: tiebreakLength,
      }
      console.log(`Starting final set as a tiebreak with length: ${tiebreakLength}`)
    } else {
      // Обычный сет
      newSet = {
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
    updatedMatch.score.currentSet = newSet

    // Смена сторон после нечетного количества сетов
    if (updatedMatch.score.sets.length % 2 === 1) {
      // Меняем стороны автоматически при смене сета
      changeSides(updatedMatch)
    }

    try {
      updateMatch(updatedMatch)
    } catch (error) {
      console.error("Ошибка при обновлении после выигрыша сета:", error)

      // Если произошла ошибка, пробуем упростить объект матча
      const minimalMatch = {
        ...updatedMatch,
        history: [],
      }

      // Удаляем историю геймов для экономии места
      if (minimalMatch.score && minimalMatch.score.sets) {
        minimalMatch.score.sets = minimalMatch.score.sets.map((set) => ({
          teamA: set.teamA,
          teamB: set.teamB,
          winner: set.winner,
        }))
      }

      updateMatch(minimalMatch)
    }
  }

  const switchServer = (updatedMatch) => {
    const currentTeam = updatedMatch.currentServer.team
    const otherTeam = currentTeam === "teamA" ? "teamB" : "teamA"

    // Для одиночной игры просто меняем команду
    if (match.format === "singles") {
      updatedMatch.currentServer.team = otherTeam
      updatedMatch.currentServer.playerIndex = 0
    } else {
      // Для парной игры - после каждого гейма подача переходит к следующему игроку по порядку
      // Порядок: A1 -> B1 -> A2 -> B2 -> A1 и т.д.
      if (currentTeam === "teamA") {
        // Если подавала команда A, переходим к команде B
        updatedMatch.currentServer.team = "teamB"
        // Сохраняем тот же индекс игрока
        // (если подавал A1, то теперь B1; если подавал A2, то теперь B2)
      } else {
        // Если подавала команда B, переходим к команде A и меняем игрока
        updatedMatch.currentServer.team = "teamA"
        // Меняем индекс игрока на следующего в команде A
        updatedMatch.currentServer.playerIndex = updatedMatch.currentServer.playerIndex === 0 ? 1 : 0
      }
    }

    return updatedMatch
  }

  const manualSwitchServer = () => {
    const updatedMatch = { ...match }

    // Отключаем историю
    updatedMatch.history = []

    // Меняем подающего
    switchServer(updatedMatch)

    updateMatch(updatedMatch)
  }

  // Функция для отображения имен игроков команды
  const renderPlayerNames = (team) => {
    const players = team.players

    // Для одиночной игры просто возвращаем имя игрока
    if (match.format === "singles" || players.length === 1) {
      return (
        <div className="text-sm text-muted-foreground text-center w-full overflow-hidden truncate">
          {players[0].name}
        </div>
      )
    }

    // Для парной игры отображаем каждое имя на отдельной строке
    return (
      <div className="text-sm text-muted-foreground text-center w-full">
        <div className="truncate overflow-hidden">{players[0].name}</div>
        <div className="truncate overflow-hidden">{players[1].name}</div>
      </div>
    )
  }

  // Проверяем, является ли текущий сет финальным
  const isDecidingSet = match.score.sets.length + 1 === match.settings.sets
  const isTwoSetsMatch = match.settings.sets === 2 && match.score.teamA === 1 && match.score.teamB === 1
  const isFinalSet = isDecidingSet || isTwoSetsMatch

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {t("match.scoreControls")}
          {isFinalSet && match.settings.finalSetTiebreak && !currentSet.isTiebreak && (
            <span className="ml-2 text-sm text-red-600 font-normal">
              (Финальный сет - тайбрейк при {match.settings.tiebreakAt})
            </span>
          )}
          {currentSet.isTiebreak && currentSet.isSuperTiebreak && (
            <span className="ml-2 text-sm text-red-600 font-normal">
              (Финальный тайбрейк до {match.settings.finalSetTiebreakLength})
            </span>
          )}
        </CardTitle>
        <SoundToggle enabled={soundsEnabled} onToggle={toggleSounds} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card className="w-full">
            <CardContent className="p-2 sm:p-4">
              <div className="min-h-[60px] sm:min-h-[80px] flex flex-col justify-center w-full">
                <h3 className="text-sm sm:text-base font-medium text-center w-full overflow-hidden truncate">
                  {t("match.teamA")}
                  <span className="ml-2 text-xs sm:text-sm text-muted-foreground">
                    ({match.courtSides?.teamA === "left" ? t("match.leftSide") : t("match.rightSide")})
                  </span>
                </h3>
                {renderPlayerNames(match.teamA)}
              </div>
              <div className="flex gap-2 items-center mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemovePointTeamA}
                  className="flex-none w-8 h-8 p-0 score-button score-button-minus"
                  disabled={match.isCompleted}
                >
                  <MinusIcon className="h-3 w-3" />
                </Button>
                <Button
                  onClick={handleAddPointTeamA}
                  className="flex-1 h-10 sm:h-12 text-sm sm:text-lg font-bold score-button score-button-plus"
                  disabled={match.isCompleted}
                >
                  <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                  {t("match.addPoint")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardContent className="p-2 sm:p-4">
              <div className="min-h-[60px] sm:min-h-[80px] flex flex-col justify-center w-full">
                <h3 className="text-sm sm:text-base font-medium text-center w-full overflow-hidden truncate">
                  {t("match.teamB")}
                  <span className="ml-2 text-xs sm:text-sm text-muted-foreground">
                    ({match.courtSides?.teamB === "left" ? t("match.leftSide") : t("match.rightSide")})
                  </span>
                </h3>
                {renderPlayerNames(match.teamB)}
              </div>
              <div className="flex gap-2 items-center mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemovePointTeamB}
                  className="flex-none w-8 h-8 p-0 score-button score-button-minus"
                  disabled={match.isCompleted}
                >
                  <MinusIcon className="h-3 w-3" />
                </Button>
                <Button
                  onClick={handleAddPointTeamB}
                  className="flex-1 h-10 sm:h-12 text-sm sm:text-lg font-bold score-button score-button-plus"
                  disabled={match.isCompleted}
                >
                  <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                  {t("match.addPoint")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {match.shouldChangeSides && (
          <Alert className="bg-red-50 border-red-200">
            <AlertDescription className="text-red-700 font-medium">{t("match.needToSwitchSides")}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 text-xs sm:text-sm py-1 sm:py-2 score-button transition-all hover:bg-blue-50"
            onClick={manualSwitchServer}
            disabled={match.isCompleted}
          >
            {t("match.switchServer")}
          </Button>

          <Button
            variant="outline"
            className="flex-1 text-xs sm:text-sm py-1 sm:py-2 score-button transition-all hover:bg-blue-50"
            onClick={() => changeSides()}
            disabled={match.isCompleted}
          >
            <ArrowLeftRightIcon className="h-4 w-4 mr-1" />
            {t("match.switchSides")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
