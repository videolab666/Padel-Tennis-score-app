// Функции для работы с хранилищем игроков
import { createClientSupabaseClient, isSupabaseAvailable, checkTablesExist, checkAndEnableRealtime } from "./supabase"
import { logEvent } from "./error-logger"

// Получение всех игроков
export const getPlayers = async () => {
  if (typeof window === "undefined") return []

  try {
    // Проверяем доступность Supabase
    const supabaseAvailable = await isSupabaseAvailable()

    if (supabaseAvailable) {
      const supabase = createClientSupabaseClient()
      const { data, error } = await supabase.from("players").select("*").order("name")

      if (error) {
        console.error("Ошибка при получении игроков из Supabase:", error)
        logEvent("error", "Ошибка при получении игроков из Supabase", "getPlayers", error)
      } else if (data && data.length > 0) {
        return data
      }
    }

    // Если Supabase недоступен или нет игроков, используем локальное хранилище
    const players = localStorage.getItem("tennis_padel_players")
    return players ? JSON.parse(players) : []
  } catch (error) {
    console.error("Ошибка при получении игроков:", error)
    logEvent("error", "Ошибка при получении игроков", "getPlayers", error)
    return []
  }
}

// Добавление нового игрока
export const addPlayer = async (player) => {
  if (typeof window === "undefined") return false

  try {
    // Получаем текущий список игроков
    const players = await getPlayers()

    // Проверяем, что игрок с таким именем еще не существует
    if (players.some((p) => p.name.toLowerCase() === player.name.toLowerCase())) {
      logEvent("warn", "Попытка добавить игрока с существующим именем", "addPlayer", { name: player.name })
      return { success: false, message: "Игрок с таким именем уже существует" }
    }

    // Проверяем доступность Supabase
    const supabaseAvailable = await isSupabaseAvailable()

    if (supabaseAvailable) {
      // Проверяем и включаем Realtime
      await checkAndEnableRealtime()

      const supabase = createClientSupabaseClient()
      // Теперь отправляем в Supabase также и поле country, так как колонка уже существует
      const { error } = await supabase.from("players").insert({
        id: player.id,
        name: player.name,
        country: player.country || null, // Добавляем поле страны
      })

      if (error) {
        console.error("Ошибка при добавлении игрока в Supabase:", error)
        logEvent("error", "Ошибка при добавлении игрока в Supabase", "addPlayer", error)
      } else {
        logEvent("info", "Игрок успешно добавлен в Supabase", "addPlayer", {
          playerId: player.id,
          name: player.name,
          country: player.country,
        })
      }
    }

    // Всегда сохраняем в локальное хранилище
    players.push(player)
    localStorage.setItem("tennis_padel_players", JSON.stringify(players))

    // Отправляем кастомное событие для обновления списка игроков
    window.dispatchEvent(new CustomEvent("player-added", { detail: player }))

    return { success: true, message: "Игрок успешно добавлен" }
  } catch (error) {
    console.error("Ошибка при добавлении игрока:", error)
    logEvent("error", "Ошибка при добавлении игрока", "addPlayer", error)
    return { success: false, message: "Ошибка при добавлении игрока" }
  }
}

// Удаление игрока
export const deletePlayer = async (id) => {
  if (typeof window === "undefined") return false

  try {
    // Проверяем доступность Supabase
    const supabaseAvailable = await isSupabaseAvailable()

    if (supabaseAvailable) {
      const supabase = createClientSupabaseClient()
      const { error } = await supabase.from("players").delete().eq("id", id)

      if (error) {
        console.error("Ошибка при удалении игрока из Supabase:", error)
        logEvent("error", "Ошибка при удалении игрока из Supabase", "deletePlayer", error)
      }
    }

    // Всегда обновляем локальное хранилище
    const players = await getPlayers()
    const filteredPlayers = players.filter((player) => player.id !== id)

    localStorage.setItem("tennis_padel_players", JSON.stringify(filteredPlayers))

    // Отправляем кастомное событие для обновления списка игроков
    window.dispatchEvent(new CustomEvent("players-updated"))

    return true
  } catch (error) {
    console.error("Ошибка при удалении игрока:", error)
    logEvent("error", "Ошибка при удалении игрока", "deletePlayer", error)
    return false
  }
}

