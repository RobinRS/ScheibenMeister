"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Mock data for demonstration


export function TargetAnalysis ({ shootData, set, className }: { shootData: any, set: React.Dispatch<React.SetStateAction<any>>, className?: string }) {

  const chartConfig = {} satisfies ChartConfig;
  const chartData = [];
  const lastWeaponId = {};

  // Last 30 results of weapons
  shootData.schussDaten.reverse().map((data) => {
    if (!lastWeaponId[data.waffenId]) {
      lastWeaponId[data.waffenId] = [];
    }

    if (lastWeaponId[data.waffenId].length < 30) {
      lastWeaponId[data.waffenId].push(data);
    } else {
      lastWeaponId[data.waffenId].shift();
      lastWeaponId[data.waffenId].push(data);
    }
  })

  Object.keys(lastWeaponId).map((weaponId) => {
    const weaponData = lastWeaponId[weaponId];
    console.log(shootData);
    const weaponName = shootData.waffen.find((a) => a.id == weaponId)?.name || "Gewehr " + weaponId;
    const weaponColor = shootData.waffen.find((a) => a.id == weaponId)?.farbe || "hsl(var(--chart-" + weaponId + "))";

    for (let i = 0; i < weaponData.length; i++) {
      const obj = { id: i };
      obj[weaponName] = weaponData[i].ergebnis.reduce((partialSum, a) => partialSum + a, 0);

      const idObj = chartData.find((a) => a.id == i);
      if (idObj) {
        idObj[weaponName] = obj[weaponName];
      } else {
        chartData.push(obj);
      }
    }

    chartConfig[weaponName] = {
      color: weaponColor,
      name: weaponName,
    };
  });



  const akErgebnis = shootData.schussDaten?.find((a) => a.id == shootData.aktuelleSchussDaten.id);

  const wd = (a, b) => {
    return a == undefined ? 'Keine Daten' : b;
  }




  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Statstik</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="id"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
            />
            <ChartLegend content={<ChartLegendContent />} />

            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent indicator="dot" />}
            />
            {chartData.length > 0 && Object.keys(chartData[0]).length > 0 && Object.keys(chartData[0]).map((weaponName) => {
              if (weaponName !== "id") {
                console.log(weaponName, chartConfig[weaponName]);
                return (
                  <Area
                    key={weaponName}
                    dataKey={weaponName}
                    type="natural"
                    fill={chartConfig[weaponName].color}
                    fillOpacity={0.4}
                    stroke={chartConfig[weaponName].color}
                    stackId="a"><LabelList
                      position="top"
                      offset={12}
                      className="fill-foreground"
                      fontSize={12}
                    />
                  </Area>
                )
              }
            })}


          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
