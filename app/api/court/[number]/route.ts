import { type NextRequest, NextResponse } from "next/server"
import { getTennisPointName } from "@/lib/tennis-utils"
import { logEvent } from "@/lib/error-logger"
import { getMatchFromServerByCourtNumber } from "@/lib/server-match-storage"

// Функция для преобразования числового значения очков в теннисе в индекс
const getPointIndex = (point) => {
  // Обработка строкового значения "Ad" (преимущество)
  if (point === "Ad") return 4

  // Преобразуем числовые значения очков (0, 15, 30, 40) в индексы (0, 1, 2, 3)
  if (point === 0) return 0
  if (point === 15) return 1
  if (point === 30) return 2
  if (point === 40) return 3

  // Если значение больше 40, считаем это преимуществом (Ad)
  if (typeof point === "number" && point > 40) return 4

  // Если это числовое значение, но не стандартное, возвращаем его как есть
  // (это может быть счет в тай-брейке)
  return point
}

// Функция для определения game point
const isGamePoint = (match) => {
  if (!match || !match.score || !match.score.currentSet) {
    return false
  }

  const currentSet = match.score.currentSet
  const currentGame = currentSet.currentGame

  if (!currentGame) {
    return false
  }

  // Получаем индексы очков для правильного сравнения
  const teamAIndex = getPointIndex(currentGame.teamA)
  const teamBIndex = getPointIndex(currentGame.teamB)

  // Для тай-брейка
  if (currentSet.isTiebreak) {
    // В тай-брейке обычно нужно набрать 7 очков с разницей в 2 очка
    // Если команда A имеет 6 очков и ведет, это game point
    if (currentGame.teamA >= 6 && currentGame.teamA >= currentGame.teamB + 1) {
      return "teamA"
    }
    // Если команда B имеет 6 очков и ведет, это game point
    if (currentGame.teamB >= 6 && currentGame.teamB >= currentGame.teamA + 1) {
      return "teamB"
    }
    return false
  }

  // Для обычного гейма - исправленная логика с использованием индексов

  // Если у команды A преимущество (Ad)
  if (teamAIndex === 4 && teamBIndex <= 3) {
    return "teamA"
  }

  // Если команда A имеет 40 (индекс 3) и команда B имеет меньше или равно 30 (индекс <= 2)
  if (teamAIndex === 3 && teamBIndex <= 2) {
    return "teamA"
  }

  // Если у команды B преимущество (Ad)
  if (teamBIndex === 4 && teamAIndex <= 3) {
    return "teamB"
  }

  // Если команда B имеет 40 (индекс 3) и команда A имеет меньше или равно 30 (индекс <= 2)
  if (teamBIndex === 3 && teamAIndex <= 2) {
    return "teamB"
  }

  return false
}

// Функция для определения set point
const isSetPoint = (match) => {
  if (!match || !match.score || !match.score.currentSet) {
    return false
  }

  const currentSet = match.score.currentSet
  const teamAGames = currentSet.teamA
  const teamBGames = currentSet.teamB

  // Если идет тай-брейк, проверяем особым образом
  if (currentSet.isTiebreak) {
    // Получаем, кто имеет гейм-поинт в тай-брейке
    const gamePoint = isGamePoint(match)

    // Если есть гейм-поинт в тай-брейке, то это также и сет-поинт
    if (gamePoint) {
      return gamePoint
    }

    return false
  }

  // Для обычного гейма
  // Получаем, кто имеет гейм-поинт
  const gamePoint = isGamePoint(match)

  if (!gamePoint) {
    return false
  }

  // Для команды A
  if (gamePoint === "teamA") {
    // Если команда A ведет 5-x и выиграет этот гейм, то счет станет 6-x
    if (teamAGames === 5 && teamBGames <= 4) {
      return "teamA"
    }
    // Если команда A ведет 6-5 и выиграет этот гейм, то счет станет 7-5
    if (teamAGames === 6 && teamBGames === 5) {
      return "teamA"
    }
  }

  // Для команды B
  if (gamePoint === "teamB") {
    // Если команда B ведет 5-x и выиграет этот гейм, то счет станет 6-x
    if (teamBGames === 5 && teamAGames <= 4) {
      return "teamB"
    }
    // Если команда B ведет 6-5 и выиграет этот гейм, то счет станет 7-5
    if (teamBGames === 6 && teamAGames === 5) {
      return "teamB"
    }
  }

  return false
}

// Функция для определения match point
const isMatchPoint = (match) => {
  if (!match || !match.score || !match.score.currentSet) {
    return false
  }

  // Определяем, сколько сетов нужно для победы
  const setsToWin = getSetsToWin(match)

  // Получаем текущий счет по сетам
  const teamASets = match.score.sets ? match.score.sets.filter((set) => set.teamA > set.teamB).length : 0
  const teamBSets = match.score.sets ? match.score.sets.filter((set) => set.teamB > set.teamA).length : 0

  // Проверяем, является ли текущий гейм сет-поинтом
  const setPoint = isSetPoint(match)

  // Если нет сет-поинта, то не может быть и матч-поинта
  if (!setPoint) {
    return false
  }

  // Для команды A
  if (setPoint === "teamA" && teamASets === setsToWin - 1) {
    return "teamA"
  }

  // Для команды B
  if (setPoint === "teamB" && teamBSets === setsToWin - 1) {
    return "teamB"
  }

  return false
}

