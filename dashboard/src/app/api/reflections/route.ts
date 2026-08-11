import { prisma } from "@/lib/server/prisma";
import { authedRoute, corsPreflight, json } from "@/lib/server/api";
import { reflectionSchema } from "@/lib/server/schemas";
import { fromMood, mapReflection } from "@/lib/server/mappers";

export { corsPreflight as OPTIONS };

export const GET = authedRoute(async ({ user }) => {
  const items = await prisma.reflection.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 20,
  });
  return json({ data: items.map(mapReflection) });
});

export const POST = authedRoute(async ({ request, user }) => {
  const body = reflectionSchema.parse(await request.json());
  const date = new Date(body.date);
  const values = {
    mood: fromMood(body.mood),
    gratitude: body.gratitude,
    wins: body.wins,
    improve: body.improve,
  };
  const item = await prisma.reflection.upsert({
    where: { userId_date: { userId: user.id, date } },
    update: values,
    create: { userId: user.id, date, ...values },
  });
  return json({ data: mapReflection(item) }, { status: 201 });
});
