"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getMatchByCourtNumber } from "@/lib/court-utils"
import { logEvent } from "@/lib/error-logger"
import { ArrowLeft, Copy, ExternalLink, Eye, Save, ArrowRight } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/contexts/language-context"

export default function CourtVmixSettingsPage({ params }) {
  const router = useRouter()
  const { t } = useLanguage()
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copying, setCopying] = useState(false)
  const courtNumber = Number.parseInt(params.number)

  // Настройки отображения
  const [theme, setTheme] = useState("custom")
  const [showNames, setShowNames] = useState(true)
  const [showPoints, setShowPoints] = useState(true)
  const [showSets, setShowSets] = useState(true)
  const [showServer, setShowServer] = useState(true)
  const [showCountry, setShowCountry] = useState(false)
  const [fontSize, setFontSize] = useState("normal")
  const [bgOpacity, setBgOpacity] = useState(0.5)
  const [textColor, setTextColor] = useState("#ffffff")
  const [accentColor, setAccentColor] = useState("#fbbf24")

  // Настройки размера шрифта имен игроков
  const [playerNamesFontSize, setPlayerNamesFontSize] = useState(1.2)

  // Настройки цветов и градиентов
  const [namesBgColor, setNamesBgColor] = useState("#0369a1")
  const [countryBgColor, setCountryBgColor] = useState("#0369a1")
  const [serveBgColor, setServeBgColor] = useState("#0369a1")
  const [pointsBgColor, setPointsBgColor] = useState("#0369a1")
  const [setsBgColor, setSetsBgColor] = useState("#ffffff")
  const [setsTextColor, setSetsTextColor] = useState("#000000")
  const [namesGradient, setNamesGradient] = useState(true)
  const [namesGradientFrom, setNamesGradientFrom] = useState("#0369a1")
  const [namesGradientTo, setNamesGradientTo] = useState("#0284c7")
  const [countryGradient, setCountryGradient] = useState(true)
  const [countryGradientFrom, setCountryGradientFrom] = useState("#0369a1")
  const [countryGradientTo, setCountryGradientTo] = useState("#0284c7")
  const [serveGradient, setServeGradient] = useState(true)
  const [serveGradientFrom, setServeGradientFrom] = useState("#0369a1")
  const [serveGradientTo, setServeGradientTo] = useState("#0284c7")
  const [pointsGradient, setPointsGradient] = useState(true)

  const [pointsGradientFrom, setPointsGradientFrom] = useState("#0369a1")
  const [pointsGradientTo, setPointsGradientTo] = useState("#0284c7")
  const [setsGradient, setSetsGradient] = useState(true)
  const [setsGradientFrom, setSetsGradientFrom] = useState("#ffffff")
  const [setsGradientTo, setSetsGradientTo] = useState("#f0f0f0")

  // Настройки для индикатора важных моментов
  const [indicatorBgColor, setIndicatorBgColor] = useState("#7c2d12")
  const [indicatorTextColor, setIndicatorTextColor] = useState("#ffffff")
  const [indicatorGradient, setIndicatorGradient] = useState(true)
  const [indicatorGradientFrom, setIndicatorGradientFrom] = useState("#7c2d12")
  const [indicatorGradientTo, setIndicatorGradientTo] = useState("#991b1b")

  // Функция для сохранения настроек в localStorage
  const saveSettings = () => {
    try {
      const settings = {
        theme,
        showNames,
        showPoints,
        showSets,
        showServer,
        showCountry,
        fontSize,
        bgOpacity,
        textColor,
        accentColor,
        namesBgColor,
        countryBgColor,
        serveBgColor,
        pointsBgColor,
        setsBgColor,
        setsTextColor,
        namesGradient,
        namesGradientFrom,
        namesGradientTo,
        countryGradient,
        countryGradientFrom,
        countryGradientTo,
        serveGradient,
        serveGradientFrom,
        serveGradientTo,
        pointsGradient,
        pointsGradientFrom,
        pointsGradientTo,
        setsGradient,
        setsGradientFrom,
        setsGradientTo,
        // Добавляем настройки индикатора
        indicatorBgColor,
        indicatorTextColor,
        indicatorGradient,
        indicatorGradientFrom,
        indicatorGradientTo,
        // Добавляем размер шрифта имен игроков
        playerNamesFontSize,
      }

      localStorage.setItem("vmix_settings", JSON.stringify(settings))
      toast({
        title: t("courtVmixSettings.settingsSaved"),
        description: t("vmixSettings.settingsSaved"),
      })
      logEvent("info", "Настройки vMix сохранены", "court-vmix-settings-save")
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("courtVmixSettings.errorSavingSettings"),
        variant: "destructive",
      })
      logEvent("error", "Ошибка при сохранении настроек vMix", "court-vmix-settings-save", error)
    }
  }

  // Функция для загрузки сохраненных настроек
  const loadSavedSettings = () => {
    try {
      const savedSettings = localStorage.getItem("vmix_settings")
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)

        // Применяем сохраненные настройки
        setTheme(settings.theme || "custom")
        setShowNames(settings.showNames !== undefined ? settings.showNames : true)
        setShowPoints(settings.showPoints !== undefined ? settings.showPoints : true)
        setShowSets(settings.showSets !== undefined ? settings.showSets : true)
        setShowServer(settings.showServer !== undefined ? settings.showServer : true)
        setShowCountry(settings.showCountry !== undefined ? settings.showCountry : false)
        setFontSize(settings.fontSize || "normal")
        setBgOpacity(settings.bgOpacity !== undefined ? settings.bgOpacity : 0.5)
        setTextColor(settings.textColor || "#ffffff")
        setAccentColor(settings.accentColor || "#fbbf24")

        setNamesBgColor(settings.namesBgColor || "#0369a1")
        setCountryBgColor(settings.countryBgColor || "#0369a1")
        setServeBgColor(settings.serveBgColor || "#0369a1")
        setPointsBgColor(settings.pointsBgColor || "#0369a1")
        setSetsBgColor(settings.setsBgColor || "#ffffff")
        setSetsTextColor(settings.setsTextColor || "#000000")

        // Загружаем настройки градиентов
        setNamesGradient(settings.namesGradient !== undefined ? settings.namesGradient : true)
        setNamesGradientFrom(settings.namesGradientFrom || "#0369a1")
        setNamesGradientTo(settings.namesGradientTo || "#0284c7")

        setCountryGradient(settings.countryGradient !== undefined ? settings.countryGradient : true)
        setCountryGradientFrom(settings.countryGradientFrom || "#0369a1")
        setCountryGradientTo(settings.countryGradientTo || "#0284c7")

        setServeGradient(settings.serveGradient !== undefined ? settings.serveGradient : true)
        setServeGradientFrom(settings.serveGradientFrom || "#0369a1")
        setServeGradientTo(settings.serveGradientTo || "#0284c7")

        setPointsGradient(settings.pointsGradient !== undefined ? settings.pointsGradient : true)

        setPointsGradientFrom(settings.pointsGradientFrom || "#0369a1")
        setPointsGradientTo(settings.pointsGradientTo || "#0284c7")

        setSetsGradient(settings.setsGradient !== undefined ? settings.setsGradient : true)
        setSetsGradientFrom(settings.setsGradientFrom || "#ffffff")
        setSetsGradientTo(settings.setsGradientTo || "#f0f0f0")

        // Загружаем настройки индикатора
        setIndicatorBgColor(settings.indicatorBgColor || "#7c2d12")
        setIndicatorTextColor(settings.indicatorTextColor || "#ffffff")
        setIndicatorGradient(settings.indicatorGradient !== undefined ? settings.indicatorGradient : true)
        setIndicatorGradientFrom(settings.indicatorGradientFrom || "#7c2d12")
        setIndicatorGradientTo(settings.indicatorGradientTo || "#991b1b")

        // Загружаем размер шрифта имен игроков
        setPlayerNamesFontSize(settings.playerNamesFontSize !== undefined ? settings.playerNamesFontSize : 1.2)

        logEvent("info", "Загружены сохраненные настройки vMix", "court-vmix-settings-load")
      }
    } catch (error) {
      logEvent("error", "Ошибка при загрузке сохраненных настроек vMix", "court-vmix-settings-load", error)
    }
  }

  useEffect(() => {
    const loadMatch = async () => {
      try {
        if (isNaN(courtNumber) || courtNumber < 1 || courtNumber > 10) {
          setError("Некорректный номер корта")
          setLoading(false)
          return
        }

        const matchData = await getMatchByCourtNumber(courtNumber)
        if (matchData) {
          setMatch(matchData)
          setError("")
          logEvent("info", `vMix настройки загружены для корта: ${courtNumber}`, "court-vmix-settings")
        } else {
          setError(`На корте ${courtNumber} нет активных матчей`)
          logEvent("warn", `vMix настройки: на корте ${courtNumber} нет активных матчей`, "court-vmix-settings")
        }
      } catch (err) {
        setError("Ошибка загрузки матча")
        logEvent("error", "Ошибка загрузки матча для vMix настроек корта", "court-vmix-settings", err)
      } finally {
        setLoading(false)
      }
    }

    loadMatch()
    // Загружаем сохраненные настройки после загрузки матча
    loadSavedSettings()
  }, [courtNumber])

  const handleBack = () => {
    router.back()
  }

  // Функция для корректной передачи цветов в URL
  const formatColorForUrl = (color) => {
    // Удаляем # из цвета для URL
    return color.replace("#", "")
  }

  const generateCourtVmixUrl = () => {
    const baseUrl = window.location.origin
    const url = new URL(`${baseUrl}/court-vmix/${courtNumber}`)

    // Добавляем основные параметры
    url.searchParams.set("theme", theme)
    url.searchParams.set("showNames", showNames.toString())
    url.searchParams.set("showPoints", showPoints.toString())
    url.searchParams.set("showSets", showSets.toString())
    url.searchParams.set("showServer", showServer.toString())
    url.searchParams.set("showCountry", showCountry.toString())
    url.searchParams.set("fontSize", fontSize)
    url.searchParams.set("bgOpacity", bgOpacity.toString())
    url.searchParams.set("textColor", formatColorForUrl(textColor))
    url.searchParams.set("accentColor", formatColorForUrl(accentColor))
    url.searchParams.set("playerNamesFontSize", playerNamesFontSize.toString())

    // Добавляем параметры цветов и градиентов (только если тема не прозрачная)
    if (theme !== "transparent") {
      url.searchParams.set("namesBgColor", formatColorForUrl(namesBgColor))
      url.searchParams.set("countryBgColor", formatColorForUrl(countryBgColor))
      url.searchParams.set("serveBgColor", formatColorForUrl(serveBgColor))
      url.searchParams.set("pointsBgColor", formatColorForUrl(pointsBgColor))
      url.searchParams.set("setsBgColor", formatColorForUrl(setsBgColor))
      url.searchParams.set("setsTextColor", formatColorForUrl(setsTextColor))

      // Явно передаем строковые значения "true" или "false" для булевых параметров
      url.searchParams.set("namesGradient", namesGradient ? "true" : "false")
      url.searchParams.set("namesGradientFrom", formatColorForUrl(namesGradientFrom))
      url.searchParams.set("namesGradientTo", formatColorForUrl(namesGradientTo))
      url.searchParams.set("countryGradient", countryGradient ? "true" : "false")
      url.searchParams.set("countryGradientFrom", formatColorForUrl(countryGradientFrom))
      url.searchParams.set("countryGradientTo", formatColorForUrl(countryGradientTo))
      url.searchParams.set("serveGradient", serveGradient ? "true" : "false")
      url.searchParams.set("serveGradientFrom", formatColorForUrl(serveGradientFrom))
      url.searchParams.set("serveGradientTo", formatColorForUrl(serveGradientTo))
      url.searchParams.set("pointsGradient", pointsGradient ? "true" : "false")
      url.searchParams.set("pointsGradientFrom", formatColorForUrl(pointsGradientFrom))
      url.searchParams.set("pointsGradientTo", formatColorForUrl(pointsGradientTo))
      url.searchParams.set("setsGradient", setsGradient ? "true" : "false")
      url.searchParams.set("setsGradientFrom", formatColorForUrl(setsGradientFrom))
      url.searchParams.set("setsGradientTo", formatColorForUrl(setsGradientTo))

      // Добавляем параметры для индикатора
      url.searchParams.set("indicatorBgColor", formatColorForUrl(indicatorBgColor))
      url.searchParams.set("indicatorTextColor", formatColorForUrl(indicatorTextColor))
      url.searchParams.set("indicatorGradient", indicatorGradient ? "true" : "false")
      url.searchParams.set("indicatorGradientFrom", formatColorForUrl(indicatorGradientFrom))
      url.searchParams.set("indicatorGradientTo", formatColorForUrl(indicatorGradientTo))
    }

    return url.toString()
  }

  const generateJsonUrl = () => {
    const baseUrl = window.location.origin
    return `${baseUrl}/api/court/${courtNumber}`
  }

  const handleCopyUrl = async () => {
    try {
      setCopying(true)
      await navigator.clipboard.writeText(generateCourtVmixUrl())
      toast({
        title: t("courtVmixSettings.copyUrl"),
        description: t("matchPage.linkCopied"),
      })
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("courtVmixSettings.errorSavingSettings"),
        variant: "destructive",
      })
    } finally {
      setCopying(false)
    }
  }

  const handleCopyJsonUrl = async () => {
    try {
      setCopying(true)
      await navigator.clipboard.writeText(generateJsonUrl())
      toast({
        title: t("courtVmixSettings.copyUrl"),
        description: "URL для JSON API скопирован в буфер обмена",
      })
    } catch (error) {
      toast({
        title: t("common.error"),
        description: "Не удалось скопировать URL",
        variant: "destructive",
      })
    } finally {
      setCopying(false)
    }
  }

  const handleOpenVmix = () => {
    window.open(generateCourtVmixUrl(), "_blank")
  }

  const handleOpenVmixInCurrentWindow = () => {
    router.push(generateCourtVmixUrl())
  }

  const handlePreview = () => {
    const previewUrl = generateCourtVmixUrl()
    window.open(previewUrl, "vmix_preview", "width=800,height=400")
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>{t("courtVmixSettings.loadingSettings")}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Button onClick={handleBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("courtVmixSettings.backToMatch")}
      </Button>

      <h1 className="text-2xl font-bold mb-4">
        {t("courtVmixSettings.title")} - Корт {courtNumber}
      </h1>

      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      ) : match ? (
        <div className="mb-4">
          <p className="font-medium">
            {t("courtVmixSettings.matchOnCourt", { number: courtNumber })}:{" "}
            {match.teamA.players.map((p) => p.name).join(" / ")} vs {match.teamB.players.map((p) => p.name).join(" / ")}
          </p>
        </div>
      ) : (
        <div className="mb-4">
          <p className="font-medium">{t("courtVmixSettings.noActiveMatches", { number: courtNumber })}</p>
        </div>
      )}

      <Tabs defaultValue="settings">
        <TabsList className="mb-4">
          <TabsTrigger value="settings">{t("courtVmixSettings.displaySettings")}</TabsTrigger>
          <TabsTrigger value="api">{t("courtVmixSettings.apiForVmix")}</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Левая колонка - основные настройки */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("courtVmixSettings.basicSettings")}</CardTitle>
                  <CardDescription>{t("courtVmixSettings.configureBasicParams")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">{t("courtVmixSettings.theme")}</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger id="theme">
                        <SelectValue placeholder={t("courtVmixSettings.selectTheme")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">{t("courtVmixSettings.customTheme")}</SelectItem>
                        <SelectItem value="transparent">{t("courtVmixSettings.transparentTheme")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fontSize">{t("courtVmixSettings.fontSize")}</Label>
                    <Select value={fontSize} onValueChange={setFontSize}>
                      <SelectTrigger id="fontSize">
                        <SelectValue placeholder={t("courtVmixSettings.selectFontSize")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">{t("courtVmixSettings.smallSize")}</SelectItem>
                        <SelectItem value="normal">{t("courtVmixSettings.mediumSize")}</SelectItem>
                        <SelectItem value="large">{t("courtVmixSettings.largeSize")}</SelectItem>
                        <SelectItem value="xlarge">{t("courtVmixSettings.xlargeSize")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="playerNamesFontSize">
                      {t("courtVmixSettings.playerNamesFontSize").replace("{size}", playerNamesFontSize.toString())}
                    </Label>
                    <Slider
                      id="playerNamesFontSize"
                      min={0.6}
                      max={2.0}
                      step={0.1}
                      value={[playerNamesFontSize]}
                      onValueChange={(value) => setPlayerNamesFontSize(value[0])}
                    />
                  </div>

                  {theme !== "transparent" && (
                    <div className="space-y-2">
                      <Label htmlFor="bgOpacity">
                        {t("courtVmixSettings.bgOpacity").replace("{opacity}", Math.round(bgOpacity * 100).toString())}
                      </Label>
                      <Slider
                        id="bgOpacity"
                        min={0}
                        max={1}
                        step={0.05}
                        value={[bgOpacity]}
                        onValueChange={(value) => setBgOpacity(value[0])}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="textColor">{t("courtVmixSettings.textColor")}</Label>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: textColor }}></div>
                      <Input
                        id="textColor"
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-12 p-1 h-8"
                      />
                      <Input
                        type="text"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accentColor">{t("courtVmixSettings.serveIndicatorColor")}</Label>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: accentColor }}></div>
                      <Input
                        id="accentColor"
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-12 p-1 h-8"
                      />
                      <Input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showNames">Показывать имена игроков</Label>
                      <Switch
                        id="showNames"
                        checked={showNames}
                        onCheckedChange={setShowNames}
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="showPoints">Показывать текущие очки</Label>
                      <Switch
                        id="showPoints"
                        checked={showPoints}
                        onCheckedChange={setShowPoints}
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="showSets">Показывать счет по сетам</Label>
                      <Switch
                        id="showSets"
                        checked={showSets}
                        onCheckedChange={setShowSets}
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="showServer">Показывать подающего</Label>
                      <Switch
                        id="showServer"
                        checked={showServer}
                        onCheckedChange={setShowServer}
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="showCountry">Показывать страны</Label>
                      <Switch
                        id="showCountry"
                        checked={showCountry}
                        onCheckedChange={showCountry}
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Правая колонка - настройки цветов и градиентов */}
            <div className="space-y-6">
              {theme !== "transparent" && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t("courtVmixSettings.colorsAndGradients")}</CardTitle>
                    <CardDescription>{t("courtVmixSettings.configureColorsAndGradients")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Имена игроков */}
                    <div className="space-y-4 border-b pb-4">
                      <h3 className="font-medium">{t("courtVmixSettings.playerNamesBlock")}</h3>
                      <div className="space-y-2">
                        <Label htmlFor="namesBgColor">{t("courtVmixSettings.playerNamesBgColor")}</Label>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: namesBgColor }}></div>
                          <Input
                            id="namesBgColor"
                            type="color"
                            value={namesBgColor}
                            onChange={(e) => setNamesBgColor(e.target.value)}
                            className="w-12 p-1 h-8"
                          />
                          <Input
                            type="text"
                            value={namesBgColor}
                            onChange={(e) => setNamesBgColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="namesGradient">{t("courtVmixSettings.useGradientForNames")}</Label>
                        <Switch
                          id="namesGradient"
                          checked={namesGradient}
                          onCheckedChange={setNamesGradient}
                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                        />
                      </div>

                      {namesGradient && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="namesGradientFrom">{t("courtVmixSettings.namesGradientStartColor")}</Label>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-6 h-6 rounded-full border"
                                style={{ backgroundColor: namesGradientFrom }}
                              ></div>
                              <Input
                                id="namesGradientFrom"
                                type="color"
                                value={namesGradientFrom}
                                onChange={(e) => setNamesGradientFrom(e.target.value)}
                                className="w-12 p-1 h-8"
                              />
                              <Input
                                type="text"
                                value={namesGradientFrom}
                                onChange={(e) => setNamesGradientFrom(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="namesGradientTo">{t("courtVmixSettings.namesGradientEndColor")}</Label>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-6 h-6 rounded-full border"
                                style={{ backgroundColor: namesGradientTo }}
                              ></div>
                              <Input
                                id="namesGradientTo"
                                type="color"
                                value={namesGradientTo}
                                onChange={(e) => setNamesGradientTo(e.target.value)}
                                className="w-12 p-1 h-8"
                              />
                              <Input
                                type="text"
                                value={namesGradientTo}
                                onChange={(e) => setNamesGradientTo(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div
                            className="h-8 rounded"
                            style={{
                              background: `linear-gradient(to bottom, ${namesGradientFrom}, ${namesGradientTo})`,
                            }}
                          ></div>
                        </>
                      )}
                    </div>

                    {/* Страны игроков */}
                    <div className="space-y-4 border-b pb-4">
                      <h3 className="font-medium">{t("courtVmixSettings.countriesBlock")}</h3>
                      <div className="space-y-2">
                        <Label htmlFor="countryBgColor">{t("courtVmixSettings.countriesBgColor")}</Label>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: countryBgColor }}
                          ></div>
                          <Input
                            id="countryBgColor"
                            type="color"
                            value={countryBgColor}
                            onChange={(e) => setCountryBgColor(e.target.value)}
                            className="w-12 p-1 h-8"
                          />
                          <Input
                            type="text"
                            value={countryBgColor}
                            onChange={(e) => setCountryBgColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="countryGradient">{t("courtVmixSettings.useGradientForCountries")}</Label>
                        <Switch
                          id="countryGradient"
                          checked={countryGradient}
                          onCheckedChange={setCountryGradient}
                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                        />
                      </div>

                      {countryGradient && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="countryGradientFrom">
                              {t("courtVmixSettings.countriesGradientStartColor")}
                            </Label>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-6 h-6 rounded-full border"
                                style={{ backgroundColor: countryGradientFrom }}
                              ></div>
                              <Input
                                id="countryGradientFrom"
                                type="color"
                                value={countryGradientFrom}
                                onChange={(e) => setCountryGradientFrom(e.target.value)}
                                className="w-12 p-1 h-8"
                              />
                              <Input
                                type="text"
                                value={countryGradientFrom}
                                onChange={(e) => setCountryGradientFrom(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="countryGradientTo">
                              {t("courtVmixSettings.countriesGradientEndColor")}
                            </Label>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-6 h-6 rounded-full border"
                                style={{ backgroundColor: countryGradientTo }}
                              ></div>
                              <Input
                                id="countryGradientTo"
                                type="color"
                                value={countryGradientTo}
                                onChange={(e) => setCountryGradientTo(e.target.value)}
                                className="w-12 p-1 h-8"
                              />
                              <Input
                                type="text"
                                value={countryGradientTo}
                                onChange={(e) => setCountryGradientTo(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div
                            className="h-8 rounded"
                            style={{
                              background: `linear-gradient(to bottom, ${countryGradientFrom}, ${countryGradientTo})`,
                            }}
                          ></div>
                        </>
                      )}
                    </div>

                    {/* Индикатор подачи */}
                    <div className="space-y-4 border-b pb-4">
                      <h3 className="font-medium">{t("courtVmixSettings.serveIndicatorBlock")}</h3>
                      <div className="space-y-2">
                        <Label htmlFor="serveBgColor">{t("courtVmixSettings.serveIndicatorBgColor")}</Label>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: serveBgColor }}></div>
                          <Input
                            id="serveBgColor"
                            type="color"
                            value={serveBgColor}
                            onChange={(e) => setServeBgColor(e.target.value)}
                            className="w-12 p-1 h-8"
                          />
                          <Input
                            type="text"
                            value={serveBgColor}
                            onChange={(e) => setServeBgColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="accentColor">{t("courtVmixSettings.serveIndicatorColor")}</Label>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: accentColor }}></div>
                          <Input
                            id="accentColor"
                            type="color"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="w-12 p-1 h-8"
                          />
                          <Input
                            type="text"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="serveGradient">{t("courtVmixSettings.useGradientForServeIndicator")}</Label>
                        <Switch
                          id="serveGradient"
                          checked={serveGradient}
                          onCheckedChange={setServeGradient}
                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                        />
                      </div>

                      {serveGradient && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="serveGradientFrom">
                              {t("courtVmixSettings.serveIndicatorGradientStartColor")}
                            </Label>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-6 h-6 rounded-full border"
                                style={{ backgroundColor: serveGradientFrom }}
                              ></div>
                              <Input
                                id="serveGradientFrom"
                                type="color"
                                value={serveGradientFrom}
                                onChange={(e) => setServeGradientFrom(e.target.value)}
                                className="w-12 p-1 h-8"
                              />
                              <Input
                                type="text"
                                value={serveGradientFrom}
                                onChange={(e) => setServeGradientFrom(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="serveGradientTo">
                              {t("courtVmixSettings.serveIndicatorGradientEndColor")}
                            </Label>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-6 h-6 rounded-full border"
                                style={{ backgroundColor: serveGradientTo }}
                              ></div>
                              <Input
                                id="serveGradientTo"
                                type="color"
                                value={serveGradientTo}
                                onChange={(e) => setServeGradientTo(e.target.value)}
                                className="w-12 p-1 h-8"
                              />
                              <Input
                                type="text"
                                value={serveGradientTo}
                                onChange={(e) => setServeGradientTo(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div
                            className="h-8 rounded"
                            style={{
                              background: `linear-gradient(to bottom, ${serveGradientFrom}, ${serveGradientTo})`,
                            }}
                          ></div>
                        </>
                      )}

                      {/* Пример индикатора подачи */}
                      <div className="mt-4 flex items-center space-x-2">
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center"
                          style={{
                            ...(serveGradient
                              ? { background: `linear-gradient(to bottom, ${serveGradientFrom}, ${serveGradientTo})` }
                              : { background: serveBgColor }),
                            color: accentColor,
                          }}
                        >
                          <span style={{ fontSize: "2em", lineHeight: "0.5" }}>&bull;</span>
                        </div>
                        <span className="text-sm">{t("courtVmixSettings.serveIndicatorExample")}</span>
                      </div>
                    </div>

                    {/* Текущий счет */}
                    <div className="space-y-4 border-b pb-4">
                      <h3 className="font-medium">{t("courtVmixSettings.currentScoreBlock")}</h3>
                      <div className="space-y-2">
                        <Label htmlFor="pointsBgColor">{t("courtVmixSettings.currentScoreBgColor")}</Label>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: pointsBgColor }}></div>
                          <Input
                            id="pointsBgColor"
                            type="color"
                            value={pointsBgColor}
                            onChange={(e) => setPointsBgColor(e.target.value)}
                            className="w-12 p-1 h-8"
                          />
                          <Input
                            type="text"
                            value={pointsBgColor}
                            onChange={(e) => setPointsBgColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="pointsGradient">{t("courtVmixSettings.useGradientForCurrentScore")}</Label>
                        <Switch
                          id="pointsGradient"
                          checked={pointsGradient}
                          onCheckedChange={setPointsGradient}
                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                        />
                      </div>

                      {pointsGradient && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="pointsGradientFrom">
                              {t("courtVmixSettings.currentScoreGradientStartColor")}
                            </Label>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-6 h-6 rounded-full border"
                                style={{ backgroundColor: pointsGradientFrom }}
                              ></div>
                              <Input
                                id="pointsGradientFrom"
                                type="color"
                                value={pointsGradientFrom}
                                onChange={(e) => setPointsGradientFrom(e.target.value)}
                                className="w-12 p-1 h-8"
                              />
                              <Input
                                type="text"
                                value={pointsGradientFrom}
                                onChange={(e) => setPointsGradientFrom(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="pointsGradientTo">
                              {t("courtVmixSettings.currentScoreGradientEndColor")}
                            </Label>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-6 h-6 rounded-full border"
                                style={{ backgroundColor: pointsGradientTo }}
                              ></div>
                              <Input
                                id="pointsGradientTo"
                                type="color"
                                value={pointsGradientTo}
                                onChange={(e) => setPointsGradientTo(e.target.value)}
                                className="w-12 p-1 h-8"
                              />
                              <Input
                                type="text"
                                value={pointsGradientTo}
                                onChange={(e) => setPointsGradientTo(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div
                            className="h-8 rounded"
                            style={{
                              background: `linear-gradient(to bottom, ${pointsGradientFrom}, ${pointsGradientTo})`,
                            }}
                          ></div>
                        </>
                      )}
                    </div>

                    {/* Счет в сетах */}
                    <div className="space-y-4 border-b pb-4">
                      <h3 className="font-medium">{t("courtVmixSettings.setsScoreBlock")}</h3>
                      <div className="space-y-2">
                        <Label htmlFor="setsBgColor">{t("courtVmixSettings.setsBgColor")}</Label>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: setsBgColor }}></div>
                          <Input
                            id="setsBgColor"
                            type="color"
                            value={setsBgColor}
                            onChange={(e) => setSetsBgColor(e.target.value)}
                            className="w-12 p-1 h-8"
                          />
                          <Input
                            type="text"
                            value={setsBgColor}
                            onChange={(e) => setSetsBgColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="setsTextColor">{t("courtVmixSettings.setsTextColor")}</Label>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: setsTextColor }}></div>
                          <Input
                            id="setsTextColor"
                            type="color"
                            value={setsTextColor}
                            onChange={(e) => setSetsTextColor(e.target.value)}
                            className="w-12 p-1 h-8"
                          />
                          <Input
                            type="text"
                            value={setsTextColor}
                            onChange={(e) => setSetsTextColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="setsGradient">{t("courtVmixSettings.useGradientForSets")}</Label>
                        <Switch
                          id="setsGradient"
                          checked={setsGradient}
                          onCheckedChange={setSetsGradient}
                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                        />
                      </div>

                      {setsGradient && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="setsGradientFrom">{t("courtVmixSettings.setsGradientStartColor")}</Label>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-6 h-6 rounded-full border"
                                style={{ backgroundColor: setsGradientFrom }}
                              ></div>
                              <Input
                                id="setsGradientFrom"
                                type="color"
                                value={setsGradientFrom}
                                onChange={(e) => setSetsGradientFrom(e.target.value)}
                                className="w-12 p-1 h-8"
                              />
                              <Input
                                type="text"
                                value={setsGradientFrom}
                                onChange={(e) => setSetsGradientFrom(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="setsGradientTo">{t("courtVmixSettings.setsGradientEndColor")}</Label>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-6 h-6 rounded-full border"
                                style={{ backgroundColor: setsGradientTo }}
                              ></div>
                              <Input
                                id="setsGradientTo"
                                type="color"
                                value={setsGradientTo}
                                onChange={(e) => setSetsGradientTo(e.target.value)}
                                className="w-12 p-1 h-8"
                              />
                              <Input
                                type="text"
                                value={setsGradientTo}
                                onChange={(e) => setSetsGradientTo(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div
                            className="h-8 rounded"
                            style={{
                              background: `linear-gradient(to bottom, ${setsGradientFrom}, ${setsGradientTo})`,
                            }}
                          ></div>
                        </>
                      )}
                    </div>

                    {/* Индикатор важных моментов */}
                    <div className="space-y-4">
                      <h3 className="font-medium">{t("courtVmixSettings.importantMomentsIndicator")}</h3>
                      <div className="space-y-2">
                        <Label htmlFor="indicatorBgColor">{t("courtVmixSettings.indicatorBgColor")}</Label>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: indicatorBgColor }}
                          ></div>
                          <Input
                            id="indicatorBgColor"
                            type="color"
                            value={indicatorBgColor}
                            onChange={(e) => setIndicatorBgColor(e.target.value)}
                            className="w-12 p-1 h-8"
                          />
                          <Input
                            type="text"
                            value={indicatorBgColor}
                            onChange={(e) => setIndicatorBgColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="indicatorTextColor">{t("courtVmixSettings.indicatorTextColor")}</Label>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: indicatorTextColor }}
                          ></div>
                          <Input
                            id="indicatorTextColor"
                            type="color"
                            value={indicatorTextColor}
                            onChange={(e) => setIndicatorTextColor(e.target.value)}
                            className="w-12 p-1 h-8"
                          />
                          <Input
                            type="text"
                            value={indicatorTextColor}
                            onChange={(e) => setIndicatorTextColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="indicatorGradient">{t("courtVmixSettings.useGradientForIndicator")}</Label>
                        <Switch
                          id="indicatorGradient"
                          checked={indicatorGradient}
                          onCheckedChange={setIndicatorGradient}
                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                        />
                      </div>

                      {indicatorGradient && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="indicatorGradientFrom">
                              {t("courtVmixSettings.indicatorGradientStartColor")}
                            </Label>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-6 h-6 rounded-full border"
                                style={{ backgroundColor: indicatorGradientFrom }}
                              ></div>
                              <Input
                                id="indicatorGradientFrom"
                                type="color"
                                value={indicatorGradientFrom}
                                onChange={(e) => setIndicatorGradientFrom(e.target.value)}
                                className="w-12 p-1 h-8"
                              />
                              <Input
                                type="text"
                                value={indicatorGradientFrom}
                                onChange={(e) => setIndicatorGradientFrom(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="indicatorGradientTo">
                              {t("courtVmixSettings.indicatorGradientEndColor")}
                            </Label>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-6 h-6 rounded-full border"
                                style={{ backgroundColor: indicatorGradientTo }}
                              ></div>
                              <Input
                                id="indicatorGradientTo"
                                type="color"
                                value={indicatorGradientTo}
                                onChange={(e) => setIndicatorGradientTo(e.target.value)}
                                className="w-12 p-1 h-8"
                              />
                              <Input
                                type="text"
                                value={indicatorGradientTo}
                                onChange={(e) => setIndicatorGradientTo(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div
                            className="h-8 rounded"
                            style={{
                              background: `linear-gradient(to bottom, ${indicatorGradientFrom}, ${indicatorGradientTo})`,
                            }}
                          ></div>
                        </>
                      )}

                      {/* Пример индикатора */}
                      <div className="mt-4">
                        <div
                          className="rounded text-center py-1 px-2 font-bold"
                          style={{
                            color: indicatorTextColor,
                            ...(indicatorGradient
                              ? {
                                  background: `linear-gradient(to bottom, ${indicatorGradientFrom}, ${indicatorGradientTo})`,
                                }
                              : { background: indicatorBgColor }),
                          }}
                        >
                          MATCH POINT
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Кнопки действий */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("courtVmixSettings.actions")}</CardTitle>
                  <CardDescription>{t("courtVmixSettings.previewAndUseSettings")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handlePreview} className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    {t("courtVmixSettings.preview")}
                  </Button>
                  <Button onClick={handleOpenVmix} className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t("courtVmixSettings.openInNewWindow")}
                  </Button>
                  <Button onClick={handleOpenVmixInCurrentWindow} className="w-full">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    {t("courtVmixSettings.openInCurrentWindow")}
                  </Button>
                  <Button onClick={handleCopyUrl} className="w-full" disabled={copying}>
                    <Copy className="mr-2 h-4 w-4" />
                    {copying ? t("courtVmixSettings.copying") : t("courtVmixSettings.copyUrl")}
                  </Button>
                  <Button onClick={saveSettings} className="w-full" variant="secondary">
                    <Save className="mr-2 h-4 w-4" />
                    {t("courtVmixSettings.saveSettings")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>{t("courtVmixSettings.jsonApiForVmix")}</CardTitle>
              <CardDescription>{t("courtVmixSettings.useApiForVmixData")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("courtVmixSettings.jsonApiUrl")}</Label>
                <div className="flex items-center space-x-2">
                  <Input readOnly value={generateJsonUrl()} />
                  <Button variant="outline" onClick={handleCopyJsonUrl} disabled={copying}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("courtVmixSettings.instructionsForVmix")}</Label>
                <div className="bg-gray-100 p-4 rounded-md text-sm">
                  <p className="font-semibold mb-2">{t("courtVmixSettings.dataSourceSetup")}</p>
                  <ol className="list-decimal pl-5 space-y-1 mb-4">
                    {t("courtVmixSettings.dataSourceSteps")
                      .split("\n")
                      .map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                  </ol>

                  <p className="font-semibold mb-2">{t("courtVmixSettings.titleDesignerUsage")}</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    {t("courtVmixSettings.titleDesignerSteps")
                      .split("\n")
                      .map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                  </ol>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("courtVmixSettings.availableDataFields")}</Label>
                <div className="bg-gray-100 p-4 rounded-md text-sm">
                  <p className="font-semibold mb-2">{t("courtVmixSettings.teamA")}</p>
                  <ul className="list-disc pl-5 space-y-1 mb-3">
                    <li>
                      <code>teamA_name</code> - имена игроков команды A
                    </li>
                    <li>
                      <code>teamA_score</code> - общий счет команды A
                    </li>
                    <li>
                      <code>teamA_game_score</code> - текущий счет в гейме (0, 15, 30, 40, Ad)
                    </li>
                    <li>
                      <code>teamA_current_set</code> - счет в текущем сете
                    </li>
                    <li>
                      <code>teamA_serving</code> - подает ли команда A ("Да"/"Нет")
                    </li>
                    <li>
                      <code>teamA_set1</code>, <code>teamA_set2</code>, <code>teamA_set3</code> - счет по сетам
                    </li>
                  </ul>

                  <p className="font-semibold mb-2">{t("courtVmixSettings.teamB")}</p>
                  <ul className="list-disc pl-5 space-y-1 mb-3">
                    <li>
                      <code>teamB_name</code> - имена игроков команды B
                    </li>
                    <li>
                      <code>teamB_score</code> - общий счет команды B
                    </li>
                    <li>
                      <code>teamB_game_score</code> - текущий счет в гейме (0, 15, 30, 40, Ad)
                    </li>
                    <li>
                      <code>teamB_current_set</code> - счет в текущем сете
                    </li>
                    <li>
                      <code>teamB_serving</code> - подает ли команда B ("Да"/"Нет")
                    </li>
                    <li>
                      <code>teamB_set1</code>, <code>teamB_set2</code>, <code>teamB_set3</code> - счет по сетам
                    </li>
                  </ul>

                  <p className="font-semibold mb-2">{t("courtVmixSettings.generalData")}</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <code>match_id</code> - идентификатор матча
                    </li>
                    <li>
                      <code>is_tiebreak</code> - идет ли тай-брейк ("Да"/"Нет")
                    </li>
                    <li>
                      <code>is_completed</code> - завершен ли матч ("Да"/"Нет")
                    </li>
                    <li>
                      <code>winner</code> - победитель матча (если есть)
                    </li>
                    <li>
                      <code>update_time</code> - время последнего обновления
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCopyJsonUrl} className="w-full" disabled={copying}>
                <Copy className="mr-2 h-4 w-4" />
                {copying ? "Копирование..." : "Скопировать URL для JSON API"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