// Функция для определения важного момента
const getImportantPoint = (match) => {
  // Проверяем, идет ли тай-брейк
  const isTiebreak = match?.score?.currentSet?.isTiebreak || false

  // Сначала проверяем match point (самый приоритетный)
  const matchPoint = isMatchPoint(match)
  if (matchPoint) {
    return { type: "MATCH POINT", team: matchPoint }
  }

  // Затем проверяем set point
  const setPoint = isSetPoint(match)
  if (setPoint) {
    return { type: "SET POINT", team: setPoint }
  }

  // Затем проверяем game point
  const gamePoint = isGamePoint(match)
  if (gamePoint) {
    // Если идет тай-брейк, показываем "TIEBREAK POINT" вместо "GAME POINT"
    if (isTiebreak) {
      return { type: "TIEBREAK POINT", team: gamePoint }
    }
    return { type: "GAME POINT", team: gamePoint }
  }

  // Если нет важного момента, возвращаем тип индикатора в зависимости от того, идет ли тай-брейк
  return { type: isTiebreak ? "TIEBREAK" : "", team: null }
}

// Функция для определения общего количества сетов
const getTotalSets = (match) => {
  // Проверяем различные возможные пути к данным о формате матча
  if (match.format && typeof match.format === "object") {
    // Прямое указание общего количества сетов
    if (typeof match.format.totalSets === "number") {
      return match.format.totalSets
    }
    if (typeof match.format.sets === "number") {
      return match.format.sets
    }
    // Формат "best of X sets"
    if (typeof match.format.bestOf === "number") {
      return match.format.bestOf
    }
  }

  // Проверяем настройки матча
  if (match.settings && typeof match.settings === "object") {
    // Прямое указание общего количества сетов
    if (typeof match.settings.totalSets === "number") {
      return match.settings.totalSets
    }
    if (typeof match.settings.sets === "number") {
      return match.settings.sets
    }
    // Формат "best of X sets"
    if (typeof match.settings.bestOf === "number") {
      return match.settings.bestOf
    }
  }

  // По умолчанию 3 сета
  return 3
}

// Функция для определения количества сетов для победы
const getSetsToWin = (match) => {
  // Проверяем различные возможные пути к данным о формате матча
  if (match.format && typeof match.format === "object") {
    // Прямое указание количества сетов для победы
    if (typeof match.format.setsToWin === "number") {
      return match.format.setsToWin
    }
  }

  // Проверяем настройки матча
  if (match.settings && typeof match.settings === "object") {
    // Прямое указание количества сетов для победы
    if (typeof match.settings.setsToWin === "number") {
      return match.settings.setsToWin
    }
  }

  // Вычисляем на основе общего количества сетов
  const totalSets = getTotalSets(match)
  return Math.ceil(totalSets / 2)
}

// Функция для определения номера текущего сета
const getCurrentSetNumber = (match) => {
  if (!match || !match.score) {
    return 1
  }

  // Если матч завершен, возвращаем последний сыгранный сет
  if (match.isCompleted) {
    return match.score.sets ? match.score.sets.length : 1
  }

  // Если есть массив сетов, текущий сет = количество завершенных сетов + 1
  if (match.score.sets && Array.isArray(match.score.sets)) {
    return match.score.sets.length + 1
  }

  // По умолчанию первый сет
  return 1
}

