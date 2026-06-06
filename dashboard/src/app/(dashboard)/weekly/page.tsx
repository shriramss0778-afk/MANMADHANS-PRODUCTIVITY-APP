"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  addDays,
  startOfWeek,
  format,
  isSameDay,
  isToday,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Flame,
  ListChecks,
  Pencil,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { HabitDialog, HABIT_ICONS } from "@/components/dashboard/habit-dialog";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Habit, WeeklyTodo } from "@/lib/types";

const iso = (d: Date) => format(d, "yyyy-MM-dd");

export default function WeeklyPage() {
  const {
    weeklyTodos,
    addWeeklyTodo,
    removeWeeklyTodo,
    toggleWeeklyTodo,
    habits,
    addHabit,
    updateHabit,
    removeHabit,
    toggleHabitDay,
  } = useStore();

  // Anchor the week containing the app's "today" (Sun start).
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date("2026-05-31"), { weekStartsOn: 0 }),
  );
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const weekTodos = useMemo(
    () => weeklyTodos.filter((t) => days.some((d) => iso(d) === t.date)),
    [weeklyTodos, days],
  );
  const doneCount = weekTodos.filter((t) => t.done).length;
  const weekPct = weekTodos.length
    ? Math.round((doneCount / weekTodos.length) * 100)
    : 0;

  const addTodo = (date: string) => {
    const title = (drafts[date] ?? "").trim();
    if (!title) return;
    const todo: WeeklyTodo = { id: `wt-${Date.now()}`, date, title, done: false };
    addWeeklyTodo(todo);
    setDrafts((d) => ({ ...d, [date]: "" }));
  };

  const rangeLabel = `${format(weekStart, "MMM d")} – ${format(addDays(weekStart, 6), "MMM d, yyyy")}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weekly Planner"
        subtitle="Date-wise to-dos and habit tracking"
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="icon" onClick={() => setWeekStart((w) => addDays(w, -7))}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[180px] text-center text-sm font-medium">{rangeLabel}</span>
            <Button variant="secondary" size="icon" onClick={() => setWeekStart((w) => addDays(w, 7))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        }
      />

      {/* Week progress */}
      <Card>
        <CardContent className="overflow-hidden p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-indigo to-brand-purple">
                <ListChecks className="size-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-2 text-sm font-medium">This week&apos;s to-dos</p>
                <Progress value={weekPct} />
              </div>
            </div>

            <div className="grid min-w-[120px] shrink-0 gap-0.5 text-left md:text-right">
              <p className="text-sm text-muted">
                {doneCount}/{weekTodos.length} done
              </p>
              <p className="text-3xl font-bold gradient-text leading-none">{weekPct}%</p>
              <p className="text-[11px] text-muted">complete</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date-wise to-do list */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted">To-do list by day</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {days.map((day) => {
            const key = iso(day);
            const dayTodos = weeklyTodos.filter((t) => t.date === key);
            const today = isToday(day);
            return (
              <Card
                key={key}
                className={cn(today && "ring-1 ring-brand-cyan/50")}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                      {format(day, "EEEE")}
                    </CardTitle>
                    <span
                      className={cn(
                        "grid size-7 place-items-center rounded-lg text-xs font-bold",
                        today ? "bg-brand-cyan text-black" : "bg-[var(--surface)] text-muted",
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {dayTodos.map((t) => (
                      <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        className="group flex items-center gap-2 rounded-lg bg-[var(--surface)] p-2"
                      >
                        <button
                          onClick={() => toggleWeeklyTodo(t.id)}
                          aria-label={t.done ? "Mark incomplete" : "Mark complete"}
                          className="shrink-0"
                        >
                          {t.done ? (
                            <CheckCircle2 className="size-4 text-emerald-400" />
                          ) : (
                            <Circle className="size-4 text-muted" />
                          )}
                        </button>
                        <span
                          className={cn(
                            "flex-1 text-xs",
                            t.done && "text-muted line-through",
                          )}
                        >
                          {t.title}
                        </span>
                        <button
                          onClick={() => removeWeeklyTodo(t.id)}
                          aria-label="Delete to-do"
                          className="text-muted opacity-0 transition-all hover:text-rose-400 group-hover:opacity-100"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {dayTodos.length === 0 && (
                    <p className="py-1 text-center text-[11px] text-muted">No to-dos yet</p>
                  )}

                  <div className="flex gap-1.5 pt-1">
                    <Input
                      value={drafts[key] ?? ""}
                      onChange={(e) => setDrafts((d) => ({ ...d, [key]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && addTodo(key)}
                      placeholder="Add to-do..."
                      className="h-8 text-xs"
                    />
                    <Button size="icon" onClick={() => addTodo(key)} aria-label="Add to-do" className="size-8 shrink-0">
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Habit tracker (date-wise grid) */}
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flame className="size-4 text-amber-400" /> Habit tracker
            </CardTitle>
            <p className="text-sm text-muted">Tap a cell to mark a habit done for that day</p>
          </div>
          <HabitDialog
            onSave={addHabit}
            trigger={
              <Button size="sm">
                <Plus className="size-4" /> Add habit
              </Button>
            }
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-separate border-spacing-y-1.5">
              <thead>
                <tr>
                  <th className="w-40 text-left text-xs font-medium text-muted"></th>
                  {days.map((d) => (
                    <th key={iso(d)} className="px-1 text-center">
                      <div className="text-[11px] font-medium text-muted">{format(d, "EEEEE")}</div>
                      <div
                        className={cn(
                          "mx-auto mt-1 grid size-6 place-items-center rounded-full text-[11px]",
                          isToday(d) && "bg-brand-cyan font-bold text-black",
                        )}
                      >
                        {format(d, "d")}
                      </div>
                    </th>
                  ))}
                  <th className="px-2 text-center text-[11px] font-medium text-muted">Streak</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {habits.map((h) => {
                  const Icon = HABIT_ICONS[h.icon] ?? Flame;
                  const weekDone = days.filter((d) => h.log?.[iso(d)]).length;
                  return (
                    <tr key={h.id}>
                      <td className="pr-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="grid size-7 shrink-0 place-items-center rounded-lg"
                            style={{ background: `${h.color}22` }}
                          >
                            <Icon className="size-4" style={{ color: h.color }} />
                          </span>
                          <span className="truncate text-sm font-medium">{h.name}</span>
                        </div>
                      </td>
                      {days.map((d) => {
                        const key = iso(d);
                        const done = !!h.log?.[key];
                        return (
                          <td key={key} className="px-1 text-center">
                            <button
                              onClick={() => toggleHabitDay(h.id, key)}
                              aria-label={`${h.name} on ${format(d, "EEE")}`}
                              className={cn(
                                "mx-auto grid size-8 place-items-center rounded-lg border transition-all",
                                done
                                  ? "border-transparent text-white"
                                  : "border-card-border text-transparent hover:bg-[var(--surface-hover)]",
                              )}
                              style={done ? { background: h.color } : {}}
                            >
                              <CheckCircle2 className="size-4" />
                            </button>
                          </td>
                        );
                      })}
                      <td className="px-2 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
                          <Flame className="size-3" /> {weekDone}/{h.goalPerWeek}
                        </span>
                      </td>
                      <td className="pl-1 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingHabit(h)}
                            aria-label={`Edit ${h.name}`}
                            className="text-muted transition-colors hover:text-brand-cyan"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            onClick={() => removeHabit(h.id)}
                            aria-label={`Delete ${h.name}`}
                            className="text-muted transition-colors hover:text-rose-400"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Controlled habit edit dialog */}
      {editingHabit && (
        <HabitDialog
          habit={editingHabit}
          open={!!editingHabit}
          onOpenChange={(o) => !o && setEditingHabit(null)}
          onSave={(h) => {
            updateHabit(h);
            setEditingHabit(null);
          }}
        />
      )}
    </div>
  );
}
