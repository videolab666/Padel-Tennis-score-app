"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MatchList } from "@/components/match-list"
import { SupabaseStatus } from "@/components/supabase-status"
import { OfflineNotice } from "@/components/offline-notice"
import { Bug, Users, History } from "lucide-react"
import { CourtsList } from "@/components/courts-list"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/contexts/language-context"

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <div className="flex justify-end mb-2">
          <LanguageSwitcher />
        </div>
        <h1 className="text-3xl font-bold">{t("home.title")}</h1>
        <p className="text-muted-foreground">{t("home.subtitle")}</p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <SupabaseStatus />
        </div>
      </header>

      <OfflineNotice />

      <div className="mb-8">
        <Card className="bg-[#eeffbd] shadow-md">
          <CardHeader>
            <CardTitle>{t("home.newMatch")}</CardTitle>
            <CardDescription>{t("home.newMatchDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Link href="/new-match?type=tennis">
                  <Button className="w-full shadow-md">{t("home.tennis")}</Button>
                </Link>
                <Link href="/new-match?type=padel">
                  <Button className="w-full shadow-md">{t("home.padel")}</Button>
                </Link>
              </div>
              <Link href="/players">
                <Button variant="outline" className="w-full shadow-md">
                  <Users className="h-4 w-4 mr-2" />
                  {t("home.managePlayers")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Активные матчи */}
      <Card className="mb-6 bg-[#f6f6f5] shadow-md">
        <CardHeader>
          <CardTitle>{t("home.activeMatches")}</CardTitle>
          <CardDescription>{t("home.activeMatchesDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="bg-[#f6f6f5] shadow-md rounded-b-lg">
          <MatchList limit={12} />
          <div className="mt-4">
            <Link href="/history">
              <Button variant="outline" className="w-full">
                <History className="h-4 w-4 mr-2" />
                {t("home.matchHistory")}
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
          <CardTitle>{t("home.joinMatch")}</CardTitle>
          <CardDescription>{t("home.joinMatchDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Link href="/join-match">
              <Button className="w-full">{t("home.joinByCode")}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Кнопка диагностики - перемещена в самый низ */}
      <div className="text-center mt-8">
        <Link href="/debug">
          <Button variant="outline" size="sm">
            <Bug className="h-4 w-4 mr-2" />
            {t("home.diagnostics")}
          </Button>
        </Link>
      </div>
    </div>
  )
}
