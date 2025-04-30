"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { getOccupiedCourts, MAX_COURTS } from "@/lib/court-utils"
import { VmixButton } from "@/components/vmix-button"
import { FullscreenButton } from "@/components/fullscreen-button"
import { logEvent } from "@/lib/error-logger"

export function CourtsList() {
  const [occupiedCourts, setOccupiedCourts] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Загрузка списка занятых кортов
  const loadOccupiedCourts = async () => {
    try {
      setLoading(true)
      const courts = await getOccupiedCourts()
      setOccupiedCourts(courts)
      logEvent("info", "Список занятых кортов загружен", "courts-list", { courts })
    } catch (error) {
      console.error("Ошибка при загрузке занятых кортов:", error)
      logEvent("error", "Ошибка при загрузке занятых кортов", "courts-list", error)
    } finally {
      setLoading(false)
    }
  }

  // Обновление списка кортов
  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await loadOccupiedCourts()
    } finally {
      setRefreshing(false)
    }
  }

  // Загрузка при монтировании компонента
  useEffect(() => {
    loadOccupiedCourts()
  }, [])

  // Проверка, занят ли корт
  const isCourtOccupied = (courtNumber) => {
    return occupiedCourts.includes(courtNumber)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Статус кортов</CardTitle>
          <CardDescription>Информация о занятых кортах</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="sr-only">Обновить</span>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {Array.from({ length: MAX_COURTS }, (_, i) => i + 1).map((courtNumber) => {
              const occupied = isCourtOccupied(courtNumber)
              return (
                <div
                  key={courtNumber}
                  className={`p-3 rounded-lg border ${
                    occupied ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-lg font-medium">Корт {courtNumber}</div>
                    <Badge variant={occupied ? "success" : "outline"}>{occupied ? "Занят" : "Свободен"}</Badge>
                    {occupied && (
                      <div className="flex flex-col gap-1 w-full mt-1">
                        <VmixButton courtNumber={courtNumber} directLink={true} size="sm" className="w-full" />
                        <FullscreenButton courtNumber={courtNumber} size="sm" className="w-full" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
