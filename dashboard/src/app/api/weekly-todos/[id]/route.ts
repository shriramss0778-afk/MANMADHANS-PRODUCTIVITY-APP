import { prisma } from "@/lib/server/prisma";
import { requireAuth } from "@/lib/server/auth";
import { ApiError } from "@/lib/server/errors";
import { json, handleRouteError, noContent, optionsResponse } from "@/lib/server/api";
import { weeklyTodoSchema } from "@/lib/server/schemas";
import { mapWeeklyTodo } from "@/lib/server/mappers";

async function findTodo(userId: string, id: string) {
  const item = await prisma.weeklyTodo.findFirst({ where: { id, userId } });
  if (!item) {
    throw new ApiError(404, "NOT_FOUND", "Weekly todo not found");
  }
  return item;
}

export async function OPTIONS() {
  return optionsResponse();
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    await findTodo(user.id, id);
    const body = weeklyTodoSchema.partial().parse(await request.json());
    const item = await prisma.weeklyTodo.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.date !== undefined ? { date: new Date(body.date) } : {}),
        ...(body.done !== undefined ? { done: body.done } : {}),
      },
    });
    return json({ data: mapWeeklyTodo(item) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    await findTodo(user.id, id);
    await prisma.weeklyTodo.delete({ where: { id } });
    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
