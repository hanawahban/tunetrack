import * as React from "react"
import { format } from "date-fns"

import type { GetScrobblesRecent200OneItemsItem } from "@/lib/api/generated/model"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"

function countsByDay(scrobbles: GetScrobblesRecent200OneItemsItem[]) {
  const counts = new Map<string, number>()
  for (const s of scrobbles) {
    const key = format(new Date(s.playedAt), "yyyy-MM-dd")
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

export function ListeningCalendar({
  scrobbles,
}: {
  scrobbles: GetScrobblesRecent200OneItemsItem[]
}) {
  const counts = React.useMemo(() => countsByDay(scrobbles), [scrobbles])

  return (
    <Calendar
      components={{
        DayButton: (props) => {
          const count = counts.get(format(props.day.date, "yyyy-MM-dd")) ?? 0
          return (
            <CalendarDayButton {...props}>
              {props.children}
              {count > 0 && <span>{count}</span>}
            </CalendarDayButton>
          )
        },
      }}
    />
  )
}
