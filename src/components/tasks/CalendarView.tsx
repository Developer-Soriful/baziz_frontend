"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  tasks: any[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

export function CalendarView({ tasks, selectedDate, onSelectDate }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate days array
  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Previous month buffer days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevDay = prevMonthDays - i;
    const d = new Date(year, month - 1, prevDay);
    days.push({
      dateStr: d.toISOString().split("T")[0],
      dayNum: prevDay,
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const d = new Date(year, month, i);
    days.push({
      dateStr: d.toISOString().split("T")[0],
      dayNum: i,
      isCurrentMonth: true
    });
  }

  // Next month buffer days (to fill 6 rows, i.e., 42 spots)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    days.push({
      dateStr: d.toISOString().split("T")[0],
      dayNum: i,
      isCurrentMonth: false
    });
  }

  // Helper to check if a day has tasks due
  const hasTasks = (dateStr: string) => {
    return tasks.some((t) => t.dueDate?.split("T")[0] === dateStr);
  };

  const handlePrev = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNext = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="font-bold text-text">
          {monthNames[month]} {year}
        </h4>
        <div className="flex gap-1">
          <button
            onClick={handlePrev}
            className="rounded-lg p-1.5 hover:bg-surface-2 text-text-muted transition"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={handleNext}
            className="rounded-lg p-1.5 hover:bg-surface-2 text-text-muted transition"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 text-center text-xs font-bold text-text-faint">
        {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {days.map((day, idx) => {
          const isSelected = selectedDate === day.dateStr;
          const hasTask = hasTasks(day.dateStr);
          const isToday = new Date().toISOString().split("T")[0] === day.dateStr;

          return (
            <button
              key={`${day.dateStr}-${idx}`}
              onClick={() => {
                if (isSelected) {
                  onSelectDate(null); // toggle off
                } else {
                  onSelectDate(day.dateStr);
                }
              }}
              className={cn(
                "relative flex h-10 w-full flex-col items-center justify-center rounded-xl font-semibold transition-all hover:bg-surface-2",
                !day.isCurrentMonth && "text-text-faint font-normal",
                isSelected
                  ? "bg-primary text-white hover:bg-primary/90"
                  : isToday
                  ? "border border-primary text-primary"
                  : "text-text"
              )}
            >
              <span>{day.dayNum}</span>
              {hasTask && (
                <span
                  className={cn(
                    "absolute bottom-1 h-1.5 w-1.5 rounded-full",
                    isSelected ? "bg-white" : "bg-primary"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
