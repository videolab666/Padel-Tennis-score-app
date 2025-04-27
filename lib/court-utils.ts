import { createClientSupabaseClient } from "./supabase"
import { logEvent } from "./error-logger"
import { getMatch } from "./match-storage"
import { getTennisPointName } from "./tennis-utils"

export const MAX_COURTS = 10

// Функция для форматирования данных матча для vMix
export const formatVmixData = (match) => {
  if (!match) return {}

  const teamA = match.teamA
  const teamB = match.teamB
  const currentSet = match.score.currentSet

  return [
    {
      match_id: match.id,
      teamA_name: teamA.players.map((p) => p.name).join(" / "),
      teamA_score: match.score.teamA,
      teamA_game_score: currentSet
        ? currentSet.isTiebreak
          ? currentSet.currentGame.teamA
          : getTennisPointName(currentSet.currentGame.teamA)
        : "0",
      teamA_current_set: currentSet ? currentSet.teamA : 0,
      teamA_serving: match.currentServer && match.currentServer.team === "teamA" ? "Да" : "Нет",
      teamB_name: teamB.players.map((p) => p.name).join(" / "),
      teamB_score: match.score.teamB,
      teamB_game_score: currentSet
        ? currentSet.isTiebreak
          ? currentSet.currentGame.teamB
          : getTennisPointName(currentSet.currentGame.teamB)
        : "0",
      teamB_current_set: currentSet ? currentSet.teamB : 0,
      teamB_serving: match.currentServer && match.currentServer.team === "teamB" ? "Да" : "Нет",
      is_tiebreak: currentSet ? (currentSet.isTiebreak ? "Да" : "Нет") : "Нет",
      is_completed: match.isCompleted ? "Да" : "Нет",
      winner: match.winner || "",
      timestamp: new Date().toISOString(),
      update_time: new Date().toLocaleTimeString(),
    },
  ]
}

// Получение матча по номеру корта
export const getMatchByCourtNumber = async (courtNumber) => {
  try {
    logEvent("info", `Получение матча по номеру корта: ${courtNumber}`, "getMatchByCourtNumber")

    // Проверяем, что номер корта - число
    const courtNum = Number.parseInt(courtNumber)
    if (isNaN(courtNum)) {
      logEvent("error", "Некорректный номер корта", "getMatchByCourtNumber", { courtNumber })
      return null
    }

    // Создаем клиент Supabase
    const supabase = createClientSupabaseClient()
    if (!supabase) {
      logEvent("error", "Не удалось создать клиент Supabase", "getMatchByCourtNumber")
      return null
    }

    // Добавляем таймаут для запроса
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error("Timeout")), 5000) // 5 секунд таймаут
    })

    // Получаем матч из Supabase с таймаутом
    const fetchPromise = supabase
      .from("matches")
      .select("*")
      .eq("court_number", courtNum)
      .eq("is_completed", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    // Используем Promise.race для реализации таймаута
    const result = await Promise.race([fetchPromise, timeoutPromise])

    if (!result) {
      logEvent("error", "Таймаут при получении матча по номеру корта", "getMatchByCourtNumber")
      return null
    }

    const { data, error } = result

    if (error) {
      logEvent("error", `Ошибка при получении матча из Supabase: ${error.message}`, "getMatchByCourtNumber", {
        error,
        courtNumber,
      })
      return null
    }

    if (!data) {
      logEvent("warn", "Матч не найден в Supabase", "getMatchByCourtNumber", { courtNumber })
      return null
    }

    // Преобразуем данные из Supabase
    const match = {
      id: data.id,
      type: data.type,
      format: data.format,
      createdAt: data.created_at,
      settings: data.settings,
      teamA: data.team_a,
      teamB: data.team_b,
      score: data.score,
      currentServer: data.current_server,
      courtSides: data.court_sides,
      shouldChangeSides: data.should_change_sides,
      isCompleted: data.is_completed,
      winner: data.winner,
      courtNumber: data.court_number,
      history: [],
    }

    // Убедимся, что структура матча полная
    if (!match.score.sets) {
      match.score.sets = []
      logEvent("warn", "Инициализирован пустой массив sets для матча из Supabase", "getMatchByCourtNumber", {
        matchId: data.id,
        courtNumber,
      })
    }

    logEvent("info", "Матч успешно получен по номеру корта", "getMatchByCourtNumber", {
      matchId: data.id,
      courtNumber,
    })

    return match
  } catch (error) {
    logEvent("error", `Ошибка при получении матча по номеру корта: ${error.message}`, "getMatchByCourtNumber", {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      courtNumber,
    })
    return null
  }
}

