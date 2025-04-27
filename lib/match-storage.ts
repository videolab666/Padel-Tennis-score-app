// Функции для работы с хранилищем матчей
import { compressToUTF16, decompressFromUTF16 } from "lz-string"
import { createClientSupabaseClient, checkAndEnableRealtime } from "./supabase"
import { logEvent } from "./error-logger"

// Максимальное количество хранимых матчей в локальном хранилище
const MAX_MATCHES = 10

// Простой кэш для матчей
const matchCache = new Map()
// Увеличим время жизни кэша с 5 секунд до 30 секунд
const CACHE_TTL = 30000 // 30 секунд вместо 5 секунд

// Добавим кэш для проверки доступности Supabase
let supabaseAvailabilityCache = {
  available: null,
  timestamp: 0,
}

// Проверка валидности JSON строки
const isValidJSON = (str) => {
  try {
    JSON.parse(str)
    return true
  } catch (e) {
    return false
  }
}

// Безопасное получение данных из localStorage
const safeGetItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    if (!item) return defaultValue

    // Пробуем распаковать сжатые данные
    try {
      const decompressed = decompressFromUTF16(item)
      // Проверяем, что распакованные данные - валидный JSON
      if (decompressed && isValidJSON(decompressed)) {
        return JSON.parse(decompressed)
      }
    } catch (decompressError) {
      logEvent("warn", `Ошибка при распаковке данных из localStorage: ${key}`, "safeGetItem", decompressError)
    }

    // Если не удалось распаковать или данные не валидны,
    // проверяем, может быть это нормальный JSON
    if (isValidJSON(item)) {
      return JSON.parse(item)
    }

    // Если все проверки не прошли, возвращаем значение по умолчанию
    logEvent("warn", `Данные в localStorage повреждены: ${key}`, "safeGetItem")
    return defaultValue
  } catch (error) {
    logEvent("error", `Ошибка при получении данных из localStorage: ${key}`, "safeGetItem", error)
    return defaultValue
  }
}

// Безопасное сохранение данных в localStorage
const safeSetItem = (key, value) => {
  try {
    // Если value - объект, преобразуем его в JSON строку
    const stringValue = typeof value === "string" ? value : JSON.stringify(value)

    // Сжимаем данные
    const compressed = compressToUTF16(stringValue)

    // Сохраняем в localStorage
    localStorage.setItem(key, compressed)
    return true
  } catch (error) {
    logEvent("error", `Ошибка при сохранении данных в localStorage: ${key}`, "safeSetItem", error)
    return false
  }
}

// Обновим функцию transformMatchForSupabase, добавив поле court_number
const transformMatchForSupabase = (match) => {
  return {
    id: match.id,
    type: match.type,
    format: match.format,
    created_at: match.createdAt,
    settings: match.settings,
    team_a: match.teamA,
    team_b: match.teamB,
    score: match.score,
    current_server: match.currentServer,
    court_sides: match.courtSides,
    should_change_sides: match.shouldChangeSides,
    is_completed: match.isCompleted,
    winner: match.winner || null,
    court_number: match.courtNumber,
  }
}

// Обновим функцию transformMatchFromSupabase, добавив поле courtNumber
const transformMatchFromSupabase = (match) => {
  return {
    id: match.id,
    type: match.type,
    format: match.format,
    createdAt: match.created_at,
    settings: match.settings,
    teamA: match.team_a,
    teamB: match.team_b,
    score: match.score,
    currentServer: match.current_server,
    courtSides: match.court_sides,
    shouldChangeSides: match.should_change_sides,
    isCompleted: match.is_completed,
    winner: match.winner,
    courtNumber: match.court_number,
    history: [],
  }
}

