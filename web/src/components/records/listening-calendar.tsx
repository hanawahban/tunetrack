import * as React from "react"
import { format } from "date-fns"

import type { GetScrobblesRecent200OneItemsItem } from "@/lib/api/generated/model"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"

function countsByDay(scrobbles: GetScrobblesRecent200OneItemsItem[]) {
  const counts = new Map<string, number>()
  let max = 1
  for (const s of scrobbles) {
    const key = format(new Date(s.playedAt), "yyyy-MM-dd")
    const next = (counts.get(key) ?? 0) + 1
    counts.set(key, next)
    if (next > max) max = next
  }
  return { counts, max }
}

// A lit day glows warmer the more it was played; an empty day stays dark and
// inert. Applied as inline styles (not classes) so the ghost button's hover
// rule can't repaint the heat — this is a data surface, not a date picker.
function heatStyle(count: number, max: number): React.CSSProperties | undefined {
  if (count <= 0) return undefined
  const ratio = count / max
  const level = ratio > 0.75 ? 4 : ratio > 0.5 ? 3 : ratio > 0.25 ? 2 : 1
  const pct = [18, 34, 58, 88][level - 1]
  return {
    backgroundColor: `color-mix(in oklch, var(--shop-amber) ${pct}%, transparent)`,
    // dark ink reads on the brighter cells, warm paper on the dim ones
    color: level >= 3 ? "var(--shop-ink)" : "var(--shop-paper)",
  }
}

export function ListeningCalendar({
  scrobbles,
}: {
  scrobbles: GetScrobblesRecent200OneItemsItem[]
}) {
  const { counts, max } = React.useMemo(() => countsByDay(scrobbles), [scrobbles])

  return (
    <Calendar
      // ~52px cells fill the col-span-2 panel (default 28px looked lost in it)
      className="mx-auto [--cell-size:3.25rem]"
      components={{
        DayButton: (props) => {
          const count = counts.get(format(props.day.date, "yyyy-MM-dd")) ?? 0
          return (
            <CalendarDayButton {...props} style={heatStyle(count, max)}>
              {props.children}
              {count > 0 && <span>{count}</span>}
            </CalendarDayButton>
          )
        },
      }}
    />
  )
}
