"use client"

import { Moon, Settings, Sun, Trash2 } from "lucide-react"
import React, { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "./ui/input"


export function ModeToggle ({ shootData, set }: { shootData: any, set: React.Dispatch<React.SetStateAction<any>> }) {

  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  return (<>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="w-[1.2rem] h-[1.2rem] rotate-0 scale-100 transition-all" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => { setDialogOpen(!dialogOpen) }}>Gewehr ändern</DropdownMenuItem>
        <DropdownMenuItem>Daten exportieren</DropdownMenuItem>
        <DropdownMenuItem onClick={() => { localStorage.removeItem("shootData") }}>Zurücksetzen</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gewehr anpassen</DialogTitle>
        </DialogHeader>
        <div className="gap-4 grid py-4">
          <ul className="flex flex-col gap-4">
            {shootData.waffen.map((w) => (
              <li key={w.id} className="flex items-center gap-2">
                <Input
                  type="text"
                  value={(w.name !== '' ? w.name : 'Gewehr ' + w.id)}
                  onChange={(e) => {
                    const updatedWaffen = shootData.waffen.map((item) =>
                      item.id === w.id ? { ...item, name: e.target.value } : item
                    );
                    set({ ...shootData, waffen: updatedWaffen });
                  }}
                />
                <Button variant="ghost" size="icon" onClick={() => {
                  if (w.id === shootData.aktuelleWaffe.id) {
                    toast({
                      title: "Fehlgeschlagen",
                      description: "Aktuelles Gewehr kann nicht gelöscht werden",
                      action: (
                        <ToastAction altText="Goto schedule to undo">...</ToastAction>
                      ),
                    })
                    return;
                  }
                  const updatedWaffen = shootData.waffen.filter(item => item.id !== w.id);
                  set({ ...shootData, waffen: updatedWaffen });
                }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter>

          <Button type="submit" onClick={() => { setDialogOpen(false) }} className="mt-2">Speichern</Button>
          <Button type="button" variant={"outline"} onClick={() => {
            const newId = (Math.max(...shootData.waffen.map(w => parseInt(w.id))) + 1).toString();
            const newWeapon = { id: newId, name: 'Gewehr ' + newId };
            set({ ...shootData, waffen: [...shootData.waffen, newWeapon] });
          }}>Neues Gewehr</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog></>
  )
}
