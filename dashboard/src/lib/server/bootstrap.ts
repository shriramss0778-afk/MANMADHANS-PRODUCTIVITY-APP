import type { User } from "@prisma/client";
import { prisma } from "./prisma";
import { ensureDefaultAdmin, persistSession } from "./auth";
import {
  mapBook,
  mapCalendarEvent,
  mapFocusSession,
  mapHabit,
  mapKnowledgeEntry,
  mapNote,
  mapProfile,
  mapReflection,
  mapTask,
  mapTimerSettings,
  mapWeeklyTodo,
} from "./mappers";
import { buildAnalytics } from "./analytics";
import { withHabitLogs, withSubtasks } from "./relations";

/** Start a session for `user` and return the access token alongside the full bootstrap state. */
export async function startSessionState(user: Pick<User, "id" | "email" | "role">) {
  const { accessToken } = await persistSession(user);
  const state = await getBootstrapState(user.id);
  return { accessToken, ...state };
}

export async function getBootstrapState(userId?: string) {
  const resolvedUserId =
    userId ??
    (
      await ensureDefaultAdmin()
    ).id;

  const user = await prisma.user.findUnique({
    where: { id: resolvedUserId },
    include: { timerSettings: true },
  });

  if (!user) {
    return null;
  }

  const [knowledge, books, tasks, events, habits, weeklyTodos, notes, reflections, focusSessions] =
    await Promise.all([
      prisma.knowledgeEntry.findMany({ where: { userId: user.id }, orderBy: { dateLearned: "desc" } }),
      prisma.book.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
      prisma.task.findMany({
        where: { userId: user.id },
        orderBy: [{ createdAt: "desc" }],
        include: withSubtasks,
      }),
      prisma.calendarEvent.findMany({ where: { userId: user.id }, orderBy: [{ date: "asc" }, { startTime: "asc" }] }),
      prisma.habit.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
        include: withHabitLogs,
      }),
      prisma.weeklyTodo.findMany({ where: { userId: user.id }, orderBy: [{ date: "asc" }, { createdAt: "asc" }] }),
      prisma.note.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } }),
      prisma.reflection.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 10 }),
      prisma.focusSession.findMany({ where: { userId: user.id }, orderBy: { completedAt: "desc" }, take: 200 }),
    ]);

  const scratchpad = notes.find((note) => note.kind === "SCRATCHPAD") ?? null;
  const quickCapture = notes.filter((note) => note.kind === "QUICK_CAPTURE");

  return {
    user: mapProfile(user),
    timerSettings: mapTimerSettings(user.timerSettings),
    knowledge: knowledge.map(mapKnowledgeEntry),
    books: books.map(mapBook),
    tasks: tasks.map(mapTask),
    events: events.map(mapCalendarEvent),
    habits: habits.map(mapHabit),
    weeklyTodos: weeklyTodos.map(mapWeeklyTodo),
    scratchpad: scratchpad ? mapNote(scratchpad) : null,
    quickCapture: quickCapture.map(mapNote),
    reflections: reflections.map(mapReflection),
    focusSessions: focusSessions.map(mapFocusSession),
    analytics: buildAnalytics({ knowledge, books, tasks, habits, reflections, focusSessions }),
  };
}
