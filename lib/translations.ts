export type Language = "ru" | "en"

export const LANGUAGES: { [key in Language]: string } = {
  ru: "Русский",
  en: "English",
}

export type TranslationKeys = {
  common: {
    loading: string
    error: string
    save: string
    cancel: string
    delete: string
    edit: string
    back: string
    next: string
    submit: string
    offline: string
    online: string
    success: string
    warning: string
    add: string
    loadingPlayers: string
    fullscreen: string
    vmixOverlay: string
    vmixSettings: string
    checking: string
    saving: string
    continue: string
  }
  home: {
    title: string
    subtitle: string
    newMatch: string
    newMatchDesc: string
    tennis: string
    padel: string
    managePlayers: string
    activeMatches: string
    activeMatchesDesc: string
    matchHistory: string
    joinMatch: string
    joinMatchDesc: string
    joinByCode: string
    diagnostics: string
  }
  match: {
    score: string
    set: string
    game: string
    point: string
    player: string
    team: string
    teamA: string
    teamB: string
    serve: string
    undo: string
    settings: string
    scoreCard: string
    scoreControls: string
    addPoint: string
    switchServer: string
    switchSides: string
    leftSide: string
    rightSide: string
    needToSwitchSides: string
    management: string
    matchManagement: string
    editPlayers: string
    editTeams: string
    matchStatus: string
    matchType: string
    courtNumber: string
    completedMatch: string
    inProgressMatch: string
    deleteMatch: string
    confirmDeleteMatch: string
    deleteMatchWarning: string
    deleteMatchConfirm: string
    deleteMatchCancel: string
    matchDeleted: string
    matchDeleteError: string
    noCourtAssigned: string
    selectCourt: string
    courtAlreadyOccupied: string
    updateCourt: string
    courtUpdated: string
    courtUpdateError: string
    scoreEditing: string
    currentSet: string
    startTiebreakManually: string
    teamWonTiebreak: string
    matchCode: string
    scoringSystem: string
    classicScoring: string
    noAdScoring: string
    fast4Scoring: string
    tiebreakType: string
    regularTiebreak: string
    championshipTiebreak: string
    superTiebreak: string
    tiebreakAt: string
    selectTiebreakScore: string
    additional: string
    goldenGame: string
    goldenPoint: string
    windbreak: string
    applySettings: string
    unlockMatch: string
    endMatch: string
    confirmEndMatch: string
    finishMatch: string
    teamWonMatch: string
    serving: string
    currentGame: string
    setXofY: string
    setX: string
    current: string
    tiebreak: string
    of: string
  }
  matchPage: {
    loadingMatch: string
    errorTitle: string
    createNewMatch: string
    home: string
    court: string
    share: string
    viewScore: string
    notification: string
    matchTab: string
    exportImportTab: string
    exportMatch: string
    exportDescription: string
    exportButton: string
    importMatch: string
    importDescription: string
    importPlaceholder: string
    importButton: string
    technicalFunctions: string
    matchCode: string
    jsonCourt: string
    vmixCourt: string
    jsonMatch: string
    vmixMatch: string
    scoreUpdated: string
    linkCopied: string
    matchCodeCopied: string
    matchDataCopied: string
    importDataRequired: string
    matchImported: string
    importError: string
    matchDataSimplified: string
  }
  matchList: {
    loading: string
    noMatches: string
    completed: string
    inProgress: string
    court: string
  }
  courtsList: {
    title: string
    description: string
    refresh: string
    court: string
    occupied: string
    available: string
  }
  supabaseStatus: {
    checking: string
    online: string
    offline: string
    checkingTooltip: string
    onlineTooltip: string
    offlineTooltip: string
    connectionInfo: string
    connectionDetails: string
    connectionEstablished: string
    connectionMissing: string
    checkNow: string
    connectionDetailsTitle: string
    possibleIssues: string
    issueInternet: string
    issueCredentials: string
    issueServer: string
    issueCors: string
    issueEnvVars: string
    close: string
  }
  players: {
    title: string
    addPlayer: string
    editPlayer: string
    deletePlayer: string
    name: string
    country: string
    selectPlayer: string
    searchPlayer: string
    playerNotFound: string
  }
  newMatch: {
    title: string
    tennisDesc: string
    padelDesc: string
    players: string
    player1: string
    player2: string
    team1Player1: string
    team1Player2: string
    team2Player1: string
    team2Player2: string
    createMatch: string
    matchSettings: string
    sets: string
    games: string
    tiebreak: string
    finalSetTiebreak: string
    goldPoint: string
    goldenPoint: string
    goldenGame: string
    windbreak: string
    format: string
    selectFormat: string
    singles: string
    doubles: string
    oneSets: string
    twoSets: string
    threeSets: string
    fiveSets: string
    scoringSystem: string
    classicScoring: string
    noAdScoring: string
    fast4Scoring: string
    tiebreakType: string
    regularTiebreak: string
    championshipTiebreak: string
    superTiebreak: string
    tiebreakAt: string
    selectTiebreakScore: string
    additional: string
    firstServe: string
    teamASide: string
    left: string
    right: string
    courtSelection: string
    noCourt: string
    court: string
    checkingCourtAvailability: string
    occupiedCourts: string
    allCourtsAvailable: string
    startMatch: string
    selectAllPlayers: string
    selectAllPlayersForDoubles: string
    courtOccupied: string
  }
}

