import { prisma } from "@/lib/server/prisma";
import { requireAuth } from "@/lib/server/auth";
import { json, handleRouteError, optionsResponse } from "@/lib/server/api";
import { habitSchema } from "@/lib/server/schemas";
import { mapHabit } from "@/lib/server/mappers";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const user = await requireAuth();
    const items = await prisma.habit.findMany({
      where: { userId: user.id },
      include: { logs: { orderBy: { date: "asc" } } },
      orderBy: { createdAt: "asc" },
    });
    return json({ data: items.map(mapHabit) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = habitSchema.parse(await request.json());
    const item = await prisma.habit.create({
      data: {
        userId: user.id,
        name: body.name,
        icon: body.icon,
        color: body.color,
        streak: body.streak,
        goalPerWeek: body.goalPerWeek,
        logs: {
          create: Object.entries(body.log).map(([date, done]) => ({
            date: new Date(date),
            done,
          })),
        },
      },
      include: { logs: { orderBy: { date: "asc" } } },
    });
    return json({ data: mapHabit(item) }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
