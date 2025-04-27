"use client";

import type React from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { Crosshair, BarChart3, History, Settings } from "lucide-react"
import Image from "next/image"
import { TargetUpload } from "@/components/target-upload"
import { TargetAnalysis } from "@/components/target-analysis"
import { HistoricalData } from "@/components/historical-data"
import { useState } from "react";

export function DashboardShell () {

  const [data, setData] = useState({});

  if (Object.keys(data).length === 0) {
    if (typeof window !== "undefined") {
      const localData = localStorage.getItem("shootData");
      console.log("localData", localData);
      if (localData !== null) {
        const parsedData = JSON.parse(localData);
        parsedData.aktuelleSchussDaten.id = '-1'
        setData(parsedData);
      } else {
        setData({
          waffen: [
            { id: "1", name: "Luftgewehr" },
            { id: "2", name: "Zimmerstutzen" },
          ],
          aktuelleWaffe: { id: "1" },
          counter: 0,
          schussDaten: [
            //{ id: "1", datum: "2023-10-01", ergebnis: [102.2, 99.4, 89.2, 92.4], avg: 99.7, waffenId: "1", },
          ],
          aktuelleSchussDaten: { id: "0" },
        });
      }
      console.log("localData", data);
    }
  }

  const changer = (dataShoot) => {
    localStorage.setItem("shootData", JSON.stringify(dataShoot));
    setData(dataShoot);
  }

  return (
    <div className="relative flex flex-col flex-grow w-screen min-h-screen overflow-x-hidden">
      <header className="top-0 z-10 sticky bg-background border-b w-screen md:w-full overflow-x-hidden">
        <div className="flex items-center px-4 md:px-6 h-16">
          <div className="flex items-center gap-2 font-semibold">
            <Image src={"/ssvh.png"} className="rounded-lg w-auto h-10" alt="Logo" width={32} height={32} />
            <span>Scheiben Meister</span>
          </div>
          <nav className="flex items-center gap-4 md:gap-6 ml-auto">
            <ModeToggle />
          </nav>
        </div>
      </header>
      <div className="flex flex-1">
        <main className="flex-1 p-4 md:p-6">
          <div className="gap-2 grid md:grid-cols-2">
            <TargetUpload shootData={data} set={changer} />
            <TargetAnalysis shootData={data} set={changer} />
          </div>
          <div className="mt-6">
            <HistoricalData shootData={data} set={changer} />
          </div>
        </main>
      </div>
    </div>
  )
}