// Удаление нескольких игроков
export const deletePlayers = async (ids) => {
  if (typeof window === "undefined" || !ids.length) return false

  try {
    logEvent("info", `Начало удаления ${ids.length} игроков`, "deletePlayers", { ids })

    // Проверяем доступность Supabase
    const supabaseAvailable = await isSupabaseAvailable()

    if (supabaseAvailable) {
      const supabase = createClientSupabaseClient()

      // Удаляем игроков по одному, так как Supabase не поддерживает массовое удаление
      for (const id of ids) {
        const { error } = await supabase.from("players").delete().eq("id", id)

        if (error) {
          console.error(`Ошибка при удалении игрока ${id} из Supabase:`, error)
          logEvent("error", `Ошибка при удалении игрока из Supabase: ${id}`, "deletePlayers", error)
        } else {
          logEvent("debug", `Игрок ${id} успешно удален из Supabase`, "deletePlayers")
        }
      }
    }

    // Всегда обновляем локальное хранилище
    const players = await getPlayers()
    const filteredPlayers = players.filter((player) => !ids.includes(player.id))

    localStorage.setItem("tennis_padel_players", JSON.stringify(filteredPlayers))
    logEvent("info", `Игроки успешно удалены из локального хранилища`, "deletePlayers", {
      removed: players.length - filteredPlayers.length,
    })

    // Отправляем кастомное событие для обновления списка игроков
    window.dispatchEvent(new CustomEvent("players-updated"))

    return true
  } catch (error) {
    console.error("Ошибка при удалении игроков:", error)
    logEvent("error", "Ошибка при удалении игроков", "deletePlayers", error)
    return false
  }
}

// Подписка на обновления списка игроков в реальном времени
export const subscribeToPlayersUpdates = (callback) => {
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

        // Подписываемся на изменения списка игроков в Supabase
        const channel = supabase
          .channel("players-changes")
          .on(
            "postgres_changes",
            {
              event: "*", // Слушаем все события (INSERT, UPDATE, DELETE)
              schema: "public",
              table: "players",
            },
            async () => {
              // При любом изменении в таблице игроков, получаем обновленный список
              const players = await getPlayers()
              callback(players)
            },
          )
          .subscribe((status) => {
            logEvent("info", `Статус подписки на обновления игроков: ${status}`, "subscribeToPlayersUpdates")
          })

        // Сохраняем функцию отписки
        unsubscribe = () => {
          logEvent("info", "Отписка от обновлений игроков", "subscribeToPlayersUpdates")
          supabase.removeChannel(channel)
        }
      } else {
        logEvent("warn", "Таблицы в Supabase не существуют, используем локальную подписку", "subscribeToPlayersUpdates")
        setupLocalSubscription()
      }
    } else {
      logEvent("warn", "Supabase недоступен, используем локальную подписку", "subscribeToPlayersUpdates")
      setupLocalSubscription()
    }
  })

  // Функция для настройки локальной подписки
  const setupLocalSubscription = () => {
    // Обработчик события storage для синхронизации между вкладками
    const handleStorageChange = async (event) => {
      if (event.key === "tennis_padel_players") {
        const players = await getPlayers()
        callback(players)
      }
    }

    // Обработчик кастомных событий
    const handlePlayerAdded = async () => {
      const players = await getPlayers()
      callback(players)
    }

    const handlePlayersUpdated = async () => {
      const players = await getPlayers()
      callback(players)
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("player-added", handlePlayerAdded)
    window.addEventListener("players-updated", handlePlayersUpdated)

    // Также настраиваем периодическую проверку обновлений
    const interval = setInterval(async () => {
      const players = await getPlayers()
      callback(players)
    }, 5000)

    // Обновляем функцию отписки
    unsubscribe = () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("player-added", handlePlayerAdded)
      window.removeEventListener("players-updated", handlePlayersUpdated)
      clearInterval(interval)
    }
  }

  // Возвращаем функцию отписки
  return () => {
    if (unsubscribe) unsubscribe()
  }
}