// Получение всех матчей
export const getMatches = async () => {
  if (typeof window === "undefined") return []

  try {
    logEvent("info", "Получение списка матчей", "getMatches")

    // Проверяем доступность Supabase
    const supabaseAvailable = await isSupabaseAvailable()

    if (supabaseAvailable) {
      // Проверяем существование таблиц
      const tablesStatus = await checkTablesExist()

      if (tablesStatus.exists) {
        logEvent("debug", "Supabase доступен, получаем матчи из базы данных", "getMatches")
        const supabase = createClientSupabaseClient()

        // Оптимизация: выбираем только нужные поля
        const { data, error, status } = await supabase
          .from("matches")
          .select("*") // Изменено на "*" для получения всех полей
          .order("created_at", { ascending: false })
          .limit(20)

        if (error) {
          logEvent("error", `Ошибка при получении матчей из Supabase: ${error.message}`, "getMatches", {
            error,
            status,
          })
        } else if (data && data.length > 0) {
          logEvent("info", `Получено ${data.length} матчей из Supabase`, "getMatches")

          // Преобразуем данные из Supabase в нужный формат с проверкой на undefined
          const matches = data.map((match) => {
            // Безопасное получение данных с проверкой на undefined
            const teamAPlayers = match.team_a?.players || []
            const teamBPlayers = match.team_b?.players || []
            const scoreTeamA = match.score?.teamA || 0
            const scoreTeamB = match.score?.teamB || 0

            return {
              id: match.id,
              type: match.type,
              format: match.format,
              createdAt: match.created_at,
              teamA: {
                players: teamAPlayers,
              },
              teamB: {
                players: teamBPlayers,
              },
              score: {
                teamA: scoreTeamA,
                teamB: scoreTeamB,
              },
              isCompleted: match.is_completed,
              winner: match.winner,
              courtNumber: match.court_number,
            }
          })

          return matches
        } else {
          logEvent("info", "Матчи в Supabase не найдены", "getMatches")
        }
      } else {
        logEvent("warn", "Таблицы в Supabase не существуют, используем локальное хранилище", "getMatches")
      }
    } else {
      logEvent("warn", "Supabase недоступен, используем локальное хранилище", "getMatches")
    }

    // Если Supabase недоступен или нет матчей, используем локальное хранилище
    const matches = safeGetItem("tennis_padel_matches", [])
    logEvent("info", `Получено ${matches.length} матчей из localStorage`, "getMatches")
    return matches || []
  } catch (error) {
    logEvent("error", "Ошибка при получении матчей", "getMatches", error)
    return []
  }
}

