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
import { getMatch } from "@/lib/match-storage"
import { logEvent } from "@/lib/error-logger"
// Добавим импорт для иконки сохранения
import { ArrowLeft, Copy, ExternalLink, Eye, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"

export default function VmixSettingsPage({ params }) {
  const router = useRouter()
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copying, setCopying] = useState(false)

  // Настройки отображения
  const [theme, setTheme] = useState("custom")
  const [showNames, setShowNames] = useState(true)
  const [showPoints, setShowPoints] = useState(true)
  const [showSets, setShowSets] = useState(true)
  const [showServer, setShowServer] = useState(true)
  const [showCountry, setShowCountry] = useState(true)
  const [fontSize, setFontSize] = useState("normal")
  const [bgOpacity, setBgOpacity] = useState(0.5)
  const [textColor, setTextColor] = useState("#ffffff")
  const [accentColor, setAccentColor] = useState("#fbbf24")

  // Настройки размера шрифта имен игроков
  const [playerNamesFontSize, setPlayerNamesFontSize] = useState(1.2)

  // Настройки цветов и градиентов
  const [namesBgColor, setNamesBgColor] = useState("#0369a1")
  const [countryBgColor, setCountryBgColor] = useState("#0369a1")
  const [serveBgColor, setServeBgColor] = useState("#000000")
  const [pointsBgColor, setPointsBgColor] = useState("#0369a1")
  const [setsBgColor, setSetsBgColor] = useState("#ffffff")
  const [setsTextColor, setSetsTextColor] = useState("#000000")
  const [namesGradient, setNamesGradient] = useState(false)
  const [namesGradientFrom, setNamesGradientFrom] = useState("#0369a1")
  const [namesGradientTo, setNamesGradientTo] = useState("#0284c7")
  const [countryGradient, setCountryGradient] = useState(false)
  const [countryGradientFrom, setCountryGradientFrom] = useState("#0369a1")
  const [countryGradientTo, setCountryGradientTo] = useState("#0284c7")
  const [serveGradient, setServeGradient] = useState(false)
  const [serveGradientFrom, setServeGradientFrom] = useState("#000000")
  const [serveGradientTo, setServeGradientTo] = useState("#1e1e1e")
  const [pointsGradient, setPointsGradient] = useState(false)
  const [pointsGradientFrom, setPointsGradientFrom] = useState("#0369a1")
  const [pointsGradientTo, setPointsGradientTo] = useState("#0284c7")
  const [setsGradient, setSetsGradient] = useState(false)
  const [setsGradientFrom, setSetsGradientFrom] = useState("#ffffff")
  const [setsGradientTo, setSetsGradientTo] = useState("#f0f0f0")

  // Настройки для индикатора важных моментов
  const [indicatorBgColor, setIndicatorBgColor] = useState("#7c2d12")
  const [indicatorTextColor, setIndicatorTextColor] = useState("#ffffff")
  const [indicatorGradient, setIndicatorGradient] = useState(false)
  const [indicatorGradientFrom, setIndicatorGradientFrom] = useState("#7c2d12")
  const [indicatorGradientTo, setIndicatorGradientTo] = useState("#991b1b")

  // Настройки анимаций
  const [animationType, setAnimationType] = useState("fade")
  const [animationDuration, setAnimationDuration] = useState(500)

  // Добавим функцию сохранения настроек и загрузки сохраненных настроек
  // Добавьте эти функции после объявления всех состояний (useState) и перед useEffect

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
        animationType,
        animationDuration,
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
        title: "Настройки сохранены",
        description: "Ваши настройки будут применены автоматически при следующем открытии",
      })
      logEvent("info", "Настройки vMix сохранены", "vmix-settings-save")
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive",
      })
      logEvent("error", "Ошибка при сохранении настроек vMix", "vmix-settings-save", error)
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
        setShowCountry(settings.showCountry !== undefined ? settings.showCountry : true)
        setFontSize(settings.fontSize || "normal")
        setBgOpacity(settings.bgOpacity !== undefined ? settings.bgOpacity : 0.5)
        setTextColor(settings.textColor || "#ffffff")
        setAccentColor(settings.accentColor || "#fbbf24")

        setNamesBgColor(settings.namesBgColor || "#0369a1")
        setCountryBgColor(settings.countryBgColor || "#0369a1")
        setServeBgColor(settings.serveBgColor || "#000000")
        setPointsBgColor(settings.pointsBgColor || "#0369a1")
        setSetsBgColor(settings.setsBgColor || "#ffffff")
        setSetsTextColor(settings.setsTextColor || "#000000")

        setNamesGradient(settings.namesGradient !== undefined ? settings.namesGradient : false)
        setNamesGradientFrom(settings.namesGradientFrom || "#0369a1")
        setNamesGradientTo(settings.namesGradientTo || "#0284c7")

        setCountryGradient(settings.countryGradient !== undefined ? settings.countryGradient : false)
        setCountryGradientFrom(settings.countryGradientFrom || "#0369a1")
        setCountryGradientTo(settings.countryGradientTo || "#0284c7")

        setServeGradient(settings.serveGradient !== undefined ? settings.serveGradient : false)
        setServeGradientFrom(settings.serveGradientFrom || "#000000")
        setServeGradientTo(settings.serveGradientTo || "#1e1e1e")

        setPointsGradient(settings.pointsGradient !== undefined ? settings.pointsGradient : false)
        setPointsGradientFrom(settings.pointsGradientFrom || "#0369a1")
        setPointsGradientTo(settings.pointsGradientTo || "#0284c7")

        setSetsGradient(settings.setsGradient !== undefined ? settings.setsGradient : false)
        setSetsGradientFrom(settings.setsGradientFrom || "#ffffff")
        setSetsGradientTo(settings.setsGradientTo || "#f0f0f0")

        // Загружаем настройки индикатора
        setIndicatorBgColor(settings.indicatorBgColor || "#7c2d12")
        setIndicatorTextColor(settings.indicatorTextColor || "#ffffff")
        setIndicatorGradient(settings.indicatorGradient !== undefined ? settings.indicatorGradient : false)
        setIndicatorGradientFrom(settings.indicatorGradientFrom || "#7c2d12")
        setIndicatorGradientTo(settings.indicatorGradientTo || "#991b1b")

        setAnimationType(settings.animationType || "fade")
        setAnimationDuration(settings.animationDuration || 500)

        // Загружаем размер шрифта имен игроков
        setPlayerNamesFontSize(settings.playerNamesFontSize !== undefined ? settings.playerNamesFontSize : 1.2)

        logEvent("info", "Загружены сохраненные настройки vMix", "vmix-settings-load")
      }
    } catch (error) {
      logEvent("error", "Ошибка при загрузке сохраненных настроек vMix", "vmix-settings-load", error)
    }
  }

  // Модифицируем существующий useEffect для загрузки сохраненных настроек
  // Найдите существующий useEffect, который загружает матч, и добавьте вызов loadSavedSettings() в конце

  useEffect(() => {
    const loadMatch = async () => {
      try {
        if (!params.id) {
          setError("Некорректный ID матча")
          setLoading(false)
          return
        }

        const matchData = await getMatch(params.id)
        if (matchData) {
          setMatch(matchData)
          setError("")
          logEvent("info", `vMix настройки загружены для матча: ${params.id}`, "vmix-settings")
        } else {
          setError("Матч не найден")
          logEvent("error", `vMix настройки: матч не найден: ${params.id}`, "vmix-settings")
        }
      } catch (err) {
        setError("Ошибка загрузки матча")
        logEvent("error", "Ошибка загрузки матча для vMix настроек", "vmix-settings", err)
      } finally {
        setLoading(false)
      }
    }

    loadMatch()
    // Загружаем сохраненные настройки после загрузки матча
    loadSavedSettings()
  }, [params.id])

  const handleBack = () => {
    router.back()
  }

  // Функция для корректной передачи цветов в URL
  const formatColorForUrl = (color) => {
    // Удаляем # из цвета для URL
    return color.replace("#", "")
  }

  const generateVmixUrl = () => {
    const baseUrl = window.location.origin
    const url = new URL(`${baseUrl}/vmix/${params.id}`)

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
      url.searchParams.set("namesGradient", namesGradient.toString())
      url.searchParams.set("namesGradientFrom", formatColorForUrl(namesGradientFrom))
      url.searchParams.set("namesGradientTo", formatColorForUrl(namesGradientTo))
      url.searchParams.set("countryGradient", countryGradient.toString())
      url.searchParams.set("countryGradientFrom", formatColorForUrl(countryGradientFrom))
      url.searchParams.set("countryGradientTo", formatColorForUrl(countryGradientTo))
      url.searchParams.set("serveGradient", serveGradient.toString())
      url.searchParams.set("serveGradientFrom", formatColorForUrl(serveGradientFrom))
      url.searchParams.set("serveGradientTo", formatColorForUrl(serveGradientTo))
      url.searchParams.set("pointsGradient", pointsGradient.toString())
      url.searchParams.set("pointsGradientFrom", formatColorForUrl(pointsGradientFrom))
      url.searchParams.set("pointsGradientTo", formatColorForUrl(pointsGradientTo))
      url.searchParams.set("setsGradient", setsGradient.toString())
      url.searchParams.set("setsGradientFrom", formatColorForUrl(setsGradientFrom))
      url.searchParams.set("setsGradientTo", formatColorForUrl(setsGradientTo))

      // Добавляем параметры для индикатора
      url.searchParams.set("indicatorBgColor", formatColorForUrl(indicatorBgColor))
      url.searchParams.set("indicatorTextColor", formatColorForUrl(indicatorTextColor))
      url.searchParams.set("indicatorGradient", indicatorGradient.toString())
      url.searchParams.set("indicatorGradientFrom", formatColorForUrl(indicatorGradientFrom))
      url.searchParams.set("indicatorGradientTo", formatColorForUrl(indicatorGradientTo))
    }

    // Добавляем параметры анимаций
    url.searchParams.set("animationType", animationType)
    url.searchParams.set("animationDuration", animationDuration.toString())

    return url.toString()
  }

  const generateJsonUrl = () => {
    const baseUrl = window.location.origin
    return `${baseUrl}/api/vmix/${params.id}`
  }

  const handleCopyUrl = async () => {
    try {
      setCopying(true)
      await navigator.clipboard.writeText(generateVmixUrl())
      toast({
        title: "URL скопирован",
        description: "URL для vMix скопирован в буфер обмена",
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать URL",
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
        title: "URL скопирован",
        description: "URL для JSON API скопирован в буфер обмена",
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать URL",
        variant: "destructive",
      })
    } finally {
      setCopying(false)
    }
  }

  const handleOpenVmix = () => {
    window.open(generateVmixUrl(), "_blank")
  }

  const handlePreview = () => {
    const previewUrl = generateVmixUrl()
    window.open(previewUrl, "vmix_preview", "width=800,height=400")
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Загрузка настроек...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
        <Button onClick={handleBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Button onClick={handleBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад к матчу
      </Button>

      <h1 className="text-2xl font-bold mb-4">Настройки vMix для матча</h1>

      {match && (
        <div className="mb-4">
          <p className="font-medium">
            {match.teamA.players.map((p) => p.name).join(" / ")} vs {match.teamB.players.map((p) => p.name).join(" / ")}
          </p>
        </div>
      )}

      <Tabs defaultValue="settings">
        <TabsList className="mb-4">
          <TabsTrigger value="settings">Настройки отображения</TabsTrigger>
          <TabsTrigger value="api">API для vMix</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Левая колонка - основные настройки */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Основные настройки</CardTitle>
                  <CardDescription>Настройте основные параметры отображения</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Тема</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Выберите тему" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Пользовательская</SelectItem>
                        <SelectItem value="transparent">Прозрачная</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fontSize">Размер шрифта</Label>
                    <Select value={fontSize} onValueChange={setFontSize}>
                      <SelectTrigger id="fontSize">
                        <SelectValue placeholder="Выберите размер шрифта" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Маленький</SelectItem>
                        <SelectItem value="normal">Средний</SelectItem>
                        <SelectItem value="large">Большой</SelectItem>
                        <SelectItem value="xlarge">Очень большой</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="playerNamesFontSize">Размер шрифта имен игроков: {playerNamesFontSize}em</Label>
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
                      <Label htmlFor="bgOpacity">Прозрачность фона: {Math.round(bgOpacity * 100)}%</Label>
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
                    <Label htmlFor="textColor">Цвет текста</Label>
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
                    <Label htmlFor="accentColor">Цвет индикатора подачи</Label>
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
                      <Switch id="showNames" checked={showNames} onCheckedChange={setShowNames} />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="showPoints">Показывать текущие очки</Label>
                      <Switch id="showPoints" checked={showPoints} onCheckedChange={setShowPoints} />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="showSets">Показывать счет по сетам</Label>
                      <Switch id="showSets" checked={showSets} onCheckedChange={setShowSets} />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="showServer">Показывать подающего</Label>
                      <Switch id="showServer" checked={showServer} onCheckedChange={setShowServer} />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="showCountry">Показывать страны</Label>
                      <Switch id="showCountry" checked={showCountry} onCheckedChange={setShowCountry} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Настройки анимаций */}
              <Card>
                <CardHeader>
                  <CardTitle>Настройки анимаций</CardTitle>
                  <CardDescription>Настройте анимации при изменении счета</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="animationType">Тип анимации</Label>
                    <Select value={animationType} onValueChange={setAnimationType}>
                      <SelectTrigger id="animationType">
                        <SelectValue placeholder="Выберите тип анимации" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fade">Плавное появление</SelectItem>
                        <SelectItem value="zoom">Увеличение</SelectItem>
                        <SelectItem value="pulse">Пульсация</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="animationDuration">Длительность анимации: {animationDuration} мс</Label>
                    <Slider
                      id="animationDuration"
                      min={100}
                      max={2000}
                      step={50}
                      value={[animationDuration]}
                      onValueChange={(value) => setAnimationDuration(value[0])}
                    />
                  </div>

                  <div className="bg-gray-100 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Предпросмотр анимации</h3>
                    <div className="flex justify-center">
                      <div
                        className="w-16 h-16 bg-blue-600 text-white flex items-center justify-center text-xl font-bold rounded"
                        style={{
                          animation: `${
                            animationType === "fade"
                              ? "fade-animation"
                              : animationType === "zoom"
                                ? "zoom-animation"
                                : "pulse-animation"
                          } ${animationDuration}ms ease-in-out infinite`,
                        }}
                      >
                        15
                      </div>
                    </div>
                    <style>{`
                      @keyframes fade-animation {
                        0% { opacity: 0; }
                        50% { opacity: 1; }
                        100% { opacity: 0; }
                      }
                      @keyframes zoom-animation {
                        0% { transform: scale(1.3); opacity: 0; }
                        50% { transform: scale(1.1); opacity: 0.7; }
                        100% { transform: scale(1); opacity: 0; }
                      }
                      @keyframes pulse-animation {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.2); }
                        100% { transform: scale(1); }
                      }
                    `}</style>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Правая колонка - настройки цветов и градиентов */}
            <div className="space-y-6">
              {theme !== "transparent" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Цвета и градиенты</CardTitle>
                    <CardDescription>Настройте цвета и градиенты для различных блоков</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Имена игроков */}
                    <div className="space-y-4 border-b pb-4">
                      <h3 className="font-medium">Блок имен игроков</h3>
                      <div className="space-y-2">
                        <Label htmlFor="namesBgColor">Цвет фона имен игроков</Label>
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
                        <Label htmlFor="namesGradient">Использовать градиент для имен</Label>
                        <Switch id="namesGradient" checked={namesGradient} onCheckedChange={setNamesGradient} />
                      </div>

                      {namesGradient && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="namesGradientFrom">Начальный цвет градиента имен</Label>
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
                            <Label htmlFor="namesGradientTo">Конечный цвет градиента имен</Label>
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
                      <h3 className="font-medium">Блок стран игроков</h3>
                      <div className="space-y-2">
                        <Label htmlFor="countryBgColor">Цвет фона стран игроков</Label>
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
                        <Label htmlFor="countryGradient">Использовать градиент для стран</Label>
                        <Switch id="countryGradient" checked={countryGradient} onCheckedChange={setCountryGradient} />
                      </div>

                      {countryGradient && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="countryGradientFrom">Начальный цвет градиента стран</Label>
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
                            <Label htmlFor="countryGradientTo">Конечный цвет градиента стран</Label>
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
                      <h3 className="font-medium">Блок индикатора подачи</h3>
                      <div className="space-y-2">
                        <Label htmlFor="serveBgColor">Цвет фона индикатора подачи</Label>
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
                        <Label htmlFor="accentColor">Цвет индикатора подачи</Label>
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
                        <Label htmlFor="serveGradient">Использовать градиент для фона индикатора подачи</Label>
                        <Switch id="serveGradient" checked={serveGradient} onCheckedChange={setServeGradient} />
                      </div>

                      {serveGradient && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="serveGradientFrom">Начальный цвет градиента фона индикатора</Label>
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
                            <Label htmlFor="serveGradientTo">Конечный цвет градиента фона индикатора</Label>
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
                          <span style={{ fontSize: "2em", lineHeight: "0.5" }}>•</span>
                        </div>
                        <span className="text-sm">Пример индикатора подачи</span>
                      </div>
                    </div>

                    {/* Текущий счет */}
                    <div className="space-y-4 border-b pb-4">
                      <h3 className="font-medium">Блок текущего счета</h3>
                      <div className="space-y-2">
                        <Label htmlFor="pointsBgColor">Цвет фона текущего счета</Label>
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
                        <Label htmlFor="pointsGradient">Использовать градиент для счета</Label>
                        <Switch id="pointsGradient" checked={pointsGradient} onCheckedChange={setPointsGradient} />
                      </div>

                      {pointsGradient && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="pointsGradientFrom">Начальный цвет градиента счета</Label>
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
                            <Label htmlFor="pointsGradientTo">Конечный цвет градиента счета</Label>
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
                      <h3 className="font-medium">Блок счета в сетах</h3>
                      <div className="space-y-2">
                        <Label htmlFor="setsBgColor">Цвет фона счета сетов</Label>
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
                        <Label htmlFor="setsTextColor">Цвет текста счета сетов</Label>
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
                        <Label htmlFor="setsGradient">Использовать градиент для счета в сетах</Label>
                        <Switch id="setsGradient" checked={setsGradient} onCheckedChange={setSetsGradient} />
                      </div>

                      {setsGradient && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="setsGradientFrom">Начальный цвет градиента счета в сетах</Label>
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
                            <Label htmlFor="setsGradientTo">Конечный цвет градиента счета в сетах</Label>
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
                      <h3 className="font-medium">Индикатор важных моментов</h3>
                      <div className="space-y-2">
                        <Label htmlFor="indicatorBgColor">Цвет фона индикатора</Label>
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
                        <Label htmlFor="indicatorTextColor">Цвет текста индикатора</Label>
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
                        <Label htmlFor="indicatorGradient">Использовать градиент для индикатора</Label>
                        <Switch
                          id="indicatorGradient"
                          checked={indicatorGradient}
                          onCheckedChange={setIndicatorGradient}
                        />
                      </div>

                      {indicatorGradient && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="indicatorGradientFrom">Начальный цвет градиента индикатора</Label>
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
                            <Label htmlFor="indicatorGradientTo">Конечный цвет градиента индикатора</Label>
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
                  <CardTitle>Действия</CardTitle>
                  <CardDescription>Предпросмотр и использование настроек</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handlePreview} className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    Предпросмотр с текущими настройками
                  </Button>
                  <Button onClick={handleOpenVmix} className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Открыть в новом окне
                  </Button>
                  <Button onClick={handleCopyUrl} className="w-full" disabled={copying}>
                    <Copy className="mr-2 h-4 w-4" />
                    {copying ? "Копирование..." : "Скопировать URL"}
                  </Button>
                  <Button onClick={saveSettings} className="w-full" variant="secondary">
                    <Save className="mr-2 h-4 w-4" />
                    Сохранить настройки
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>JSON API для vMix</CardTitle>
              <CardDescription>Используйте этот API для получения данных матча в формате JSON</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL для JSON API</Label>
                <div className="flex items-center space-x-2">
                  <Input readOnly value={generateJsonUrl()} />
                  <Button variant="outline" onClick={handleCopyJsonUrl} disabled={copying}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Инструкция по использованию в vMix</Label>
                <div className="bg-gray-100 p-4 rounded-md text-sm">
                  <p className="font-semibold mb-2">Настройка Data Source в vMix:</p>
                  <ol className="list-decimal pl-5 space-y-1 mb-4">
                    <li>В vMix перейдите в меню "Settings" → "Data Sources"</li>
                    <li>Нажмите "Add" и выберите "Web"</li>
                    <li>Вставьте URL API в поле "URL"</li>
                    <li>Установите "Update Interval" на 1-2 секунды</li>
                    <li>Нажмите "OK" для сохранения</li>
                  </ol>

                  <p className="font-semibold mb-2">Использование в Title Designer:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Создайте новый Title или откройте существующий</li>
                    <li>Добавьте текстовые поля для отображения данных</li>
                    <li>В свойствах текстового поля выберите "Data Binding"</li>
                    <li>Выберите вашу Data Source и нужное поле (например, "teamA_name")</li>
                    <li>Повторите для всех нужных полей</li>
                  </ol>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Доступные поля данных</Label>
                <div className="bg-gray-100 p-4 rounded-md text-sm">
                  <p className="font-semibold mb-2">Команда A:</p>
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

                  <p className="font-semibold mb-2">Команда B:</p>
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

                  <p className="font-semibold mb-2">Общие данные:</p>
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

              <div className="space-y-2">
                <Label>Пример формата данных</Label>
                <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto">
                  {`[
  {
    "match_id": "6dbff28b-8611-473c-a62d-22936df1ab31",
    "teamA_name": "Игрок 1 / Игрок 2",
    "teamA_score": 0,
    "teamA_game_score": "0",
    "teamA_current_set": 4,
    "teamA_serving": "Да",
    "teamB_name": "Игрок 3 / Игрок 4",
    "teamB_score": 1,
    "teamB_game_score": "0",
    "teamB_current_set": 4,
    "teamB_serving": "Нет",
    "is_tiebreak": "Нет",
    "is_completed": "Нет",
    "winner": "",
    "teamA_set1": 4,
    "teamA_set2": "",
    "teamA_set3": "",
    "teamB_set1": 6,
    "teamB_set2": "",
    "teamB_set3": "",
    "timestamp": "2025-04-22T18:54:21.069Z",
    "update_time": "6:54:21 PM"
  }
]`}
                </pre>
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
