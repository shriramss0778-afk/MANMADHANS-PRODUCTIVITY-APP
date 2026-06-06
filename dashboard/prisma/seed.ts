import { ensureDefaultAdmin } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";

async function main() {
  const user = await ensureDefaultAdmin();
  console.log(`Default admin ready: ${user.email}`);

  const totals = await Promise.all([
    prisma.user.count(),
    prisma.knowledgeEntry.count(),
    prisma.book.count(),
    prisma.task.count(),
    prisma.calendarEvent.count(),
    prisma.habit.count(),
    prisma.weeklyTodo.count(),
    prisma.note.count(),
    prisma.reflection.count(),
    prisma.focusSession.count(),
  ]);

  console.log(
    JSON.stringify(
      {
        users: totals[0],
        knowledge: totals[1],
        books: totals[2],
        tasks: totals[3],
        calendarEvents: totals[4],
        habits: totals[5],
        weeklyTodos: totals[6],
        notes: totals[7],
        reflections: totals[8],
        focusSessions: totals[9],
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
