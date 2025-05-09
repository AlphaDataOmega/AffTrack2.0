"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { addDays, format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithRangeProps {
  className?: string
  date?: DateRange | undefined
  onDateChange?: (date: DateRange | undefined) => void
}

export function DatePickerWithRange({
  className,
  date,
  onDateChange
}: DatePickerWithRangeProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(date)

  React.useEffect(() => {
    setDateRange(date)
  }, [date])

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range)
    onDateChange?.(range)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[260px] justify-start text-left font-normal bg-white border-gray-200",
              !dateRange && "text-gray-500"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleDateSelect}
            numberOfMonths={2}
          />
          <div className="p-3 border-t border-gray-100">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleDateSelect({
                  from: new Date(),
                  to: addDays(new Date(), 7)
                })}
              >
                Last 7 days
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleDateSelect({
                  from: new Date(),
                  to: addDays(new Date(), 30)
                })}
              >
                Last 30 days
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 