"use client"

import { useState, useEffect, useRef } from "react"
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
import { getPlayers, addPlayer } from "@/lib/player-storage"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SupabaseStatus } from "@/components/supabase-status"
import { OfflineNotice } from "@/components/offline-notice"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { logEvent } from "@/lib/error-logger"
import { useLanguage } from "@/contexts/language-context"

// Добавим импорт функций для работы с кортами
import { getOccupiedCourts, MAX_COURTS, isCourtAvailable } from "@/lib/court-utils"

export default function NewMatchPage() {
  const { t } = useLanguage()
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
  const [finalSetTiebreak, setFinalSetTiebreak] = useState(false)
  const [finalSetTiebreakLength, setFinalSetTiebreakLength] = useState("10") // New state for final set tiebreak length
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
  const playersRef = useRef([]) // Reference to keep track of players without re-renders

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

  // Force re-render counter
  const [, setForceUpdate] = useState(0)

  // Показать уведомление
  const showNotification = (message, type = "success") => {
    setAlertMessage(message)
    setAlertType(type)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  // Загрузка списка игроков
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const playersList = await getPlayers()
        setPlayers(playersList)
        playersRef.current = playersList // Store in ref for direct access
      } catch (error) {
        console.error("Ошибка при загрузке игроков:", error)
        logEvent("error", "Ошибка при загрузке игроков", "NewMatchPage", error)
      } finally {
        setLoading(false)
      }
    }

    loadPlayers()

    // Set up event listener for storage changes (for cross-tab synchronization)
    const handleStorageChange = (e) => {
      if (e.key === "padel-tennis-players") {
        try {
          const updatedPlayers = JSON.parse(e.newValue || "[]")
          setPlayers(updatedPlayers)
          playersRef.current = updatedPlayers
        } catch (error) {
          console.error("Error parsing players from storage:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

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

  // Add this useEffect after the other useEffect hooks
  useEffect(() => {
    // For 2-set matches, ensure final set tiebreak is enabled
    // but don't change the tiebreak type for regular sets
    if (sets === "2") {
      setFinalSetTiebreak(true)
    }
  }, [sets])

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

        // Directly update the players array and ref
        const updatedPlayers = [...playersRef.current, newPlayer]
        playersRef.current = updatedPlayers
        setPlayers(updatedPlayers)

        // Force a re-render to ensure UI updates
        setForceUpdate((prev) => prev + 1)

        console.log("Player added:", newPlayer)
        console.log("Updated players list:", updatedPlayers)
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
      showNotification(t("newMatch.selectAllPlayers"), "error")
      return
    }

    if (matchFormat === "doubles" && (!teamAPlayer2 || !teamBPlayer2)) {
      showNotification(t("newMatch.selectAllPlayersForDoubles"), "error")
      return
    }

    // Проверка доступности корта
    if (courtNumber !== null) {
      const isAvailable = await isCourtAvailable(courtNumber)
      if (!isAvailable) {
        showNotification(t("newMatch.courtOccupied", { court: courtNumber }), "error")
        return
      }
    }

    // Создание объекта матча
    const generateNumericId = () => {
      // Генерируем 11-значный цифровой код
      let numericId = ""
      for (let i = 0; i < 11; i++) {
        numericId += Math.floor(Math.random() * 10).toString()
      }
      return numericId
    }

    // Ensure proper settings for final set tiebreak
    const matchSettings = {
      sets: Number.parseInt(sets),
      scoringSystem: scoringSystem,
      tiebreakEnabled,
      tiebreakType, // Используем выбранный тип тайбрейка напрямую
      tiebreakAt,
      finalSetTiebreak: sets === "2" ? true : finalSetTiebreak, // Всегда включаем для матчей из 2 сетов
      finalSetTiebreakLength: Number.parseInt(finalSetTiebreakLength),
      goldenGame,
      goldenPoint,
      windbreak,
    }

    // Добавляем отладочную информацию
    console.log("Creating match with settings:", {
      sets: sets,
      finalSetTiebreak: matchSettings.finalSetTiebreak,
      finalSetTiebreakLength: matchSettings.finalSetTiebreakLength,
      tiebreakType: matchSettings.tiebreakType,
    })

    const match = {
      id: generateNumericId(),
      type: matchType,
      format: matchFormat,
      createdAt: new Date().toISOString(),
      settings: matchSettings,
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
            {alertType === "success"
              ? t("common.success")
              : alertType === "error"
                ? t("common.error")
                : t("common.warning")}
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
          {t("common.back")}
        </Button>
        <SupabaseStatus />
      </div>

      <OfflineNotice />

      <Card>
        <CardHeader>
          <CardTitle className="text-center">{t("newMatch.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue={matchType} onValueChange={setMatchType}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tennis">{t("home.tennis")}</TabsTrigger>
              <TabsTrigger value="padel">{t("home.padel")}</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            <div>
              <Label>{t("newMatch.format")}</Label>
              <Select value={matchFormat} onValueChange={setMatchFormat}>
                <SelectTrigger>
                  <SelectValue placeholder={t("newMatch.selectFormat")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="singles">{t("newMatch.singles")}</SelectItem>
                  <SelectItem value="doubles">{t("newMatch.doubles")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t("newMatch.sets")}</Label>
              <RadioGroup value={sets} onValueChange={setSets} className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="sets-1" />
                  <Label htmlFor="sets-1">{t("newMatch.oneSets")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="sets-3" />
                  <Label htmlFor="sets-3">{t("newMatch.threeSets")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5" id="sets-5" />
                  <Label htmlFor="sets-5">{t("newMatch.fiveSets")}</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between">
              <Label>{t("newMatch.finalSetTiebreak")}</Label>
              <Switch
                checked={finalSetTiebreak}
                onCheckedChange={(checked) => {
                  setFinalSetTiebreak(checked)
                  console.log("Final set tiebreak changed to:", checked)
                }}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
              />
            </div>

            {finalSetTiebreak && (
              <div className="space-y-2 border border-green-200 rounded-md p-3 bg-green-50">
                <Label>{t("newMatch.finalSetTiebreakLength")}</Label>
                <Select
                  value={finalSetTiebreakLength}
                  onValueChange={(value) => {
                    setFinalSetTiebreakLength(value)
                    // Удаляем синхронизацию с типом тайбрейка
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("newMatch.selectTiebreakLength")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">{t("newMatch.tiebreakLength7")}</SelectItem>
                    <SelectItem value="10">{t("newMatch.tiebreakLength10")}</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-green-700 mt-1">
                  <p>{t("newMatch.finalSetTiebreakLengthDescription")}</p>
                  <p className="mt-1 font-medium">{t("newMatch.finalSetTiebreakNote")}</p>
                </div>
              </div>
            )}

            <div>
              <Label>{t("newMatch.scoringSystem")}</Label>
              <RadioGroup
                value={scoringSystem}
                onValueChange={setScoringSystem}
                className="grid grid-cols-1 gap-2 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="classic" id="scoring-classic" />
                  <Label htmlFor="scoring-classic">{t("newMatch.classicScoring")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no-ad" id="scoring-no-ad" />
                  <Label htmlFor="scoring-no-ad">{t("newMatch.noAdScoring")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fast4" id="scoring-fast4" />
                  <Label htmlFor="scoring-fast4">{t("newMatch.fast4Scoring")}</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between">
              <Label>{t("newMatch.tiebreak")}</Label>
              <Switch
                checked={tiebreakEnabled}
                onCheckedChange={setTiebreakEnabled}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
              />
            </div>

            {tiebreakEnabled && (
              <>
                <div>
                  <Label>{t("newMatch.tiebreakType")}</Label>
                  <RadioGroup
                    value={tiebreakType}
                    onValueChange={(value) => {
                      setTiebreakType(value)
                      // Удаляем синхронизацию с длиной финального тайбрейка
                    }}
                    className="grid grid-cols-1 gap-2 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="regular" id="tiebreak-regular" />
                      <div>
                        <Label htmlFor="tiebreak-regular" className="font-medium">
                          {t("newMatch.regularTiebreak")}
                        </Label>
                        <p className="text-xs text-muted-foreground">До 7 очков (с разницей в 2 очка)</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="championship" id="tiebreak-championship" />
                      <div>
                        <Label htmlFor="tiebreak-championship" className="font-medium">
                          {t("newMatch.championshipTiebreak")}
                        </Label>
                        <p className="text-xs text-muted-foreground">До 10 очков (с разницей в 2 очка)</p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>{t("newMatch.tiebreakAt")}</Label>
                  <Select value={tiebreakAt} onValueChange={setTiebreakAt}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("newMatch.selectTiebreakScore")} />
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

            <div className="space-y-2 border-t pt-4">
              <Label className="text-base font-medium">{t("newMatch.additional")}</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="golden-game" checked={goldenGame} onCheckedChange={setGoldenGame} />
                  <Label htmlFor="golden-game" className="text-sm">
                    {t("newMatch.goldenGame")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="golden-point" checked={goldenPoint} onCheckedChange={setGoldenPoint} />
                  <Label htmlFor="golden-point" className="text-sm">
                    {t("newMatch.goldenPoint")}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="windbreak" checked={windbreak} onCheckedChange={setWindbreak} />
                  <Label htmlFor="windbreak" className="text-sm">
                    {t("newMatch.windbreak")}
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">{t("newMatch.players")}</h3>

            <div className="flex gap-2">
              <Input
                placeholder={t("players.addPlayer")}
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isAddingPlayer && handleAddPlayer()}
                disabled={isAddingPlayer}
              />
              <Button onClick={handleAddPlayer} disabled={isAddingPlayer || !newPlayerName.trim()}>
                {isAddingPlayer ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                {t("common.add")}
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-4 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                {t("common.loadingPlayers")}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("match.teamA")}</Label>
                  <div className="space-y-2 mt-2">
                    <PlayerSelector
                      players={players}
                      value={teamAPlayer1}
                      onChange={setTeamAPlayer1}
                      placeholder={t("newMatch.player1")}
                    />

                    {matchFormat === "doubles" && (
                      <PlayerSelector
                        players={players}
                        value={teamAPlayer2}
                        onChange={setTeamAPlayer2}
                        placeholder={t("newMatch.player2")}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <Label>{t("match.teamB")}</Label>
                  <div className="space-y-2 mt-2">
                    <PlayerSelector
                      players={players}
                      value={teamBPlayer1}
                      onChange={setTeamBPlayer1}
                      placeholder={t("newMatch.player1")}
                    />

                    {matchFormat === "doubles" && (
                      <PlayerSelector
                        players={players}
                        value={teamBPlayer2}
                        onChange={setTeamBPlayer2}
                        placeholder={t("newMatch.player2")}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Первая подача - перемещена вверх */}
            <div className="w-full border rounded-md p-2 sm:p-3 mb-4">
              <Label className="block mb-1 sm:mb-2 text-[0.65rem] sm:text-sm">{t("newMatch.firstServe")}</Label>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div
                  className={`p-2 rounded cursor-pointer ${servingTeam === "teamA" ? "bg-green-200 font-medium" : "bg-gray-100"}`}
                  onClick={() => setServingTeam("teamA")}
                >
                  {t("match.teamA")}
                </div>
                <div
                  className={`p-2 rounded cursor-pointer ${servingTeam === "teamB" ? "bg-green-200 font-medium" : "bg-gray-100"}`}
                  onClick={() => setServingTeam("teamB")}
                >
                  {t("match.teamB")}
                </div>
              </div>
            </div>

            {/* Сторона команды A */}
            <div className="w-full border rounded-md p-2 sm:p-3 mb-4">
              <div className="flex justify-between items-center mb-1 sm:mb-2">
                <Label className="text-[0.65rem] sm:text-sm">{t("newMatch.teamASide")}</Label>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div
                  className={`p-2 rounded cursor-pointer ${teamASide === "left" ? "bg-blue-200 font-medium" : "bg-gray-100"}`}
                  onClick={() => setTeamASide("left")}
                >
                  {t("newMatch.left")}
                </div>
                <div
                  className={`p-2 rounded cursor-pointer ${teamASide === "right" ? "bg-blue-200 font-medium" : "bg-gray-100"}`}
                  onClick={() => setTeamASide("right")}
                >
                  {t("newMatch.right")}
                </div>
              </div>
            </div>

            {/* Выбор корта */}
            <div className="space-y-2 mb-4">
              <Label className="text-[0.65rem] sm:text-sm">{t("newMatch.courtSelection")}</Label>
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
                        {t("newMatch.noCourt")}
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
                            {t("newMatch.court")} {num}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {loadingCourts ? (
                  <div className="text-center py-2 text-[0.65rem] sm:text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                    {t("newMatch.checkingCourtAvailability")}
                  </div>
                ) : occupiedCourts.length > 0 ? (
                  <div className="text-[0.65rem] sm:text-sm text-muted-foreground">
                    {t("newMatch.occupiedCourts")}: {occupiedCourts.sort((a, b) => a - b).join(", ")}
                  </div>
                ) : (
                  <div className="text-[0.65rem] sm:text-sm text-green-600">{t("newMatch.allCourtsAvailable")}</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleCreateMatch}>
            {t("newMatch.startMatch")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
