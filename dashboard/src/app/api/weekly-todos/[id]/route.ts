import { prisma } from "@/lib/server/prisma";
import { authedRoute, corsPreflight, json, noContent } from "@/lib/server/api";
import { weeklyTodoSchema } from "@/lib/server/schemas";
import { mapWeeklyTodo } from "@/lib/server/mappers";
import { toDate } from "@/lib/server/patch";
import { findOwnedOrThrow } from "@/lib/server/query";

function findTodo(userId: string, id: string) {
  return findOwnedOrThrow(prisma.weeklyTodo.findFirst({ where: { id, userId } }), "Weekly todo");
}

export { corsPreflight as OPTIONS };

export const PATCH = authedRoute<{ id: string }>(async ({ request, user, params }) => {
  const todo = await findTodo(user.id, params.id);
  const body = weeklyTodoSchema.partial().parse(await request.json());
  const item = await prisma.weeklyTodo.update({
    where: { id: todo.id },
    data: {
      title: body.title,
      date: toDate(body.date),
      done: body.done,
    },
  });
  return json({ data: mapWeeklyTodo(item) });
});

export const DELETE = authedRoute<{ id: string }>(async ({ user, params }) => {
  const todo = await findTodo(user.id, params.id);
  await prisma.weeklyTodo.delete({ where: { id: todo.id } });
  return noContent();
});
