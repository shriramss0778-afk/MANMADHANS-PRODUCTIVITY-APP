"use client";

import { motion } from "framer-motion";
import { BookOpen, Brain, Dumbbell, Flower2, Flame, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Brain,
  Dumbbell,
  Flower2,
};

export function HabitTracker() {
  const { habits, toggleHabitDay, runAction } = useStore();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Flame className="size-4 text-amber-400" /> Habit tracker
        </CardTitle>
        <span className="text-xs text-muted">Last 7 weeks</span>
      </CardHeader>
      <CardContent className="space-y-4">
        {habits.map((h) => {
          const Icon = iconMap[h.icon] ?? Flame;
          const last7 = h.history.slice(-7);
          const doneToday = h.history[h.history.length - 1];
          return (
            <div key={h.id} className="flex items-center gap-3">
              <button
                onClick={() =>
                  runAction(() => toggleHabitDay(h.id, today), "Could not update this habit.")
                }
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl transition-all",
                  doneToday ? "text-white" : "text-muted hover:text-foreground",
                )}
                style={{
                  background: doneToday
                    ? `linear-gradient(135deg, ${h.color}, ${h.color}aa)`
                    : "rgba(255,255,255,0.05)",
                }}
                aria-label={`Toggle ${h.name}`}
              >
                <Icon className="size-5" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{h.name}</p>
                  <span className="flex items-center gap-1 text-xs text-amber-400">
                    <Flame className="size-3" /> {h.streak}
                  </span>
                </div>
                <div className="mt-1.5 flex gap-1">
                  {last7.map((done, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="h-2 flex-1 rounded-full"
                      style={{ background: done ? h.color : "rgba(255,255,255,0.08)" }}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
