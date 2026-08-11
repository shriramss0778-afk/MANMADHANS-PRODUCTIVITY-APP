import { prisma } from "@/lib/server/prisma";
import { authedRoute, corsPreflight, json, noContent } from "@/lib/server/api";
import { habitSchema } from "@/lib/server/schemas";
import { mapHabit, toHabitLogMap } from "@/lib/server/mappers";
import { mapDefined } from "@/lib/server/patch";
import { findOwnedOrThrow } from "@/lib/server/query";
import { habitLogCreateData, withHabitLogs } from "@/lib/server/relations";
import { addUtcDays, dateKey } from "@/lib/dates";

function findHabit(userId: string, id: string) {
  return findOwnedOrThrow(
    prisma.habit.findFirst({ where: { id, userId }, include: withHabitLogs }),
    "Habit",
  );
}

function calculateStreak(log: Record<string, boolean>) {
  let streak = 0;
  let cursor = new Date();
  while (log[dateKey(cursor)]) {
    streak += 1;
    cursor = addUtcDays(cursor, -1);
  }
  return streak;
}

export { corsPreflight as OPTIONS };

export const PATCH = authedRoute<{ id: string }>(async ({ request, user, params }) => {
  const existing = await findHabit(user.id, params.id);
  const body = habitSchema.partial().parse(await request.json());

  const item = await prisma.$transaction(async (tx) => {
    if (body.log) {
      await tx.habitLog.deleteMany({ where: { habitId: existing.id } });
    }

    const nextLog = body.log ?? toHabitLogMap(existing.logs);

    return tx.habit.update({
      where: { id: existing.id },
      data: {
        name: body.name,
        icon: body.icon,
        color: body.color,
        goalPerWeek: body.goalPerWeek,
        streak: body.streak ?? calculateStreak(nextLog),
        logs: mapDefined(body.log, habitLogCreateData),
      },
      include: withHabitLogs,
    });
  });

  return json({ data: mapHabit(item) });
});

export const DELETE = authedRoute<{ id: string }>(async ({ user, params }) => {
  const habit = await findHabit(user.id, params.id);
  await prisma.habit.delete({ where: { id: habit.id } });
  return noContent();
});
