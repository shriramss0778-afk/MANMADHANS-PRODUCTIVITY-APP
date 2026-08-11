import { prisma } from "@/lib/server/prisma";
import { authedRoute, corsPreflight, json } from "@/lib/server/api";
import { buildAnalytics } from "@/lib/server/analytics";

export { corsPreflight as OPTIONS };

export const GET = authedRoute(async ({ user }) => {
  const [knowledge, books, tasks, habits, reflections, focusSessions] = await Promise.all([
    prisma.knowledgeEntry.findMany({ where: { userId: user.id } }),
    prisma.book.findMany({ where: { userId: user.id } }),
    prisma.task.findMany({ where: { userId: user.id } }),
    prisma.habit.findMany({ where: { userId: user.id }, include: { logs: true } }),
    prisma.reflection.findMany({ where: { userId: user.id } }),
    prisma.focusSession.findMany({ where: { userId: user.id } }),
  ]);

  return json({
    data: buildAnalytics({ knowledge, books, tasks, habits, reflections, focusSessions }),
  });
});
