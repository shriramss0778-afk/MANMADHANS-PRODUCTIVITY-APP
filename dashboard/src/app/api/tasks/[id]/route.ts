import { prisma } from "@/lib/server/prisma";
import { requireAuth } from "@/lib/server/auth";
import { ApiError } from "@/lib/server/errors";
import { json, handleRouteError, noContent, optionsResponse } from "@/lib/server/api";
import { taskSchema } from "@/lib/server/schemas";
import { fromGoalScope, fromPriority, fromTaskStatus, mapTask } from "@/lib/server/mappers";

async function findTask(userId: string, id: string) {
  const task = await prisma.task.findFirst({
    where: { id, userId },
    include: { subtasks: { orderBy: { createdAt: "asc" } } },
  });
  if (!task) {
    throw new ApiError(404, "NOT_FOUND", "Task not found");
  }
  return task;
}

export async function OPTIONS() {
  return optionsResponse();
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    const task = await findTask(user.id, id);
    const body = taskSchema.partial().parse(await request.json());

    const item = await prisma.$transaction(async (tx) => {
      if (body.subtasks) {
        await tx.subtask.deleteMany({ where: { taskId: task.id } });
      }

      return tx.task.update({
        where: { id: task.id },
        data: {
          ...(body.title !== undefined ? { title: body.title } : {}),
          ...(body.description !== undefined ? { description: body.description } : {}),
          ...(body.status !== undefined ? { status: fromTaskStatus(body.status) } : {}),
          ...(body.priority !== undefined ? { priority: fromPriority(body.priority) } : {}),
          ...(body.deadline !== undefined ? { deadline: body.deadline ? new Date(body.deadline) : null } : {}),
          ...(body.tags !== undefined ? { tags: body.tags } : {}),
          ...(body.goalScope !== undefined ? { goalScope: fromGoalScope(body.goalScope) } : {}),
          ...(body.subtasks
            ? {
                subtasks: {
                  create: body.subtasks.map((subtask) => ({
                    title: subtask.title,
                    done: subtask.done,
                  })),
                },
              }
            : {}),
        },
        include: { subtasks: { orderBy: { createdAt: "asc" } } },
      });
    });

    return json({ data: mapTask(item) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    await findTask(user.id, id);
    await prisma.task.delete({ where: { id } });
    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
