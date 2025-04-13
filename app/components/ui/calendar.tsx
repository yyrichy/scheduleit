"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Heart, X } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-red-50 rounded-lg border border-red-200", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full text-red-800",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-white text-red-600 border-red-200 hover:bg-red-100 hover:text-red-800"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell: "text-red-600 rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal hover:bg-red-100 hover:text-red-800"
        ),
        day_selected: "bg-red-600 text-white hover:bg-red-700",
        day_today: "bg-red-100 text-red-800",
        day_outside: "text-red-300",
        day_disabled: "text-red-200",
        day_range_middle: "bg-red-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => (
          <X className="w-4 h-4 text-red-600" {...props} />
        ),
        IconRight: ({ ...props }) => (
          <Heart className="w-4 h-4 text-red-600" {...props} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };
