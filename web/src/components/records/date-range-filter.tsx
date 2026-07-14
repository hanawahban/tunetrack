import * as React from "react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function DateRangeFilter({
  range,
  onRangeChange,
}: {
  range: DateRange | undefined
  onRangeChange: (range: DateRange | undefined) => void
}) {
  const [open, setOpen] = React.useState(false)

  const label = range?.from
    ? range.to && range.to.getTime() !== range.from.getTime()
      ? `${format(range.from, "MMM d, yyyy")} – ${format(range.to, "MMM d, yyyy")}`
      : format(range.from, "MMM d, yyyy")
    : "All time"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" className="justify-start font-normal">
            <CalendarIcon className="mr-2 size-4 text-shop-amber" />
            {label}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="range"
          captionLayout="dropdown"
          numberOfMonths={2}
          selected={range}
          onSelect={onRangeChange}
        />
        {range?.from && (
          <div className="border-t border-border p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                onRangeChange(undefined)
                setOpen(false)
              }}
            >
              Clear range
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
