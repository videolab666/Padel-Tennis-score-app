"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ru, enUS } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getMatches, subscribeToMatchesListUpdates } from "@/lib/match-storage"
import { useLanguage } from "@/contexts/language-context"

export function MatchList() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { language, t } = useLanguage()

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true)
        setError(null)
        const matchList = await getMatches()
        // Сортируем матчи: сначала незавершенные, потом завершенные
        const sortedMatches = [...matchList].sort((a, b) => {
          // Сначала сортируем по статусу завершения
          if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1 // Незавершенные в начале
          }
          // Если статус одинаковый, сортируем по дате (от новых к старым)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        setMatches(sortedMatches)
      } catch (error) {
        console.error("Ошибка при загрузке матчей:", error)
        setError(error.message || "Ошибка при загрузке матчей")
      } finally {
        setLoading(false)
      }
    }

    loadMatches()

    // Подписываемся на обновления списка матчей в реальном времени
    const unsubscribe = subscribeToMatchesListUpdates((updatedMatches) => {
      if (updatedMatches && Array.isArray(updatedMatches)) {
        // Сортируем обновленные матчи: сначала незавершенные, потом завершенные
        const sortedMatches = [...updatedMatches].sort((a, b) => {
          // Сначала сортируем по статусу завершения
          if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1 // Незавершенные в начале
          }
          // Если статус одинаковый, сортируем по дате (от новых к старым)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        setMatches(sortedMatches)
      }
    })

    // Также добавим обработчик события storage для обновления списка матчей
    const handleStorageChange = async () => {
      try {
        const matchList = await getMatches()
        // Сортируем матчи: сначала незавершенные, потом завершенные
        const sortedMatches = [...matchList].sort((a, b) => {
          // Сначала сортируем по статусу завершения
          if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1 // Незавершенные в начале
          }
          // Если статус одинаковый, сортируем по дате (от новых к старым)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        setMatches(sortedMatches)
      } catch (error) {
        console.error("Ошибка при обновлении матчей:", error)
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      // Отписываемся при размонтировании компонента
      if (unsubscribe) {
        unsubscribe()
      }
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">{t("matchList.loading")}</div>
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {t("matchList.error")}: {error}
      </div>
    )
  }

  if (!matches || matches.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">{t("matchList.noMatches")}</div>
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <Link href={`/match/${match.id}`} key={match.id}>
          <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(match.createdAt), {
                    addSuffix: true,
                    locale: language === "ru" ? ru : enUS,
                  })}
                </span>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs sm:text-sm px-2 py-0.5">
                    {match.type === "tennis" ? t("home.tennis") : t("home.padel")}
                  </Badge>
                  {match.courtNumber !== null && match.courtNumber !== undefined && (
                    <Badge
                      variant="outline"
                      className="text-xs sm:text-sm px-2 py-0.5 bg-blue-100 text-blue-800 hover:bg-blue-100"
                    >
                      {t("matchList.court")} {match.courtNumber}
                    </Badge>
                  )}
                  {match.isCompleted ? (
                    <Badge
                      variant="outline"
                      className="text-xs sm:text-sm px-2 py-0.5 bg-green-100 text-green-800 hover:bg-green-100"
                    >
                      {t("matchList.completed")}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-xs sm:text-sm px-2 py-0.5 bg-blue-100 text-blue-800 hover:bg-blue-100"
                    >
                      {t("matchList.inProgress")}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-[2fr_1fr] gap-2">
                <div className="text-left">
                  <div className="mb-1">
                    {match.teamA &&
                      match.teamA.players &&
                      match.teamA.players.map((player, idx) => (
                        <p
                          key={idx}
                          className={`text-xs sm:text-sm truncate ${
                            match.isCompleted && Number(match.score.teamA) > Number(match.score.teamB)
                              ? "font-bold"
                              : "font-medium"
                          }`}
                        >
                          {player.name}
                        </p>
                      ))}
                  </div>
                  <div className="h-px bg-gray-200 my-1.5 w-full"></div>
                  <div>
                    {match.teamB &&
                      match.teamB.players &&
                      match.teamB.players.map((player, idx) => (
                        <p
                          key={idx}
                          className={`text-xs sm:text-sm truncate ${
                            match.isCompleted && Number(match.score.teamB) > Number(match.score.teamA)
                              ? "font-bold"
                              : "font-medium"
                          }`}
                        >
                          {player.name}
                        </p>
                      ))}
                  </div>
                </div>
                <div className="flex flex-col justify-between">
                  <div className="text-right font-bold text-base sm:text-xl">{match.score && match.score.teamA}</div>
                  <div className="text-right font-bold text-base sm:text-xl">{match.score && match.score.teamB}</div>
                </div>
              </div>

              {/* Добавляем код матча для удобства */}
              {match.code && (
                <div className="mt-2 text-xs text-muted-foreground text-right">
                  {t("matchList.code")}: {match.code}
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