// Получение конкретного матча по ID с использованием кэша
export const getMatch = async (id) => {
  if (typeof window === "undefined") return null

  try {
    logEvent("info", `Получение матча по ID: ${id}`, "getMatch")

    // Проверяем кэш
    if (matchCache.has(id)) {
      const { data, timestamp } = matchCache.get(id)
      // Если кэш не устарел
      if (Date.now() - timestamp < CACHE_TTL) {
        logEvent("debug", `Матч ${id} получен из кэша`, "getMatch")
        return data
      }
    }

    // Проверяем доступность Supabase
    const supabaseAvailable = await isSupabaseAvailable()

    if (supabaseAvailable) {
      // Проверяем существование таблиц
      const tablesStatus = await checkTablesExist()

      if (tablesStatus.exists) {
        logEvent("debug", "Supabase доступен, получаем матч из базы данных", "getMatch")
        const supabase = createClientSupabaseClient()
        const { data, error, status } = await supabase.from("matches").select("*").eq("id", id).single()

        if (error) {
          logEvent("error", `Ошибка при получении матча из Supabase: ${error.message}`, "getMatch", {
            error,
            status,
            matchId: id,
          })
        } else if (data) {
          logEvent("info", "Матч успешно получен из Supabase", "getMatch", { matchId: id })
          // Преобразуем данные из Supabase
          const match = transformMatchFromSupabase(data)

          // Убедимся, что структура матча полная
          if (!match.score.sets) {
            match.score.sets = []
            logEvent("warn", "Инициализирован пустой массив sets для матча из Supabase", "getMatch", { matchId: id })
          }

          // Загружаем информацию о странах игроков
          try {
            // Собираем ID всех игроков из матча
            const playerIds = [...match.teamA.players.map((p) => p.id), ...match.teamB.players.map((p) => p.id)].filter(
              (id, index, self) => self.indexOf(id) === index,
            ) // Убираем дубликаты

            if (playerIds.length > 0) {
              // Получаем информацию о странах игроков
              const { data: playersData, error: playersError } = await supabase
                .from("players")
                .select("id, country")
                .in("id", playerIds)

              if (!playersError && playersData) {
                // Создаем карту игрок ID -> страна
                const playerCountryMap = {}
                playersData.forEach((player) => {
                  if (player.country) {
                    playerCountryMap[player.id] = player.country
                  }
                })

                // Обновляем информацию о странах в объекте матча
                match.teamA.players.forEach((player) => {
                  if (playerCountryMap[player.id]) {
                    player.country = playerCountryMap[player.id]
                  }
                })

                match.teamB.players.forEach((player) => {
                  if (playerCountryMap[player.id]) {
                    player.country = playerCountryMap[player.id]
                  }
                })

                logEvent("info", "Информация о странах игроков успешно загружена", "getMatch", { matchId: id })
              } else {
                logEvent("warn", "Не удалось загрузить информацию о странах игроков", "getMatch", {
                  matchId: id,
                  error: playersError,
                })
              }
            }
          } catch (countryError) {
            logEvent("error", "Ошибка при загрузке информации о странах игроков", "getMatch", {
              error: countryError,
              matchId: id,
            })
          }

          // Сохраняем в кэш
          matchCache.set(id, { data: match, timestamp: Date.now() })

          return match
        } else {
          logEvent("warn", "Матч не найден в Supabase", "getMatch", { matchId: id })
        }
      } else {
        logEvent("warn", "Таблицы в Supabase не существуют, используем локальное хранилище", "getMatch")
      }
    } else {
      logEvent("warn", "Supabase недоступен, используем локальное хранилище", "getMatch")
    }

    // Если Supabase недоступен или матч не найден, используем локальное хранилище
    const singleMatchKey = `match_${id}`
    const match = safeGetItem(singleMatchKey, null)

    if (match) {
      logEvent("info", "Матч найден в локальном хранилище", "getMatch", { matchId: id, source: "direct" })
      // Убедимся, что структура матча полная
      if (!match.score.sets) {
        match.score.sets = []
        logEvent("warn", "Инициализирован пустой массив sets для матча из localStorage", "getMatch", { matchId: id })
      }

      // Сохраняем в кэш
      matchCache.set(id, { data: match, timestamp: Date.now() })

      return match
    }

    // Если нет, ищем в общем списке
    const matches = safeGetItem("tennis_padel_matches", [])
    const foundMatch = matches.find((match) => match.id === id) || null

    if (foundMatch) {
      logEvent("info", "Матч найден в общем списке локального хранилища", "getMatch", { matchId: id, source: "list" })
      // Убедимся, что структура матча полная
      if (!foundMatch.score.sets) {
        foundMatch.score.sets = []
        logEvent("warn", "Инициализирован пустой массив sets для матча из списка", "getMatch", { matchId: id })
      }

      // Сохраняем в кэш
      matchCache.set(id, { data: foundMatch, timestamp: Date.now() })
    } else {
      logEvent("warn", "Матч не найден ни в Supabase, ни в локальном хранилище", "getMatch", { matchId: id })
    }

    return foundMatch
  } catch (error) {
    logEvent("error", `Ошибка при получении матча: ${error.message}`, "getMatch", {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      matchId: id,
    })
    return null
  }
}

// Очистка старых матчей при приближении к лимиту
const cleanupStorage = () => {
  try {
    // Получаем все матчи
    const matches = safeGetItem("tennis_padel_matches", [])

    // Если матчей больше максимального количества, удаляем самые старые
    if (matches.length > MAX_MATCHES) {
      logEvent("info", `Очистка локального хранилища: ${matches.length} матчей, лимит ${MAX_MATCHES}`, "cleanupStorage")

      // Сортируем по дате создания (от новых к старым)
      matches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      // Оставляем только MAX_MATCHES матчей\
      const updatedMatches = matches.slice(0, MAX_MATCHES)

      // Сохраняем обновленный список
      safeSetItem("tennis_padel_matches", updatedMatches)

      // Удаляем отдельные записи для старых матчей
      const deletedMatches = matches.slice(MAX_MATCHES)
      deletedMatches.forEach((match) => {
        localStorage.removeItem(`match_${match.id}`)
        logEvent("debug", `Удален старый матч из localStorage: ${match.id}`, "cleanupStorage")
      })
    }

    return true
  } catch (error) {
    logEvent("error", "Ошибка при очистке хранилища", "cleanupStorage", error)
    return false
  }
}

