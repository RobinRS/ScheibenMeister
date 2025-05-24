"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Download } from "lucide-react"

// Mock data for demon

export function HistoricalData ({ shootData, set }: { shootData: any, set: React.Dispatch<React.SetStateAction<any>> }) {
  const [searchTerm, setSearchTerm] = useState("")
  const pageSize = 10 // Define the number of items per page
  const [currentPage, setCurrentPage] = useState(1)

  const filteredData = shootData.schussDaten?.filter(
    (item) =>
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.datum.toLowerCase().includes(searchTerm.toLowerCase()),
  )



  const changeShootingData = (e: React.ChangeEvent<HTMLInputElement>, id, index) => {
    const { value, dataset } = e.target
    console.log("changeShootingData", value, dataset)
    for (let i = 0; i < shootData.schussDaten.length; i++) {
      if (shootData.schussDaten[i].id === id) {
        shootData.schussDaten[i].ergebnis[index] = parseFloat(value)
        //shootData.schussDaten[i].avg = shootData.schussDaten[i].ergebnis.reduce((a, b) => a + b, 0) / shootData.schussDaten[i].ergebnis.length
        break
      }
    }
    set({ ...shootData, schussDaten: shootData.schussDaten })
    console.log("Updated shooting data:", shootData.schussDaten)
    // localStorage.setItem("shootData", JSON.stringify({ ...shootData, schussDaten: shootData.schussDaten }))
  }


  return (
    <Card className="">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Verlauf</CardTitle>
          <CardDescription></CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 w-4 h-4" />
          Export
        </Button>
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
              <SelectValue placeholder="Gewähr Filter" />
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
                <TableHead>Datum</TableHead>
                <TableHead>Waffe</TableHead>
                <TableHead>Avg.</TableHead>
                <TableHead colSpan={4}>Runden</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData?.reverse().slice(currentPage - 1 * pageSize, currentPage * pageSize).map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.datum.includes(",") ? item.datum.split(",")[0] : item.datum}</TableCell>
                  <TableCell>{shootData.waffen?.filter(w => w.id == item.waffenId)[0].name}</TableCell>
                  <TableCell>
                    <Badge variant={item.avg >= 9 ? "default" : "outline"}>{item.avg}</Badge>
                  </TableCell>
                  <TableCell><Input type="number" dataset-index={0} className="w-20 text-black" value={item.ergebnis[0]} onChange={(e) => { changeShootingData(e, item.id, 0) }} /></TableCell>
                  <TableCell><Input type="number" dataset-index={0} className="w-20 text-black" value={item.ergebnis[1]} onChange={(e) => { changeShootingData(e, item.id, 1) }} /></TableCell>
                  <TableCell><Input type="number" dataset-index={0} className="w-20 text-black" value={item.ergebnis[2]} onChange={(e) => { changeShootingData(e, item.id, 2) }} /></TableCell>
                  <TableCell><Input type="number" dataset-index={0} className="w-20 text-black" value={item.ergebnis[3]} onChange={(e) => { changeShootingData(e, item.id, 3) }} /></TableCell>
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
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="w-4 h-4" />
            Vorherige
          </Button>
          <Button variant="outline" size="sm" disabled>
            Nächste
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
