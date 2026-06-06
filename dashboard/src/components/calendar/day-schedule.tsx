"use client";

import { motion } from "framer-motion";
import type { CalendarEvent } from "@/lib/types";

const START_HOUR = 7;
const END_HOUR = 21;
const HOUR_HEIGHT = 56; // px

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** Google-Calendar-style vertical time-blocking day view. */
export function DaySchedule({ events }: { events: CalendarEvent[] }) {
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  return (
    <div className="relative overflow-hidden rounded-2xl glass-strong p-4">
      <div className="relative" style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }}>
        {/* Hour grid */}
        {hours.map((h, i) => (
          <div
            key={h}
            className="absolute inset-x-0 flex items-start gap-3"
            style={{ top: i * HOUR_HEIGHT }}
          >
            <span className="w-12 shrink-0 text-right text-[11px] text-muted">
              {h % 12 === 0 ? 12 : h % 12}
              {h < 12 ? "am" : "pm"}
            </span>
            <div className="mt-1.5 h-px flex-1 bg-card-border" />
          </div>
        ))}

        {/* Events */}
        <div className="absolute inset-y-0 left-16 right-2">
          {events.map((ev, idx) => {
            const top = ((toMinutes(ev.startTime) - START_HOUR * 60) / 60) * HOUR_HEIGHT;
            const height =
              ((toMinutes(ev.endTime) - toMinutes(ev.startTime)) / 60) * HOUR_HEIGHT;
            return (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                whileHover={{ scale: 1.01 }}
                className="absolute left-0 right-0 overflow-hidden rounded-xl border p-2.5"
                style={{
                  top,
                  height: Math.max(height, 30),
                  background: `${ev.color}22`,
                  borderColor: `${ev.color}55`,
                  borderLeft: `3px solid ${ev.color}`,
                }}
              >
                <p className="truncate text-xs font-semibold" style={{ color: ev.color }}>
                  {ev.title}
                </p>
                <p className="text-[10px] text-muted">
                  {ev.startTime} – {ev.endTime}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
