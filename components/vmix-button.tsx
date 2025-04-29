"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

// Обновим интерфейс пропсов:
interface VmixButtonProps {
  matchId: string
  courtNumber?: number | null
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
  directLink?: boolean // Добавим опцию для прямого перехода на страницу vMix
}

// Функция для загрузки настроек из localStorage
const loadVmixSettings = () => {
  if (typeof window === "undefined") return null

  try {
    const savedSettings = localStorage.getItem("vmix_settings")
    if (savedSettings) {
      return JSON.parse(savedSettings)
    }
  } catch (error) {
    console.error("Ошибка при загрузке настроек vMix:", error)
  }
  return null
}

// Функция для форматирования цвета в URL
const formatColorForUrl = (color) => {
  if (!color) return ""
  return color.replace("#", "")
}

// Функция для генерации URL с настройками
const generateVmixUrl = (matchId, settings) => {
  const baseUrl = window.location.origin
  const url = new URL(`${baseUrl}/vmix/${matchId}`)

  if (!settings) return url.toString()

  // Добавляем основные параметры
  url.searchParams.set("theme", settings.theme || "custom")
  url.searchParams.set("showNames", (settings.showNames !== undefined ? settings.showNames : true).toString())
  url.searchParams.set("showPoints", (settings.showPoints !== undefined ? settings.showPoints : true).toString())
  url.searchParams.set("showSets", (settings.showSets !== undefined ? settings.showSets : true).toString())
  url.searchParams.set("showServer", (settings.showServer !== undefined ? settings.showServer : true).toString())
  url.searchParams.set("showCountry", (settings.showCountry !== undefined ? settings.showCountry : true).toString())
  url.searchParams.set("fontSize", settings.fontSize || "normal")
  url.searchParams.set("bgOpacity", (settings.bgOpacity !== undefined ? settings.bgOpacity : 0.5).toString())
  url.searchParams.set("textColor", formatColorForUrl(settings.textColor || "#ffffff"))
  url.searchParams.set("accentColor", formatColorForUrl(settings.accentColor || "#fbbf24"))
  url.searchParams.set(
    "playerNamesFontSize",
    (settings.playerNamesFontSize !== undefined ? settings.playerNamesFontSize : 1.2).toString(),
  )

  // Добавляем параметры цветов и градиентов (только если тема не прозрачная)
  if (settings.theme !== "transparent") {
    url.searchParams.set("namesBgColor", formatColorForUrl(settings.namesBgColor || "#0369a1"))
    url.searchParams.set("countryBgColor", formatColorForUrl(settings.countryBgColor || "#0369a1"))
    url.searchParams.set("serveBgColor", formatColorForUrl(settings.serveBgColor || "#000000"))
    url.searchParams.set("pointsBgColor", formatColorForUrl(settings.pointsBgColor || "#0369a1"))
    url.searchParams.set("setsBgColor", formatColorForUrl(settings.setsBgColor || "#ffffff"))
    url.searchParams.set("setsTextColor", formatColorForUrl(settings.setsTextColor || "#000000"))

    // Явно передаем строковые значения "true" или "false" для булевых параметров
    url.searchParams.set(
      "namesGradient",
      (settings.namesGradient !== undefined ? settings.namesGradient : true) ? "true" : "false",
    )
    url.searchParams.set("namesGradientFrom", formatColorForUrl(settings.namesGradientFrom || "#0369a1"))
    url.searchParams.set("namesGradientTo", formatColorForUrl(settings.namesGradientTo || "#0284c7"))
    url.searchParams.set(
      "countryGradient",
      (settings.countryGradient !== undefined ? settings.countryGradient : true) ? "true" : "false",
    )
    url.searchParams.set("countryGradientFrom", formatColorForUrl(settings.countryGradientFrom || "#0369a1"))
    url.searchParams.set("countryGradientTo", formatColorForUrl(settings.countryGradientTo || "#0284c7"))
    url.searchParams.set(
      "serveGradient",
      (settings.serveGradient !== undefined ? settings.serveGradient : true) ? "true" : "false",
    )
    url.searchParams.set("serveGradientFrom", formatColorForUrl(settings.serveGradientFrom || "#0369a1"))
    url.searchParams.set("serveGradientTo", formatColorForUrl(settings.serveGradientTo || "#0284c7"))
    url.searchParams.set(
      "pointsGradient",
      (settings.pointsGradient !== undefined ? settings.pointsGradient : true) ? "true" : "false",
    )
    url.searchParams.set("pointsGradientFrom", formatColorForUrl(settings.pointsGradientFrom || "#0369a1"))
    url.searchParams.set("pointsGradientTo", formatColorForUrl(settings.pointsGradientTo || "#0284c7"))
    url.searchParams.set(
      "setsGradient",
      (settings.setsGradient !== undefined ? settings.setsGradient : true) ? "true" : "false",
    )
    url.searchParams.set("setsGradientFrom", formatColorForUrl(settings.setsGradientFrom || "#ffffff"))
    url.searchParams.set("setsGradientTo", formatColorForUrl(settings.setsGradientTo || "#f0f0f0"))

    // Добавляем параметры для индикатора
    url.searchParams.set("indicatorBgColor", formatColorForUrl(settings.indicatorBgColor || "#7c2d12"))
    url.searchParams.set("indicatorTextColor", formatColorForUrl(settings.indicatorTextColor || "#ffffff"))
    url.searchParams.set(
      "indicatorGradient",
      (settings.indicatorGradient !== undefined ? settings.indicatorGradient : true) ? "true" : "false",
    )
    url.searchParams.set("indicatorGradientFrom", formatColorForUrl(settings.indicatorGradientFrom || "#7c2d12"))
    url.searchParams.set("indicatorGradientTo", formatColorForUrl(settings.indicatorGradientTo || "#991b1b"))
  }

  return url.toString()
}

