"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { createWorker, PSM } from 'tesseract.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"


export function TargetUpload ({ shootData, set }: { shootData: any, set: React.Dispatch<React.SetStateAction<any>> }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)


  const tesseractWorker = async () => {
    const worker = await createWorker('deu', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          setProgress(m.progress * 100)
        }
      },
    });


    await worker.setParameters({
      tessedit_char_whitelist: "0123456789.*",
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
    });


    console.log(file)
    if (file == null) {
      return;
    }
    try {
      const res = await worker.recognize(file);
      console.log(JSON.stringify(res.data));

      const { data: { text } } = res;
      const lines = text.split('\n');

      const scores = lines.map(line => {
        const match = line.match(/(\d+(\.\d+)?)/);
        if (match) {
          return parseFloat(match[0]);
        }
        return null;
      }).filter(score => score !== null);
      const avgScore = JSON.parse(JSON.stringify(scores)).slice((scores.length - 4), scores.length).filter((s) => s >= 7 && s <= 11.2)[0];
      let fScores = scores.filter(score => score >= 60 && score <= 150).map(score => parseFloat(score.toFixed(1)));

      console.log(fScores);
      if (fScores.length === 0) {
        console.error("No valid scores found");
        return;
      }
      if (fScores.length > 4) {
        fScores = fScores.slice((fScores.length - 4), fScores.length)
      }
      setIsProcessing(false)
      const clone = { ...shootData }
      clone.counter = parseInt(clone.counter) + 1;
      clone.schussDaten.push({ id: "" + clone.counter, datum: new Date().toLocaleString(), ergebnis: fScores, avg: avgScore, avgRunde: (fScores.reduce((a, b) => a + b, 0) / fScores.length).toFixed(1), waffenId: clone.aktuelleWaffe.id });
      clone.aktuelleSchussDaten = { id: "" + clone.counter };
      set(clone);

      if (avgScore > 9.5) {


        confetti({
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          particleCount: randomInRange(50, 100),
          origin: { y: 0.6 },
        }); s
      }


    } catch (error) {
      console.error(error);

    } finally {
      await worker.terminate();
    }
  }

  const randomInRange = (min, max) => {
    return Math.random() * (max - min) + min;
  }


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const processImage = () => {
    if (!file) return

    setIsProcessing(true)
    setProgress(0)
    tesseractWorker();
  }

  return (
    <Card className="">
      <CardHeader>
        <div className="flex flex-row justify-between w-full">
          <div className="flex flex-col justify-between">
            <CardTitle>Bild hochladen</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-block">
                <CardDescription className="float-start w-full text-left">Gewähr: {shootData.waffen?.find((a: { id: string }) => a.id == shootData.aktuelleWaffe.id).name}</CardDescription>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {shootData.waffen?.map((weapon: { id: string, name: string }) => (
                  <DropdownMenuItem
                    key={weapon.id}
                    onClick={() => {
                      const clone = { ...shootData }
                      clone.aktuelleWaffe = weapon
                      set(clone)
                    }}
                  >
                    {weapon.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            <Button onClick={processImage} disabled={!file || isProcessing} className="w-full">
              {isProcessing ? "Verarbeitung läuft..." : "Bild auswerten"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="flex flex-col justify-center items-center hover:bg-muted/50 p-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer"
          onClick={() => document.getElementById("target-upload")?.click()}
        >
          {preview ? (
            <img
              src={preview || "/placeholder.svg"}
              alt="Target preview"
              className="mb-4 max-h-[150px] object-contain"
            />
          ) : (
            <div className="flex justify-center items-center bg-muted/30 mb-4 rounded-md w-full max-h-[200px] aspect-square">
              <Upload className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
          <p className="text-muted-foreground text-sm">Klicken und Bild auswählen</p>
          <p className="mt-1 text-muted-foreground text-xs">PNG, JPG or WEBP</p>
          <input id="target-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Processing image...</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
