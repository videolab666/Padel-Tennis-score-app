"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
// Добавим импорт для новой иконки
import { ArrowLeft, Share2, Copy, Download, Upload, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScoreBoard } from "@/components/score-board"
import { ScoreControls } from "@/components/score-controls"
import { MatchSettings } from "@/components/match-settings"
import { SupabaseStatus } from "@/components/supabase-status"
import { OfflineNotice } from "@/components/offline-notice"
import {
  getMatch,
  updateMatch,
  getMatchShareUrl,
  exportMatchToJson,
  importMatchFromJson,
  subscribeToMatchUpdates,
} from "@/lib/match-storage"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
// Добавим импорт для VmixButton
import { VmixButton } from "@/components/vmix-button"
import { Badge } from "@/components/ui/badge"

type MatchParams = {
  params: {
    id: string
  }
}

export default function MatchPage({ params }: MatchParams) {
  const router = useRouter()
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [importData, setImportData] = useState("")
  const [activeTab, setActiveTab] = useState("match")

  useEffect(() => {
    const loadMatch = async () => {
      try {
        if (!params.id || params.id === "[object%20Promise]") {
          setError("Некорректный ID матча")
          setLoading(false)
          return
        }

        const matchData = await getMatch(params.id)
        if (matchData) {
          // Убедимся, что структура матча полная
          if (!matchData.score.sets) {
            matchData.score.sets = []
          }
          setMatch(matchData)
          setError("")
        } else {
          setError("Матч не найден")
        }
      } catch (err) {
        setError("Ошибка загрузки матча")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadMatch()

    // Подписываемся на обновления матча в реальном времени
    const unsubscribe = subscribeToMatchUpdates(params.id, (updatedMatch) => {
      if (updatedMatch) {
        setMatch(updatedMatch)
        setError("")
      } else {
        // Если матч был удален, показываем ошибку
        setError("Матч не найден или был удален")
      }
    })

    // Добавляем обработчик события match-updated
    const handleMatchUpdated = async (event) => {
      if (event.detail && event.detail.id === params.id) {
        // Перезагружаем матч при получении события обновления
        const matchData = await getMatch(params.id)
        if (matchData) {
          setMatch(matchData)
          setError("")
        }
      }
    }

    window.addEventListener("match-updated", handleMatchUpdated)

    return () => {
      // Отписываемся при размонтировании компонента
      if (unsubscribe) {
        unsubscribe()
      }
      window.removeEventListener("match-updated", handleMatchUpdated)
    }
  }, [params.id])

  const handleUpdateMatch = async (updatedMatch) => {
    try {
      // Отключаем функцию отмены для экономии места
      updatedMatch.history = []

      await updateMatch(updatedMatch)
      setMatch(updatedMatch)

      // Показываем уведомление об успешном обновлении
      setAlertMessage("Счет обновлен")
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 2000)
    } catch (err) {
      console.error("Ошибка обновления матча:", err)

      // Если произошла ошибка, пробуем упростить объект матча
      try {
        // Создаем минимальную версию матча
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

        await updateMatch(minimalMatch)
        setMatch(minimalMatch)

        // Показываем уведомление о проблеме
        setAlertMessage("Данные матча были упрощены из-за ограничений хранилища")
        setShowAlert(true)
        setTimeout(() => setShowAlert(false), 3000)
      } catch (innerErr) {
        console.error("Критическая ошибка обновления матча:", innerErr)
        setError("Не удалось обновить матч. Попробуйте обновить страницу.")
      }
    }
  }

  const handleShare = () => {
    const url = getMatchShareUrl(params.id)

    if (navigator.share) {
      navigator.share({
        title: "Теннисный матч",
        text: "Следите за счетом матча в реальном времени",
        url,
      })
    } else {
      navigator.clipboard.writeText(url)
      setAlertMessage("Ссылка скопирована в буфер обмена")
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 2000)
    }
  }

  const copyMatchId = () => {
    navigator.clipboard.writeText(params.id)
    setAlertMessage("Код матча скопирован в буфер обмена")
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 2000)
  }

  const handleExportMatch = async () => {
    const jsonData = await exportMatchToJson(params.id)
    if (jsonData) {
      navigator.clipboard.writeText(jsonData)
      setAlertMessage("Данные матча скопированы в буфер обмена")
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 2000)
    }
  }

  const handleImportMatch = async () => {
    if (!importData.trim()) {
      setAlertMessage("Введите данные для импорта")
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 2000)
      return
    }

    try {
      const matchId = await importMatchFromJson(importData)
      if (matchId) {
        setAlertMessage("Матч успешно импортирован")
        setShowAlert(true)
        setTimeout(() => {
          setShowAlert(false)
          router.push(`/match/${matchId}`)
        }, 2000)
      } else {
        throw new Error("Ошибка импорта")
      }
    } catch (err) {
      setAlertMessage("Ошибка при импорте матча. Проверьте формат данных.")
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
    }
  }

  // Если матч не найден, предлагаем создать новый
  const handleCreateNewMatch = () => {
    router.push("/new-match")
  }

  if (loading) {
    return <div className="container max-w-4xl mx-auto px-4 py-8 text-center">Загрузка матча...</div>
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          На главную
        </Button>
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Ошибка</h2>
          <p className="mb-4">{error}</p>
          <Button onClick={handleCreateNewMatch}>Создать новый матч</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {showAlert && (
        <Alert className="fixed top-4 right-4 w-auto z-50 bg-green-50 border-green-200">
          <AlertTitle>Уведомление</AlertTitle>
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}

      {/* Добавим кнопку для перехода на страницу просмотра счета в блок с кнопками в верхней части страницы */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            На главную
          </Button>
          {match && match.courtNumber !== null && (
            <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">
              Корт {match.courtNumber}
            </Badge>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <SupabaseStatus />
        </div>
      </div>

      {/* Добавим блок с основными кнопками, которые будут растягиваться на мобильных устройствах */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
        <Button variant="outline" onClick={handleShare} className="w-full">
          <Share2 className="mr-2 h-4 w-4" />
          Поделиться
        </Button>
        <Button variant="outline" onClick={() => router.push(`/match/${params.id}/view`)} className="w-full">
          <ExternalLink className="mr-2 h-4 w-4" />
          Просмотр счета
        </Button>
      </div>

      <OfflineNotice />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="match">Матч</TabsTrigger>
          <TabsTrigger value="export">Экспорт/Импорт</TabsTrigger>
        </TabsList>

        <TabsContent value="match">
          <Card className="mb-6 p-4">
            <ScoreBoard match={match} updateMatch={handleUpdateMatch} />
          </Card>

          <div className="flex flex-col gap-4 w-full">
            <ScoreControls match={match} updateMatch={handleUpdateMatch} />
            <MatchSettings match={match} updateMatch={handleUpdateMatch} />
          </div>
        </TabsContent>

        <TabsContent value="export">
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Экспорт матча</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Скопируйте данные матча для сохранения или передачи на другое устройство
              </p>
              <Button onClick={handleExportMatch}>
                <Download className="mr-2 h-4 w-4" />
                Экспортировать данные
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Импорт матча</h3>
              <p className="text-sm text-muted-foreground mb-4">Вставьте данные матча для импорта</p>
              <Textarea
                placeholder="Вставьте данные матча в формате JSON"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="mb-4"
                rows={6}
              />
              <Button onClick={handleImportMatch}>
                <Upload className="mr-2 h-4 w-4" />
                Импортировать данные
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      {activeTab === "match" && (
        <Card className="mt-6 p-4">
          <h3 className="text-sm font-medium mb-3 text-muted-foreground">Технические функции</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            <Button variant="outline" onClick={copyMatchId} className="w-full text-sm" size="sm">
              <Copy className="mr-2 h-4 w-4" />
              Код матча
            </Button>
            <VmixButton matchId={params.id} courtNumber={match?.courtNumber} className="w-full text-sm" size="sm" />
            {match?.courtNumber && (
              <Button
                variant="outline"
                onClick={() => window.open(`/api/court/${match.courtNumber}`, "_blank")}
                className="w-full text-sm"
                size="sm"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                JSON КОРТ {match.courtNumber}
              </Button>
            )}
            {match?.courtNumber && (
              <Button
                variant="outline"
                onClick={() => window.open(`/court-vmix/${match.courtNumber}`, "_blank")}
                className="w-full text-sm"
                size="sm"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                vMix корт {match.courtNumber}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => window.open(`/api/vmix/${params.id}`, "_blank")}
              className="w-full text-sm"
              size="sm"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              JSON МАТЧ
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(`/vmix/${params.id}`, "_blank")}
              className="w-full text-sm"
              size="sm"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              vMix матч
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