// Получение списка занятых кортов
export const getOccupiedCourts = async () => {
  try {
    logEvent("info", "Получение списка занятых кортов", "getOccupiedCourts")

    // Создаем клиент Supabase
    const supabase = createClientSupabaseClient()
    if (!supabase) {
      logEvent("error", "Не удалось создать клиент Supabase", "getOccupiedCourts")
      return []
    }

    // Добавляем таймаут для запроса
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error("Timeout")), 5000) // 5 секунд таймаут
    })

    // Получаем активные матчи из Supabase с таймаутом
    const fetchPromise = supabase
      .from("matches")
      .select("id, court_number, is_completed")
      .eq("is_completed", false)
      .not("court_number", "is", null)

    // Используем Promise.race для реализации таймаута
    const result = await Promise.race([fetchPromise, timeoutPromise])

    if (!result) {
      logEvent("error", "Таймаут при получении списка занятых кортов", "getOccupiedCourts")
      return []
    }

    const { data, error } = result

    if (error) {
      logEvent("error", `Ошибка при получении списка занятых кортов: ${error.message}`, "getOccupiedCourts", { error })
      return []
    }

    if (!data || data.length === 0) {
      logEvent("info", "Нет активных матчей на кортах", "getOccupiedCourts")
      return []
    }

    // Преобразуем данные
    const occupiedCourts = data.map((match) => match.court_number)

    logEvent("info", `Получено ${occupiedCourts.length} занятых кортов`, "getOccupiedCourts")
    return occupiedCourts
  } catch (error) {
    logEvent("error", `Ошибка при получении списка занятых кортов: ${error.message}`, "getOccupiedCourts", {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    })

    // В случае ошибки возвращаем пустой массив
    return []
  }
}

// Получение списка свободных кортов
export const getFreeCourts = async (totalCourts = 10) => {
  try {
    const occupiedCourts = await getOccupiedCourts()
    const occupiedCourtNumbers = occupiedCourts.map((court) => court)

    // Создаем массив всех кортов
    const allCourts = Array.from({ length: totalCourts }, (_, i) => i + 1)

    // Фильтруем свободные корты
    const freeCourts = allCourts.filter((courtNumber) => !occupiedCourtNumbers.includes(courtNumber))

    logEvent("info", `Получено ${freeCourts.length} свободных кортов`, "getFreeCourts")
    return freeCourts
  } catch (error) {
    logEvent("error", `Ошибка при получении списка свободных кортов: ${error.message}`, "getFreeCourts", {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    })
    return []
  }
}

// Проверка доступности корта
export const isCourtAvailable = async (courtNumber) => {
  try {
    const occupiedCourts = await getOccupiedCourts()
    return !occupiedCourts.includes(courtNumber)
  } catch (error) {
    console.error("Ошибка при проверке доступности корта:", error)
    return false
  }
}

// Назначение матча на корт
export const assignMatchToCourt = async (matchId, courtNumber) => {
  try {
    logEvent("info", `Назначение матча ${matchId} на корт ${courtNumber}`, "assignMatchToCourt")

    // Получаем текущий матч
    const match = await getMatch(matchId)
    if (!match) {
      logEvent("error", "Матч не найден", "assignMatchToCourt", { matchId })
      return false
    }

    // Обновляем номер корта
    match.courtNumber = courtNumber

    // Сохраняем обновленный матч
    const supabase = createClientSupabaseClient()
    if (!supabase) {
      logEvent("error", "Не удалось создать клиент Supabase", "assignMatchToCourt")
      return false
    }

    const { error } = await supabase.from("matches").update({ court_number: courtNumber }).eq("id", matchId)

    if (error) {
      logEvent("error", `Ошибка при назначении матча на корт: ${error.message}`, "assignMatchToCourt", {
        error,
        matchId,
        courtNumber,
      })
      return false
    }

    logEvent("info", `Матч ${matchId} успешно назначен на корт ${courtNumber}`, "assignMatchToCourt")
    return true
  } catch (error) {
    logEvent("error", `Ошибка при назначении матча на корт: ${error.message}`, "assignMatchToCourt", {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      matchId,
      courtNumber,
    })
    return false
  }
}

// Освобождение корта
export const freeUpCourt = async (courtNumber) => {
  try {
    logEvent("info", `Освобождение корта ${courtNumber}`, "freeUpCourt")

    // Получаем матч на этом корте
    const match = await getMatchByCourtNumber(courtNumber)
    if (!match) {
      logEvent("warn", "Матч на корте не найден", "freeUpCourt", { courtNumber })
      return false
    }

    // Обновляем матч, убирая номер корта
    const supabase = createClientSupabaseClient()
    if (!supabase) {
      logEvent("error", "Не удалось создать клиент Supabase", "freeUpCourt")
      return false
    }

    const { error } = await supabase.from("matches").update({ court_number: null }).eq("id", match.id)

    if (error) {
      logEvent("error", `Ошибка при освобождении корта: ${error.message}`, "freeUpCourt", {
        error,
        courtNumber,
        matchId: match.id,
      })
      return false
    }

    logEvent("info", `Корт ${courtNumber} успешно освобожден`, "freeUpCourt")
    return true
  } catch (error) {
    logEvent("error", `Ошибка при освобождении корта: ${error.message}`, "freeUpCourt", {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      courtNumber,
    })
    return false
  }
}
