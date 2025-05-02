"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useLanguage } from "@/contexts/language-context"

type PlayerSelectorProps = {
  players: Array<{ id: string; name: string }>
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onPlayersChange?: (players: Array<{ id: string; name: string }>) => void
  label?: string
}

export function PlayerSelector({ players, value, onChange, placeholder, onPlayersChange, label }: PlayerSelectorProps) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)

  const selectedPlayer = players.find((player) => player.id === value)
  const defaultPlaceholder = t ? t("players.selectPlayer") : "Выберите игрока"

  // Если передан обработчик onPlayersChange, вызываем его при изменении списка игроков
  useEffect(() => {
    if (onPlayersChange) {
      onPlayersChange(players)
    }
  }, [players, onPlayersChange])

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {selectedPlayer ? selectedPlayer.name : placeholder || defaultPlaceholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={t ? t("players.searchPlayer") : "Поиск игрока..."} />
            <CommandList>
              <CommandEmpty>{t ? t("players.playerNotFound") : "Игрок не найден"}</CommandEmpty>
              <CommandGroup>
                {players.map((player) => (
                  <CommandItem
                    key={player.id}
                    value={player.name}
                    onSelect={() => {
                      onChange(player.id)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === player.id ? "opacity-100" : "opacity-0")} />
                    {player.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
