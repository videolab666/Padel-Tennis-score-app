"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

// Изменим компонент VmixButton, чтобы он возвращал только одну кнопку

// Обновим интерфейс пропсов:
interface VmixButtonProps {
  matchId: string
  courtNumber?: number | null
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
}

// Обновим функцию компонента, чтобы она возвращала только одну кнопку:
export function VmixButton({ matchId, courtNumber, className = "", size = "default" }: VmixButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    window.location.href = `/vmix-settings/${matchId}`
  }

  return (
    <Button variant="outline" onClick={handleClick} className={className} size={size}>
      <ExternalLink className="mr-2 h-4 w-4" />
      vMix настройки
    </Button>
  )
}
