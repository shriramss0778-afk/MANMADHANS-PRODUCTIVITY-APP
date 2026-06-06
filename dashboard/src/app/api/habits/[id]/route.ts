import { prisma } from "@/lib/server/prisma";
import { requireAuth } from "@/lib/server/auth";
import { ApiError } from "@/lib/server/errors";
import { json, handleRouteError, noContent, optionsResponse } from "@/lib/server/api";
import { habitSchema } from "@/lib/server/schemas";
import { mapHabit } from "@/lib/server/mappers";

async function findHabit(userId: string, id: string) {
  const item = await prisma.habit.findFirst({
    where: { id, userId },
    include: { logs: { orderBy: { date: "asc" } } },
  });
  if (!item) {
    throw new ApiError(404, "NOT_FOUND", "Habit not found");
  }
  return item;
}

function calculateStreak(log: Record<string, boolean>) {
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!log[key]) {
      break;
    }
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export async function OPTIONS() {
  return optionsResponse();
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    const existing = await findHabit(user.id, id);
    const body = habitSchema.partial().parse(await request.json());

    const item = await prisma.$transaction(async (tx) => {
      if (body.log) {
        await tx.habitLog.deleteMany({ where: { habitId: existing.id } });
      }

      const nextLog = body.log ?? Object.fromEntries(
        existing.logs.map((log) => [log.date.toISOString().slice(0, 10), log.done]),
      );

      return tx.habit.update({
        where: { id: existing.id },
        data: {
          ...(body.name !== undefined ? { name: body.name } : {}),
          ...(body.icon !== undefined ? { icon: body.icon } : {}),
          ...(body.color !== undefined ? { color: body.color } : {}),
          ...(body.goalPerWeek !== undefined ? { goalPerWeek: body.goalPerWeek } : {}),
          streak: body.streak ?? calculateStreak(nextLog),
          ...(body.log
            ? {
                logs: {
                  create: Object.entries(body.log).map(([date, done]) => ({
                    date: new Date(date),
                    done,
                  })),
                },
              }
            : {}),
        },
        include: { logs: { orderBy: { date: "asc" } } },
      });
    });

    return json({ data: mapHabit(item) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    await findHabit(user.id, id);
    await prisma.habit.delete({ where: { id } });
    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
