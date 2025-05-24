"use client";

import type React from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { Crosshair, BarChart3, History, Settings } from "lucide-react"
import Image from "next/image"
import { TargetUpload } from "@/components/target-upload"
import { TargetAnalysis } from "@/components/target-analysis"
import { HistoricalData } from "@/components/historical-data"
import { useState, useEffect } from "react";
import { Toaster } from "./ui/toaster";

export function DashboardShell () {

  const [data, setData] = useState({});

  useEffect(() => {
    const localData = localStorage.getItem("shootData");
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
  }, [])


  const changer = (dataShoot) => {
    localStorage.setItem("shootData", JSON.stringify(dataShoot));
    setData(dataShoot);
  }

  return Object.keys(data).length > 0 ? (
    <div className="relative flex flex-col flex-grow w-screen min-h-screen overflow-x-hidden">
      <Toaster />
      <header className="top-0 z-10 sticky bg-background border-b w-screen md:w-full overflow-x-hidden">
        <div className="flex items-center px-4 md:px-6 h-16">
          <div className="flex items-center gap-2 font-semibold">
            <Image src={"/ssvh.png"} className="rounded-lg w-auto h-10" alt="Logo" width={32} height={32} />
            <span>Scheiben Meister</span>
          </div>
          <nav className="flex items-center gap-4 md:gap-6 ml-auto">
            <ModeToggle shootData={data} set={changer} />
          </nav>
        </div>
      </header>
      <div className="flex flex-1 w-screen">
        <main className="flex-1 p-4 w-full">
          <div className="">
            <TargetUpload shootData={data} set={changer} />
            <TargetAnalysis shootData={data} set={changer} className="mt-2" />
          </div>
          <div className="mt-6">
            <HistoricalData shootData={data} set={changer} />
          </div>
        </main>
      </div>
    </div>
  ) : (<></>)
}
