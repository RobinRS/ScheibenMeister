"use client"

import { useState } from "react"
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

  const filteredData = shootData.schussDaten?.filter(
    (item) =>
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.datum.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card className="">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Verlauf</CardTitle>
          <CardDescription>Historische Daten vom aktuellen Gerät</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 w-4 h-4" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Suchen Datum, Waffe, Ergebniss"
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
              <SelectItem value="all">Alle Gewähre</SelectItem>
              {shootData.waffen?.map((weapon: { id: string, name: string }) => (
                <SelectItem key={weapon.id} value={weapon.name}>
                  {weapon.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Waffe</TableHead>
                <TableHead>Avg.</TableHead>
                <TableHead>Runde 1</TableHead>
                <TableHead>Runde 2</TableHead>
                <TableHead>Runde 3</TableHead>
                <TableHead>Runde 4</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.datum}</TableCell>
                  <TableCell>{shootData.waffen?.filter(w => w.id == item.waffenId)[0].name}</TableCell>
                  <TableCell>
                    <Badge variant={item.avg >= 9 ? "default" : "outline"}>{item.avg}</Badge>
                  </TableCell>
                  <TableCell>{item.ergebnis[0]}</TableCell>
                  <TableCell>{item.ergebnis[1]}</TableCell>
                  <TableCell>{item.ergebnis[2]}</TableCell>
                  <TableCell>{item.ergebnis[3]}</TableCell>
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
