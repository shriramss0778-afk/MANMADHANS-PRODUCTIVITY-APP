import type { Subtask } from "@/lib/types";

/** Prisma includes shared by every task/habit query so ordering stays consistent. */
export const withSubtasks = { subtasks: { orderBy: { createdAt: "asc" } } } as const;
export const withHabitLogs = { logs: { orderBy: { date: "asc" } } } as const;

/** Nested create payload for a task's subtasks. */
export function subtaskCreateData(subtasks: Pick<Subtask, "title" | "done">[]) {
  return {
    create: subtasks.map((subtask) => ({
      title: subtask.title,
      done: subtask.done,
    })),
  };
}

/** Nested create payload for a habit's date-keyed completion log. */
export function habitLogCreateData(log: Record<string, boolean>) {
  return {
    create: Object.entries(log).map(([date, done]) => ({
      date: new Date(date),
      done,
    })),
  };
}
