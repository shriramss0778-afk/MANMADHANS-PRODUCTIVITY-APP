"use client";

import { motion } from "framer-motion";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from "date-fns";
import type { CalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthGrid({
  month,
  events,
  selected,
  onSelect,
}: {
  month: Date;
  events: CalendarEvent[];
  selected: string;
  onSelect: (date: string) => void;
}) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  });

  const eventsByDay = events.reduce<Record<string, CalendarEvent[]>>((acc, ev) => {
    (acc[ev.date] ||= []).push(ev);
    return acc;
  }, {});

  return (
    <div className="rounded-2xl glass-strong p-4">
      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1 text-center text-[11px] font-medium text-muted">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const key = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay[key] ?? [];
          const inMonth = isSameMonth(day, month);
          const isSelected = key === selected;
          return (
            <motion.button
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.005 }}
              onClick={() => onSelect(key)}
              className={cn(
                "flex aspect-square flex-col items-center gap-1 rounded-xl p-1.5 text-sm transition-colors",
                !inMonth && "opacity-30",
                isSelected
                  ? "bg-gradient-to-br from-brand-indigo/40 to-brand-purple/30 ring-1 ring-brand-purple/50"
                  : "hover:bg-[var(--surface)]",
              )}
            >
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-full text-xs",
                  isToday(day) && "bg-brand-cyan font-bold text-black",
                )}
              >
                {format(day, "d")}
              </span>
              <div className="flex flex-wrap justify-center gap-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <span
                    key={ev.id}
                    className="size-1.5 rounded-full"
                    style={{ background: ev.color }}
                  />
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
