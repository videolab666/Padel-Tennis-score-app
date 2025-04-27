"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getOccupiedCourts, MAX_COURTS, getMatchByCourtNumber } from "@/lib/court-utils"
import { Loader2, ExternalLink, Tv2, FileJson, Copy } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function CourtsList() {
  const [occupiedCourts, setOccupiedCourts] = useState<Record<number, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCourtsStatus = async () => {
    try {
      setLoading(true)
      // Получаем список занятых кортов
      const courts = await getOccupiedCourts()

      // Если список пуст, просто завершаем загрузку
      if (!courts || courts.length === 0) {
        setOccupiedCourts({})
        setLoading(false)
        return
      }

      // Для каждого занятого корта получаем информацию о матче
      const courtsInfo: Record<number, any> = {}
      for (const courtNumber of courts) {
        try {
          const match = await getMatchByCourtNumber(courtNumber)
          if (match) {
            courtsInfo[courtNumber] = match
          }
        } catch (matchError) {
          console.error(`Ошибка при загрузке матча для корта ${courtNumber}:`, matchError)
          // Продолжаем с другими кортами
        }
      }

      setOccupiedCourts(courtsInfo)
    } catch (error) {
      console.error("Ошибка при загрузке статуса кортов:", error)
      toast({
        title: "Ошибка соединения",
        description: "Не удалось загрузить статус кортов. Проверьте соединение с интернетом.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourtsStatus()

    // Обновляем статус кортов каждые 30 секунд
    const interval = setInterval(loadCourtsStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleCopyJsonUrl = async (courtNumber: number) => {
    try {
      const jsonUrl = `${window.location.origin}/api/court/${courtNumber}`
      await navigator.clipboard.writeText(jsonUrl)
      toast({
        title: "URL скопирован",
        description: `URL для JSON API корта ${courtNumber} скопирован в буфер обмена`,
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать URL",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        Загрузка статуса кортов...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4 text-destructive">
        <p className="mb-2">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setError(null)
            loadCourtsStatus()
          }}
        >
          Повторить попытку
        </Button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Статус кортов</CardTitle>
        <CardDescription>Текущие матчи на кортах</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Изменяем расположение кортов для десктопной версии */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: MAX_COURTS }, (_, i) => i + 1).map((courtNumber) => {
            const match = occupiedCourts[courtNumber]

            return (
              <Card key={courtNumber} className={`${match ? "border-blue-300" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <Badge variant={match ? "default" : "outline"} className="mb-0">
                      Корт {courtNumber}
                    </Badge>
                    <Badge
                      variant={match ? "default" : "outline"}
                      className={match ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}
                    >
                      {match ? "Занят" : "Свободен"}
                    </Badge>
                  </div>

                  {match ? (
                    <div className="mb-3">
                      <div className="text-sm font-medium">{match.teamA.players.map((p) => p.name).join(" / ")}</div>
                      <div className="text-xs text-muted-foreground">vs</div>
                      <div className="text-sm font-medium">{match.teamB.players.map((p) => p.name).join(" / ")}</div>
                      <div className="text-lg font-bold mt-1 text-center">
                        {match.score.teamA} - {match.score.teamB}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground text-sm mb-3">Нет активных матчей</div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/court/${courtNumber}`} passHref>
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        Счет
                      </Button>
                    </Link>
                    <Link href={`/court-vmix/${courtNumber}`} target="_blank" passHref>
                      <Button variant="outline" size="sm" className="w-full">
                        <Tv2 className="h-3.5 w-3.5 mr-1" />
                        vMix
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(`/api/court/${courtNumber}`, "_blank")}
                    >
                      <FileJson className="h-3.5 w-3.5 mr-1" />
                      JSON
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleCopyJsonUrl(courtNumber)}
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      URL
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