// Создание нового матча
export const createMatch = async (match) => {
  if (typeof window === "undefined") return null

  try {
    logEvent("info", "Создание нового матча", "createMatch", { matchId: match.id, type: match.type })

    // Инициализируем пустую историю
    match.history = []

    // Убедимся, что структура матча полная
    if (!match.score.sets) {
      match.score.sets = []
      logEvent("debug", "Инициализирован пустой массив sets для нового матча", "createMatch")
    }

    // Проверяем доступность Supabase
    const supabaseAvailable = await isSupabaseAvailable()

    if (supabaseAvailable) {
      // Проверяем существование таблиц
      const tablesStatus = await checkTablesExist()

      if (tablesStatus.exists) {
        // Проверяем и включаем Realtime
        await checkAndEnableRealtime()

        logEvent("debug", "Supabase доступен, сохраняем матч в базу данных", "createMatch")
        const supabase = createClientSupabaseClient()
        const transformedMatch = transformMatchForSupabase(match)
        const { error, status, statusText } = await supabase.from("matches").insert(transformedMatch)

        if (error) {
          logEvent("error", `Ошибка при сохранении матча в Supabase: ${error.message}`, "createMatch", {
            error,
            status,
            statusText,
            matchId: match.id,
          })
        } else {
          logEvent("info", "Матч успешно сохранен в Supabase", "createMatch", { matchId: match.id })

          // Добавляем в кэш
          matchCache.set(match.id, { data: match, timestamp: Date.now() })
        }
      } else {
        logEvent("warn", "Таблицы в Supabase не существуют, сохраняем только в локальное хранилище", "createMatch")
      }
    } else {
      logEvent("warn", "Supabase недоступен, сохраняем только в локальное хранилище", "createMatch")
    }

    // Всегда сохраняем в локальное хранилище как резервную копию
    // Очищаем локальное хранилище перед добавлением нового матча
    cleanupStorage()

    // Сохраняем в локальное хранилище
    const singleMatchKey = `match_${match.id}`
    safeSetItem(singleMatchKey, match)

    // Добавляем в общий список без истории и детальных данных
    const matchSummary = {
      id: match.id,
      type: match.type,
      format: match.format,
      createdAt: match.createdAt,
      teamA: {
        players: match.teamA.players,
      },
      teamB: {
        players: match.teamB.players,
      },
      score: {
        teamA: match.score.teamA,
        teamB: match.score.teamB,
      },
      isCompleted: match.isCompleted,
      courtNumber: match.courtNumber,
    }

    const matches = safeGetItem("tennis_padel_matches", [])
    matches.unshift(matchSummary)
    safeSetItem("tennis_padel_matches", matches)

    // Уведомляем другие вкладки об изменении
    window.dispatchEvent(new Event("storage"))

    logEvent("info", "Матч успешно сохранен в локальное хранилище", "createMatch", { matchId: match.id })
    return match.id
  } catch (error) {
    logEvent("error", `Ошибка при создании матча: ${error.message}`, "createMatch", {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      matchId: match?.id,
    })
    return null
  }
}

