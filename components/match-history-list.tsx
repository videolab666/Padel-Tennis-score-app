"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
// Custom function to replace date-fns formatDistanceToNow
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`

  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`
}

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Filter, RefreshCw, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { deleteMatch, getAllMatches, getMatches } from "@/lib/match-storage"
import { toast } from "@/components/ui/use-toast"

type Match = {
  id: string
  date: string
  team1: {
    player1: string
    player2: string
    score: number
  }
  team2: {
    player1: string
    player2: string
    score: number
  }
  completed: boolean
  courtNumber?: number | null
}

interface MatchHistoryListProps {
  showControls?: boolean
}

export function MatchHistoryList({ showControls = false }: MatchHistoryListProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([])
  const [courtFilter, setCourtFilter] = useState<string>("all")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [matchToDelete, setMatchToDelete] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    // Загружаем матчи при монтировании компонента
    loadMatches()
  }, [])

  const loadMatches = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Загрузка матчей...")

      // Используем функцию getAllMatches из match-storage.ts
      const allMatches = await getAllMatches()
      console.log("Получено матчей:", allMatches.length, allMatches)

      if (allMatches && allMatches.length > 0) {
        setMatches(allMatches)
        setFilteredMatches(allMatches)
      } else {
        // Если getAllMatches не вернул матчи, пробуем получить их напрямую
        console.log("getAllMatches вернул пустой массив, пробуем getMatches...")
        const matchesFromStorage = await getMatches()
        console.log("getMatches вернул:", matchesFromStorage.length, matchesFromStorage)

        if (matchesFromStorage && matchesFromStorage.length > 0) {
          // Преобразуем формат данных для совместимости с компонентом
          const formattedMatches = matchesFromStorage.map((match) => ({
            id: match.id,
            date: match.createdAt || new Date().toISOString(),
            team1: {
              player1: match.teamA?.players?.[0]?.name || "Игрок 1",
              player2: match.teamA?.players?.[1]?.name || "Игрок 2",
              score: match.score?.teamA || 0,
            },
            team2: {
              player1: match.teamB?.players?.[0]?.name || "Игрок 3",
              player2: match.teamB?.players?.[1]?.name || "Игрок 4",
              score: match.score?.teamB || 0,
            },
            completed: match.isCompleted || false,
            courtNumber: match.courtNumber || null,
          }))

          setMatches(formattedMatches)
          setFilteredMatches(formattedMatches)
        } else {
          // Если и это не помогло, проверяем localStorage напрямую
          console.log("Проверяем localStorage напрямую...")

          // Проверяем все возможные ключи
          const keys = ["padelMatches", "tennis_padel_matches", "matches"]
          let foundMatches = null

          for (const key of keys) {
            const savedMatches = localStorage.getItem(key)
            if (savedMatches) {
              try {
                const parsedMatches = JSON.parse(savedMatches)
                console.log(`Найдены матчи по ключу ${key}:`, parsedMatches)
                if (Array.isArray(parsedMatches) && parsedMatches.length > 0) {
                  foundMatches = parsedMatches
                  break
                }
              } catch (e) {
                console.error(`Ошибка при парсинге матчей из localStorage по ключу ${key}:`, e)
              }
            }
          }

          if (foundMatches) {
            setMatches(foundMatches)
            setFilteredMatches(foundMatches)
          } else {
            setError("Матчи не найдены в хранилище")
          }
        }
      }
    } catch (error) {
      console.error("Ошибка при загрузке матчей:", error)
      setError(`Ошибка при загрузке матчей: ${error.message}`)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить историю матчей",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (courtFilter === "all") {
      setFilteredMatches(matches)
    } else {
      const courtNumber = Number.parseInt(courtFilter)
      setFilteredMatches(matches.filter((match) => match.courtNumber === courtNumber))
    }
  }, [courtFilter, matches])

  const openDeleteDialog = (id: string) => {
    setMatchToDelete(id)
    setDialogOpen(true)
  }

  const handleDeleteMatch = async () => {
    if (!matchToDelete) return

    setIsDeleting(true)
    try {
      await deleteMatch(matchToDelete)
      setMatches((prevMatches) => prevMatches.filter((match) => match.id !== matchToDelete))
      toast({
        title: "Матч удален",
        description: "Матч был успешно удален из истории",
      })
    } catch (error) {
      console.error("Ошибка при удалении матча:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось удалить матч",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDialogOpen(false)
      setMatchToDelete(null)
    }
  }

  // Получаем уникальные номера кортов для фильтра
  const courtNumbers = Array.from(new Set(matches.map((match) => match.courtNumber).filter(Boolean))).sort(
    (a, b) => (a || 0) - (b || 0),
  )

  if (isLoading) {
    return <div className="text-center py-8">Загрузка матчей...</div>
  }

  if (error) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={loadMatches} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Попробовать снова
        </Button>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-muted-foreground">Нет матчей. Начните с создания нового матча!</p>
        <Button onClick={loadMatches} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Обновить
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {showControls && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={courtFilter} onValueChange={setCourtFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Фильтр по корту" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все корты</SelectItem>
                {courtNumbers.map((court) => (
                  <SelectItem key={court} value={court?.toString() || ""}>
                    Корт {court}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" onClick={loadMatches}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
        </div>
      )}

      {filteredMatches.map((match) => (
        <Card key={match.id} className="hover:bg-muted/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {match.date ? formatTimeAgo(new Date(match.date)) : "Recently"}
                </span>
                {match.courtNumber && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    Корт {match.courtNumber}
                  </Badge>
                )}
              </div>
              {match.completed ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                  Завершен
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                  В процессе
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
              <div className="text-left">
                <p className="font-medium truncate">{match.team1.player1}</p>
                <p className="font-medium truncate">{match.team1.player2}</p>
              </div>
              <div className="text-center font-bold text-xl">
                {match.team1.score} - {match.team2.score}
              </div>
              <div className="text-right">
                <p className="font-medium truncate">{match.team2.player1}</p>
                <p className="font-medium truncate">{match.team2.player2}</p>
              </div>
            </div>

            {showControls && (
              <div className="flex justify-between mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/match/${match.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    Просмотр
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => openDeleteDialog(match.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Удалить
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить матч?</AlertDialogTitle>
            <AlertDialogDescription>Это действие нельзя отменить. Матч будет удален из истории.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMatch}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-700"
            >
              {isDeleting ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
