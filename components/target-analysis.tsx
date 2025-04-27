"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Mock data for demonstration


export function TargetAnalysis ({ shootData, set }: { shootData: any, set: React.Dispatch<React.SetStateAction<any>> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeTab, setActiveTab] = useState("visual")

  useEffect(() => {
    if (activeTab === "visual") {
      renderTargetCanvas()
    }
  }, [activeTab])

  const renderTargetCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) * 0.4

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw target rings
    const rings = 10
    for (let i = rings; i > 0; i--) {
      const ringRadius = (i / rings) * radius
      ctx.beginPath()
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)

      // Alternate colors for better visibility
      if (i % 2 === 0) {
        ctx.fillStyle = "#f8fafc" // Light background
      } else {
        ctx.fillStyle = "#f1f5f9" // Slightly darker
      }

      ctx.fill()
      ctx.strokeStyle = "#94a3b8"
      ctx.lineWidth = 1
      ctx.stroke()

      // Add score numbers
      if (i > 0) {
        ctx.fillStyle = "#64748b"
        ctx.font = "12px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText((11 - i).toString(), centerX, centerY - ringRadius + 8)
      }
    }

    // Draw bullseye
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.1, 0, Math.PI * 2)
    ctx.fillStyle = "#dc2626"
    ctx.fill()

    // Draw shot markers
    /* mockTargetData.shots.forEach((shot) => {
       const shotX = centerX + shot.x * radius * 2
       const shotY = centerY + shot.y * radius * 2
 
       // Draw shot hole
       ctx.beginPath()
       ctx.arc(shotX, shotY, 5, 0, Math.PI * 2)
       ctx.fillStyle = "#000000"
       ctx.fill()
 
       // Draw score label
       ctx.fillStyle = "#ffffff"
       ctx.font = "10px sans-serif"
       ctx.textAlign = "center"
       ctx.textBaseline = "middle"
       ctx.fillText(shot.score.toString(), shotX, shotY)
     })
       */
  }

  const akErgebnis = shootData.schussDaten?.find((a) => a.id == shootData.aktuelleSchussDaten.id);

  const wd = (a, b) => {
    return a == undefined ? 'Keine Daten' : b;
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Auswertung</CardTitle>
        <CardDescription>Mustererkennung</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="data" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="visual">Visuell</TabsTrigger>
            <TabsTrigger value="data">Daten</TabsTrigger>
          </TabsList>
          <TabsContent value="visual" className="pt-4">
            <div className="flex justify-center items-center w-full max-h-[300px] aspect-square">
              <canvas ref={canvasRef} width={300} height={300} className="border rounded-md" />
            </div>
          </TabsContent>
          <TabsContent value="data" className="pt-4">
            <div className="space-y-4">
              <div className="gap-4 grid grid-cols-2">
                <div className="space-y-2">
                  <p className="font-medium text-sm">Ergebniss</p>
                  <div className="font-bold text-3xl">{wd(akErgebnis, akErgebnis?.avg)}{akErgebnis && '/100'}</div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-sm">{akErgebnis && 'Runden'}</p>
                <div className="flex flex-wrap gap-2">
                  {akErgebnis && shootData.schussDaten?.find((a) => a.id == shootData.aktuelleSchussDaten.id).ergebnis.map((score, idx) => {
                    return (
                      <Badge key={score + "-" + idx} variant="outline" className="px-3 py-1">
                        {score}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              <div className="gap-4 grid grid-cols-2 text-sm">
                <div>
                  <span className="font-medium">{akErgebnis && 'Waffe:'}</span> {shootData.waffen?.find((a) => a.id == akErgebnis?.waffenId)?.name}
                </div>
                <div>
                  <span className="font-medium">{akErgebnis && 'Datum:'}</span> {shootData.schussDaten?.find((a) => a.id == shootData.aktuelleSchussDaten.id)?.datum}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
