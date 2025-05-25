"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Download, Pencil, Trash2 } from "lucide-react"
import { dateFromString } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Textarea } from "./ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

// Mock data for demon

export function HistoricalData ({ shootData, set }: { shootData: any, set: React.Dispatch<React.SetStateAction<any>> }) {
  const [searchTerm, setSearchTerm] = useState("")
  const pageSize = 10 // Define the number of items per page
  const [currentPage, setCurrentPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [json, setJson] = useState(JSON.stringify(shootData, null, 2))

  const filteredData = shootData.schussDaten?.filter(
    (item) =>
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.datum.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  filteredData?.sort(function (a, b) { return dateFromString(b.datum) - dateFromString(a.datum) });

  const changeShootingData = (e: React.ChangeEvent<HTMLInputElement>, id, index) => {
    for (let i = 0; i < shootData.schussDaten.length; i++) {
      if (shootData.schussDaten[i].id === id) {
        shootData.schussDaten[i].ergebnis[index] = parseFloat(e.target.value)
        //shootData.schussDaten[i].avg = shootData.schussDaten[i].ergebnis.reduce((a, b) => a + b, 0) / shootData.schussDaten[i].ergebnis.length
        break
      }
    }
    set({ ...shootData, schussDaten: shootData.schussDaten })
    // localStorage.setItem("shootData", JSON.stringify({ ...shootData, schussDaten: shootData.schussDaten }))
  }


  return (
    <Card className="">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Verlauf</CardTitle>
          <CardDescription></CardDescription>
        </div>
        <div>
          <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Pencil className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Daten ändern</DialogTitle>
              </DialogHeader>
              <Textarea rows={20} value={json} onChange={(e) => setJson(e.target.value)} />
              <DialogFooter>
                <Button variant="destructive" onClick={() => {
                  try {
                    const parsedData = JSON.parse(json);
                    set(parsedData);
                    setDialogOpen(false);
                  } catch (error) {
                    alert("Ungültiges JSON-Format");
                  }
                }}>
                  Ändern
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Abbrechen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" className="ml-2" onClick={() => {
            const csvContent = "data:text/csv;charset=utf-8," + filteredData.map(e => `${e.id},${e.datum},${e.ergebnis.join(",")}`).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "shooting_data.csv");
            document.body.appendChild(link);
            link.click();
          }}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 w-8/12">
            <Input
              placeholder="Suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Gewehrfilter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              {shootData.waffen?.map((weapon: { id: string, name: string }) => (
                <SelectItem key={weapon.id} value={weapon.name !== '' ? weapon.name : 'Gewehr ' + weapon.id}>
                  {weapon.name !== '' ? weapon.name : 'Gewehr ' + weapon.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Info</TableHead>
                <TableHead>Runden</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData?.sort(function (a, b) { return new Date(a.datum) - new Date(b.datum) }).map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex-col text-sm">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-block">
                          <p>{shootData.waffen?.filter(w => w.id == item.waffenId)[0].name}</p>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {shootData.waffen?.map((weapon: { id: string, name: string }) => (
                            <DropdownMenuItem
                              key={weapon.id}
                              onClick={() => {
                                const updatedData = shootData.schussDaten.map((d) => {
                                  if (d.id === item.id) {
                                    return { ...d, waffenId: weapon.id }
                                  }
                                  return d
                                })
                                set({ ...shootData, schussDaten: updatedData })
                              }}
                            >
                              {weapon.name !== '' ? weapon.name : 'Gewehr ' + weapon.id}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>


                      <p>{item.datum.includes(",") ? item.datum.split(",")[0] : item.datum}</p>
                      <Badge className="mt-2">{parseFloat(item.ergebnis.reduce((a, b) => a + b, 0)).toFixed(1)}</Badge>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => {
                          const updatedData = shootData.schussDaten.filter((d) => d.id !== item.id)
                          set({ ...shootData, schussDaten: updatedData })
                        }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {item.ergebnis.map((score, idx) => {
                        return (<Input key={idx} type="number" dataset-index={0} className="w-16" value={item.ergebnis[idx]} onChange={(e) => { changeShootingData(e, item.id, idx) }} />)
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(filteredData == undefined || filteredData?.length === 0) && (
                <TableRow>
                  <TableCell colSpan={8} className="py-4 text-muted-foreground text-center">
                    Kein Ergebniss gefunden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end items-center space-x-2 py-4">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            <ChevronLeft className="w-4 h-4" />
            Vorherige
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => prev + 1)} disabled={currentPage * pageSize >= filteredData?.length}>
            Nächste
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
