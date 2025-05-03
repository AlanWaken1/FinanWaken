"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

const CustomHead = () => {
  return (
    <div className="flex w-full justify-between mb-2 px-1">
      {["L", "M", "X", "J", "V", "S", "D"].map((day, i) => (
        <div
          key={i} 
          className="text-muted-foreground w-9 font-medium text-xs text-center"
        >
          {day}
        </div>
      ))}
    </div>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <div className="space-y-4">
      <CustomHead />
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "relative flex justify-center items-center pb-4",
          caption_label: "text-base font-medium",
          nav: "flex items-center space-x-1",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-8 w-8 p-0 opacity-70 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse",
          head_row: "hidden",
          row: "flex w-full mt-2",
          cell: "relative p-0 text-center rounded-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal rounded-md aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground"
          ),
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent/50 text-accent-foreground",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          day_hidden: "invisible",
          ...classNames,
        }}
        {...props}
      />
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar } 