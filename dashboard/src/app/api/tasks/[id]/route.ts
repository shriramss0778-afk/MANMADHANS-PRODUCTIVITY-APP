import { prisma } from "@/lib/server/prisma";
import { authedRoute, corsPreflight, json, noContent } from "@/lib/server/api";
import { taskSchema } from "@/lib/server/schemas";
import { fromGoalScope, fromPriority, fromTaskStatus, mapTask } from "@/lib/server/mappers";
import { mapDefined, toNullableDate } from "@/lib/server/patch";
import { findOwnedOrThrow } from "@/lib/server/query";
import { subtaskCreateData, withSubtasks } from "@/lib/server/relations";

function findTask(userId: string, id: string) {
  return findOwnedOrThrow(
    prisma.task.findFirst({ where: { id, userId }, include: withSubtasks }),
    "Task",
  );
}

export { corsPreflight as OPTIONS };

export const PATCH = authedRoute<{ id: string }>(async ({ request, user, params }) => {
  const task = await findTask(user.id, params.id);
  const body = taskSchema.partial().parse(await request.json());

  const item = await prisma.$transaction(async (tx) => {
    if (body.subtasks) {
      await tx.subtask.deleteMany({ where: { taskId: task.id } });
    }

    return tx.task.update({
      where: { id: task.id },
      data: {
        title: body.title,
        description: body.description,
        status: mapDefined(body.status, fromTaskStatus),
        priority: mapDefined(body.priority, fromPriority),
        deadline: toNullableDate(body.deadline),
        tags: body.tags,
        goalScope: mapDefined(body.goalScope, fromGoalScope),
        subtasks: mapDefined(body.subtasks, subtaskCreateData),
      },
      include: withSubtasks,
    });
  });

  return json({ data: mapTask(item) });
});

export const DELETE = authedRoute<{ id: string }>(async ({ user, params }) => {
  const task = await findTask(user.id, params.id);
  await prisma.task.delete({ where: { id: task.id } });
  return noContent();
});