export const translations: { [key in Language]: TranslationKeys } = {
  ru: {
    common: {
      loading: "Загрузка...",
      error: "Ошибка",
      save: "Сохранить",
      cancel: "Отмена",
      delete: "Удалить",
      edit: "Редактировать",
      back: "Назад",
      next: "Далее",
      submit: "Отправить",
      offline: "Оффлайн",
      online: "Онлайн",
      success: "Успешно",
      warning: "Предупреждение",
      add: "Добавить",
      loadingPlayers: "Загрузка игроков...",
      fullscreen: "Полный экран",
      vmixOverlay: "vMix overlay",
      vmixSettings: "vMix настройки",
      checking: "Проверка...",
      saving: "Сохранение...",
      continue: "Продолжить",
    },
    home: {
      title: "Tennis & Padel Scoreboard",
      subtitle: "Отслеживайте счет в реальном времени",
      newMatch: "Создать новый матч",
      newMatchDesc: "Настройте новую игру с выбранными параметрами",
      tennis: "Теннис",
      padel: "Падел",
      managePlayers: "Управление игроками",
      activeMatches: "Активные матчи",
      activeMatchesDesc: "Текущие и недавние матчи",
      matchHistory: "История матчей",
      joinMatch: "Присоединиться к матчу",
      joinMatchDesc: "Введите код матча для просмотра",
      joinByCode: "Присоединиться по цифровому коду",
      diagnostics: "Диагностика",
    },
    match: {
      score: "Счет",
      set: "Сет",
      game: "Гейм",
      point: "Очко",
      player: "Игрок",
      team: "Команда",
      teamA: "Команда A",
      teamB: "Команда B",
      serve: "Подача",
      undo: "Отменить",
      settings: "Настройки",
      scoreCard: "Табло счета",
      scoreControls: "Управление счетом",
      addPoint: "Очко",
      switchServer: "Сменить подающего",
      switchSides: "Сменить стороны",
      leftSide: "Левая сторона",
      rightSide: "Правая сторона",
      needToSwitchSides:
        "Необходимо поменять стороны! Смена сторон произойдет автоматически при следующем изменении счета.",
      management: "Управление",
      matchManagement: "Управление матчем",
      editPlayers: "Редактировать игроков",
      editTeams: "Редактировать команды",
      matchStatus: "Статус матча",
      matchType: "Тип матча",
      courtNumber: "Номер корта",
      completedMatch: "Завершенный",
      inProgressMatch: "В процессе",
      deleteMatch: "Удалить матч",
      confirmDeleteMatch: "Подтвердите удаление",
      deleteMatchWarning: "Вы уверены, что хотите удалить этот матч? Это действие нельзя отменить.",
      deleteMatchConfirm: "Да, удалить",
      deleteMatchCancel: "Отмена",
      matchDeleted: "Матч успешно удален",
      matchDeleteError: "Ошибка при удалении матча",
      noCourtAssigned: "Не назначен",
      selectCourt: "Выберите корт",
      courtAlreadyOccupied: "Этот корт уже занят",
      updateCourt: "Обновить корт",
      courtUpdated: "Корт успешно обновлен",
      courtUpdateError: "Ошибка при обновлении корта",
      scoreEditing: "Редактирование счета",
      currentSet: "текущий",
      startTiebreakManually: "Начать тай-брейк вручную",
      teamWonTiebreak: "Тай-брейк выиграла",
      matchCode: "Код матча",
      scoringSystem: "Система счета",
      classicScoring: "Классическая (AD)",
      noAdScoring: "No-Ad (ровно → решающий мяч)",
      fast4Scoring: "Fast4 (до 4 геймов)",
      tiebreakType: "Тип тай-брейка",
      regularTiebreak: "Обычный (до 7)",
      championshipTiebreak: "Чемпионский (до 10)",
      superTiebreak: "Супер-тай-брейк (вместо 3-го сета)",
      tiebreakAt: "Тай-брейк при счете",
      selectTiebreakScore: "Выберите счет для тай-брейка",
      additional: "Дополнительно",
      goldenGame: "Золотой гейм (падел)",
      goldenPoint: "Золотой мяч (40-40 в решающем гейме)",
      windbreak: "Виндрейк (подача через гейм)",
      applySettings: "Применить настройки",
      unlockMatch: "Разблокировать матч",
      endMatch: "Завершить матч",
      confirmEndMatch: "Вы уверены, что хотите завершить матч? Вы сможете разблокировать его позже, если потребуется.",
      finishMatch: "Завершить матч",
      teamWonMatch: "Команда {{team}} выиграла матч! Что вы хотите сделать?",
      serving: "Подача",
      currentGame: "Текущий гейм",
      setXofY: "Сет {{current}} из {{total}}",
      setX: "Сет {{number}}",
      current: "Текущий",
      tiebreak: "Тай-брейк",
      of: "из",
    },
    matchPage: {
      loadingMatch: "Загрузка матча...",
      errorTitle: "Ошибка",
      createNewMatch: "Создать новый матч",
      home: "На главную",
      court: "Корт",
      share: "Поделиться",
      viewScore: "Просмотр счета",
      notification: "Уведомление",
      matchTab: "Матч",
      exportImportTab: "Экспорт/Импорт",
      exportMatch: "Экспорт матча",
      exportDescription: "Скопируйте данные матча для сохранения или передачи на другое устройство",
      exportButton: "Экспортировать данные",
      importMatch: "Импорт матча",
      importDescription: "Вставьте данные матча для импорта",
      importPlaceholder: "Вставьте данные матча в формате JSON",
      importButton: "Импортировать данные",
      technicalFunctions: "Технические функции",
      matchCode: "Код матча",
      jsonCourt: "JSON КОРТ",
      vmixCourt: "vMix корт",
      jsonMatch: "JSON МАТЧ",
      vmixMatch: "vMix матч",
      scoreUpdated: "Счет обновлен",
      linkCopied: "Ссылка скопирована в буфер обмена",
      matchCodeCopied: "Код матча скопирован в буфер обмена",
      matchDataCopied: "Данные матча скопированы в буфер обмена",
      importDataRequired: "Введите данные для импорта",
      matchImported: "Матч успешно импортирован",
      importError: "Ошибка при импорте матча. Проверьте формат данных.",
      matchDataSimplified: "Данные матча были упрощены из-за ограничений хранилища",
    },
    matchList: {
      loading: "Загрузка матчей...",
      noMatches: "Нет активных матчей",
      completed: "Завершен",
      inProgress: "В процессе",
      court: "Корт",
    },
    courtsList: {
      title: "Статус кортов",
      description: "Информация о занятых кортах",
      refresh: "Обновить",
      court: "Корт",
      occupied: "Занят",
      available: "Свободен",
    },
    supabaseStatus: {
      checking: "Проверка...",
      online: "Онлайн",
      offline: "Офлайн",
      checkingTooltip: "Проверка соединения с базой данных...",
      onlineTooltip: "Синхронизация включена. Матчи доступны на всех устройствах.",
      offlineTooltip: "Синхронизация отключена. Матчи сохраняются только локально.",
      connectionInfo: "Информация о соединении с базой данных",
      connectionDetails: "Подробная информация о статусе соединения с Supabase",
      connectionEstablished: "Соединение установлено",
      connectionMissing: "Соединение отсутствует",
      checkNow: "Проверить сейчас",
      connectionDetailsTitle: "Детали соединения:",
      possibleIssues: "Возможные причины проблем с соединением:",
      issueInternet: "Отсутствует подключение к интернету",
      issueCredentials: "Неверные учетные данные Supabase",
      issueServer: "Сервер Supabase недоступен",
      issueCors: "Проблемы с CORS или сетевыми настройками",
      issueEnvVars: "Отсутствуют необходимые переменные окружения",
      close: "Закрыть",
    },
    players: {
      title: "Управление игроками",
      addPlayer: "Добавить игрока",
      editPlayer: "Редактировать игрока",
      deletePlayer: "Удалить игрока",
      name: "Имя",
      country: "Страна",
      selectPlayer: "Выберите игрока",
      searchPlayer: "Поиск игрока...",
      playerNotFound: "Игрок не найден",
    },
    newMatch: {
      title: "Создание нового матча",
      tennisDesc: "Настройка теннисного матча",
      padelDesc: "Настройка матча по паделу",
      players: "Игроки",
      player1: "Игрок 1",
      player2: "Игрок 2",
      team1Player1: "Команда 1 - Игрок 1",
      team1Player2: "Команда 1 - Игрок 2",
      team2Player1: "Команда 2 - Игрок 1",
      team2Player2: "Команда 2 - Игрок 2",
      createMatch: "Создать матч",
      matchSettings: "Настройки матча",
      sets: "Количество сетов",
      games: "Геймов в сете",
      tiebreak: "Тай-брейк",
      finalSetTiebreak: "Тай-брейк в решающем сете",
      goldPoint: "Золотое очко",
      goldenPoint: "Золотое очко",
      goldenGame: "Золотой гейм (падел)",
      windbreak: "Виндрейк (подача через гейм)",
      format: "Формат игры",
      selectFormat: "Выберите формат",
      singles: "Одиночная игра",
      doubles: "Парная игра",
      oneSets: "1 сет",
      twoSets: "2 сета (тай-брейк в 3-м)",
      threeSets: "3 сета",
      fiveSets: "5 сетов (Гранд-слам)",
      scoringSystem: "Система счета",
      classicScoring: "Классическая (AD)",
      noAdScoring: "No-Ad (ровно → решающий мяч)",
      fast4Scoring: "Fast4 (до 4 геймов)",
      tiebreakType: "Тип тай-брейка",
      regularTiebreak: "Обычный (до 7)",
      championshipTiebreak: "Чемпионский (до 10)",
      superTiebreak: "Супер-тай-брейк (вместо 3-го сета)",
      tiebreakAt: "Тай-брейк при счете",
      selectTiebreakScore: "Выберите счет для тай-брейка",
      additional: "Дополнительно",
      firstServe: "Первая подача",
      teamASide: "Сторона команды A",
      left: "Левая",
      right: "Правая",
      courtSelection: "Выбор корта",
      noCourt: "Без корта",
      court: "Корт",
      checkingCourtAvailability: "Проверка доступности кортов...",
      occupiedCourts: "Занятые корты",
      allCourtsAvailable: "Все корты свободны",
      startMatch: "Начать матч",
      selectAllPlayers: "Выберите игроков для обеих команд",
      selectAllPlayersForDoubles: "Для парной игры необходимо выбрать всех игроков",
      courtOccupied: "Корт {{court}} уже занят. Выберите другой корт.",
    },
  },
  en: {
    common: {
      loading: "Loading...",
      error: "Error",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      back: "Back",
      next: "Next",
      submit: "Submit",
      offline: "Offline",
      online: "Online",
      success: "Success",
      warning: "Warning",
      add: "Add",
      loadingPlayers: "Loading players...",
      fullscreen: "Full Screen",
      vmixOverlay: "vMix overlay",
      vmixSettings: "vMix settings",
      checking: "Checking...",
      saving: "Saving...",
      continue: "Continue",
    },
    home: {
      title: "Tennis & Padel Scoreboard",
      subtitle: "Track scores in real-time",
      newMatch: "Create new match",
      newMatchDesc: "Set up a new game with selected parameters",
      tennis: "Tennis",
      padel: "Padel",
      managePlayers: "Manage players",
      activeMatches: "Active matches",
      activeMatchesDesc: "Current and recent matches",
      matchHistory: "Match history",
      joinMatch: "Join a match",
      joinMatchDesc: "Enter match code to view",
      joinByCode: "Join by digital code",
      diagnostics: "Diagnostics",
    },
    match: {
      score: "Score",
      set: "Set",
      game: "Game",
      point: "Point",
      player: "Player",
      team: "Team",
      teamA: "Team A",
      teamB: "Team B",
      serve: "Serve",
      undo: "Undo",
      settings: "Settings",
      scoreCard: "Score Board",
      scoreControls: "Score Controls",
      addPoint: "Point",
      switchServer: "Switch Server",
      switchSides: "Switch Sides",
      leftSide: "Left side",
      rightSide: "Right side",
      needToSwitchSides: "Need to switch sides! Side change will happen automatically with the next score change.",
      management: "Management",
      matchManagement: "Match Management",
      editPlayers: "Edit Players",
      editTeams: "Edit Teams",
      matchStatus: "Match Status",
      matchType: "Match Type",
      courtNumber: "Court Number",
      completedMatch: "Completed",
      inProgressMatch: "In Progress",
      deleteMatch: "Delete Match",
      confirmDeleteMatch: "Confirm Deletion",
      deleteMatchWarning: "Are you sure you want to delete this match? This action cannot be undone.",
      deleteMatchConfirm: "Yes, Delete",
      deleteMatchCancel: "Cancel",
      matchDeleted: "Match successfully deleted",
      matchDeleteError: "Error deleting match",
      noCourtAssigned: "Not assigned",
      selectCourt: "Select Court",
      courtAlreadyOccupied: "This court is already occupied",
      updateCourt: "Update Court",
      courtUpdated: "Court successfully updated",
      courtUpdateError: "Error updating court",
      scoreEditing: "Score Editing",
      currentSet: "current",
      startTiebreakManually: "Start tiebreak manually",
      teamWonTiebreak: "Tiebreak won by",
      matchCode: "Match code",
      scoringSystem: "Scoring system",
      classicScoring: "Classic (AD)",
      noAdScoring: "No-Ad (deuce → deciding point)",
      fast4Scoring: "Fast4 (up to 4 games)",
      tiebreakType: "Tiebreak type",
      regularTiebreak: "Regular (up to 7)",
      championshipTiebreak: "Championship (up to 10)",
      superTiebreak: "Super tiebreak (instead of 3rd set)",
      tiebreakAt: "Tiebreak at score",
      selectTiebreakScore: "Select tiebreak score",
      additional: "Additional",
      goldenGame: "Golden game (padel)",
      goldenPoint: "Golden point (40-40 in deciding game)",
      windbreak: "Windbreak (serve every other game)",
      applySettings: "Apply settings",
      unlockMatch: "Unlock match",
      endMatch: "End match",
      confirmEndMatch: "Are you sure you want to end this match? You can unlock it later if needed.",
      finishMatch: "Finish match",
      teamWonMatch: "Team {{team}} won the match! What would you like to do?",
      serving: "Serving",
      currentGame: "Current game",
      setXofY: "Set {{current}} of {{total}}",
      setX: "Set {{number}}",
      current: "Current",
      tiebreak: "Tiebreak",
      of: "of",
    },
    matchPage: {
      loadingMatch: "Loading match...",
      errorTitle: "Error",
      createNewMatch: "Create new match",
      home: "Home",
      court: "Court",
      share: "Share",
      viewScore: "View score",
      notification: "Notification",
      matchTab: "Match",
      exportImportTab: "Export/Import",
      exportMatch: "Export match",
      exportDescription: "Copy match data for saving or transferring to another device",
      exportButton: "Export data",
      importMatch: "Import match",
      importDescription: "Paste match data to import",
      importPlaceholder: "Paste match data in JSON format",
      importButton: "Import data",
      technicalFunctions: "Technical functions",
      matchCode: "Match code",
      jsonCourt: "JSON COURT",
      vmixCourt: "vMix court",
      jsonMatch: "JSON MATCH",
      vmixMatch: "vMix match",
      scoreUpdated: "Score updated",
      linkCopied: "Link copied to clipboard",
      matchCodeCopied: "Match code copied to clipboard",
      matchDataCopied: "Match data copied to clipboard",
      importDataRequired: "Enter data for import",
      matchImported: "Match successfully imported",
      importError: "Error importing match. Check data format.",
      matchDataSimplified: "Match data was simplified due to storage limitations",
    },
    matchList: {
      loading: "Loading matches...",
      noMatches: "No active matches",
      completed: "Completed",
      inProgress: "In progress",
      court: "Court",
    },
    courtsList: {
      title: "Court Status",
      description: "Information about occupied courts",
      refresh: "Refresh",
      court: "Court",
      occupied: "Occupied",
      available: "Available",
    },
    supabaseStatus: {
      checking: "Checking...",
      online: "Online",
      offline: "Offline",
      checkingTooltip: "Checking database connection...",
      onlineTooltip: "Synchronization enabled. Matches are available on all devices.",
      offlineTooltip: "Synchronization disabled. Matches are saved locally only.",
      connectionInfo: "Database Connection Information",
      connectionDetails: "Detailed information about Supabase connection status",
      connectionEstablished: "Connection established",
      connectionMissing: "Connection missing",
      checkNow: "Check now",
      connectionDetailsTitle: "Connection details:",
      possibleIssues: "Possible connection issues:",
      issueInternet: "No internet connection",
      issueCredentials: "Invalid Supabase credentials",
      issueServer: "Supabase server is unavailable",
      issueCors: "CORS or network settings issues",
      issueEnvVars: "Missing required environment variables",
      close: "Close",
    },
    players: {
      title: "Manage players",
      addPlayer: "Add player",
      editPlayer: "Edit player",
      deletePlayer: "Delete player",
      name: "Name",
      country: "Country",
      selectPlayer: "Select player",
      searchPlayer: "Search player...",
      playerNotFound: "Player not found",
    },
    newMatch: {
      title: "Create new match",
      tennisDesc: "Set up a tennis match",
      padelDesc: "Set up a padel match",
      players: "Players",
      player1: "Player 1",
      player2: "Player 2",
      team1Player1: "Team 1 - Player 1",
      team1Player2: "Team 1 - Player 2",
      team2Player1: "Team 2 - Player 1",
      team2Player2: "Team 2 - Player 2",
      createMatch: "Create match",
      matchSettings: "Match settings",
      sets: "Number of sets",
      games: "Games per set",
      tiebreak: "Tiebreak",
      finalSetTiebreak: "Final set tiebreak",
      goldPoint: "Gold point",
      goldenPoint: "Gold point",
      goldenGame: "Golden game (padel)",
      windbreak: "Windbreak (serve every other game)",
      format: "Game format",
      selectFormat: "Select format",
      singles: "Singles",
      doubles: "Doubles",
      oneSets: "1 set",
      twoSets: "2 sets (tiebreak in 3rd)",
      threeSets: "3 sets",
      fiveSets: "5 sets (Grand Slam)",
      scoringSystem: "Scoring system",
      classicScoring: "Classic (AD)",
      noAdScoring: "No-Ad (deuce → deciding point)",
      fast4Scoring: "Fast4 (up to 4 games)",
      tiebreakType: "Tiebreak type",
      regularTiebreak: "Regular (up to 7)",
      championshipTiebreak: "Championship (up to 10)",
      superTiebreak: "Super tiebreak (instead of 3rd set)",
      tiebreakAt: "Tiebreak at score",
      selectTiebreakScore: "Select tiebreak score",
      additional: "Additional",
      firstServe: "First serve",
      teamASide: "Team A side",
      left: "Left",
      right: "Right",
      courtSelection: "Court selection",
      noCourt: "No court",
      court: "Court",
      checkingCourtAvailability: "Checking court availability...",
      occupiedCourts: "Occupied courts",
      allCourtsAvailable: "All courts available",
      startMatch: "Start match",
      selectAllPlayers: "Select players for both teams",
      selectAllPlayersForDoubles: "For doubles, you need to select all players",
      courtOccupied: "Court {{court}} is already occupied. Please select another court.",
    },
  },
}
