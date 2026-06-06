import { prisma } from "@/lib/server/prisma";

async function main() {
  const tables = await prisma.$queryRawUnsafe<Array<{ tablename: string }>>(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
  );

  const expected = [
    "Book",
    "CalendarEvent",
    "FocusSession",
    "Habit",
    "HabitLog",
    "KnowledgeEntry",
    "Note",
    "Reflection",
    "RefreshToken",
    "Subtask",
    "Task",
    "TimerSettings",
    "User",
    "WeeklyTodo",
  ];

  const names = tables.map((table) => table.tablename);
  const missing = expected.filter((table) => !names.includes(table));

  if (missing.length > 0) {
    throw new Error(`Missing expected tables: ${missing.join(", ")}`);
  }

  console.log(
    JSON.stringify(
      {
        connected: true,
        tables: names,
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