// Функция для генерации URL корта с настройками
const generateCourtVmixUrl = (courtNumber, settings) => {
  const baseUrl = window.location.origin
  const url = new URL(`${baseUrl}/court-vmix/${courtNumber}`)

  if (!settings) return url.toString()

  // Добавляем основные параметры
  url.searchParams.set("theme", settings.theme || "custom")
  url.searchParams.set("showNames", (settings.showNames !== undefined ? settings.showNames : true).toString())
  url.searchParams.set("showPoints", (settings.showPoints !== undefined ? settings.showPoints : true).toString())
  url.searchParams.set("showSets", (settings.showSets !== undefined ? settings.showSets : true).toString())
  url.searchParams.set("showServer", (settings.showServer !== undefined ? settings.showServer : true).toString())
  url.searchParams.set("showCountry", (settings.showCountry !== undefined ? settings.showCountry : true).toString())
  url.searchParams.set("fontSize", settings.fontSize || "normal")
  url.searchParams.set("bgOpacity", (settings.bgOpacity !== undefined ? settings.bgOpacity : 0.5).toString())
  url.searchParams.set("textColor", formatColorForUrl(settings.textColor || "#ffffff"))
  url.searchParams.set("accentColor", formatColorForUrl(settings.accentColor || "#fbbf24"))
  url.searchParams.set(
    "playerNamesFontSize",
    (settings.playerNamesFontSize !== undefined ? settings.playerNamesFontSize : 1.2).toString(),
  )

  // Добавляем параметры цветов и градиентов (только если тема не прозрачная)
  if (settings.theme !== "transparent") {
    url.searchParams.set("namesBgColor", formatColorForUrl(settings.namesBgColor || "#0369a1"))
    url.searchParams.set("countryBgColor", formatColorForUrl(settings.countryBgColor || "#0369a1"))
    url.searchParams.set("serveBgColor", formatColorForUrl(settings.serveBgColor || "#000000"))
    url.searchParams.set("pointsBgColor", formatColorForUrl(settings.pointsBgColor || "#0369a1"))
    url.searchParams.set("setsBgColor", formatColorForUrl(settings.setsBgColor || "#ffffff"))
    url.searchParams.set("setsTextColor", formatColorForUrl(settings.setsTextColor || "#000000"))

    // Явно передаем строковые значения "true" или "false" для булевых параметров
    url.searchParams.set(
      "namesGradient",
      (settings.namesGradient !== undefined ? settings.namesGradient : true) ? "true" : "false",
    )
    url.searchParams.set("namesGradientFrom", formatColorForUrl(settings.namesGradientFrom || "#0369a1"))
    url.searchParams.set("namesGradientTo", formatColorForUrl(settings.namesGradientTo || "#0284c7"))
    url.searchParams.set(
      "countryGradient",
      (settings.countryGradient !== undefined ? settings.countryGradient : true) ? "true" : "false",
    )
    url.searchParams.set("countryGradientFrom", formatColorForUrl(settings.countryGradientFrom || "#0369a1"))
    url.searchParams.set("countryGradientTo", formatColorForUrl(settings.countryGradientTo || "#0284c7"))
    url.searchParams.set(
      "serveGradient",
      (settings.serveGradient !== undefined ? settings.serveGradient : true) ? "true" : "false",
    )
    url.searchParams.set("serveGradientFrom", formatColorForUrl(settings.serveGradientFrom || "#0369a1"))
    url.searchParams.set("serveGradientTo", formatColorForUrl(settings.serveGradientTo || "#0284c7"))
    url.searchParams.set(
      "pointsGradient",
      (settings.pointsGradient !== undefined ? settings.pointsGradient : true) ? "true" : "false",
    )
    url.searchParams.set("pointsGradientFrom", formatColorForUrl(settings.pointsGradientFrom || "#0369a1"))
    url.searchParams.set("pointsGradientTo", formatColorForUrl(settings.pointsGradientTo || "#0284c7"))
    url.searchParams.set(
      "setsGradient",
      (settings.setsGradient !== undefined ? settings.setsGradient : true) ? "true" : "false",
    )
    url.searchParams.set("setsGradientFrom", formatColorForUrl(settings.setsGradientFrom || "#ffffff"))
    url.searchParams.set("setsGradientTo", formatColorForUrl(settings.setsGradientTo || "#f0f0f0"))

    // Добавляем параметры для индикатора
    url.searchParams.set("indicatorBgColor", formatColorForUrl(settings.indicatorBgColor || "#7c2d12"))
    url.searchParams.set("indicatorTextColor", formatColorForUrl(settings.indicatorTextColor || "#ffffff"))
    url.searchParams.set(
      "indicatorGradient",
      (settings.indicatorGradient !== undefined ? settings.indicatorGradient : true) ? "true" : "false",
    )
    url.searchParams.set("indicatorGradientFrom", formatColorForUrl(settings.indicatorGradientFrom || "#7c2d12"))
    url.searchParams.set("indicatorGradientTo", formatColorForUrl(settings.indicatorGradientTo || "#991b1b"))
  }

  return url.toString()
}

// Обновим функцию компонента, чтобы она загружала настройки из localStorage
export function VmixButton({
  matchId,
  courtNumber,
  className = "",
  size = "default",
  directLink = false,
}: VmixButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (directLink) {
      // Если указан directLink, открываем страницу vMix с настройками из localStorage
      const settings = loadVmixSettings()

      if (courtNumber) {
        // Если указан номер корта, открываем страницу корта
        window.open(generateCourtVmixUrl(courtNumber, settings), "_blank")
      } else {
        // Иначе открываем страницу матча
        window.open(generateVmixUrl(matchId, settings), "_blank")
      }
    } else {
      // Иначе перенаправляем на страницу настроек vMix
      if (courtNumber) {
        window.location.href = `/court-vmix-settings/${courtNumber}`
      } else {
        window.location.href = `/vmix-settings/${matchId}`
      }
    }
  }

  return (
    <Button variant="outline" onClick={handleClick} className={className} size={size}>
      <ExternalLink className="mr-2 h-4 w-4" />
      {directLink ? "Открыть vMix" : "vMix настройки"}
    </Button>
  )
}
