import { prisma } from "@/lib/server/prisma";
import { authedRoute, corsPreflight, json } from "@/lib/server/api";
import { habitSchema } from "@/lib/server/schemas";
import { mapHabit } from "@/lib/server/mappers";
import { habitLogCreateData, withHabitLogs } from "@/lib/server/relations";

export { corsPreflight as OPTIONS };

export const GET = authedRoute(async ({ user }) => {
  const items = await prisma.habit.findMany({
    where: { userId: user.id },
    include: withHabitLogs,
    orderBy: { createdAt: "asc" },
  });
  return json({ data: items.map(mapHabit) });
});

export const POST = authedRoute(async ({ request, user }) => {
  const body = habitSchema.parse(await request.json());
  const item = await prisma.habit.create({
    data: {
      userId: user.id,
      name: body.name,
      icon: body.icon,
      color: body.color,
      streak: body.streak,
      goalPerWeek: body.goalPerWeek,
      logs: habitLogCreateData(body.log),
    },
    include: withHabitLogs,
  });
  return json({ data: mapHabit(item) }, { status: 201 });
});
