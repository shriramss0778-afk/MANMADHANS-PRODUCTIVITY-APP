import { prisma } from "@/lib/server/prisma";
import { authedRoute, corsPreflight, json } from "@/lib/server/api";
import { weeklyTodoSchema } from "@/lib/server/schemas";
import { mapWeeklyTodo } from "@/lib/server/mappers";

export { corsPreflight as OPTIONS };

export const GET = authedRoute(async ({ user }) => {
  const items = await prisma.weeklyTodo.findMany({
    where: { userId: user.id },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });
  return json({ data: items.map(mapWeeklyTodo) });
});

export const POST = authedRoute(async ({ request, user }) => {
  const body = weeklyTodoSchema.parse(await request.json());
  const item = await prisma.weeklyTodo.create({
    data: {
      userId: user.id,
      title: body.title,
      date: new Date(body.date),
      done: body.done,
    },
  });
  return json({ data: mapWeeklyTodo(item) }, { status: 201 });
});
