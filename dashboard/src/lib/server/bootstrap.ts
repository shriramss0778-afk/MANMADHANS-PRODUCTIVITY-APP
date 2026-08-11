import { prisma } from "./prisma";
import {
  mapBook,
  mapCalendarEvent,
  mapFocusSession,
  mapHabit,
  mapKnowledgeEntry,
  mapNote,
  mapReflection,
  mapTask,
  mapTimerSettings,
  mapWeeklyTodo,
} from "./mappers";
import {
  buildCategoryDistribution,
  buildDailyPagesSeries,
  buildHeatmap,
  buildKnowledgeGrowth,
  buildProductivityRadar,
  buildWeeklyLearningHours,
} from "./analytics";

export async function getBootstrapState(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
        include: { subtasks: { orderBy: { createdAt: "asc" } } },
      }),
      prisma.calendarEvent.findMany({ where: { userId: user.id }, orderBy: [{ date: "asc" }, { startTime: "asc" }] }),
      prisma.habit.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
        include: { logs: { orderBy: { date: "asc" } } },
      }),
      prisma.weeklyTodo.findMany({ where: { userId: user.id }, orderBy: [{ date: "asc" }, { createdAt: "asc" }] }),
      prisma.note.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } }),
      prisma.reflection.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 10 }),
      prisma.focusSession.findMany({ where: { userId: user.id }, orderBy: { completedAt: "desc" }, take: 200 }),
    ]);

  const scratchpad = notes.find((note) => note.kind === "SCRATCHPAD") ?? null;
  const quickCapture = notes.filter((note) => note.kind === "QUICK_CAPTURE");

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      passwordChangeRequired: user.passwordChangeRequired,
      readingGoal: user.readingGoal,
    },
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
    analytics: {
      weeklyLearningHours: buildWeeklyLearningHours(knowledge, focusSessions),
      knowledgeGrowth: buildKnowledgeGrowth(knowledge),
      categoryDistribution: buildCategoryDistribution(knowledge),
      productivityRadar: buildProductivityRadar(tasks, books, habits, reflections),
      focusHeatmap: buildHeatmap(focusSessions.map((session) => session.completedAt), 119),
      readingHeatmap: buildHeatmap(
        books.flatMap((book) => {
          const points: Date[] = [];
          const count = Math.max(1, Math.ceil(book.pagesRead / 25));
          const anchor = book.startedAt ?? book.createdAt;
          for (let index = 0; index < count; index += 1) {
            const date = new Date(anchor);
            date.setUTCDate(date.getUTCDate() + index);
            points.push(date);
          }
          return points;
        }),
        49,
      ),
      dailyPages: buildDailyPagesSeries(books),
    },
  };
}
