"use client"

import { Moon, Settings, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ModeToggle () {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="w-[1.2rem] h-[1.2rem] rotate-0 scale-100 transition-all" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => { console.log("ABC") }}>Waffe ändern</DropdownMenuItem>
        <DropdownMenuItem>Daten ändern</DropdownMenuItem>
        <DropdownMenuItem>Daten exportieren</DropdownMenuItem>
        <DropdownMenuItem onClick={() => { localStorage.removeItem("shootData") }}>Zurücksetzen</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
