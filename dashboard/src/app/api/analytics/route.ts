import { prisma } from "@/lib/server/prisma";
import { requireAuth } from "@/lib/server/auth";
import { json, handleRouteError, optionsResponse } from "@/lib/server/api";
import {
  buildCategoryDistribution,
  buildDailyPagesSeries,
  buildHeatmap,
  buildKnowledgeGrowth,
  buildProductivityRadar,
  buildWeeklyLearningHours,
} from "@/lib/server/analytics";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const user = await requireAuth();
    const [knowledge, books, tasks, habits, reflections, focusSessions] = await Promise.all([
      prisma.knowledgeEntry.findMany({ where: { userId: user.id } }),
      prisma.book.findMany({ where: { userId: user.id } }),
      prisma.task.findMany({ where: { userId: user.id } }),
      prisma.habit.findMany({ where: { userId: user.id }, include: { logs: true } }),
      prisma.reflection.findMany({ where: { userId: user.id } }),
      prisma.focusSession.findMany({ where: { userId: user.id } }),
    ]);

    return json({
      data: {
        weeklyLearningHours: buildWeeklyLearningHours(knowledge, focusSessions),
        knowledgeGrowth: buildKnowledgeGrowth(knowledge),
        categoryDistribution: buildCategoryDistribution(knowledge),
        productivityRadar: buildProductivityRadar(tasks, books, habits, reflections),
        focusHeatmap: buildHeatmap(focusSessions.map((session) => session.completedAt), 119),
        readingHeatmap: buildHeatmap(
          books.flatMap((book) => {
            const dates: Date[] = [];
            const count = Math.max(1, Math.ceil(book.pagesRead / 25));
            for (let index = 0; index < count; index += 1) {
              const date = new Date(book.startedAt ?? book.createdAt);
              date.setUTCDate(date.getUTCDate() + index);
              dates.push(date);
            }
            return dates;
          }),
          49,
        ),
        dailyPages: buildDailyPagesSeries(books),
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
