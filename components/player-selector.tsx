"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getPlayers } from "@/lib/player-storage"
import { useLanguage } from "@/contexts/language-context"

interface PlayerSelectorProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function PlayerSelector({ label, value, onChange }: PlayerSelectorProps) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setLoading(true)
        const loadedPlayers = await getPlayers()
        setPlayers(loadedPlayers)
      } catch (error) {
        console.error("Failed to load players", error)
      } finally {
        setLoading(false)
      }
    }

    loadPlayers()
  }, [])

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {value ? value : t("players.selectPlayer")}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={t("players.searchPlayer")} />
            <CommandList>
              <CommandEmpty>{loading ? t("common.loading") : t("players.playerNotFound")}</CommandEmpty>
              <CommandGroup>
                {players.map((player) => (
                  <CommandItem
                    key={player.id}
                    value={player.name}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === player.name ? "opacity-100" : "opacity-0")} />
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
