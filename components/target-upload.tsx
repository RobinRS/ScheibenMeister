"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Camera, ImagePlus, Upload, Loader2, PlusCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { createWorker, PSM } from 'tesseract.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { clear } from "console"

export function TargetUpload ({ shootData, set }: { shootData: any, set: React.Dispatch<React.SetStateAction<any>> }) {
  const [file, setFile] = useState<File | null>(null)
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [rem, setRem] = useState(0)
  const [wPercentage, setWidthPercentage] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [newResult, setNewResult] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    setRem(parseFloat(getComputedStyle(document.documentElement).fontSize))
    const handleResize = () => {
      const width = window.innerWidth
      setWidthPercentage(width / 100)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
  }, [])


  const tesseractWorker = async (fileParam: File) => {
    const worker = await createWorker('deu', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          setProgress(m.progress * 100)
        }
      },
    });

    await worker.setParameters({
      tessedit_char_whitelist: '0123456789.,WertungLGiga',
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
    });
    try {
      const res = await worker.recognize(file == null ? fileParam : file, { rotateAuto: true }, { blocks: true, box: true });

      const { data: { text, box, blocks } } = res;
      const lines = text.split('\n');

      const canvas = document.getElementById("canvas") as HTMLCanvasElement;
      const context = canvas.getContext("2d");
      if (!context) {
        console.error("Canvas context not found");
        return;
      }
      blocks?.forEach((block: any) => {
        const { x0, y0, x1, y1 } = block.bbox;
        context.strokeStyle = 'red';
        context.lineWidth = 2;
        context.strokeRect(x0, y0, x1 - x0, y1 - y0);
        // Draw the text above the bounding box
        context.fillStyle = 'red';
        context.font = '20px Arial';
        context.fillText(block.text, x0, y0 - 5);
      })

      // Group blocks by near y coordinates
      const groupedBlocks: { [key: string]: any[] } = {};
      blocks?.forEach((block: any) => {
        const key = Math.round(block.bbox.y0 / 10) * 10; // Group by y coordinate rounded to nearest 10
        if (!groupedBlocks[key]) {
          groupedBlocks[key] = [];
        }
        groupedBlocks[key].push(block);
      });
      console.log("Grouped blocks:", groupedBlocks);





      const scores = lines.map(line => {
        const match = line.match(/(\d+(\.\d+)?)/);
        if (match) {
          return parseFloat(match[0]);
        }
        return null;
      }).filter(score => score !== null);
      let fScores = scores.filter(score => score >= 80 && score <= 120).map(score => parseFloat(score.toFixed(1)));

      console.log(fScores);
      if (fScores.length === 0) {
        fScores = [0, 0, 0, 0];
        toast({
          title: "Fehlgeschlagen",
          description: "Keine gültigen Treffer gefunden. Bitte überprüfen Sie das Bild.",
          action: (
            <Button variant="outline" onClick={() => {
              setIsProcessing(false);
              setProgress(0);
              setNewResult({});
              document.getElementById("takePicture")?.click();
            }}>
              <span>Erneut versuchen</span>
            </Button>
          )
        }
        );
      }
      if (fScores.length > 4) {
        fScores = fScores.slice((fScores.length - 4), fScores.length)
      }


      setIsProcessing(false)
      const clone = { ...shootData }
      setNewResult({
        id: "" + clone.counter,
        datum: new Date().toLocaleString(),
        ergebnis: fScores,
        avgRunde: (fScores.reduce((a, b) => a + b, 0) / fScores.length).toFixed(1),
        waffenId: clone.aktuelleWaffe.id
      });

    } catch (error) {
      console.error(error);
    } finally {
      await worker.terminate();
    }
  }

  const insertNewResult = () => {
    const clone = { ...shootData }
    debugger;
    clone.counter = parseInt(clone.counter) + 1;
    clone.schussDaten.push(newResult);
    clone.aktuelleSchussDaten = { id: "" + clone.counter };
    set(clone);
    setNewResult({});
    setDialogOpen(false);
  }

  return (
    <Card className="md:w-full overflow-x-hidden">
      <CardHeader>
        <div className="flex flex-row justify-between w-full">
          <div className="flex flex-col justify-between">
            <CardTitle>{shootData.waffen?.find((a: { id: string }) => a.id == shootData.aktuelleWaffe.id).name}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-block">
                <CardDescription className="float-start w-full text-left">Ergebniss hinzufügen</CardDescription>
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
                    {weapon.name !== '' ? weapon.name : 'Gewehr ' + weapon.id}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Camera className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="">
                <DialogHeader>
                  <DialogTitle>Ergebniss hinzufügen</DialogTitle>
                  <DialogDescription>
                    Bild aufnehmen oder hochladen {videoStream !== null}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col mx-auto w-full h-full">
                  <canvas height={rem * 24 * 5} width={wPercentage * 80 * 5} className="bg-gray-200 rounded-lg w-full h-96" id="canvas" />
                  <video height={rem * 24 * 5} width={wPercentage * 80 * 5} className="hidden z-50 rounded-lg w-full h-96" id="videoStream" playsInline muted />
                  <div className="flex justify-between items-center mt-2">
                    <Button variant="outline" id="takePicture" className="mr-2 w-1/2" onClick={() => {
                      const canvas = document.getElementById("canvas") as HTMLCanvasElement;
                      const video = document.getElementById("videoStream") as HTMLVideoElement;
                      video.width = canvas.width;
                      video.height = canvas.height;
                      navigator.mediaDevices.getUserMedia({
                        audio: false,
                        video: {
                          facingMode: "environment", // Use rear camera
                          width: { ideal: 1280 },
                          height: { ideal: 720 },
                        },
                      })
                        .then((stream) => {
                          video.srcObject = stream;
                          setVideoStream(stream);
                          video.play();
                          console.log("Camera started");
                          const imgOverlay = new Image();
                          imgOverlay.src = "/overlay.png"; // Optional: Add an overlay image
                          imgOverlay.onload = () => {
                            const context = canvas.getContext("2d");
                            if (context) {
                              context.drawImage(imgOverlay, 0, 0, canvas.width, canvas.height);
                            }
                          }

                          window.interval = setInterval(() => {
                            const canvas = document.getElementById("canvas") as HTMLCanvasElement;
                            const context = canvas.getContext("2d");
                            if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
                              context.clearRect(0, 0, canvas.width, canvas.height);
                              const aspectRatio = video.videoWidth / video.videoHeight;
                              const newWidth = (canvas.width);
                              const newHeight = newWidth / aspectRatio;
                              context.drawImage(video, 0, 0, newWidth, newHeight);
                              if (imgOverlay.complete) {
                                context.drawImage(imgOverlay, 0, 0, canvas.width, canvas.height);
                              }
                            }
                          }, 1000 / 25); // 30 FPS
                        })
                        .catch((err) => console.error("Error accessing camera: ", err));
                    }

                    }>
                      <Camera className="mr-2 w-4 h-4" />
                      Aufnehmen
                    </Button>
                    <Button variant="outline" className="ml-2 w-1/2" onClick={() => {
                      const input = document.getElementById("preview-upload") as HTMLInputElement;
                      input.click();
                    }}>
                      <input type="file" id="preview-upload" accept="image/*" className="hidden" onChange={(e) => {
                        const video = document.getElementById("videoStream") as HTMLVideoElement;
                        video.pause();
                        videoStream?.getTracks().forEach(track => track.stop());

                        setIsProcessing(false);
                        setProgress(0);
                        setNewResult({});

                        const targetFile = e.target.files?.[0];
                        if (targetFile) {
                          console.log("Selected file:", targetFile);
                          if (targetFile.type.startsWith("image/")) {
                            console.log("Selected file:", targetFile);
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.getElementById("canvas") as HTMLCanvasElement;
                                const context = canvas.getContext("2d");
                                if (context) {
                                  console.log("Context not null");

                                  context.clearRect(0, 0, canvas.width, canvas.height);
                                  const aspectRatio = img.width / img.height;
                                  const newWidth = canvas.width;
                                  const newHeight = newWidth / aspectRatio;
                                  context.drawImage(img, 0, 0, newWidth, newHeight);
                                  console.log("Image drawn on canvas");
                                }
                              };
                              img.src = event.target?.result as string;
                            };
                            reader.readAsDataURL(targetFile);
                          }
                        }
                      }}></input>
                      <ImagePlus className="mr-2 w-4 h-4" />
                      Galerie
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  {Object.keys(newResult).length == 0 && <Button type="submit" onClick={() => {
                    clearInterval(window.interval);
                    const video = document.getElementById("videoStream") as HTMLVideoElement;
                    video.pause();
                    videoStream?.getTracks().forEach(track => track.stop());

                    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
                    const fileStream = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
                    const byteString = atob(fileStream.split(',')[1]);
                    const ab = new ArrayBuffer(byteString.length);
                    const ia = new Uint8Array(ab);
                    for (let i = 0; i < byteString.length; i++) {
                      ia[i] = byteString.charCodeAt(i);
                    }
                    const blob = new Blob([ab], { type: "image/png" });
                    const file = new File([blob], "target.png", { type: "image/png" });
                    setTimeout(() => {
                      setFile(file);
                    }, 500);

                    setTimeout(() => {
                      console.log("File ready for processing:", file);
                      if (!file) return;
                      console.log("File selected:", file);
                      setIsProcessing(true);
                      setProgress(0);
                      tesseractWorker(file);
                    }, 1000);
                  }}>Auswerten</Button>}


                  {Object.keys(newResult).length > 0 && (
                    <Button className="mt-2" type="submit" onClick={() => {
                      insertNewResult();
                    }}>Ergebniss speichern</Button>
                  )}

                  {Object.keys(newResult).length > 0 && (
                    newResult.ergebnis && newResult.ergebnis.length > 0 && (
                      <div className="flex flex-row justify-evenly gap-2">
                        {newResult.ergebnis.map((score: number, index: number) => (
                          <input
                            type="number"
                            className="p-1 border rounded w-20 text-center"
                            value={score}
                            key={index}
                            onChange={(e) => {
                              const newScores = [...newResult.ergebnis];
                              newScores[index] = parseFloat(e.target.value);
                              setNewResult({ ...newResult, ergebnis: newScores });
                            }}
                          />))}

                      </div>
                    ))}
                  <PlusCircle className="mr-2 w-4 h-4" onClick={() => {
                    const ergebnis = newResult.ergebnis || [];
                    ergebnis.push(0);
                    setNewResult({ ...newResult, ergebnis });
                  }} />


                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Verarbeitung läuft...</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>


          </div>
        </div>
      </CardHeader>
    </Card >
  )
}