// Обновление существующего матча
// Оптимизируем функцию updateMatch для более быстрой работы
export const updateMatch = async (updatedMatch) => {
  if (typeof window === "undefined") return false

  try {
    logEvent("info", `Обновление матча: ${updatedMatch.id}`, "updateMatch")

    // Полностью отключаем историю для экономии места
    updatedMatch.history = []

    // Убедимся, что структура матча полная
    if (!updatedMatch.score.sets) {
      updatedMatch.score.sets = []
      logEvent("debug", "Инициализирован пустой массив sets при обновлении матча", "updateMatch")
    }

    // Обновляем кэш немедленно для быстрого доступа
    matchCache.set(updatedMatch.id, { data: updatedMatch, timestamp: Date.now() })

    // Сохраняем в локальное хранилище сразу для быстрого доступа
    const singleMatchKey = `match_${updatedMatch.id}`
    try {
      safeSetItem(singleMatchKey, updatedMatch)
    } catch (storageError) {
      // Если не удалось сохранить полные данные, сохраняем только самое необходимое
      const essentialMatchData = {
        id: updatedMatch.id,
        type: updatedMatch.type,
        format: updatedMatch.format,
        createdAt: updatedMatch.createdAt,
        settings: updatedMatch.settings,
        teamA: updatedMatch.teamA,
        teamB: updatedMatch.teamB,
        score: updatedMatch.score,
        currentServer: updatedMatch.currentServer,
        courtSides: updatedMatch.courtSides,
        shouldChangeSides: updatedMatch.shouldChangeSides,
        isCompleted: updatedMatch.isCompleted,
        courtNumber: updatedMatch.courtNumber,
        history: [],
      }

      // Удаляем историю геймов для экономии места
      if (essentialMatchData.score && essentialMatchData.score.currentSet) {
        essentialMatchData.score.currentSet.games = []
      }

      if (essentialMatchData.score && essentialMatchData.score.sets) {
        essentialMatchData.score.sets = essentialMatchData.score.sets.map((set) => ({
          teamA: set.teamA,
          teamB: set.teamB,
          winner: set.winner,
          games: [],
        }))
      }

      safeSetItem(singleMatchKey, essentialMatchData)
    }

    // Обновляем запись в общем списке
    const matches = safeGetItem("tennis_padel_matches", [])
    const index = matches.findIndex((match) => match.id === updatedMatch.id)

    if (index !== -1) {
      matches[index] = {
        id: updatedMatch.id,
        type: updatedMatch.type,
        format: updatedMatch.format,
        createdAt: updatedMatch.createdAt,
        teamA: {
          players: updatedMatch.teamA.players,
        },
        teamB: {
          players: updatedMatch.teamB.players,
        },
        score: {
          teamA: updatedMatch.score.teamA,
          teamB: updatedMatch.score.teamB,
        },
        isCompleted: updatedMatch.isCompleted,
        courtNumber: updatedMatch.courtNumber,
      }

      safeSetItem("tennis_padel_matches", matches)
    }
    // Асинхронно обновляем данные в Supabase без ожидания результата
    // Это позволит UI обновиться быстрее
    ;(async () => {
      try {
        // Проверяем доступность Supabase (используя кэшированный результат)
        const supabaseAvailable = await isSupabaseAvailable()

        if (supabaseAvailable) {
          // Проверяем существование таблиц (используя кэшированный результат)
          const tablesStatus = await checkTablesExist()

          if (tablesStatus.exists) {
            const supabase = createClientSupabaseClient()
            const transformedMatch = transformMatchForSupabase(updatedMatch)
            await supabase.from("matches").update(transformedMatch).eq("id", updatedMatch.id)
          }
        }
      } catch (error) {
        logEvent("error", `Ошибка при асинхронном обновлении матча в Supabase: ${error.message}`, "updateMatch", {
          error,
          matchId: updatedMatch?.id,
        })
      }
    })()

    return true
  } catch (error) {
    logEvent("error", `Критическая ошибка при обновлении матча: ${error.message}`, "updateMatch", {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      matchId: updatedMatch?.id,
    })
    throw error
  }
}

// Удаление матча
export const deleteMatch = async (id) => {
  if (typeof window === "undefined") return false

  try {
    logEvent("info", `Удаление матча: ${id}`, "deleteMatch")

    // Удаляем из кэша
    matchCache.delete(id)

    // Проверяем доступность Supabase
    const supabaseAvailable = await isSupabaseAvailable()

    if (supabaseAvailable) {
      // Проверяем существование таблиц
      const tablesStatus = await checkTablesExist()

      if (tablesStatus.exists) {
        logEvent("debug", "Supabase доступен, удаляем матч из базы данных", "deleteMatch")
        const supabase = createClientSupabaseClient()
        const { error } = await supabase.from("matches").delete().eq("id", id)

        if (error) {
          logEvent("error", `Ошибка при удалении матча из Supabase: ${error.message}`, "deleteMatch", {
            error,
            matchId: id,
          })
        } else {
          logEvent("info", "Матч успешно удален из Supabase", "deleteMatch", { matchId: id })
        }
      } else {
        logEvent("warn", "Таблицы в Supabase не существуют, удаляем только из локального хранилища", "deleteMatch")
      }
    } else {
      logEvent("warn", "Supabase недоступен, удаляем только из локального хранилища", "deleteMatch")
    }

    // Удаляем отдельную запись матча из локального хранилища
    localStorage.removeItem(`match_${id}`)

    // Удаляем из общего списка
    const matches = safeGetItem("tennis_padel_matches", [])
    const filteredMatches = matches.filter((match) => match.id !== id)
    safeSetItem("tennis_padel_matches", filteredMatches)

    // Уведомляем другие вкладки об изменении
    window.dispatchEvent(new Event("storage"))

    logEvent("info", "Матч успешно удален из локального хранилища", "deleteMatch", { matchId: id })
    return true
  } catch (error) {
    logEvent("error", `Ошибка при удалении матча: ${error.message}`, "deleteMatch", {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      matchId: id,
    })
    return false
  }
}

