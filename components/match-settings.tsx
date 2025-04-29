"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { MinusIcon, PlusIcon, LockOpenIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

export function MatchSettings({ match, updateMatch }) {
  const [tiebreakEnabled, setTiebreakEnabled] = useState(match?.settings?.tiebreakEnabled)
  const [tiebreakType, setTiebreakType] = useState(match?.settings?.tiebreakType || "regular")
  const [tiebreakAt, setTiebreakAt] = useState(match?.settings?.tiebreakAt)
  const [finalSetTiebreak, setFinalSetTiebreak] = useState(match?.settings?.finalSetTiebreak)
  const [scoringSystem, setScoringSystem] = useState(match?.settings?.scoringSystem || "classic")
  const [goldenGame, setGoldenGame] = useState(match?.settings?.goldenGame || false)
  const [goldenPoint, setGoldenPoint] = useState(match?.settings?.goldenPoint || false)
  const [windbreak, setWindbreak] = useState(match?.settings?.windbreak || false)

  // Состояние для редактирования счета сетов
  const [editSetIndex, setEditSetIndex] = useState(null)
  const [editSetScoreA, setEditSetScoreA] = useState(0)
  const [editSetScoreB, setEditSetScoreB] = useState(0)

  const applySettings = () => {
    const updatedMatch = { ...match }

    // Отключаем историю
    updatedMatch.history = []

    // Обновляем настройки
    updatedMatch.settings = {
      ...updatedMatch.settings,
      tiebreakEnabled,
      tiebreakType,
      tiebreakAt,
      finalSetTiebreak,
      scoringSystem,
      goldenGame,
      goldenPoint,
      windbreak,
    }

    try {
      updateMatch(updatedMatch)
    } catch (error) {
      console.error("Ошибка при обновлении настроек:", error)

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

  const startTiebreak = () => {
    const updatedMatch = { ...match }

    // Отключаем историю
    updatedMatch.history = []

    // Начинаем тай-брейк
    updatedMatch.score.currentSet.isTiebreak = true
    updatedMatch.score.currentSet.currentGame = {
      teamA: 0,
      teamB: 0,
    }

    try {
      updateMatch(updatedMatch)
    } catch (error) {
      console.error("Ошибка при запуске тай-брейка:", error)

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

  const endTiebreak = (winner) => {
    const updatedMatch = { ...match }

    // Отключаем историю
    updatedMatch.history = []

    // Завершаем тай-брейк и увеличиваем счет победителя
    updatedMatch.score.currentSet[winner]++
    updatedMatch.score.currentSet.isTiebreak = false

    // Завершаем сет
    winSet(winner, updatedMatch)
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
    const setsToWin = Math.ceil(match.settings.sets / 2)
    if (updatedMatch.score[team] >= setsToWin) {
      // Запрашиваем подтверждение перед завершением матча
      if (confirm(`Команда ${team === "teamA" ? "A" : "B"} выиграла матч! Завершить матч?`)) {
        updatedMatch.isCompleted = true
        updatedMatch.winner = team
        updateMatch(updatedMatch)
        return
      }
    }

    // Начинаем новый сет
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

    updateMatch(updatedMatch)
  }

  const endMatch = () => {
    console.log("endMatch function called")

    // Create a copy of the match
    const updatedMatch = { ...match }

    // Mark as completed
    updatedMatch.isCompleted = true
    updatedMatch.history = []

    // Determine winner based on sets
    if (updatedMatch.score.teamA > updatedMatch.score.teamB) {
      updatedMatch.winner = "teamA"
    } else if (updatedMatch.score.teamB > updatedMatch.score.teamA) {
      updatedMatch.winner = "teamB"
    } else {
      // If sets are equal, determine by games in current set
      if (updatedMatch.score.currentSet.teamA > updatedMatch.score.currentSet.teamB) {
        updatedMatch.winner = "teamA"
      } else if (updatedMatch.score.currentSet.teamB > updatedMatch.score.currentSet.teamA) {
        updatedMatch.winner = "teamB"
      } else {
        // If games are also equal, use current game points
        if (updatedMatch.score.currentSet.currentGame.teamA > updatedMatch.score.currentSet.currentGame.teamB) {
          updatedMatch.winner = "teamA"
        } else {
          updatedMatch.winner = "teamB"
        }
      }
    }

    console.log("Updating match with:", updatedMatch)
    updateMatch(updatedMatch)
  }

  const unlockMatch = () => {
    const updatedMatch = { ...match }
    updatedMatch.isCompleted = false
    updatedMatch.history = []
    updateMatch(updatedMatch)
  }

  const updateSetScore = (index, team, delta) => {
    const updatedMatch = { ...match }
    updatedMatch.history = []

    if (index === match.score.sets.length) {
      // Обновляем текущий сет
      if (delta > 0 || updatedMatch.score.currentSet[team] > 0) {
        updatedMatch.score.currentSet[team] += delta
        if (updatedMatch.score.currentSet[team] < 0) {
          updatedMatch.score.currentSet[team] = 0
        }
      }
    } else if (index < match.score.sets.length) {
      // Обновляем завершенный сет
      if (delta > 0 || updatedMatch.score.sets[index][team] > 0) {
        updatedMatch.score.sets[index][team] += delta
        if (updatedMatch.score.sets[index][team] < 0) {
          updatedMatch.score.sets[index][team] = 0
        }
      }

      // Определяем победителя сета
      const set = updatedMatch.score.sets[index]
      if (set.teamA > set.teamB) {
        set.winner = "teamA"
      } else if (set.teamB > set.teamA) {
        set.winner = "teamB"
      } else {
        set.winner = null
      }

      // Пересчитываем общий счет матча
      updatedMatch.score.teamA = updatedMatch.score.sets.filter((set) => set.winner === "teamA").length
      updatedMatch.score.teamB = updatedMatch.score.sets.filter((set) => set.winner === "teamB").length
    }

    updateMatch(updatedMatch)
  }

  const startEditSet = (index) => {
    if (index < match.score.sets.length) {
      const set = match.score.sets[index]
      setEditSetScoreA(set.teamA)
      setEditSetScoreB(set.teamB)
      setEditSetIndex(index)
    } else if (index === match.score.sets.length) {
      // Текущий сет
      setEditSetScoreA(match.score.currentSet.teamA)
      setEditSetScoreB(match.score.currentSet.teamB)
      setEditSetIndex(index)
    }
  }

  const saveSetScore = () => {
    if (editSetIndex === null) return

    const updatedMatch = { ...match }
    updatedMatch.history = []

    if (editSetIndex < match.score.sets.length) {
      // Обновляем завершенный сет
      updatedMatch.score.sets[editSetIndex].teamA = editSetScoreA
      updatedMatch.score.sets[editSetIndex].teamB = editSetScoreB

      // Определяем победителя сета
      if (editSetScoreA > editSetScoreB) {
        updatedMatch.score.sets[editSetIndex].winner = "teamA"
      } else if (editSetScoreB > editSetScoreA) {
        updatedMatch.score.sets[editSetIndex].winner = "teamB"
      }

      // Пересчитываем общий счет матча
      updatedMatch.score.teamA = updatedMatch.score.sets.filter((set) => set.winner === "teamA").length
      updatedMatch.score.teamB = updatedMatch.score.sets.filter((set) => set.winner === "teamB").length
    } else if (editSetIndex === match.score.sets.length) {
      // Обновляем текущий сет
      updatedMatch.score.currentSet.teamA = editSetScoreA
      updatedMatch.score.currentSet.teamB = editSetScoreB
    }

    updateMatch(updatedMatch)
    setEditSetIndex(null)
  }

  // Создаем массив для отображения всех запланированных сетов
  const totalSets = match.settings.sets || 3 // По умолчанию 3 сета
  const allSetsArray = []

  // Добавляем завершенные сеты
  for (let i = 0; i < match.score.sets.length; i++) {
    allSetsArray.push({
      index: i,
      isCompleted: true,
      isCurrent: false,
      teamA: match.score.sets[i].teamA,
      teamB: match.score.sets[i].teamB,
    })
  }

  // Добавляем текущий сет
  allSetsArray.push({
    index: match.score.sets.length,
    isCompleted: false,
    isCurrent: true,
    teamA: match.score.currentSet.teamA,
    teamB: match.score.currentSet.teamB,
  })

  // Добавляем будущие сеты
  for (let i = match.score.sets.length + 1; i < totalSets; i++) {
    allSetsArray.push({
      index: i,
      isCompleted: false,
      isCurrent: false,
      teamA: 0,
      teamB: 0,
    })
  }

  if (!match) return null

  return (
    <>
      {/* Score Editing Card */}
      <Card className="w-full mb-4">
        <CardHeader>
          <CardTitle>Редактирование счета</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-[1fr_2fr_2fr] gap-2 items-center">
              <div className="font-medium text-center">Сет</div>
              <div className="font-medium text-center">Команда A</div>
              <div className="font-medium text-center">Команда B</div>
            </div>

            {/* All Sets */}
            {allSetsArray.map((set) => (
              <div
                key={set.index}
                className={`grid grid-cols-[1fr_2fr_2fr] gap-2 items-center ${
                  set.isCurrent ? "bg-blue-50 rounded-md p-2" : ""
                }`}
              >
                <div className="text-center font-medium">
                  {set.index + 1}
                  {set.isCurrent && <span className="text-xs block text-blue-600">текущий</span>}
                </div>
                <div>
                  <div className="flex">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-r-none"
                      onClick={() => updateSetScore(set.index, "teamA", -1)}
                      disabled={match.isCompleted}
                    >
                      <MinusIcon className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      value={
                        editSetIndex === set.index
                          ? editSetScoreA
                          : set.isCurrent
                            ? match.score.currentSet.teamA
                            : set.isCompleted
                              ? match.score.sets[set.index].teamA
                              : 0
                      }
                      onChange={(e) => {
                        setEditSetIndex(set.index)
                        setEditSetScoreA(Number.parseInt(e.target.value) || 0)
                      }}
                      onBlur={() => {
                        if (editSetIndex === set.index) {
                          saveSetScore()
                        }
                      }}
                      disabled={match.isCompleted || (!set.isCompleted && !set.isCurrent)}
                      className="text-center rounded-none border-x-0"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-l-none"
                      onClick={() => updateSetScore(set.index, "teamA", 1)}
                      disabled={match.isCompleted || (!set.isCompleted && !set.isCurrent)}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <div className="flex">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-r-none"
                      onClick={() => updateSetScore(set.index, "teamB", -1)}
                      disabled={match.isCompleted || (!set.isCompleted && !set.isCurrent)}
                    >
                      <MinusIcon className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      value={
                        editSetIndex === set.index
                          ? editSetScoreB
                          : set.isCurrent
                            ? match.score.currentSet.teamB
                            : set.isCompleted
                              ? match.score.sets[set.index].teamB
                              : 0
                      }
                      onChange={(e) => {
                        setEditSetIndex(set.index)
                        setEditSetScoreB(Number.parseInt(e.target.value) || 0)
                      }}
                      onBlur={() => {
                        if (editSetIndex === set.index) {
                          saveSetScore()
                        }
                      }}
                      disabled={match.isCompleted || (!set.isCompleted && !set.isCurrent)}
                      className="text-center rounded-none border-x-0"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-l-none"
                      onClick={() => updateSetScore(set.index, "teamB", 1)}
                      disabled={match.isCompleted || (!set.isCompleted && !set.isCurrent)}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t">
            <Button
              variant="outline"
              className="w-full mb-2"
              onClick={startTiebreak}
              disabled={match.isCompleted || match.score.currentSet.isTiebreak}
            >
              Начать тай-брейк вручную
            </Button>

            {match.score.currentSet.isTiebreak && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button variant="outline" onClick={() => endTiebreak("teamA")} disabled={match.isCompleted}>
                  Тай-брейк выиграла A
                </Button>
                <Button variant="outline" onClick={() => endTiebreak("teamB")} disabled={match.isCompleted}>
                  Тай-брейк выиграла B
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Match Settings Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Настройки матча</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-md text-sm text-center">
            Код матча: <span className="font-bold">{match.id}</span>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Система счета</Label>
              <RadioGroup
                value={scoringSystem}
                onValueChange={setScoringSystem}
                className="grid grid-cols-1 gap-2 mt-2"
                disabled={match.isCompleted}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="classic" id="scoring-classic" disabled={match.isCompleted} />
                  <Label htmlFor="scoring-classic">Классическая (AD)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no-ad" id="scoring-no-ad" disabled={match.isCompleted} />
                  <Label htmlFor="scoring-no-ad">No-Ad (ровно → решающий мяч)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fast4" id="scoring-fast4" disabled={match.isCompleted} />
                  <Label htmlFor="scoring-fast4">Fast4 (до 4 геймов)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="tiebreak-enabled">Тай-брейк</Label>
              <Switch
                id="tiebreak-enabled"
                checked={tiebreakEnabled}
                onCheckedChange={setTiebreakEnabled}
                disabled={match.isCompleted}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
              />
            </div>

            {tiebreakEnabled && (
              <>
                <div>
                  <Label>Тип тай-брейка</Label>
                  <RadioGroup
                    value={tiebreakType}
                    onValueChange={setTiebreakType}
                    className="grid grid-cols-1 gap-2 mt-2"
                    disabled={match.isCompleted}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="regular" id="tiebreak-regular" disabled={match.isCompleted} />
                      <Label htmlFor="tiebreak-regular">Обычный (до 7)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="championship" id="tiebreak-championship" disabled={match.isCompleted} />
                      <Label htmlFor="tiebreak-championship">Чемпионский (до 10)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="super" id="tiebreak-super" disabled={match.isCompleted} />
                      <Label htmlFor="tiebreak-super">Супер-тай-брейк (вместо 3-го сета)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Тай-брейк при счете</Label>
                  <Select value={tiebreakAt} onValueChange={setTiebreakAt} disabled={match.isCompleted}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите счет для тай-брейка" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6-6">6:6</SelectItem>
                      <SelectItem value="5-5">5:5</SelectItem>
                      <SelectItem value="4-4">4:4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="final-set-tiebreak">Тай-брейк в решающем сете</Label>
              <Switch
                id="final-set-tiebreak"
                checked={finalSetTiebreak}
                onCheckedChange={setFinalSetTiebreak}
                disabled={match.isCompleted}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
              />
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label className="text-base font-medium">Дополнительно</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="golden-game"
                    checked={goldenGame}
                    onCheckedChange={setGoldenGame}
                    disabled={match.isCompleted}
                  />
                  <Label htmlFor="golden-game" className="text-sm">
                    Золотой гейм (падел)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="golden-point"
                    checked={goldenPoint}
                    onCheckedChange={setGoldenPoint}
                    disabled={match.isCompleted}
                  />
                  <Label htmlFor="golden-point" className="text-sm">
                    Золотой мяч (40-40 в решающем гейме)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="windbreak"
                    checked={windbreak}
                    onCheckedChange={setWindbreak}
                    disabled={match.isCompleted}
                  />
                  <Label htmlFor="windbreak" className="text-sm">
                    Виндрейк (подача через гейм)
                  </Label>
                </div>
              </div>
            </div>

            <Button className="w-full" onClick={applySettings} disabled={match.isCompleted}>
              Применить настройки
            </Button>
          </div>

          <div className="pt-2 border-t">
            {match.isCompleted ? (
              <Button variant="outline" className="w-full mt-2" onClick={unlockMatch}>
                <LockOpenIcon className="mr-2 h-4 w-4" />
                Разблокировать матч
              </Button>
            ) : (
              <Button
                variant="destructive"
                className="w-full mt-2"
                onClick={() => {
                  if (
                    confirm(
                      "Вы уверены, что хотите завершить матч? Вы сможете разблокировать его позже, если потребуется.",
                    )
                  ) {
                    endMatch()
                  }
                }}
              >
                Завершить матч
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
