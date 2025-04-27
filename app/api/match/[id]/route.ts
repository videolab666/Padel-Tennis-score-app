import { NextResponse } from "next/server"
import { getMatch } from "@/lib/match-storage"
import { logEvent } from "@/lib/error-logger"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const matchId = params.id

    if (!matchId) {
      return NextResponse.json({ error: "Match ID is required" }, { status: 400 })
    }

    // Логируем запрос к API
    logEvent("info", `API запрос данных матча: ${matchId}`, "match-api")

    // Пытаемся получить матч с несколькими попытками
    let match = null
    let attempts = 0
    const maxAttempts = 3

    while (!match && attempts < maxAttempts) {
      attempts++
      try {
        match = await getMatch(matchId)
        if (match) break
      } catch (retryError) {
        logEvent("warn", `Попытка ${attempts} получения матча не удалась`, "match-api", retryError)
        // Небольшая задержка перед следующей попыткой
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }
    }

    if (!match) {
      logEvent("error", `Матч не найден после ${attempts} попыток: ${matchId}`, "match-api")
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    // Устанавливаем заголовки для предотвращения кэширования
    const headers = new Headers()
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    headers.set("Pragma", "no-cache")
    headers.set("Expires", "0")
    headers.set("Surrogate-Control", "no-store")
    headers.set("Access-Control-Allow-Origin", "*")
    headers.set("Access-Control-Allow-Methods", "GET")
    headers.set("Access-Control-Allow-Headers", "Content-Type")

    // Возвращаем данные матча
    return new NextResponse(JSON.stringify(match), {
      status: 200,
      headers: headers,
    })
  } catch (error) {
    logEvent("error", "Ошибка при обработке API запроса", "match-api", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
