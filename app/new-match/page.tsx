"use client"

import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayerSelector } from "@/components/player-selector"
import { MatchSettings } from "@/components/match-settings"
import { createMatch } from "@/lib/match-storage"
import { useLanguage } from "@/contexts/language-context"

export default function NewMatch() {
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get("type") || "tennis"

  const [player1, setPlayer1] = useState("")
  const [player2, setPlayer2] = useState("")
  const [player3, setPlayer3] = useState("")
  const [player4, setPlayer4] = useState("")
  const [settings, setSettings] = useState({
    sets: 3,
    games: 6,
    tiebreak: true,
    finalSetTiebreak: true,
    goldPoint: false,
    servingSide: "left" as "left" | "right",
    servingTeam: 1 as 1 | 2,
    servingPlayer: 1 as 1 | 2 | 3 | 4,
  })

  const handleCreateMatch = async () => {
    try {
      // Формируем структуру матча в соответствии с ожиданиями функции createMatch
      const matchData = {
        type,
        format: type === "tennis" ? "singles" : "doubles",
        createdAt: new Date().toISOString(),
        settings,
        teamA: {
          players:
            type === "tennis"
              ? [{ id: player1, name: player1 }]
              : [
                  { id: player1, name: player1 },
                  { id: player3, name: player3 },
                ],
        },
        teamB: {
          players:
            type === "tennis"
              ? [{ id: player2, name: player2 }]
              : [
                  { id: player2, name: player2 },
                  { id: player4, name: player4 },
                ],
        },
        score: {
          teamA: 0,
          teamB: 0,
          sets: [],
        },
        currentServer: settings.servingPlayer,
        courtSides: {
          teamA: settings.servingSide === "left" ? "left" : "right",
          teamB: settings.servingSide === "left" ? "right" : "left",
        },
        shouldChangeSides: false,
        isCompleted: false,
        winner: null,
        courtNumber: null,
      }

      const matchCode = await createMatch(matchData)
      if (matchCode) {
        router.push(`/match/${matchCode}`)
      } else {
        console.error("Failed to create match - no match code returned")
      }
    } catch (error) {
      console.error("Failed to create match", error)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("newMatch.title")}</CardTitle>
          <CardDescription>{type === "tennis" ? t("newMatch.tennisDesc") : t("newMatch.padelDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">{t("newMatch.players")}</h3>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlayerSelector
                  label={type === "tennis" ? t("newMatch.player1") : t("newMatch.team1Player1")}
                  value={player1}
                  onChange={setPlayer1}
                />
                <PlayerSelector
                  label={type === "tennis" ? t("newMatch.player2") : t("newMatch.team2Player1")}
                  value={player2}
                  onChange={setPlayer2}
                />
              </div>

              {type === "padel" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PlayerSelector label={t("newMatch.team1Player2")} value={player3} onChange={setPlayer3} />
                  <PlayerSelector label={t("newMatch.team2Player2")} value={player4} onChange={setPlayer4} />
                </div>
              )}
            </div>
          </div>

          <MatchSettings type={type} settings={settings} onChange={setSettings} />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            {t("common.back")}
          </Button>
          <Button
            onClick={handleCreateMatch}
            disabled={!player1 || !player2 || (type === "padel" && (!player3 || !player4))}
          >
            {t("newMatch.createMatch")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
