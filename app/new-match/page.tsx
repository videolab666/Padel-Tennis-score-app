"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2, Plus } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { PlayerSelector } from "@/components/player-selector"
import { createMatch } from "@/lib/match-storage"
import { getPlayers, addPlayer, subscribeToPlayersUpdates } from "@/lib/player-storage"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SupabaseStatus } from "@/components/supabase-status"
import { OfflineNotice } from "@/components/offline-notice"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { logEvent } from "@/lib/error-logger"

// Добавим импорт функций для работы с кортами
import { getOccupiedCourts, MAX_COURTS, isCourtAvailable } from "@/lib/court-utils"

export default function NewMatchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultType = searchParams.get("type") || "tennis"

  const [matchType, setMatchType] = useState(defaultType)
  const [matchFormat, setMatchFormat] = useState("doubles") // Изменено на "doubles" по умолчанию
  const [sets, setSets] = useState("3") // Изменено на "3" по умолчанию
  const [scoringSystem, setScoringSystem] = useState("classic")
  const [tiebreakEnabled, setTiebreakEnabled] = useState(true)
  const [tiebreakType, setTiebreakType] = useState("regular")
  const [tiebreakAt, setTiebreakAt] = useState("6-6")
  const [finalSetTiebreak, setFinalSetTiebreak] = useState(true)
  const [goldenGame, setGoldenGame] = useState(false)
  const [goldenPoint, setGoldenPoint] = useState(false)
  const [windbreak, setWindbreak] = useState(false)
  const [players, setPlayers] = useState([])
  const [newPlayerName, setNewPlayerName] = useState("")
  const [loading, setLoading] = useState(true)
  const [isAddingPlayer, setIsAddingPlayer] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [alertType, setAlertType] = useState("success") // success, error, warning

  // Игроки для команд
  const [teamAPlayer1, setTeamAPlayer1] = useState("")
  const [teamAPlayer2, setTeamAPlayer2] = useState("")
  const [teamBPlayer1, setTeamBPlayer1] = useState("")
  const [teamBPlayer2, setTeamBPlayer2] = useState("")

  // Стороны корта
  const [teamASide, setTeamASide] = useState("left")
  const [servingTeam, setServingTeam] = useState("teamA")

  // Добавим состояние для выбора корта и списка занятых кортов
  const [courtNumber, setCourtNumber] = useState<number | null>(null)
  const [occupiedCourts, setOccupiedCourts] = useState<number[]>([])
  const [loadingCourts, setLoadingCourts] = useState(false)

  // Показать уведомление
  const showNotification = (message, type = "success") => {
    setAlertMessage(message)
    setAlertType(type)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  // Обработчик обновления списка игроков
  const handlePlayersUpdate = useCallback((updatedPlayers) => {
    setPlayers(updatedPlayers)
  }, [])

  // Загрузка списка игроков
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const playersList = await getPlayers()
        setPlayers(playersList)
      } catch (error) {
        console.error("Ошибка при загрузке игроков:", error)
        logEvent("error", "Ошибка при загрузке игроков", "NewMatchPage", error)
      } finally {
        setLoading(false)
      }
    }

    loadPlayers()

    // Подписываемся на обновления списка игроков
    const unsubscribe = subscribeToPlayersUpdates(handlePlayersUpdate)

    return () => {
      // Отписываемся при размонтировании компонента
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [handlePlayersUpdate])

  // Добавим эффект для загрузки списка занятых кортов
  useEffect(() => {
    const loadOccupiedCourts = async () => {
      setLoadingCourts(true)
      try {
        const courts = await getOccupiedCourts()
        setOccupiedCourts(courts)
      } catch (error) {
        console.error("Ошибка при загрузке занятых кортов:", error)
        logEvent("error", "Ошибка при загрузке занятых кортов", "NewMatchPage", error)
      } finally {
        setLoadingCourts(false)
      }
    }

    loadOccupiedCourts()
  }, [])

  // Добавление нового игрока
  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) return

    setIsAddingPlayer(true)
    try {
      const newPlayer = {
        id: uuidv4(),
        name: newPlayerName.trim(),
      }

      logEvent("info", "Попытка добавления нового игрока", "NewMatchPage", { name: newPlayerName })

      const result = await addPlayer(newPlayer)

      if (result.success) {
        setNewPlayerName("")
        showNotification(result.message)
        logEvent("info", "Игрок успешно добавлен", "NewMatchPage", { id: newPlayer.id, name: newPlayer.name })
      } else {
        showNotification(result.message, "error")
        logEvent("warn", "Не удалось добавить игрока", "NewMatchPage", {
          name: newPlayerName,
          reason: result.message,
        })
      }
    } catch (error) {
      console.error("Ошибка при добавлении игрока:", error)
      showNotification("Произошла ошибка при добавлении игрока", "error")
      logEvent("error", "Ошибка при добавлении игрока", "NewMatchPage", error)
    } finally {
      setIsAddingPlayer(false)
    }
  }

  // Обновим функцию handleCreateMatch, добавив номер корта
  const handleCreateMatch = async () => {
    // Проверка, что все необходимые игроки выбраны
    if (!teamAPlayer1 || !teamBPlayer1) {
      showNotification("Выберите игроков для обеих команд", "error")
      return
    }

    if (matchFormat === "doubles" && (!teamAPlayer2 || !teamBPlayer2)) {
      showNotification("Для парной игры необходимо выбрать всех игроков", "error")
      return
    }

    // Проверка доступности корта
    if (courtNumber !== null) {
      const isAvailable = await isCourtAvailable(courtNumber)
      if (!isAvailable) {
        showNotification(`Корт ${courtNumber} уже занят. Выберите другой корт.`, "error")
        return
      }
    }

    // Создание объекта матча
    const match = {
      id: uuidv4(),
      type: matchType,
      format: matchFormat,
      createdAt: new Date().toISOString(),
      settings: {
        sets: Number.parseInt(sets),
        scoringSystem: scoringSystem,
        tiebreakEnabled,
        tiebreakType: tiebreakType,
        tiebreakAt,
        finalSetTiebreak,
        goldenGame,
        goldenPoint,
        windbreak,
      },
      teamA: {
        players: [
          { id: teamAPlayer1, name: players.find((p) => p.id === teamAPlayer1)?.name || teamAPlayer1 },
          ...(teamAPlayer2
            ? [{ id: teamAPlayer2, name: players.find((p) => p.id === teamAPlayer2)?.name || teamAPlayer2 }]
            : []),
        ],
        isServing: servingTeam === "teamA",
      },
      teamB: {
        players: [
          { id: teamBPlayer1, name: players.find((p) => p.id === teamBPlayer1)?.name || teamBPlayer1 },
          ...(teamBPlayer2
            ? [{ id: teamBPlayer2, name: players.find((p) => p.id === teamBPlayer2)?.name || teamBPlayer2 }]
            : []),
        ],
        isServing: servingTeam === "teamB",
      },
      score: {
        teamA: 0,
        teamB: 0,
        sets: [],
        currentSet: {
          teamA: 0,
          teamB: 0,
          games: [],
          currentGame: {
            teamA: 0,
            teamB: 0,
          },
        },
        isTiebreak: false,
      },
      currentServer: {
        team: servingTeam,
        playerIndex: 0,
      },
      courtSides: {
        teamA: teamASide,
        teamB: teamASide === "left" ? "right" : "left",
      },
      shouldChangeSides: false,
      history: [],
      isCompleted: false,
      courtNumber: courtNumber,
    }

    // Сохранение матча и переход на страницу матча
    const matchId = await createMatch(match)
    router.push(`/match/${matchId}`)
  }

  // Добавим функцию для проверки, занят ли корт
  const isCourtOccupied = (courtNum) => {
    return occupiedCourts.includes(courtNum)
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      {showAlert && (
        <Alert
          className={`fixed top-4 right-4 w-auto z-50 ${
            alertType === "success"
              ? "bg-green-50 border-green-200"
              : alertType === "error"
                ? "bg-red-50 border-red-200"
                : "bg-amber-50 border-amber-200"
          }`}
        >
          <AlertTitle>
            {alertType === "success" ? "Успешно" : alertType === "error" ? "Ошибка" : "Предупреждение"}
          </AlertTitle>
          <AlertDescription
            className={
              alertType === "success" ? "text-green-800" : alertType === "error" ? "text-red-800" : "text-amber-800"
            }
          >
            {alertMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>
        <SupabaseStatus />
      </div>

      <OfflineNotice />

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Новый матч</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue={matchType} onValueChange={setMatchType}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tennis">Теннис</TabsTrigger>
              <TabsTrigger value="padel">Падел</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            <div>
              <Label>Формат игры</Label>
              <Select value={matchFormat} onValueChange={setMatchFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите формат" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="singles">Одиночная игра</SelectItem>
                  <SelectItem value="doubles">Парная игра</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Количество сетов</Label>
              <RadioGroup value={sets} onValueChange={setSets} className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="sets-1" />
                  <Label htmlFor="sets-1">1 сет</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="sets-2" />
                  <Label htmlFor="sets-2">2 сета (тай-брейк в 3-м)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="sets-3" />
                  <Label htmlFor="sets-3">3 сета</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5" id="sets-5" />
                  <Label htmlFor="sets-5">5 сетов (Гранд-слам)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Система счета</Label>
              <RadioGroup
                value={scoringSystem}
                onValueChange={setScoringSystem}
                className="grid grid-cols-1 gap-2 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="classic" id="scoring-classic" />
                  <Label htmlFor="scoring-classic">Классическая (AD)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no-ad" id="scoring-no-ad" />
                  <Label htmlFor="scoring-no-ad">No-Ad (ровно → решающий мяч)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fast4" id="scoring-fast4" />
                  <Label htmlFor="scoring-fast4">Fast4 (до 4 геймов)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between">
              <Label>Тай-брейк</Label>
              <Switch checked={tiebreakEnabled} onCheckedChange={setTiebreakEnabled} />
            </div>

            {tiebreakEnabled && (
              <>
                <div>
                  <Label>Тип тай-брейка</Label>
                  <RadioGroup
                    value={tiebreakType}
                    onValueChange={setTiebreakType}
                    className="grid grid-cols-1 gap-2 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="regular" id="tiebreak-regular" />
                      <Label htmlFor="tiebreak-regular">Обычный (до 7)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="championship" id="tiebreak-championship" />
                      <Label htmlFor="tiebreak-championship">Чемпионский (до 10)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="super" id="tiebreak-super" />
                      <Label htmlFor="tiebreak-super">Супер-тай-брейк (вместо 3-го сета)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Тай-брейк при счете</Label>
                  <Select value={tiebreakAt} onValueChange={setTiebreakAt}>
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
              <Label>Тай-брейк в решающем сете</Label>
              <Switch checked={finalSetTiebreak} onCheckedChange={setFinalSetTiebreak} />
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label className="text-base font-medium">Дополнительно</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="golden-game" checked={goldenGame} onCheckedChange={setGoldenGame} />
                  <Label htmlFor="golden-game" className="text-sm">
                    Золотой гейм (падел)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="golden-point" checked={goldenPoint} onCheckedChange={setGoldenPoint} />
                  <Label htmlFor="golden-point" className="text-sm">
                    Золотой мяч (40-40 в решающем гейме)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="windbreak" checked={windbreak} onCheckedChange={setWindbreak} />
                  <Label htmlFor="windbreak" className="text-sm">
                    Виндрейк (подача через гейм)
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Игроки</h3>

            <div className="flex gap-2">
              <Input
                placeholder="Добавить нового игрока"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isAddingPlayer && handleAddPlayer()}
                disabled={isAddingPlayer}
              />
              <Button onClick={handleAddPlayer} disabled={isAddingPlayer || !newPlayerName.trim()}>
                {isAddingPlayer ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Добавить
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-4 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Загрузка игроков...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Команда A</Label>
                  <div className="space-y-2 mt-2">
                    <PlayerSelector
                      players={players}
                      value={teamAPlayer1}
                      onChange={setTeamAPlayer1}
                      placeholder="Игрок 1"
                    />

                    {matchFormat === "doubles" && (
                      <PlayerSelector
                        players={players}
                        value={teamAPlayer2}
                        onChange={setTeamAPlayer2}
                        placeholder="Игрок 2"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <Label>Команда B</Label>
                  <div className="space-y-2 mt-2">
                    <PlayerSelector
                      players={players}
                      value={teamBPlayer1}
                      onChange={setTeamBPlayer1}
                      placeholder="Игрок 1"
                    />

                    {matchFormat === "doubles" && (
                      <PlayerSelector
                        players={players}
                        value={teamBPlayer2}
                        onChange={setTeamBPlayer2}
                        placeholder="Игрок 2"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Первая подача - перемещена вверх */}
            <div className="w-full border rounded-md p-2 sm:p-3 mb-4">
              <Label className="block mb-1 sm:mb-2 text-[0.65rem] sm:text-sm">Первая подача</Label>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div
                  className={`p-2 rounded cursor-pointer ${servingTeam === "teamA" ? "bg-green-200 font-medium" : "bg-gray-100"}`}
                  onClick={() => setServingTeam("teamA")}
                >
                  Команда A
                </div>
                <div
                  className={`p-2 rounded cursor-pointer ${servingTeam === "teamB" ? "bg-green-200 font-medium" : "bg-gray-100"}`}
                  onClick={() => setServingTeam("teamB")}
                >
                  Команда B
                </div>
              </div>
            </div>

            {/* Сторона команды A */}
            <div className="w-full border rounded-md p-2 sm:p-3 mb-4">
              <div className="flex justify-between items-center mb-1 sm:mb-2">
                <Label className="text-[0.65rem] sm:text-sm">Сторона команды A</Label>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div
                  className={`p-2 rounded cursor-pointer ${teamASide === "left" ? "bg-blue-200 font-medium" : "bg-gray-100"}`}
                  onClick={() => setTeamASide("left")}
                >
                  Левая
                </div>
                <div
                  className={`p-2 rounded cursor-pointer ${teamASide === "right" ? "bg-blue-200 font-medium" : "bg-gray-100"}`}
                  onClick={() => setTeamASide("right")}
                >
                  Правая
                </div>
              </div>
            </div>

            {/* Выбор корта */}
            <div className="space-y-2 mb-4">
              <Label className="text-[0.65rem] sm:text-sm">Выбор корта</Label>
              <div className="border rounded-md p-2 sm:p-3">
                <div className="mb-2">
                  <RadioGroup
                    value={courtNumber === null ? "no-court" : courtNumber.toString()}
                    onValueChange={(value) => {
                      if (value === "no-court") {
                        setCourtNumber(null)
                      } else {
                        setCourtNumber(Number.parseInt(value))
                      }
                    }}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value="no-court" id="no-court" className="scale-75 sm:scale-100" />
                      <Label htmlFor="no-court" className="text-[0.65rem] sm:text-sm">
                        Без корта
                      </Label>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: MAX_COURTS }, (_, i) => i + 1).map((num) => (
                        <div key={num} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={num.toString()}
                            id={`court-${num}`}
                            disabled={isCourtOccupied(num) || loadingCourts}
                            className="scale-75 sm:scale-100"
                          />
                          <Label
                            htmlFor={`court-${num}`}
                            className={`text-[0.65rem] sm:text-sm ${isCourtOccupied(num) ? "text-muted-foreground line-through" : ""}`}
                          >
                            Корт {num}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {loadingCourts ? (
                  <div className="text-center py-2 text-[0.65rem] sm:text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                    Проверка доступности кортов...
                  </div>
                ) : occupiedCourts.length > 0 ? (
                  <div className="text-[0.65rem] sm:text-sm text-muted-foreground">
                    Занятые корты: {occupiedCourts.sort((a, b) => a - b).join(", ")}
                  </div>
                ) : (
                  <div className="text-[0.65rem] sm:text-sm text-green-600">Все корты свободны</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleCreateMatch}>
            Начать матч
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