export async function GET(request: NextRequest, { params }: { params: { number: string } }) {
  try {
    const courtNumber = Number.parseInt(params.number)

    if (isNaN(courtNumber) || courtNumber < 1 || courtNumber > 10) {
      return NextResponse.json({ error: "Некорректный номер корта" }, { status: 400 })
    }

    logEvent("info", `Court API: запрос данных матча на корте ${courtNumber}`, "court-api")

    // Используем серверную функцию для получения матча по номеру корта
    const match = await getMatchFromServerByCourtNumber(courtNumber)

    if (!match) {
      logEvent("error", `Court API: матч на корте ${courtNumber} не найден`, "court-api")
      return NextResponse.json(
        {
          error: "Матч не найден",
          courtNumber: courtNumber,
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      )
    }

    // Логируем структуру матча для отладки
    logEvent("debug", `Court API: структура матча`, "court-api", {
      matchId: match.id,
      format: match.format,
      settings: match.settings,
    })

    // Получаем текущие сеты для обеих команд
// Получаем завершенные сеты
const completedTeamASets = match.score.sets ? match.score.sets.map((set) => set.teamA) : []
const completedTeamBSets = match.score.sets ? match.score.sets.map((set) => set.teamB) : []

// Создаем полные массивы сетов, включая текущий играющийся сет
const teamASets = [...completedTeamASets]
const teamBSets = [...completedTeamBSets]

// Если матч не завершен и есть текущий сет, добавляем его счет
if (!match.isCompleted && match.score.currentSet) {
  teamASets.push(match.score.currentSet.teamA)
  teamBSets.push(match.score.currentSet.teamB)
}

    // Определяем информацию о победителе
    let winnerTeamName = ""
    let winnerName1 = ""
    let winnerName2 = ""

    if (match.isCompleted && match.winner) {
      if (match.winner === "teamA") {
        winnerTeamName = match.teamA.players.map((p) => p.name).join(" / ")
        winnerName1 = match.teamA.players[0]?.name || ""
        winnerName2 = match.teamA.players[1]?.name || ""
      } else if (match.winner === "teamB") {
        winnerTeamName = match.teamB.players.map((p) => p.name).join(" / ")
        winnerName1 = match.teamB.players[0]?.name || ""
        winnerName2 = match.teamB.players[1]?.name || ""
      }
    }

    // Получаем информацию о важном моменте
    const importantPoint = getImportantPoint(match)

    // Определяем общее количество сетов и сетов для победы
    const totalSets = getTotalSets(match)
    const setsToWin = getSetsToWin(match)
    const currentSetNumber = getCurrentSetNumber(match)

    // Логируем определенные значения для отладки
    logEvent("debug", `Court API: определены параметры матча`, "court-api", {
      totalSets,
      setsToWin,
      currentSetNumber,
      completedSets: match.score.sets ? match.score.sets.length : 0,
    })

    // Формируем базовый объект данных
    const flatVmixData = {
      match_id: match.id,
      court_number: courtNumber,

      // Данные команды A
      teamA_name: match.teamA.players.map((p) => p.name).join(" / "),
      teamA_player1_name: match.teamA.players[0]?.name || "",
      teamA_player2_name: match.teamA.players[1]?.name || "",
      teamA_score: match.score.teamA,
      teamA_game_score: match.score.currentSet
        ? match.score.currentSet.isTiebreak
          ? match.score.currentSet.currentGame.teamA
          : getTennisPointName(match.score.currentSet.currentGame.teamA)
        : "0",
      teamA_current_set: match.score.currentSet ? match.score.currentSet.teamA : 0,
      teamA_serving: match.currentServer && match.currentServer.team === "teamA" ? "True" : "False",

      // Данные команды B
      teamB_name: match.teamB.players.map((p) => p.name).join(" / "),
      teamB_player1_name: match.teamB.players[0]?.name || "",
      teamB_player2_name: match.teamB.players[1]?.name || "",
      teamB_score: match.score.teamB,
      teamB_game_score: match.score.currentSet
        ? match.score.currentSet.isTiebreak
          ? match.score.currentSet.currentGame.teamB
          : getTennisPointName(match.score.currentSet.currentGame.teamB)
        : "0",
      teamB_current_set: match.score.currentSet ? match.score.currentSet.teamB : 0,
      teamB_serving: match.currentServer && match.currentServer.team === "teamB" ? "True" : "False",

      // Общие данные матча
      is_tiebreak: match.score.currentSet ? (match.score.currentSet.isTiebreak ? "True" : "False") : "False",
      is_completed: match.isCompleted ? "True" : "False",
      winner: match.winner || "",
      total_sets: totalSets,
      sets_to_win: setsToWin,
      current_set_number: currentSetNumber,

      // Информация о победителе
      winner_team_name: winnerTeamName,
      winner_name1: winnerName1,
      winner_name2: winnerName2,

      // Информация о важном моменте
      important_point_type: importantPoint.type || "",
      important_point_team: importantPoint.team || "",
      is_important_p: importantPoint.team ? "True" : "False",
      is_match_point: isMatchPoint(match) ? "True" : "False",
      is_set_point: isSetPoint(match) ? "True" : "False",
      is_game_point: isGamePoint(match) ? "True" : "False",

      // Служебная информация
      timestamp: new Date().toISOString(),
      update_time: new Date().toLocaleTimeString(),
    }

    // Динамически добавляем данные о сетах в зависимости от настр��ек матча
    // Гарантируем, что будет как минимум 5 сетов для совместимости с vMix
    const maxSets = Math.max(5, totalSets)
    for (let i = 0; i < maxSets; i++) {
      flatVmixData[`teamA_set${i + 1}`] = teamASets[i] !== undefined ? teamASets[i] : ""
      flatVmixData[`teamB_set${i + 1}`] = teamBSets[i] !== undefined ? teamBSets[i] : ""
    }

    // Оборачиваем объект в массив для vMix
    const vmixDataArray = [flatVmixData]

    logEvent("info", `Court API: данные матча на корте ${courtNumber} успешно отправлены`, "court-api")

    // Устанавливаем заголовки для CORS, чтобы vMix мог получить данные
    return NextResponse.json(vmixDataArray, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    logEvent("error", "Court API: ошибка при обработке запроса", "court-api", error)
    return NextResponse.json(
      {
        error: "Внутренняя ошибка сервера",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
