export type Language = "ru" | "en" | "uk"

export const LANGUAGES: { [key in Language]: string } = {
  ru: "Русский",
  en: "English",
  uk: "Українська",
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
    fixedSides: string
    fixedPlayers: string
  }
  scoreboard: {
    tennis: string
    padel: string
    singles: string
    doubles: string
    matchCompleted: string
    set: string
    of: string
    tiebreak: string
    game: string
    leftCourtSide: string
    rightCourtSide: string
    currentServer: string
    playerA: string
    playerB: string
  }
  scoreboardSettings: {
    title: string
    presets: string
    colors: string
    display: string
    sizes: string
    advancedColors: string
    darkTheme: string
    lightTheme: string
    contrastTheme: string
    neutralTheme: string
    backgroundColor: string
    textColor: string
    teamAColors: string
    teamBColors: string
    startColor: string
    endColor: string
    showCourtSides: string
    showCurrentServer: string
    showServerIndicator: string
    showSetsScore: string
    useCustomSizes: string
    fontSize: string
    playerCellWidth: string
    playerNamesFontSize: string
    gameScoreFontSize: string
    setsScoreFontSize: string
    infoBlockFontSize: string
    gameScoreTextColor: string
    gameCellBgColor: string
    tiebreakCellBgColor: string
    setsScoreTextColor: string
    done: string
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
    backToMatchControl: string
  }
  matchList: {
    loading: string
    noMatches: string
    completed: string
    inProgress: string
    court: string
    code?: string
    error?: string
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
    deletePlayers: string
    deletePlayersConfirm: string
    deletePlayersWarning: string
    deleteSelected: string
    name: string
    country: string
    countryAbbreviation: string
    selectPlayer: string
    searchPlayer: string
    playerNotFound: string
    selectAll: string
    loadingPlayers: string
    emptyList: string
    totalPlayers: string
    selected: string
    errorAddingPlayer: string
    errorDeletingPlayers: string
    noPlayersFound: string
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
    finalSetTiebreakLength: string
    finalSetTiebreakLengthDescription: string
    finalSetTiebreakNote: string
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
    superSet: string
  }
  vmixSettings: {
    title: string
    backToMatch: string
    settingsFor: string
    displaySettings: string
    apiForVmix: string
    basicSettings: string
    configureBasicParams: string
    theme: string
    selectTheme: string
    customTheme: string
    transparentTheme: string
    fontSize: string
    selectFontSize: string
    smallSize: string
    mediumSize: string
    largeSize: string
    xlargeSize: string
    playerNamesFontSize: string
    bgOpacity: string
    textColor: string
    serveIndicatorColor: string
    colorsAndGradients: string
    configureColorsAndGradients: string
    playerNamesBlock: string
    playerNamesBgColor: string
    useGradientForNames: string
    namesGradientStartColor: string
    namesGradientEndColor: string
    countriesBlock: string
    countriesBgColor: string
    useGradientForCountries: string
    countriesGradientStartColor: string
    countriesGradientEndColor: string
    serveIndicatorBlock: string
    serveIndicatorBgColor: string
    useGradientForServeIndicator: string
    serveIndicatorGradientStartColor: string
    serveIndicatorGradientEndColor: string
    serveIndicatorExample: string
    currentScoreBlock: string
    currentScoreBgColor: string
    useGradientForCurrentScore: string
    currentScoreGradientStartColor: string
    currentScoreGradientEndColor: string
    setsScoreBlock: string
    setsBgColor: string
    setsTextColor: string
    useGradientForSets: string
    setsGradientStartColor: string
    setsGradientEndColor: string
    importantMomentsIndicator: string
    indicatorBgColor: string
    indicatorTextColor: string
    useGradientForIndicator: string
    indicatorGradientStartColor: string
    indicatorGradientEndColor: string
    actions: string
    previewAndUseSettings: string
    preview: string
    openInNewWindow: string
    openInCurrentWindow: string
    copyUrl: string
    copying: string
    saveSettings: string
    jsonApiForVmix: string
    useApiForVmixData: string
    jsonApiUrl: string
    instructionsForVmix: string
    dataSourceSetup: string
    titleDesignerUsage: string
    titleDesignerSteps: string
    availableDataFields: string
    teamA: string
    teamB: string
    generalData: string
    dataFormatExample: string
    settingsSaved: string
    errorSavingSettings: string
    teamAName: string
    teamAScore: string
    teamAGameScore: string
    teamACurrentSet: string
    teamAServing: string
    teamASetScores: string
    teamBName: string
    teamBScore: string
    teamBGameScore: string
    teamBCurrentSet: string
    teamBServing: string
    teamBSetScores: string
    matchId: string
    isTiebreak: string
    isCompleted: string
    winner: string
    updateTime: string
    copyJsonApiUrl: string
    openCourtInNewWindow: string
    openCourtInCurrentWindow: string
    copyCourtUrl: string
    actionsForCourtPage: string
    courtNotAssigned: string
    selectSaveOrDeleteSettings: string
    saveSettingsDialog: string
    saveSettingsDescription: string
    settingsName: string
    settingsNamePlaceholder: string
    useAsDefault: string
    cancelButton: string
    savingButton: string
    saveButton: string
    savedSettings: string
    selectSettings: string
  }
  courtVmixSettings: {
    title: string
    backToMatch: string
    settingsForCourt: string
    noActiveMatches: string
    matchOnCourt: string
    displaySettings: string
    apiForVmix: string
    basicSettings: string
    configureBasicParams: string
    theme: string
    selectTheme: string
    customTheme: string
    transparentTheme: string
    fontSize: string
    selectFontSize: string
    smallSize: string
    mediumSize: string
    largeSize: string
    xlargeSize: string
    playerNamesFontSize: string
    bgOpacity: string
    textColor: string
    serveIndicatorColor: string
    colorsAndGradients: string
    configureColorsAndGradients: string
    playerNamesBlock: string
    playerNamesBgColor: string
    useGradientForNames: string
    namesGradientStartColor: string
    namesGradientEndColor: string
    countriesBlock: string
    countriesBgColor: string
    useGradientForCountries: string
    countriesGradientStartColor: string
    countriesGradientEndColor: string
    serveIndicatorBlock: string
    serveIndicatorBgColor: string
    useGradientForServeIndicator: string
    serveIndicatorGradientStartColor: string
    serveIndicatorGradientEndColor: string
    serveIndicatorExample: string
    currentScoreBlock: string
    currentScoreBgColor: string
    useGradientForCurrentScore: string
    currentScoreGradientStartColor: string
    currentScoreGradientEndColor: string
    setsScoreBlock: string
    setsBgColor: string
    setsTextColor: string
    useGradientForSets: string
    setsGradientStartColor: string
    setsGradientEndColor: string
    importantMomentsIndicator: string
    indicatorBgColor: string
    indicatorTextColor: string
    useGradientForIndicator: string
    indicatorGradientStartColor: string
    indicatorGradientEndColor: string
    actions: string
    previewAndUseSettings: string
    preview: string
    openInNewWindow: string
    openInCurrentWindow: string
    copyUrl: string
    copying: string
    saveSettings: string
    jsonApiForVmix: string
    useApiForVmixData: string
    jsonApiUrl: string
    instructionsForVmix: string
    dataSourceSetup: string
    dataSourceSteps: string
    titleDesignerUsage: string
    titleDesignerSteps: string
    availableDataFields: string
    teamA: string
    teamB: string
    generalData: string
    dataFormatExample: string
    settingsSaved: string
    errorSavingSettings: string
    loadingSettings: string
    teamAName: string
    teamAScore: string
    teamAGameScore: string
    teamACurrentSet: string
    teamAServing: string
    teamASetScores: string
    teamBName: string
    teamBScore: string
    teamBGameScore: string
    teamBCurrentSet: string
    teamBServing: string
    teamBSetScores: string
    matchId: string
    isTiebreak: string
    isCompleted: string
    winner: string
    updateTime: string
    copyJsonApiUrl: string
    showPlayerNames: string
    showCurrentPoints: string
    showSetsScore: string
    showServer: string
    showCountries: string
    savedSettings: string
    selectSaveOrDeleteSettings: string
    saveSettingsDialog: string
    saveSettingsDescription: string
    settingsName: string
    settingsNamePlaceholder: string
    useAsDefault: string
    cancelButton: string
    savingButton: string
    saveButton: string
    selectSettings: string
    createNewSettings: "Створити нові"
    updateSettings: "Оновити"
    deleteSettings: "Видалити"
    saveToDatabase: "Зберегти в базу даних"
    deletingButton: "Видалення..."
    deleteButton: "Видалити"
    deleteSettingsDialog: "Видалення налаштувань"
    deleteSettingsDescription: "Ви впевнені, що хочете видалити ці налаштування? Цю дію не можна скасувати."
    matchInfo: "Інформація про матч"
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
      teamWonMatch: "{{team}} выиграли матч! Что вы хотите сделать?",
      serving: "Подача",
      currentGame: "Текущий гейм",
      setXofY: "Сет {{current}} из {{total}}",
      setX: "Сет {{number}}",
      current: "Текущий",
      tiebreak: "Тай-брейк",
      of: "из",
      fixedSides: "Фиксированные стороны",
      fixedPlayers: "Фиксированные игроки",
    },
    scoreboard: {
      tennis: "Теннис",
      padel: "Падел",
      singles: "Одиночная игра",
      doubles: "Парная игра",
      matchCompleted: "Матч завершен",
      set: "Сет",
      of: "из",
      tiebreak: "Тайбрейк",
      game: "Гейм",
      leftCourtSide: "Левая сторона корта",
      rightCourtSide: "Правая сторона корта",
      currentServer: "Текущая подача",
      playerA: "Игрок A",
      playerB: "Игрок B",
    },
    scoreboardSettings: {
      title: "Настройки отображения",
      presets: "Готовые схемы",
      colors: "Цвета",
      display: "Отображение",
      sizes: "Размеры",
      advancedColors: "Доп. цвета",
      darkTheme: "Темная",
      lightTheme: "Светлая",
      contrastTheme: "Контрастная",
      neutralTheme: "Нейтральная",
      backgroundColor: "Цвет фона",
      textColor: "Цвет текста",
      teamAColors: "Цвета команды A",
      teamBColors: "Цвета команды B",
      startColor: "Начальный цвет",
      endColor: "Конечный цвет",
      showCourtSides: "Показывать стороны корта",
      showCurrentServer: "Показывать блок текущей подачи",
      showServerIndicator: "Показывать индикатор подачи у имен",
      showSetsScore: "Показывать счет сетов",
      useCustomSizes: "Использовать настройки размеров",
      fontSize: "Общий размер шрифта",
      playerCellWidth: "Ширина ячейки имен игроков",
      playerNamesFontSize: "Размер шрифта имен игроков",
      gameScoreFontSize: "Размер шрифта счета в гейме",
      setsScoreFontSize: "Размер шрифта счета в сетах",
      infoBlockFontSize: "Размер шрифта информационных блоков",
      gameScoreTextColor: "Цвет текста счета в гейме",
      gameCellBgColor: "Цвет фона ячейки гейма",
      tiebreakCellBgColor: "Цвет фона ячейки тай-брейка",
      setsScoreTextColor: "Цвет текста счета в сетах",
      done: "Готово",
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
      backToMatchControl: "К управлению матчем",
    },
    matchList: {
      loading: "Загрузка матчей...",
      noMatches: "Нет активных матчей",
      completed: "Завершен",
      inProgress: "В процессе",
      court: "Корт",
      code: "Код",
      error: "Ошибка загрузки",
    },
    courtsList: {
      title: "Статус кортов",
      description: "Информация о занятых кортах",
      refresh: "Обновить",
      court: "Корт",
      occupied: "Занят",
      available: "Свободен",
      jsonData: "JSON данные",
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
      deletePlayers: "Удаление игроков",
      deletePlayersConfirm: "Вы уверены, что хотите удалить выбранных игроков",
      deletePlayersWarning: "Это действие нельзя отменить.",
      deleteSelected: "Удалить выбранных",
      name: "Имя",
      country: "Страна",
      countryAbbreviation: "Аббревиатура страны (ENG, RUS, ESP...)",
      selectPlayer: "Выберите игрока",
      searchPlayer: "Поиск игрока...",
      playerNotFound: "Игрок не найден",
      selectAll: "Выбрать всех",
      loadingPlayers: "Загрузка игроков...",
      emptyList: "Список игроков пуст",
      totalPlayers: "Всего игроков",
      selected: "Выбрано",
      errorAddingPlayer: "Произошла ошибка при добавлении игрока",
      errorDeletingPlayers: "Произошла ошибка при удалении игроков",
      noPlayersFound: "Игроки не найдены",
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
      finalSetTiebreakLength: "Длина тай-брейка в решающем сете",
      finalSetTiebreakLengthDescription: "Выберите длину тай-брейка в решающем сете",
      finalSetTiebreakNote: "Эта настройка влияет только на завершающий сет и не связана с обычными тайбрейками.",
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
      superSet: "🟢 ПРО сет до 8 геймов (Fast Set / Short Set)",
    },
    vmixSettings: {
      title: "Настройки vMix для матча",
      backToMatch: "Назад к матчу",
      settingsFor: "Настройки для матча",
      displaySettings: "Настройки отображения",
      apiForVmix: "API для vMix",
      basicSettings: "Основные настройки",
      configureBasicParams: "Настройте основные параметры отображения",
      theme: "Тема",
      selectTheme: "Выберите тему",
      customTheme: "Пользовательская",
      transparentTheme: "Прозрачная",
      fontSize: "Размер шрифта",
      selectFontSize: "Выберите размер шрифта",
      smallSize: "Маленький",
      mediumSize: "Средний",
      largeSize: "Большой",
      xlargeSize: "Очень большой",
      playerNamesFontSize: "Размер шрифта имен игроков",
      bgOpacity: "Прозрачность фона",
      textColor: "Цвет текста",
      serveIndicatorColor: "Цвет индикатора подачи",
      colorsAndGradients: "Цвета и градиенты",
      configureColorsAndGradients: "Настройте цвета и градиенты для различных блоков",
      playerNamesBlock: "Блок имен игроков",
      playerNamesBgColor: "Цвет фона имен игроков",
      useGradientForNames: "Использовать градиент для имен",
      namesGradientStartColor: "Начальный цвет градиента имен",
      namesGradientEndColor: "Конечный цвет градиента имен",
      countriesBlock: "Блок стран игроков",
      countriesBgColor: "Цвет фона стран игроков",
      useGradientForCountries: "Использовать градиент для стран",
      countriesGradientStartColor: "Начальный цвет градиента стран",
      countriesGradientEndColor: "Конечный цвет градиента стран",
      serveIndicatorBlock: "Блок индикатора подачи",
      serveIndicatorBgColor: "Цвет фона индикатора подачи",
      useGradientForServeIndicator: "Использовать градиент для фона индикатора подачи",
      serveIndicatorGradientStartColor: "Начальный цвет градиента фона индикатора",
      serveIndicatorGradientEndColor: "Конечный цвет градиента фона индикатора",
      serveIndicatorExample: "Пример индикатора подачи",
      currentScoreBlock: "Блок текущего счета",
      currentScoreBgColor: "Цвет фона текущего счета",
      useGradientForCurrentScore: "Использовать градиент для счета",
      currentScoreGradientStartColor: "Начальный цвет градиента счета",
      currentScoreGradientEndColor: "Конечный цвет градиента счета",
      setsScoreBlock: "Блок счета в сетах",
      setsBgColor: "Цвет фона счета сетов",
      setsTextColor: "Цвет текста счета сетов",
      useGradientForSets: "Использовать градиент для счета в сетах",
      setsGradientStartColor: "Начальный цвет градиента счета в сетах",
      setsGradientEndColor: "Конечный цвет градиента счета в сетах",
      importantMomentsIndicator: "Индикатор важных моментов",
      indicatorBgColor: "Цвет фона индикатора",
      indicatorTextColor: "Цвет текста индикатора",
      useGradientForIndicator: "Использовать градиент для индикатора",
      indicatorGradientStartColor: "Начальный цвет градиента индикатора",
      indicatorGradientEndColor: "Конечный цвет градиента индикатора",
      actions: "Действия",
      previewAndUseSettings: "Предпросмотр и использование настроек",
      preview: "Предпросмотр с текущими настройками",
      openInNewWindow: "Открыть в новом окне",
      openInCurrentWindow: "Открыть в текущем окне",
      copyUrl: "Скопировать URL",
      copying: "Копирование...",
      saveSettings: "Сохранить настройки",
      jsonApiForVmix: "JSON API для vMix",
      useApiForVmixData: "Используйте этот API для получения данных матча в формате JSON",
      jsonApiUrl: "URL для JSON API",
      instructionsForVmix: "Инструкция по использованию в vMix",
      dataSourceSetup: "Настройка Data Source в vMix:",
      dataSourceSteps:
        'В vMix перейдите в меню "Settings" → "Data Sources"\nНажмите "Add" и выберите "Web"\nВставьте URL API в поле "URL"\nУстановите "Update Interval" на 1-2 секунды\nНажмите "OK" для сохранения',
      titleDesignerUsage: "Использование в Title Designer:",
      titleDesignerSteps:
        'Создайте новый Title или откройте существующий\nДобавьте текстовые поля для отображения данных\nВ свойствах текстового поля выберите "Data Binding"\nВыберите вашу Data Source и нужное поле (например, "teamA_name")\nПовторите для всех нужных полей',
      availableDataFields: "Доступные поля данных",
      teamA: "Команда A:",
      teamB: "Команда B:",
      generalData: "Общие данные:",
      dataFormatExample: "Пример формата данных",
      settingsSaved: "Настройки сохранены",
      errorSavingSettings: "Не удалось сохранить настройки",
      teamAName: "Имя команды A",
      teamAScore: "Счет команды A",
      teamAGameScore: "Текущий счет в гейме команды A",
      teamACurrentSet: "Текущий сет команды A",
      teamAServing: "Подача команды A",
      teamASetScores: "Счет в сетах команды A",
      teamBName: "Имя команды B",
      teamBScore: "Счет команды B",
      teamBGameScore: "Текущий счет в гейме команды B",
      teamBCurrentSet: "Текущий сет команды B",
      teamBServing: "Подача команды B",
      teamBSetScores: "Счет в сетах команды B",
      matchId: "ID матча",
      isTiebreak: "Тай-брейк",
      isCompleted: "Матч завершен",
      winner: "Победитель",
      updateTime: "Время обновления",
      copyJsonApiUrl: "Скопировать URL JSON API",
      openCourtInNewWindow: "Открыть корт в новом окне",
      openCourtInCurrentWindow: "Открыть корт в текущем окне",
      copyCourtUrl: "Скопировать URL корта",
      actionsForCourtPage: "Действия для страницы корта:",
      courtNotAssigned: "Матч не назначен на корт. Назначьте матч на корт, чтобы использовать эти функции.",
      selectSaveOrDeleteSettings: "Выберите, сохраните или удалите настройки vMix",
      saveSettingsDialog: "Сохранение настроек vMix",
      saveSettingsDescription: "Введите название для настроек и выберите, будут ли они использоваться по умолчанию",
      settingsName: "Название настроек",
      settingsNamePlaceholder: "Введите название настроек",
      useAsDefault: "Использовать по умолчанию",
      cancelButton: "Отмена",
      savingButton: "Сохранение...",
      saveButton: "Сохранить",
      savedSettings: "Сохраненные настройки",
      selectSettings: "Выберите настройки",
      small: "Маленький",
      normal: "Нормальный",
      large: "Большой",
      xlarge: "Очень большой",
      playerNameBlock: "Блок имен игроков",
      playerNameBgColor: "Цвет фона имен игроков",
      playerCountryBlock: "Блок стран игроков",
      playerCountryBgColor: "Цвет фона стран игроков",
      useApiToGetMatchData: "Используйте этот API для получения данных матча в формате JSON",
      goToSettingsDataSources: 'В vMix, go to "Settings" → "Data Sources"',
      clickAddAndSelectWeb: 'Нажмите "Add" и выберите "Web"',
      pasteApiUrl: 'Вставьте URL API в поле "URL"',
      setUpdateInterval: 'Установите "Update Interval" на 1-2 секунды',
      clickOkToSave: 'Нажмите "OK" для сохранения',
      createOrOpenTitle: "Создайте новый Title или откройте существующий",
      addTextFields: "Добавьте текстовые поля для отображения данных",
      inTextFieldPropertiesSelectDataBinding: 'В свойствах текстового поля выберите "Data Binding"',
      selectDataSourceAndField: 'Выберите вашу Data Source и нужное поле (например, "teamA_name")',
      repeatForAllFields: "Повторите для всех нужных полей",
      urlCopied: "URL скопирован",
      vmixUrlCopied: "URL для vMix скопирован в буфер обмена",
      courtUrlCopied: "URL для корта скопирован в буфер обмена",
      jsonApiUrlCopied: "URL для JSON API скопирован в буфер обмена",
      failedToCopyUrl: "Не удалось скопировать URL",
      openCourtPageNewWindow: "Открыть страницу корта {courtNumber} в новом окне",
      openCourtPageCurrentWindow: "Открыть страницу корта {courtNumber} в текущем окне",
      copyCourtPageUrl: "Скопировать URL страницы корта {courtNumber}",
      matchNotAssignedToCourt: "Матч не назначен на корт. Назначьте матч на корт, чтобы использовать эти функции.",
      loadingSettings: "Загрузка настроек...",
      backgroundOpacity: "Прозрачность фона",
      accentColor: "Цвет акцента",
      previewWithCurrentSettings: "Предпросмотр с текущими настройками",
      matchInfo: "Информация о матче",
    },
    courtVmixSettings: {
      title: "Настройки vMix для корта",
      backToMatch: "Назад",
      settingsForCourt: "Настройки vMix для корта {number}",
      noActiveMatches: "Немає активних матчів на корті {number}",
      matchOnCourt: "Матч на корті: {match}",
      displaySettings: "Налаштування відображення",
      apiForVmix: "API для vMix",
      basicSettings: "Основні налаштування",
      configureBasicParams: "Налаштуйте основні параметри відображення",
      theme: "Тема",
      selectTheme: "Виберіть тему",
      customTheme: "Користувацька",
      transparentTheme: "Прозора",
      fontSize: "Розмір шрифту",
      selectFontSize: "Виберіть розмір шрифту",
      smallSize: "Маленький",
      mediumSize: "Середній",
      largeSize: "Великий",
      xlargeSize: "Дуже великий",
      playerNamesFontSize: "Розмір шрифту імен гравців: {size}em",
      bgOpacity: "Прозорість фону: {opacity}%",
      textColor: "Колір тексту",
      serveIndicatorColor: "Колір індикатора подачі",
      colorsAndGradients: "Кольори та градієнти",
      configureColorsAndGradients: "Налаштуйте кольори та градієнти для різних блоків",
      playerNamesBlock: "Блок імен гравців",
      playerNamesBgColor: "Колір фону імен гравців",
      useGradientForNames: "Використовувати градієнт для імен",
      namesGradientStartColor: "Початковий колір градієнта імен",
      namesGradientEndColor: "Кінцевий колір градієнта імен",
      countriesBlock: "Блок країн гравців",
      countriesBgColor: "Колір фону країн гравців",
      useGradientForCountries: "Використовувати градієнт для країн",
      countriesGradientStartColor: "Початковий колір градієнта країн",
      countriesGradientEndColor: "Кінцевий колір градієнта країн",
      serveIndicatorBlock: "Блок індикатора подачі",
      serveIndicatorBgColor: "Колір фону індикатора подачі",
      useGradientForServeIndicator: "Використовувати градієнт для фону індикатора подачі",
      serveIndicatorGradientStartColor: "Початковий колір градієнта фону індикатора",
      serveIndicatorGradientEndColor: "Кінцевий колір градієнта фону індикатора",
      serveIndicatorExample: "Приклад індикатора подачі",
      currentScoreBlock: "Цвет фона текущего счета",
      currentScoreBgColor: "Цвет фона текущего счета",
      useGradientForCurrentScore: "Использовать градиент для счета",
      currentScoreGradientStartColor: "Начальный цвет градиента счета",
      currentScoreGradientEndColor: "Кінцевий колір градієнта рахунку",
      setsScoreBlock: "Блок рахунку в сетах",
      setsBgColor: "Колір фону рахунку сетів",
      setsTextColor: "Колір тексту рахунку сетів",
      useGradientForSets: "Використовувати градієнт для рахунку в сетах",
      setsGradientStartColor: "Початковий колір градієнта рахунку в сетах",
      setsGradientEndColor: "Кінцевий колір градієнта рахунку в сетах",
      importantMomentsIndicator: "Індикатор важливих моментів",
      indicatorBgColor: "Колір фону індикатора",
      indicatorTextColor: "Колір тексту індикатора",
      useGradientForIndicator: "Використовувати градієнт для індикатора",
      indicatorGradientStartColor: "Початковий колір градієнта індикатора",
      indicatorGradientEndColor: "Кінцевий колір градієнта індикатора",
      actions: "Дії",
      previewAndUseSettings: "Попередній перегляд та використання налаштувань",
      preview: "Попередній перегляд з поточними налаштуваннями",
      openInNewWindow: "Відкрити у новому вікні",
      openInCurrentWindow: "Відкрити в поточному вікні",
      copyUrl: "Скопіювати URL",
      copying: "Копіювання...",
      saveSettings: "Зберегти налаштування",
      jsonApiForVmix: "JSON API для vMix",
      useApiForVmixData: "Використовуйте цей API для отримання даних матчу у форматі JSON",
      jsonApiUrl: "URL для JSON API",
      instructionsForVmix: "Інструкція з використання у vMix",
      dataSourceSetup: "Налаштування Data Source у vMix:",
      dataSourceSteps:
        'У vMix перейдіть в меню "Settings" → "Data Sources"\nНатисніть "Add" і виберіть "Web"\nВставте URL API в поле "URL"\nВстановіть "Update Interval" на 1-2 секунди\nНатисніть "OK" для збереження',
      titleDesignerUsage: "Використання в Title Designer:",
      titleDesignerSteps:
        'Створіть новий Title або відкрийте існуючий\nДодайте текстові поля для відображення даних\nУ властивостях текстового поля виберіть "Data Binding"\nВиберіть вашу Data Source і потрібне поле (наприклад, "teamA_name")\nПовторіть для всіх потрібних полів',
      availableDataFields: "Доступні поля даних",
      teamA: "Команда A:",
      teamB: "Команда B:",
      generalData: "Загальні дані:",
      dataFormatExample: "Приклад формату даних",
      settingsSaved: "Налаштування збережено",
      errorSavingSettings: "Не вдалося зберегти налаштування",
      loadingSettings: "Завантаження налаштувань...",
      teamAName: "Ім'я команди A",
      teamAScore: "Рахунок команди A",
      teamAGameScore: "Поточний рахунок в геймі команди A",
      teamACurrentSet: "Поточний сет команди A",
      teamAServing: "Подача команди A",
      teamASetScores: "Рахунок в сетах команди A",
      teamBName: "Ім'я команди B",
      teamBScore: "Рахунок команди B",
      teamBGameScore: "Поточний рахунок в геймі команди B",
      teamBCurrentSet: "Поточний сет команди B",
      teamBServing: "Подача команди B",
      teamBSetScores: "Рахунок в сетах команди B",
      matchId: "ID матчу",
      isTiebreak: "Тай-брейк",
      isCompleted: "Матч завершено",
      winner: "Переможець",
      updateTime: "Час оновлення",
      copyJsonApiUrl: "Скопіювати URL JSON API",
      showPlayerNames: "Показувати імена гравців",
      showCurrentPoints: "Показувати поточні очки",
      showSetsScore: "Показувати рахунок по сетах",
      showServer: "Показувати подаючого",
      showCountries: "Показувати країни",
      savedSettings: "Збережені налаштування",
      selectSaveOrDeleteSettings: "Виберіть, збережіть або видаліть налаштування vMix",
      saveSettingsDialog: "Збереження налаштувань vMix",
      saveSettingsDescription:
        "Введіть назву для налаштувань і виберіть, чи будуть вони використовуватися за замовчуванням",
      settingsName: "Назва налаштувань",
      settingsNamePlaceholder: "Введіть назву налаштувань",
      useAsDefault: "Використовувати за замовчуванням",
      cancelButton: "Скасувати",
      savingButton: "Збереження...",
      saveButton: "Зберегти",
      selectSettings: "Виберіть налаштування",
      createNewSettings: "Створити нові",
      updateSettings: "Оновити",
      deleteSettings: "Видалити",
      saveToDatabase: "Зберегти в базу даних",
      deletingButton: "Видалення...",
      deleteButton: "Видалити",
      deleteSettingsDialog: "Видалення налаштувань",
      deleteSettingsDescription: "Ви впевнені, що хочете видалити ці налаштування? Цю дію не можна скасувати.",
      matchInfo: "Інформація про матч",
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
      teamWonMatch: "{{team}} won the match! What would you like to do?",
      serving: "Serving",
      currentGame: "Current game",
      setXofY: "Set {{current}} of {{total}}",
      setX: "Set {{number}}",
      current: "Current",
      tiebreak: "Tiebreak",
      of: "of",
      fixedSides: "Fixed court sides",
      fixedPlayers: "Fixed players",
    },
    scoreboard: {
      tennis: "Tennis",
      padel: "Padel",
      singles: "Singles",
      doubles: "Doubles",
      matchCompleted: "Match completed",
      set: "Set",
      of: "of",
      tiebreak: "Tiebreak",
      game: "Game",
      leftCourtSide: "Left court side",
      rightCourtSide: "Right court side",
      currentServer: "Current server",
      playerA: "Player A",
      playerB: "Player B",
    },
    scoreboardSettings: {
      title: "Display Settings",
      presets: "Presets",
      colors: "Colors",
      display: "Display",
      sizes: "Sizes",
      advancedColors: "Advanced Colors",
      darkTheme: "Dark",
      lightTheme: "Light",
      contrastTheme: "Contrast",
      neutralTheme: "Neutral",
      backgroundColor: "Background Color",
      textColor: "Text Color",
      teamAColors: "Team A Colors",
      teamBColors: "Team B Colors",
      startColor: "Start Color",
      endColor: "End Color",
      showCourtSides: "Show Court Sides",
      showCurrentServer: "Show Current Server Block",
      showServerIndicator: "Show Server Indicator by Names",
      showSetsScore: "Show Sets Score",
      useCustomSizes: "Use Custom Sizes",
      fontSize: "General Font Size",
      playerCellWidth: "Player Names Cell Width",
      playerNamesFontSize: "Player Names Font Size",
      gameScoreFontSize: "Game Score Font Size",
      setsScoreFontSize: "Sets Score Font Size",
      infoBlockFontSize: "Info Block Font Size",
      gameScoreTextColor: "Game Score Text Color",
      gameCellBgColor: "Game Cell Background Color",
      tiebreakCellBgColor: "Tiebreak Cell Background Color",
      setsScoreTextColor: "Sets Score Text Color",
      done: "Done",
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
      backToMatchControl: "Back to match control",
    },
    matchList: {
      loading: "Loading matches...",
      noMatches: "No active matches",
      completed: "Completed",
      inProgress: "In progress",
      court: "Court",
      code: "Code",
      error: "Loading error",
    },
    courtsList: {
      title: "Court Status",
      description: "Information about occupied courts",
      refresh: "Refresh",
      court: "Court",
      occupied: "Occupied",
      available: "Available",
      jsonData: "JSON data",
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
      deletePlayers: "Delete Players",
      deletePlayersConfirm: "Are you sure you want to delete the selected players",
      deletePlayersWarning: "This action cannot be undone.",
      deleteSelected: "Delete selected",
      name: "Name",
      country: "Country",
      countryAbbreviation: "Country abbreviation (ENG, RUS, ESP...)",
      selectPlayer: "Select player",
      searchPlayer: "Search player...",
      playerNotFound: "Player not found",
      selectAll: "Select all",
      loadingPlayers: "Loading players...",
      emptyList: "Player list is empty",
      totalPlayers: "Total players",
      selected: "Selected",
      errorAddingPlayer: "Error adding player",
      errorDeletingPlayers: "Error deleting players",
      noPlayersFound: "No players found",
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
      finalSetTiebreakLength: "Final set tiebreak length",
      finalSetTiebreakLengthDescription: "Select final set tiebreak length",
      finalSetTiebreakNote: "This setting only affects the final set and is not related to regular tiebreaks.",
      goldPoint: "Gold point",
      goldenPoint: "Golden point",
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
      superSet: "🟢 PRO Set to 8 games (Fast Set / Short Set)",
    },
    vmixSettings: {
      title: "vMix Settings for Match",
      backToMatch: "Back to Match",
      settingsFor: "Settings for Match",
      displaySettings: "Display Settings",
      apiForVmix: "API for vMix",
      basicSettings: "Basic Settings",
      configureBasicParams: "Configure basic display parameters",
      theme: "Theme",
      selectTheme: "Select theme",
      customTheme: "Custom",
      transparentTheme: "Transparent",
      fontSize: "Font Size",
      selectFontSize: "Select font size",
      smallSize: "Small",
      mediumSize: "Medium",
      largeSize: "Large",
      xlargeSize: "Extra Large",
      playerNamesFontSize: "Player names font size",
      bgOpacity: "Background opacity",
      textColor: "Text color",
      serveIndicatorColor: "Serve indicator color",
      colorsAndGradients: "Colors and Gradients",
      configureColorsAndGradients: "Configure colors and gradients for different blocks",
      playerNamesBlock: "Player Names Block",
      playerNamesBgColor: "Player Names Background Color",
      useGradientForNames: "Use gradient for names",
      namesGradientStartColor: "Names gradient start color",
      namesGradientEndColor: "Names gradient end color",
      countriesBlock: "Countries Block",
      countriesBgColor: "Countries background color",
      useGradientForCountries: "Use gradient for countries",
      countriesGradientStartColor: "Countries gradient start color",
      countriesGradientEndColor: "Countries gradient end color",
      serveIndicatorBlock: "Serve Indicator Block",
      serveIndicatorBgColor: "Serve indicator background color",
      useGradientForServeIndicator: "Use gradient for serve indicator background",
      serveIndicatorGradientStartColor: "Serve indicator gradient start color",
      serveIndicatorGradientEndColor: "Serve indicator gradient end color",
      serveIndicatorExample: "Serve indicator example",
      currentScoreBlock: "Current Score Block",
      currentScoreBgColor: "Current score background color",
      useGradientForCurrentScore: "Use gradient for score",
      currentScoreGradientStartColor: "Score gradient start color",
      currentScoreGradientEndColor: "Score gradient end color",
      setsScoreBlock: "Sets Score Block",
      setsBgColor: "Sets score background color",
      setsTextColor: "Sets score text color",
      useGradientForSets: "Use gradient for sets score",
      setsGradientStartColor: "Sets score gradient start color",
      setsGradientEndColor: "Sets score gradient end color",
      importantMomentsIndicator: "Important Moments Indicator",
      indicatorBgColor: "Indicator background color",
      indicatorTextColor: "Indicator text color",
      useGradientForIndicator: "Use gradient for indicator",
      indicatorGradientStartColor: "Indicator gradient start color",
      indicatorGradientEndColor: "Indicator gradient end color",
      actions: "Actions",
      previewAndUseSettings: "Preview and use settings",
      preview: "Preview with current settings",
      openInNewWindow: "Open in new window",
      openInCurrentWindow: "Open in current window",
      copyUrl: "Copy URL",
      copying: "Copying...",
      saveSettings: "Save settings",
      jsonApiForVmix: "JSON API for vMix",
      useApiForVmixData: "Use this API to get match data in JSON format",
      jsonApiUrl: "URL for JSON API",
      instructionsForVmix: "Instructions for using in vMix",
      dataSourceSetup: "Setting up Data Source in vMix:",
      dataSourceSteps:
        'In vMix, go to "Settings" → "Data Sources"\nClick "Add" and select "Web"\nPaste the API URL in the "URL" field\nSet "Update Interval" to 1-2 seconds\nClick "OK" to save',
      titleDesignerUsage: "Using in Title Designer:",
      titleDesignerSteps:
        'Create a new Title or open an existing one\nAdd text fields to display data\nIn the text field properties, select "Data Binding"\nSelect your Data Source and the required field (e.g., "teamA_name")\nRepeat for all required fields',
      availableDataFields: "Available data fields",
      teamA: "Team A:",
      teamB: "Team B:",
      generalData: "General data:",
      dataFormatExample: "Data format example",
      settingsSaved: "Settings saved",
      errorSavingSettings: "Failed to save settings",
      teamAName: "Team A Name",
      teamAScore: "Team A Score",
      teamAGameScore: "Team A Current Game Score",
      teamACurrentSet: "Team A Current Set",
      teamAServing: "Team A Serving",
      teamASetScores: "Team A Set Scores",
      teamBName: "Team B Name",
      teamBScore: "Team B Score",
      teamBGameScore: "Team B Current Game Score",
      teamBCurrentSet: "Team B Current Set",
      teamBServing: "Team B Serving",
      teamBSetScores: "Team B Set Scores",
      matchId: "Match ID",
      isTiebreak: "Tiebreak",
      isCompleted: "Completed",
      winner: "Winner",
      updateTime: "Update Time",
      copyJsonApiUrl: "Copy JSON API URL",
      openCourtInNewWindow: "Open court in new window",
      openCourtInCurrentWindow: "Open court in current window",
      copyCourtUrl: "Copy court URL",
      actionsForCourtPage: "Actions for court page:",
      courtNotAssigned: "Match is not assigned to a court. Assign the match to a court to use these functions.",
      selectSaveOrDeleteSettings: "Select, save, or delete vMix settings",
      saveSettingsDialog: "Saving vMix settings",
      saveSettingsDescription: "Enter a name for the settings and select whether they should be used by default",
      settingsName: "Settings name",
      settingsNamePlaceholder: "Enter settings name",
      useAsDefault: "Use as default",
      cancelButton: "Cancel",
      savingButton: "Saving...",
      saveButton: "Save",
      savedSettings: "Saved settings",
      selectSettings: "Select settings",
      small: "Small",
      normal: "Normal",
      large: "Large",
      xlarge: "Extra Large",
      playerNameBlock: "Player Names Block",
      playerNameBgColor: "Player Names Background Color",
      playerCountryBlock: "Player Countries Block",
      playerCountryBgColor: "Player Countries Background Color",
      useApiToGetMatchData: "Use this API to get match data in JSON format",
      goToSettingsDataSources: 'In vMix, go to "Settings" → "Data Sources"',
      clickAddAndSelectWeb: 'Click "Add" and select "Web"',
      pasteApiUrl: 'Paste the API URL in the "URL" field',
      setUpdateInterval: 'Set "Update Interval" to 1-2 seconds',
      clickOkToSave: 'Click "OK" to save',
      createOrOpenTitle: "Create a new Title or open an existing one",
      addTextFields: "Add text fields to display data",
      inTextFieldPropertiesSelectDataBinding: 'In the text field properties, select "Data Binding"',
      selectDataSourceAndField: 'Select your Data Source and the required field (e.g., "teamA_name")',
      repeatForAllFields: "Repeat for all required fields",
      urlCopied: "URL copied",
      vmixUrlCopied: "URL for vMix copied to clipboard",
      courtUrlCopied: "URL for court copied to clipboard",
      jsonApiUrlCopied: "URL for JSON API copied to clipboard",
      failedToCopyUrl: "Failed to copy URL",
      openCourtPageNewWindow: "Open court page {courtNumber} in new window",
      openCourtPageCurrentWindow: "Open court page {courtNumber} in current window",
      copyCourtPageUrl: "Copy court page URL {courtNumber}",
      matchNotAssignedToCourt: "Match is not assigned to a court. Assign the match to a court to use these functions.",
      loadingSettings: "Loading settings...",
      backgroundOpacity: "Background opacity",
      accentColor: "Accent color",
      previewWithCurrentSettings: "Preview with current settings",
      matchInfo: "Match Information",
    },
    courtVmixSettings: {
      title: "vMix Settings for Court",
      backToMatch: "Back",
      settingsForCourt: "vMix Settings for Court {number}",
      noActiveMatches: "No active matches on court {number}",
      matchOnCourt: "Match on court: {match}",
      displaySettings: "Display Settings",
      apiForVmix: "API for vMix",
      basicSettings: "Basic Settings",
      configureBasicParams: "Configure basic display parameters",
      theme: "Theme",
      selectTheme: "Select theme",
      customTheme: "Custom",
      transparentTheme: "Transparent",
      fontSize: "Font Size",
      selectFontSize: "Select font size",
      smallSize: "Small",
      mediumSize: "Medium",
      largeSize: "Large",
      xlargeSize: "Extra Large",
      playerNamesFontSize: "Player names font size: {size}em",
      bgOpacity: "Background opacity: {opacity}%",
      textColor: "Text color",
      serveIndicatorColor: "Serve indicator color",
      colorsAndGradients: "Colors and Gradients",
      configureColorsAndGradients: "Configure colors and gradients for different blocks",
      playerNamesBlock: "Player Names Block",
      playerNamesBgColor: "Player Names Background Color",
      useGradientForNames: "Use gradient for names",
      namesGradientStartColor: "Names gradient start color",
      namesGradientEndColor: "Names gradient end color",
      countriesBlock: "Countries Block",
      countriesBgColor: "Countries background color",
      useGradientForCountries: "Use gradient for countries",
      countriesGradientStartColor: "Countries gradient start color",
      countriesGradientEndColor: "Countries gradient end color",
      serveIndicatorBlock: "Serve Indicator Block",
      serveIndicatorBgColor: "Serve indicator background color",
      useGradientForServeIndicator: "Use gradient for serve indicator background",
      serveIndicatorGradientStartColor: "Serve indicator gradient start color",
      serveIndicatorGradientEndColor: "Serve indicator gradient end color",
      serveIndicatorExample: "Serve indicator example",
      currentScoreBlock: "Current Score Block",
      currentScoreBgColor: "Current score background color",
      useGradientForCurrentScore: "Use gradient for score",
      currentScoreGradientStartColor: "Score gradient start color",
      currentScoreGradientEndColor: "Score gradient end color",
      setsScoreBlock: "Sets Score Block",
      setsBgColor: "Sets score background color",
      setsTextColor: "Sets score text color",
      useGradientForSets: "Use gradient for sets score",
      setsGradientStartColor: "Sets score gradient start color",
      setsGradientEndColor: "Sets score gradient end color",
      importantMomentsIndicator: "Important Moments Indicator",
      indicatorBgColor: "Indicator background color",
      indicatorTextColor: "Indicator text color",
      useGradientForIndicator: "Use gradient for indicator",
      indicatorGradientStartColor: "Indicator gradient start color",
      indicatorGradientEndColor: "Indicator gradient end color",
      actions: "Actions",
      previewAndUseSettings: "Preview and use settings",
      preview: "Preview with current settings",
      openInNewWindow: "Open in new window",
      openInCurrentWindow: "Open in current window",
      copyUrl: "Copy URL",
      copying: "Copying...",
      saveSettings: "Save settings",
      jsonApiForVmix: "JSON API for vMix",
      useApiForVmixData: "Use this API to get match data in JSON format",
      jsonApiUrl: "URL for JSON API",
      instructionsForVmix: "Instructions for using in vMix",
      dataSourceSetup: "Setting up Data Source in vMix:",
      dataSourceSteps:
        'In vMix, go to "Settings" → "Data Sources"\nClick "Add" and select "Web"\nPaste the API URL in the "URL" field\nSet "Update Interval" to 1-2 seconds\nClick "OK" to save',
      titleDesignerUsage: "Using in Title Designer:",
      titleDesignerSteps:
        'Create a new Title or open an existing one\nAdd text fields to display data\nIn the text field properties, select "Data Binding"\nSelect your Data Source and the required field (e.g., "teamA_name")\nRepeat for all required fields',
      availableDataFields: "Available data fields",
      teamA: "Team A:",
      teamB: "Team B:",
      generalData: "General data:",
      dataFormatExample: "Data format example",
      settingsSaved: "Settings saved",
      errorSavingSettings: "Failed to save settings",
      loadingSettings: "Loading settings...",
      teamAName: "Team A Name",
      teamAScore: "Team A Score",
      teamAGameScore: "Team A Current Game Score",
      teamACurrentSet: "Team A Current Set",
      teamAServing: "Team A Serving",
      teamASetScores: "Team A Set Scores",
      teamBName: "Team B Name",
      teamBScore: "Team B Score",
      teamBGameScore: "Team B Current Game Score",
      teamBCurrentSet: "Team B Current Set",
      teamBServing: "Team B Serving",
      teamBSetScores: "Team B Set Scores",
      matchId: "Match ID",
      isTiebreak: "Tiebreak",
      isCompleted: "Completed",
      winner: "Winner",
      updateTime: "Update Time",
      copyJsonApiUrl: "Copy JSON API URL",
      showPlayerNames: "Show Player Names",
      showCurrentPoints: "Show Current Points",
      showSetsScore: "Show Sets Score",
      showServer: "Show Server",
      showCountries: "Show Countries",
      savedSettings: "Saved settings",
      selectSaveOrDeleteSettings: "Select, save, or delete vMix settings",
      saveSettingsDialog: "Saving vMix settings",
      saveSettingsDescription: "Enter a name for the settings and select whether they should be used by default",
      settingsName: "Settings name",
      settingsNamePlaceholder: "Enter settings name",
      useAsDefault: "Use as default",
      cancelButton: "Cancel",
      savingButton: "Saving...",
      saveButton: "Save",
      selectSettings: "Select settings",
      createNewSettings: "Create new",
      updateSettings: "Update",
      deleteSettings: "Delete",
      saveToDatabase: "Save to database",
      deletingButton: "Deleting...",
      deleteButton: "Delete",
      deleteSettingsDialog: "Delete settings",
      deleteSettingsDescription: "Are you sure you want to delete these settings? This action cannot be undone.",
      matchInfo: "Match Information",
    },
  },
  uk: {
    common: {
      loading: "Завантаження...",
      error: "Помилка",
      save: "Зберегти",
      cancel: "Скасувати",
      delete: "Видалити",
      edit: "Редагувати",
      back: "Назад",
      next: "Далі",
      submit: "Відправити",
      offline: "Офлайн",
      online: "Онлайн",
      success: "Успішно",
      warning: "Попередження",
      add: "Додати",
      loadingPlayers: "Завантаження гравців...",
      fullscreen: "Повний екран",
      vmixOverlay: "vMix overlay",
      vmixSettings: "vMix налаштування",
      checking: "Перевірка...",
      saving: "Збереження...",
      continue: "Продовжити",
    },
    home: {
      title: "Tennis & Padel Scoreboard",
      subtitle: "Відстежуйте рахунок в реальному часі",
      newMatch: "Створити новий матч",
      newMatchDesc: "Налаштуйте нову гру з вибраними параметрами",
      tennis: "Теніс",
      padel: "Падел",
      managePlayers: "Управління гравцями",
      activeMatches: "Активні матчі",
      activeMatchesDesc: "Поточні та нещодавні матчі",
      matchHistory: "Історія матчів",
      joinMatch: "Приєднатися до матчу",
      joinMatchDesc: "Введіть код матчу для перегляду",
      joinByCode: "Приєднатися за цифровим кодом",
      diagnostics: "Діагностика",
    },
    match: {
      score: "Рахунок",
      set: "Сет",
      game: "Гейм",
      point: "Очко",
      player: "Гравець",
      team: "Команда",
      teamA: "Команда A",
      teamB: "Команда B",
      serve: "Подача",
      undo: "Скасувати",
      settings: "Налаштування",
      scoreCard: "Табло рахунку",
      scoreControls: "Управління рахунком",
      addPoint: "Очко",
      switchServer: "Змінити подаючого",
      switchSides: "Змінити сторони",
      leftSide: "Ліва сторона",
      rightSide: "Права сторона",
      needToSwitchSides: "Необхідно змінити сторони! Зміна сторін відбудеться автоматично при наступній зміні рахунку.",
      management: "Управління",
      matchManagement: "Управління матчем",
      editPlayers: "Редагувати гравців",
      editTeams: "Редагувати команди",
      matchStatus: "Статус матчу",
      matchType: "Тип матчу",
      courtNumber: "Номер корту",
      completedMatch: "Завершено",
      inProgressMatch: "В процесі",
      deleteMatch: "Видалити матч",
      confirmDeleteMatch: "Підтвердіть видалення",
      deleteMatchWarning: "Ви впевнені, що хочете видалити цей матч? Цю дію не можна скасувати.",
      deleteMatchConfirm: "Так, видалити",
      deleteMatchCancel: "Скасувати",
      matchDeleted: "Матч успішно видалено",
      matchDeleteError: "Помилка при видаленні матчу",
      noCourtAssigned: "Не призначено",
      selectCourt: "Виберіть корт",
      courtAlreadyOccupied: "Цей корт вже зайнятий",
      updateCourt: "Оновити корт",
      courtUpdated: "Корт успішно оновлено",
      courtUpdateError: "Помилка при оновленні корту",
      scoreEditing: "Редагування рахунку",
      currentSet: "поточний",
      startTiebreakManually: "Розпочати тай-брейк вручну",
      teamWonTiebreak: "Тай-брейк виграла",
      matchCode: "Код матчу",
      scoringSystem: "Система рахунку",
      classicScoring: "Класична (AD)",
      noAdScoring: "No-Ad (рівно → вирішальний м'яч)",
      fast4Scoring: "Fast4 (до 4 геймів)",
      tiebreakType: "Тип тай-брейку",
      regularTiebreak: "Звичайний (до 7)",
      championshipTiebreak: "Чемпіонський (до 10)",
      superTiebreak: "Супер-тай-брейк (замість 3-го сету)",
      tiebreakAt: "Тай-брейк при рахунку",
      selectTiebreakScore: "Виберіть рахунок для тай-брейку",
      additional: "Додатково",
      goldenGame: "Золотий гейм (падел)",
      goldenPoint: "Золотий м'яч (40-40 у вирішальному геймі)",
      windbreak: "Віндбрейк (подача через гейм)",
      applySettings: "Застосувати налаштування",
      unlockMatch: "Розблокувати матч",
      endMatch: "Завершити матч",
      confirmEndMatch:
        "Ви впевнені, що хочете завершити цей матч? Ви зможете розблокувати його пізніше, якщо потрібно.",
      finishMatch: "Завершити матч",
      teamWonMatch: "{{team}} виграли матч! Що ви хочете зробити?",
      serving: "Подача",
      currentGame: "Поточний гейм",
      setXofY: "Сет {{current}} з {{total}}",
      setX: "Сет {{number}}",
      current: "Поточний",
      tiebreak: "Тай-брейк",
      of: "з",
      fixedSides: "Фіксовані сторони",
      fixedPlayers: "Фіксовані гравці",
    },
    scoreboard: {
      tennis: "Теніс",
      padel: "Падел",
      singles: "Одиночна гра",
      doubles: "Парна гра",
      matchCompleted: "Матч завершено",
      set: "Сет",
      of: "з",
      tiebreak: "Тайбрейк",
      game: "Гейм",
      leftCourtSide: "Ліва сторона корту",
      rightCourtSide: "Права сторона корту",
      currentServer: "Поточна подача",
      playerA: "Гравець A",
      playerB: "Гравець B",
    },
    scoreboardSettings: {
      title: "Налаштування відображення",
      presets: "Готові схеми",
      colors: "Кольори",
      display: "Відображення",
      sizes: "Розміри",
      advancedColors: "Додаткові кольори",
      darkTheme: "Темна",
      lightTheme: "Світла",
      contrastTheme: "Контрастна",
      neutralTheme: "Нейтральна",
      backgroundColor: "Колір фону",
      textColor: "Колір тексту",
      teamAColors: "Кольори команди A",
      teamBColors: "Кольори команди B",
      startColor: "Початковий колір",
      endColor: "Кінцевий колір",
      showCourtSides: "Показувати сторони корту",
      showCurrentServer: "Показувати блок поточної подачі",
      showServerIndicator: "Показувати індикатор подачі біля імен",
      showSetsScore: "Показувати рахунок сетів",
      useCustomSizes: "Використовувати налаштування розмірів",
      fontSize: "Загальний розмір шрифту",
      playerCellWidth: "Ширина комірки імен гравців",
      playerNamesFontSize: "Розмір шрифту імен гравців",
      gameScoreFontSize: "Розмір шрифту рахунку в геймі",
      setsScoreFontSize: "Розмір шрифту рахунку в сетах",
      infoBlockFontSize: "Розмір шрифту інформаційних блоків",
      gameScoreTextColor: "Колір тексту рахунку в геймі",
      gameCellBgColor: "Колір фону комірки гейму",
      tiebreakCellBgColor: "Колір фону комірки тай-брейку",
      setsScoreTextColor: "Колір тексту рахунку в сетах",
      done: "Готово",
    },
    matchPage: {
      loadingMatch: "Завантаження матчу...",
      errorTitle: "Помилка",
      createNewMatch: "Створити новий матч",
      home: "На головну",
      court: "Корт",
      share: "Поділитися",
      viewScore: "Перегляд рахунку",
      notification: "Сповіщення",
      matchTab: "Матч",
      exportImportTab: "Експорт/Імпорт",
      exportMatch: "Експорт матчу",
      exportDescription: "Скопіюйте дані матчу для збереження або передачі на інший пристрій",
      exportButton: "Експортувати дані",
      importMatch: "Імпорт матчу",
      importDescription: "Вставте дані матчу для імпорту",
      importPlaceholder: "Вставте дані матчу у форматі JSON",
      importButton: "Імпортувати дані",
      technicalFunctions: "Технічні функції",
      matchCode: "Код матчу",
      jsonCourt: "JSON КОРТ",
      vmixCourt: "vMix корт",
      jsonMatch: "JSON МАТЧ",
      vmixMatch: "vMix матч",
      scoreUpdated: "Рахунок оновлено",
      linkCopied: "Посилання скопійовано в буфер обміну",
      matchCodeCopied: "Код матчу скопійовано в буфер обміну",
      matchDataCopied: "Дані матчу скопійовано в буфер обміну",
      importDataRequired: "Введіть дані для імпорту",
      matchImported: "Матч успішно імпортовано",
      importError: "Помилка при імпорті матчу. Перевірте формат даних.",
      matchDataSimplified: "Дані матчу було спрощено через обмеження сховища",
      backToMatchControl: "До управління матчем",
    },
    matchList: {
      loading: "Завантаження матчів...",
      noMatches: "Немає активних матчів",
      completed: "Завершено",
      inProgress: "В процесі",
      court: "Корт",
      code: "Код",
      error: "Помилка завантаження",
    },
    courtsList: {
      title: "Статус кортів",
      description: "Інформація про зайняті корти",
      refresh: "Оновити",
      court: "Корт",
      occupied: "Зайнятий",
      available: "Вільний",
      jsonData: "JSON дані",
    },
    supabaseStatus: {
      checking: "Перевірка...",
      online: "Онлайн",
      offline: "Офлайн",
      checkingTooltip: "Перевірка з'єднання з базою даних...",
      onlineTooltip: "Синхронізація включена. Матчі доступні на всіх пристроях.",
      offlineTooltip: "Синхронізація вимкнена. Матчі зберігаються лише локально.",
      connectionInfo: "Інформація про з'єднання з базою даних",
      connectionDetails: "Детальна інформація про статус з'єднання з Supabase",
      connectionEstablished: "З'єднання встановлено",
      connectionMissing: "З'єднання відсутнє",
      checkNow: "Перевірити зараз",
      connectionDetailsTitle: "Деталі з'єднання:",
      possibleIssues: "Можливі причини проблем зі з'єднанням:",
      issueInternet: "Відсутнє підключення до інтернету",
      issueCredentials: "Невірні облікові дані Supabase",
      issueServer: "Сервер Supabase недоступний",
      issueCors: "Проблеми з CORS або мережевими налаштуваннями",
      issueEnvVars: "Відсутні необхідні змінні оточення",
      close: "Закрити",
    },
    players: {
      title: "Управління гравцями",
      addPlayer: "Додати гравця",
      editPlayer: "Редагувати гравця",
      deletePlayer: "Видалити гравця",
      deletePlayers: "Видалення гравців",
      deletePlayersConfirm: "Ви впевнені, що хочете видалити вибраних гравців",
      deletePlayersWarning: "Цю дію не можна скасувати.",
      deleteSelected: "Видалити вибраних",
      name: "Ім'я",
      country: "Країна",
      countryAbbreviation: "Абревіатура країни (ENG, RUS, ESP...)",
      selectPlayer: "Виберіть гравця",
      searchPlayer: "Пошук гравця...",
      playerNotFound: "Гравець не знайдений",
      selectAll: "Вибрати всіх",
      loadingPlayers: "Завантаження гравців...",
      emptyList: "Список гравців порожній",
      totalPlayers: "Всього гравців",
      selected: "Вибрано",
      errorAddingPlayer: "Сталася помилка при додаванні гравця",
      errorDeletingPlayers: "Сталася помилка при видаленні гравців",
      noPlayersFound: "Гравці не знайдені",
    },
    newMatch: {
      title: "Створення нового матчу",
      tennisDesc: "Налаштування тенісного матчу",
      padelDesc: "Налаштування матчу з паделу",
      players: "Гравці",
      player1: "Гравець 1",
      player2: "Гравець 2",
      team1Player1: "Команда 1 - Гравець 1",
      team1Player2: "Команда 1 - Гравець 2",
      team2Player1: "Команда 2 - Гравець 1",
      team2Player2: "Команда 2 - Гравець 2",
      createMatch: "Створити матч",
      matchSettings: "Налаштування матчу",
      sets: "Кількість сетів",
      games: "Геймів у сеті",
      tiebreak: "Тай-брейк",
      finalSetTiebreak: "Тай-брейк у вирішальному сеті",
      finalSetTiebreakLength: "Довжина тай-брейку у вирішальному сеті",
      finalSetTiebreakLengthDescription: "Виберіть довжину тай-брейку у вирішальному сеті",
      finalSetTiebreakNote:
        "Цей параметр впливає тільки на завершальний сет і не пов'язаний зі звичайними тайбрейками.",
      goldPoint: "Золоте очко",
      goldenPoint: "Золоте очко",
      goldenGame: "Золотий гейм (падел)",
      windbreak: "Віндбрейк (подача через гейм)",
      format: "Формат гри",
      selectFormat: "Виберіть формат",
      singles: "Одиночна гра",
      doubles: "Парна гра",
      oneSets: "1 сет",
      twoSets: "2 сети (тай-брейк у 3-му)",
      threeSets: "3 сети",
      fiveSets: "5 сетів (Гранд-слам)",
      scoringSystem: "Система рахунку",
      classicScoring: "Класична (AD)",
      noAdScoring: "No-Ad (рівно → вирішальний м'яч)",
      fast4Scoring: "Fast4 (до 4 геймів)",
      tiebreakType: "Тип тай-брейку",
      regularTiebreak: "Звичайний (до 7)",
      championshipTiebreak: "Чемпіонський (до 10)",
      superTiebreak: "Супер-тай-брейк (замість 3-го сету)",
      tiebreakAt: "Тай-брейк при рахунку",
      selectTiebreakScore: "Виберіть рахунок для тай-брейку",
      additional: "Додатково",
      firstServe: "Перша подача",
      teamASide: "Сторона команди A",
      left: "Ліва",
      right: "Права",
      courtSelection: "Вибір корту",
      noCourt: "Без корту",
      court: "Корт",
      checkingCourtAvailability: "Перевірка доступності кортів...",
      occupiedCourts: "Зайняті корти",
      allCourtsAvailable: "Всі корти вільні",
      startMatch: "Почати матч",
      selectAllPlayers: "Виберіть гравців для обох команд",
      selectAllPlayersForDoubles: "Для парної гри необхідно вибрати всіх гравців",
      courtOccupied: "Корт {{court}} вже зайнятий. Виберіть інший корт.",
      superSet: "🟢 ПРО сет до 8 геймів (Fast Set / Short Set)",
    },
    vmixSettings: {
      title: "Налаштування vMix для матчу",
      backToMatch: "Назад до матчу",
      settingsFor: "Налаштування для матчу",
      displaySettings: "Налаштування відображення",
      apiForVmix: "API для vMix",
      basicSettings: "Основні налаштування",
      configureBasicParams: "Налаштуйте основні параметри відображення",
      theme: "Тема",
      selectTheme: "Виберіть тему",
      customTheme: "Користувацька",
      transparentTheme: "Прозора",
      fontSize: "Розмір шрифту",
      selectFontSize: "Виберіть розмір шрифту",
      smallSize: "Маленький",
      mediumSize: "Середній",
      largeSize: "Великий",
      xlargeSize: "Дуже великий",
      playerNamesFontSize: "Розмір шрифту імен гравців",
      bgOpacity: "Прозорість фону",
      textColor: "Колір тексту",
      serveIndicatorColor: "Колір індикатора подачі",
      colorsAndGradients: "Кольори та градієнти",
      configureColorsAndGradients: "Налаштуйте кольори та градієнти для різних блоків",
      playerNamesBlock: "Блок імен гравців",
      playerNamesBgColor: "Колір фону імен гравців",
      useGradientForNames: "Використовувати градієнт для імен",
      namesGradientStartColor: "Початковий колір градієнта імен",
      namesGradientEndColor: "Кінцевий колір градієнта імен",
      countriesBlock: "Блок країн гравців",
      countriesBgColor: "Колір фону країн гравців",
      useGradientForCountries: "Використовувати градієнт для країн",
      countriesGradientStartColor: "Початковий колір градієнта країн",
      countriesGradientEndColor: "Кінцевий колір градієнта країн",
      serveIndicatorBlock: "Блок індикатора подачі",
      serveIndicatorBgColor: "Колір фону індикатора подачі",
      useGradientForServeIndicator: "Використовувати градієнт для фону індикатора подачі",
      serveIndicatorGradientStartColor: "Початковий колір градієнта фону індикатора",
      serveIndicatorGradientEndColor: "Кінцевий колір градієнта фону індикатора",
      serveIndicatorExample: "Приклад індикатора подачі",
      currentScoreBlock: "Блок поточного рахунку",
      currentScoreBgColor: "Колір фону поточного рахунку",
      useGradientForCurrentScore: "Використовувати градієнт для рахунку",
      currentScoreGradientStartColor: "Початковий колір градієнта рахунку",
      currentScoreGradientEndColor: "Кінцевий колір градієнта рахунку",
      setsScoreBlock: "Блок рахунку в сетах",
      setsBgColor: "Колір фону рахунку сетів",
      setsTextColor: "Колір тексту рахунку сетів",
      useGradientForSets: "Використовувати градієнт для рахунку в сетах",
      setsGradientStartColor: "Початковий колір градієнта рахунку в сетах",
      setsGradientEndColor: "Кінцевий колір градієнта рахунку в сетах",
      importantMomentsIndicator: "Індикатор важливих моментів",
      indicatorBgColor: "Колір фону індикатора",
      indicatorTextColor: "Колір тексту індикатора",
      useGradientForIndicator: "Використовувати градієнт для індикатора",
      indicatorGradientStartColor: "Початковий колір градієнта індикатора",
      indicatorGradientEndColor: "Кінцевий колір градієнта індикатора",
      actions: "Дії",
      previewAndUseSettings: "Попередній перегляд та використання налаштувань",
      preview: "Попередній перегляд з поточними налаштуваннями",
      openInNewWindow: "Відкрити у новому вікні",
      openInCurrentWindow: "Відкрити в поточному вікні",
      copyUrl: "Скопіювати URL",
      copying: "Копіювання...",
      saveSettings: "Зберегти налаштування",
      jsonApiForVmix: "JSON API для vMix",
      useApiForVmixData: "Використовуйте цей API для отримання даних матчу у форматі JSON",
      jsonApiUrl: "URL для JSON API",
      instructionsForVmix: "Інструкція з використання у vMix",
      dataSourceSetup: "Налаштування Data Source у vMix:",
      dataSourceSteps:
        'У vMix перейдіть в меню "Settings" → "Data Sources"\nНатисніть "Add" і виберіть "Web"\nВставте URL API в поле "URL"\nВстановіть "Update Interval" на 1-2 секунди\nНатисніть "OK" для збереження',
      titleDesignerUsage: "Використання в Title Designer:",
      titleDesignerSteps:
        'Створіть новий Title або відкрийте існуючий\nДодайте текстові поля для відображення даних\nУ властивостях текстового поля виберіть "Data Binding"\nВиберіть вашу Data Source і потрібне поле (наприклад, "teamA_name")\nПовторіть для всіх потрібних полів',
      availableDataFields: "Доступні поля даних",
      teamA: "Команда A:",
      teamB: "Команда B:",
      generalData: "Загальні дані:",
      dataFormatExample: "Приклад формату даних",
      settingsSaved: "Налаштування збережено",
      errorSavingSettings: "Не вдалося зберегти налаштування",
      teamAName: "Ім'я команди A",
      teamAScore: "Рахунок команди A",
      teamAGameScore: "Поточний рахунок в геймі команди A",
      teamACurrentSet: "Поточний сет команди A",
      teamAServing: "Подача команди A",
      teamASetScores: "Рахунок в сетах команди A",
      teamBName: "Ім'я команди B",
      teamBScore: "Рахунок команди B",
      teamBGameScore: "Поточний рахунок в геймі команди B",
      teamBCurrentSet: "Поточний сет команди B",
      teamBServing: "Подача команди B",
      teamBSetScores: "Рахунок в сетах команди B",
      matchId: "ID матчу",
      isTiebreak: "Тай-брейк",
      isCompleted: "Матч завершено",
      winner: "Переможець",
      updateTime: "Час оновлення",
      copyJsonApiUrl: "Скопіювати URL JSON API",
      showPlayerNames: "Показувати імена гравців",
      showCurrentPoints: "Показувати поточні очки",
      showSetsScore: "Показувати рахунок по сетах",
      showServer: "Показувати подаючого",
      showCountries: "Показувати країни",
      savedSettings: "Збережені налаштування",
      selectSaveOrDeleteSettings: "Виберіть, збережіть або видаліть налаштування vMix",
      saveSettingsDialog: "Збереження налаштувань vMix",
      saveSettingsDescription:
        "Введіть назву для налаштувань і виберіть, чи будуть вони використовуватися за замовчуванням",
      settingsName: "Назва налаштувань",
      settingsNamePlaceholder: "Введіть назву налаштувань",
      useAsDefault: "Використовувати за замовчуванням",
      cancelButton: "Скасувати",
      savingButton: "Збереження...",
      saveButton: "Зберегти",
      selectSettings: "Виберіть налаштування",
      createNewSettings: "Створити нові",
      updateSettings: "Оновити",
      deleteSettings: "Видалити",
      saveToDatabase: "Зберегти в базу даних",
      deletingButton: "Видалення...",
      deleteButton: "Видалити",
      deleteSettingsDialog: "Видалення налаштувань",
      deleteSettingsDescription: "Ви впевнені, що хочете видалити ці налаштування? Цю дію не можна скасувати.",
      matchInfo: "Інформація про матч",
    },
  },
}
