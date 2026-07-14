import * as React from "react"
import { format } from "date-fns"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import type { GetScrobblesRecent200OneItemsItem } from "@/lib/api/generated/model"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const trendConfig = {
  plays: { label: "Plays", color: "var(--shop-amber)" },
} satisfies ChartConfig

const genreConfig = {
  plays: { label: "Plays", color: "var(--shop-oxblood)" },
} satisfies ChartConfig

function trendData(scrobbles: GetScrobblesRecent200OneItemsItem[]) {
  const counts = new Map<string, number>()
  for (const s of scrobbles) {
    const key = format(new Date(s.playedAt), "yyyy-MM-dd")
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, plays]) => ({ plays, label: format(new Date(date), "MMM d") }))
}

function genreData(scrobbles: GetScrobblesRecent200OneItemsItem[]) {
  const counts = new Map<string, number>()
  for (const s of scrobbles) {
    const genre = s.track?.album?.genre ?? "Unknown"
    counts.set(genre, (counts.get(genre) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([genre, plays]) => ({ genre, plays }))
}

export function ListeningTrendChart({
  scrobbles,
}: {
  scrobbles: GetScrobblesRecent200OneItemsItem[]
}) {
  const data = React.useMemo(() => trendData(scrobbles), [scrobbles])

  return (
    <ChartContainer config={trendConfig} className="aspect-auto h-48 w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={24} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="plays" fill="var(--color-plays)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}

export function TopGenresChart({
  scrobbles,
}: {
  scrobbles: GetScrobblesRecent200OneItemsItem[]
}) {
  const data = React.useMemo(() => genreData(scrobbles), [scrobbles])

  return (
    <ChartContainer config={genreConfig} className="aspect-auto h-48 w-full">
      <BarChart data={data} layout="vertical">
        <CartesianGrid horizontal={false} />
        <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
        <YAxis dataKey="genre" type="category" tickLine={false} axisLine={false} width={80} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="plays" fill="var(--color-plays)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
