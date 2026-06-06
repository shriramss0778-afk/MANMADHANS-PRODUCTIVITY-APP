import { prisma } from "@/lib/server/prisma";
import { requireAuth } from "@/lib/server/auth";
import { json, handleRouteError, optionsResponse } from "@/lib/server/api";
import { reflectionSchema } from "@/lib/server/schemas";
import { fromMood, mapReflection } from "@/lib/server/mappers";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const user = await requireAuth();
    const items = await prisma.reflection.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 20,
    });
    return json({ data: items.map(mapReflection) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = reflectionSchema.parse(await request.json());
    const item = await prisma.reflection.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: new Date(body.date),
        },
      },
      update: {
        mood: fromMood(body.mood),
        gratitude: body.gratitude,
        wins: body.wins,
        improve: body.improve,
      },
      create: {
        userId: user.id,
        date: new Date(body.date),
        mood: fromMood(body.mood),
        gratitude: body.gratitude,
        wins: body.wins,
        improve: body.improve,
      },
    });
    return json({ data: mapReflection(item) }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