// Подписка на обновления матча в реальном времени
export const subscribeToMatchUpdates = (matchId, callback) => {
  if (typeof window === "undefined") return () => {}

  let unsubscribe = null

  // Проверяем доступность Supabase
  isSupabaseAvailable().then(async (supabaseAvailable) => {
    if (supabaseAvailable) {
      // Проверяем существование таблиц
      const tablesStatus = await checkTablesExist()

      if (tablesStatus.exists) {
        // Проверяем и включаем Realtime
        await checkAndEnableRealtime()

        const supabase = createClientSupabaseClient()

        // Подписываемся на изменения матча в Supabase
        const channel = supabase
          .channel(`match-${matchId}`)
          .on(
            "postgres_changes",
            {
              event: "*", // Слушаем все события (INSERT, UPDATE, DELETE)
              schema: "public",
              table: "matches",
              filter: `id=eq.${matchId}`,
            },
            async (payload) => {
              logEvent("debug", `Получено событие Supabase для матча ${matchId}`, "subscribeToMatchUpdates", payload)

              if (payload.eventType === "DELETE") {
                // Если матч был удален
                matchCache.delete(matchId)
                callback(null)
              } else {
                // Для INSERT или UPDATE получаем обновленные данные
                // Преобразуем данные из Supabase
                const updatedMatch = transformMatchFromSupabase(payload.new)

                // Обновляем кэш
                matchCache.set(matchId, { data: updatedMatch, timestamp: Date.now() })

                callback(updatedMatch)
              }
            },
          )
          .subscribe((status) => {
            logEvent("info", `Статус подписки на матч ${matchId}: ${status}`, "subscribeToMatchUpdates")
          })

        // Сохраняем функцию отписки
        unsubscribe = () => {
          logEvent("info", `Отписка от обновлений матча ${matchId}`, "subscribeToMatchUpdates")
          supabase.removeChannel(channel)
        }
      } else {
        logEvent("warn", "Таблицы в Supabase не существуют, используем локальную подписку", "subscribeToMatchUpdates")
        setupLocalSubscription()
      }
    } else {
      logEvent("warn", "Supabase недоступен, используем локальную подписку", "subscribeToMatchUpdates")
      setupLocalSubscription()
    }
  })

  // Функция для настройки локальной подписки
  const setupLocalSubscription = () => {
    const handleStorageChange = async (event) => {
      if (event.key === `match_${matchId}` || event.key === "tennis_padel_matches" || !event.key) {
        const match = await getMatch(matchId)
        if (match) {
          callback(match)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Также настраиваем периодическую проверку обновлений
    const interval = setInterval(async () => {
      const match = await getMatch(matchId)
      if (match) {
        callback(match)
      }
    }, 3000) // Уменьшаем интервал до 3 секунд для более частых проверок

    // Обновляем функцию отписки
    unsubscribe = () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }

  // Возвращаем функцию отписки
  return () => {
    if (unsubscribe) unsubscribe()
  }
}

// Подписка на обновления списка матчей в реальном времени
export const subscribeToMatchesListUpdates = (callback) => {
  // Проверяем доступность Supabase
  isSupabaseAvailable().then(async (supabaseAvailable) => {
    if (supabaseAvailable) {
      // Проверяем существование таблиц
      const tablesStatus = await checkTablesExist()

      if (tablesStatus.exists) {
        // Проверяем и включаем Realtime
        await checkAndEnableRealtime()

        const supabase = createClientSupabaseClient()

        // Подписываемся на изменения списка матчей в Supabase
        const subscription = supabase
          .channel("matches-list")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "matches",
            },
            async () => {
              // При любом изменении в таблице матчей, получаем обновленный список
              const matches = await getMatches()
              callback(matches)
            },
          )
          .subscribe()

        // Возвращаем функцию для отписки
        return () => {
          supabase.removeChannel(subscription)
        }
      } else {
        logEvent(
          "warn",
          "Таблицы в Supabase не существуют, используем локальную подписку",
          "subscribeToMatchesListUpdates",
        )
      }
    } else {
      logEvent("warn", "Supabase недоступен, используем локальную подписку", "subscribeToMatchesListUpdates")
    }

    // Если Supabase недоступен или таблицы не существуют, настраиваем локальную подписку через событие storage
    const handleStorageChange = async () => {
      const matches = await getMatches()
      callback(matches)
    }

    window.addEventListener("storage", handleStorageChange)

    // Также настраиваем периодическую проверку обновлений
    const interval = setInterval(handleStorageChange, 5000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  })

  // Возвращаем пустую функцию отписки по умолчанию
  return () => {}
}

// Сохранение матча в URL для шаринга
export const getMatchShareUrl = (matchId) => {
  if (typeof window === "undefined") return ""

  const baseUrl = window.location.origin
  return `${baseUrl}/match/${matchId}`
}

// Функция для экспорта матча в JSON
export const exportMatchToJson = async (matchId) => {
  if (typeof window === "undefined") return null

  try {
    const match = await getMatch(matchId)
    if (!match) return null

    // Создаем копию матча без истории для уменьшения размера
    const exportMatch = { ...match, history: [] }

    // Преобразуем в JSON
    return JSON.stringify(exportMatch)
  } catch (error) {
    logEvent("error", `Ошибка при экспорте матча: ${error.message}`, "exportMatchToJson", error)
    return null
  }
}

// Функция для импорта матча из JSON
export const importMatchFromJson = async (jsonData) => {
  if (typeof window === "undefined") return false

  try {
    // Проверяем, что jsonData - валидный JSON
    if (!isValidJSON(jsonData)) {
      throw new Error("Некорректный формат JSON")
    }

    const match = JSON.parse(jsonData)

    // Проверяем, что это валидный матч
    if (!match.id || !match.teamA || !match.teamB || !match.score) {
      throw new Error("Некорректный формат данных матча")
    }

    // Убедимся, что структура матча полная
    if (!match.score.sets) {
      match.score.sets = []
    }

    // Сохраняем импортированный матч
    await createMatch(match)
    return match.id
  } catch (error) {
    logEvent("error", `Ошибка при импорте матча: ${error.message}`, "importMatchFromJson", error)
    return false
  }
}

// Добавьте или обновите функцию getAllMatches, если она уже существует

export async function getAllMatches() {
  if (typeof window === "undefined") return []

  try {
    logEvent("info", "Получение всех матчей для истории", "getAllMatches")

    // Сначала пробуем получить матчи через основную функцию getMatches
    const matches = await getMatches()

    if (matches && matches.length > 0) {
      logEvent("info", `Получено ${matches.length} матчей через getMatches`, "getAllMatches")

      // Преобразуем формат данных для совместимости с компонентом истории
      return matches.map((match) => ({
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
    }

    // Если основной метод не вернул матчи, пробуем альтернативные ключи
    const alternativeKeys = ["padelMatches", "tennis_padel_matches", "matches"]

    for (const key of alternativeKeys) {
      const savedMatches = localStorage.getItem(key)
      if (savedMatches) {
        try {
          const parsedMatches = JSON.parse(savedMatches)
          if (Array.isArray(parsedMatches) && parsedMatches.length > 0) {
            logEvent("info", `Получено ${parsedMatches.length} матчей из localStorage по ключу ${key}`, "getAllMatches")
            return parsedMatches
          }
        } catch (e) {
          logEvent("warn", `Ошибка при парсинге матчей из localStorage по ключу ${key}`, "getAllMatches", e)
        }
      }
    }

    // Если ничего не нашли, проверяем все ключи в localStorage на наличие матчей
    if (typeof localStorage !== "undefined") {
      logEvent("debug", "Поиск матчей по всем ключам localStorage", "getAllMatches")

      // Создаем временный массив для хранения найденных матчей
      const foundMatches = []

      // Перебираем все ключи в localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith("match_") || key.includes("match") || key.includes("padel"))) {
          try {
            const item = localStorage.getItem(key)
            if (item) {
              // Пробуем распаковать, если это сжатые данные
              try {
                const decompressed = decompressFromUTF16(item)
                if (decompressed && isValidJSON(decompressed)) {
                  const match = JSON.parse(decompressed)
                  if (match && match.id) {
                    // Преобразуем в нужный формат
                    foundMatches.push({
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
                    })
                  }
                }
              } catch (e) {
                // Если не удалось распаковать, пробуем как обычный JSON
                if (isValidJSON(item)) {
                  const match = JSON.parse(item)
                  if (match && match.id) {
                    // Преобразуем в нужный формат
                    foundMatches.push({
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
                    })
                  }
                }
              }
            }
          } catch (e) {
            logEvent("warn", `Ошибка при обработке ключа ${key}`, "getAllMatches", e)
          }
        }
      }

      if (foundMatches.length > 0) {
        logEvent("info", `Найдено ${foundMatches.length} матчей при сканировании localStorage`, "getAllMatches")
        return foundMatches
      }
    }

    // Если ничего не нашли, возвращаем пустой массив
    logEvent("warn", "Не удалось найти матчи в localStorage", "getAllMatches")
    return []
  } catch (error) {
    logEvent("error", "Ошибка при получении всех матчей", "getAllMatches", error)
    return []
  }
}

// Заменим функцию isSupabaseAvailable на оптимизированную версию с кэшированием
export const isSupabaseAvailable = async () => {
  try {
    // Используем кэшированный результат, если он не устарел (действителен 60 секунд)
    if (supabaseAvailabilityCache.available !== null && Date.now() - supabaseAvailabilityCache.timestamp < 60000) {
      return supabaseAvailabilityCache.available
    }

    logEvent("info", "Проверка доступности Supabase", "isSupabaseAvailable")

    const supabase = createClientSupabaseClient()
    if (!supabase) {
      logEvent("error", "Клиент Supabase не создан", "isSupabaseAvailable")
      supabaseAvailabilityCache = { available: false, timestamp: Date.now() }
      return false
    }

    // Проверяем соединение с Supabase, используя простой запрос
    logEvent("debug", "Выполнение тестового запроса к Supabase", "isSupabaseAvailable")
    const startTime = Date.now()

    // Используем простой запрос к системной информации
    const { error } = await supabase.from("_http_response").select("*").limit(1).maybeSingle()

    const endTime = Date.now()
    const responseTime = endTime - startTime

    // Если получили ошибку о том, что таблица не существует - это нормально,
    // главное что соединение работает
    if (error && !error.message.includes("does not exist")) {
      logEvent("error", `Ошибка при проверке доступности Supabase: ${error.message}`, "isSupabaseAvailable", {
        error,
        responseTime,
      })
      supabaseAvailabilityCache = { available: false, timestamp: Date.now() }
      return false
    }

    logEvent("info", "Supabase доступен", "isSupabaseAvailable", {
      responseTime,
      error: error?.message,
    })
    supabaseAvailabilityCache = { available: true, timestamp: Date.now() }
    return true
  } catch (error) {
    logEvent("error", "Исключение при проверке доступности Supabase", "isSupabaseAvailable", {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    })
    supabaseAvailabilityCache = { available: false, timestamp: Date.now() }
    return false
  }
}

// Кэш для проверки существования таблиц
let tablesExistCache = {
  exists: null,
  timestamp: 0,
}

// Заменим функцию checkTablesExist на оптимизированную версию с кэшированием
export const checkTablesExist = async () => {
  try {
    // Используем кэшированный результат, если он не устарел (действителен 5 минут)
    if (tablesExistCache.exists !== null && Date.now() - tablesExistCache.timestamp < 300000) {
      return tablesExistCache.exists
    }

    const supabase = createClientSupabaseClient()
    if (!supabase) return { exists: false, error: "Клиент Supabase не создан" }

    // Оптимизация: выполняем запросы параллельно
    const [matchesResponse, playersResponse] = await Promise.all([
      supabase.from("matches").select("id").limit(1),
      supabase.from("players").select("id").limit(1),
    ])

    const matchesError = matchesResponse.error
    const playersError = playersResponse.error
    const matchesData = matchesResponse.data
    const playersData = playersResponse.data

    const matchesExists = !matchesError || (matchesError && !matchesError.message.includes("does not exist"))
    const playersExists = !playersError || (playersError && !playersError.message.includes("does not exist"))

    if (!matchesExists || !playersExists) {
      logEvent("warn", "Таблицы в базе данных не существуют (проверка через прямые запросы)", "checkTablesExist", {
        matchesError,
        playersError,
      })
    } else {
      logEvent("info", "Таблицы в базе данных существуют", "checkTablesExist", {
        matchesCount: matchesData?.length || 0,
        playersCount: playersData?.length || 0,
      })
    }

    const result = {
      exists: matchesExists && playersExists,
      matchesExists,
      playersExists,
      errors: {
        matches: matchesError?.message,
        players: playersError?.message,
      },
    }

    tablesExistCache = { exists: result, timestamp: Date.now() }
    return result
  } catch (error) {
    logEvent("error", "Ошибка при проверке существования таблиц", "checkTablesExist", error)
    return { exists: false, error: error.message }
  }
}
