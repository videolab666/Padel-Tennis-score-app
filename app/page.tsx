import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MatchList } from "@/components/match-list"
import { SupabaseStatus } from "@/components/supabase-status"
import { OfflineNotice } from "@/components/offline-notice"
// Добавим импорт иконки History
import { Bug, Users, History } from "lucide-react"

// Добавим импорт компонента CourtsList
import { CourtsList } from "@/components/courts-list"

export default function HomePage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold">Tennis & Padel Scoreboard</h1>
        <p className="text-muted-foreground">Отслеживайте счет в реальном времени</p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <SupabaseStatus />
        </div>
      </header>

      <OfflineNotice />

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Создать новый матч</CardTitle>
            <CardDescription>Настройте новую игру с выбранными параметрами</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Link href="/new-match?type=tennis">
                  <Button className="w-full">Теннис</Button>
                </Link>
                <Link href="/new-match?type=padel">
                  <Button className="w-full">Падел</Button>
                </Link>
              </div>
              {/* Добавляем кнопку "Игроки" под кнопками "Теннис" и "Падел" */}
              <Link href="/players">
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Управление игроками
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Активные матчи */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Активные матчи</CardTitle>
          <CardDescription>Текущие и недавние матчи</CardDescription>
        </CardHeader>
        <CardContent>
          <MatchList />
          <div className="mt-4">
            <Link href="/history">
              <Button variant="outline" className="w-full">
                <History className="h-4 w-4 mr-2" />
                История матчей
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Статус кортов - перемещен под активные матчи */}
      <div className="mb-6">
        <CourtsList />
      </div>

      {/* Присоединиться к матчу - перемещен под статус кортов */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Присоединиться к матчу</CardTitle>
          <CardDescription>Введите код матча для просмотра</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Link href="/join-match">
              <Button className="w-full">Присоединиться по цифровому коду</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Кнопка диагностики - перемещена в самый низ */}
      <div className="text-center mt-8">
        <Link href="/debug">
          <Button variant="outline" size="sm">
            <Bug className="h-4 w-4 mr-2" />
            Диагностика
          </Button>
        </Link>
      </div>
    </div>
  )
}
