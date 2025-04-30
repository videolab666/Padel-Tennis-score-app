"use client"

import { Button } from "@/components/ui/button"
import { Maximize2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface FullscreenButtonProps {
  courtNumber: number | null
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
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
const generateFullscreenUrl = (courtNumber, settings) => {
  const baseUrl = window.location.origin
  const url = new URL(`${baseUrl}/fullscreen-scoreboard/${courtNumber}`)

  if (!settings) return url.toString()

  // Добавляем основные параметры
  url.searchParams.set("theme", settings.theme || "custom")
  url.searchParams.set("showNames", (settings.showNames !== undefined ? settings.showNames : true).toString())
  url.searchParams.set("showPoints", (settings.showPoints !== undefined ? settings.showPoints : true).toString())
  url.searchParams.set("showSets", (settings.showSets !== undefined ? settings.showSets : true).toString())
  url.searchParams.set("showServer", (settings.showServer !== undefined ? settings.showServer : true).toString())
  url.searchParams.set("showCountry", (settings.showCountry !== undefined ? settings.showCountry : true).toString())
  url.searchParams.set("textColor", formatColorForUrl(settings.textColor || "#ffffff"))
  url.searchParams.set("accentColor", formatColorForUrl(settings.accentColor || "#fbbf24"))

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
  }

  return url.toString()
}

export function FullscreenButton({ courtNumber, className = "", size = "default" }: FullscreenButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (!courtNumber) return

    // Загружаем настройки из localStorage
    const settings = loadVmixSettings()

    // Генерируем URL с настройками
    const url = generateFullscreenUrl(courtNumber, settings)

    // Открываем в новом окне
    window.open(url, "_blank")
  }

  if (!courtNumber) return null

  return (
    <Button variant="outline" onClick={handleClick} className={className} size={size}>
      <Maximize2 className="mr-2 h-4 w-4" />
      Полный экран
    </Button>
  )
}
