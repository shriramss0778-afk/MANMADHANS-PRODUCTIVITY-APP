import type { Book, FocusSession, Habit, HabitLog, KnowledgeEntry, Reflection, Task } from "@prisma/client";

const shortDay = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const shortMonth = new Intl.DateTimeFormat("en-US", { month: "short" });

function sameDay(a: Date, b: Date) {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

export function buildWeeklyLearningHours(knowledge: KnowledgeEntry[], focusSessions: FocusSession[]) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return date;
  });

  return days.map((date) => {
    const focusMinutes = focusSessions
      .filter((session) => sameDay(session.completedAt, date) && session.mode === "focus")
      .reduce((sum, session) => sum + session.durationMins, 0);
    const knowledgeUnits = knowledge.filter((entry) => sameDay(entry.dateLearned, date)).length * 0.75;
    const focusHours = Number((focusMinutes / 60).toFixed(1));
    const hours = Number((focusHours + knowledgeUnits).toFixed(1));
    return {
      day: shortDay.format(date),
      hours,
      focus: focusHours,
    };
  });
}

export function buildKnowledgeGrowth(knowledge: KnowledgeEntry[]) {
  const byMonth = new Map<string, { month: string; entries: number; retentionTotal: number }>();
  const sorted = [...knowledge].sort((a, b) => a.dateLearned.getTime() - b.dateLearned.getTime());

  for (const item of sorted) {
    const key = `${item.dateLearned.getUTCFullYear()}-${item.dateLearned.getUTCMonth()}`;
    const current = byMonth.get(key) ?? {
      month: shortMonth.format(item.dateLearned),
      entries: 0,
      retentionTotal: 0,
    };
    current.entries += 1;
    current.retentionTotal += item.retention;
    byMonth.set(key, current);
  }

  let runningEntries = 0;

  return [...byMonth.values()].slice(-6).map((value) => {
    runningEntries += value.entries;
    return {
      month: value.month,
      entries: runningEntries,
      retention: Math.round(value.retentionTotal / value.entries),
    };
  });
}

export function buildCategoryDistribution(knowledge: KnowledgeEntry[]) {
  const colors = ["#3b82f6", "#a855f7", "#22d3ee", "#01c3a8", "#ffb741", "#f43f5e", "#6366f1", "#10b981"];
  const totals = new Map<string, number>();
  knowledge.forEach((entry) => {
    totals.set(entry.category, (totals.get(entry.category) ?? 0) + 1);
  });
  return [...totals.entries()].map(([name, value], index) => ({
    name,
    value,
    color: colors[index % colors.length],
  }));
}

export function buildProductivityRadar(tasks: Task[], books: Book[], habits: (Habit & { logs: HabitLog[] })[], reflections: Reflection[]) {
  const completedTasks = tasks.length ? (tasks.filter((task) => task.status === "COMPLETED").length / tasks.length) * 100 : 0;
  const reading = books.length
    ? (books.reduce((sum, book) => sum + Math.min(book.pagesRead, book.totalPages), 0) /
        books.reduce((sum, book) => sum + Math.max(book.totalPages, 1), 0)) *
      100
    : 0;
  const habitCompletions = habits.length
    ? habits.reduce((sum, habit) => sum + habit.logs.filter((log) => log.done).length, 0) / habits.length
    : 0;
  const reflectionScore = Math.min(100, reflections.length * 20);

  return [
    { metric: "Focus", value: Math.round(Math.min(100, completedTasks + 10)) },
    { metric: "Consistency", value: Math.round(Math.min(100, habitCompletions * 7)) },
    { metric: "Learning", value: Math.round(Math.min(100, completedTasks + reflectionScore / 2)) },
    { metric: "Reading", value: Math.round(Math.min(100, reading)) },
    { metric: "Health", value: Math.round(Math.min(100, habitCompletions * 5)) },
    { metric: "Thinking", value: Math.round(reflectionScore) },
  ];
}

export function buildHeatmap(sourceDates: Date[], length: number) {
  const counts = new Map<string, number>();
  sourceDates.forEach((date) => {
    const key = date.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return Array.from({ length }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (length - 1 - index));
    const count = counts.get(date.toISOString().slice(0, 10)) ?? 0;
    return Math.min(4, count);
  });
}

export function buildDailyPagesSeries(books: Book[]) {
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const pages = books
      .filter((book) => book.startedAt && book.startedAt <= date)
      .reduce((sum, book) => {
        const baseline = Math.max(1, book.totalPages);
        const spread = Math.max(1, Math.min(14, Math.ceil(book.pagesRead / 20)));
        const pagesPerDay = Math.round(book.pagesRead / spread);
        return sum + Math.min(baseline, pagesPerDay);
      }, 0);

    return {
      day: shortDay.format(date),
      pages,
    };
  });
}
