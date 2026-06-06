import { prisma } from "@/lib/server/prisma";
import { requireAuth } from "@/lib/server/auth";
import { json, handleRouteError, optionsResponse } from "@/lib/server/api";
import { weeklyTodoSchema } from "@/lib/server/schemas";
import { mapWeeklyTodo } from "@/lib/server/mappers";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const user = await requireAuth();
    const items = await prisma.weeklyTodo.findMany({
      where: { userId: user.id },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    });
    return json({ data: items.map(mapWeeklyTodo) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
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
  } catch (error) {
    return handleRouteError(error);
  }
}
