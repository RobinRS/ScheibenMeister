"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

import { CartesianGrid, LabelList, LineChart, Line, XAxis, YAxis, Legend } from "recharts"

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
      obj[weaponName] = parseFloat(weaponData[i].ergebnis.reduce((partialSum, a) => partialSum + a, 0)).toFixed(1);

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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Statstik</CardTitle>
      </CardHeader>
      <CardContent className="px-1 py-4">
        <ChartContainer config={chartConfig}>
          <LineChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <Legend />

            <YAxis type="number" domain={['dataMin - 25', 'dataMax + 25']} yAxisId="left" tickCount={3} />
            <YAxis type="number" domain={['dataMin - 25', 'dataMax + 25']} yAxisId="right" orientation="right" tickCount={3} />

            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent indicator="dot" nameKey="name" />}
            />
            {chartData.length > 0 && Object.keys(chartData[0]).length > 0 && Object.keys(chartData[0]).map((weaponName, idx) => {
              if (weaponName !== "id") {
                console.log(weaponName, chartConfig[weaponName]);
                return (
                  <Line
                    key={weaponName}
                    dataKey={weaponName}
                    type="natural"
                    yAxisId={idx % 2 === 0 ? "left" : "right"}
                    fill={chartConfig[weaponName].color}
                    fillOpacity={0.4}
                    stroke={chartConfig[weaponName].color}>
                    <LabelList
                      position={idx % 2 === 0 ? "top" : "bottom"}
                      offset={12}
                      className="fill-foreground"
                      fontSize={16}
                    />
                  </Line>
                )
              }
            })}


          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
