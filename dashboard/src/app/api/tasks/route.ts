import { prisma } from "@/lib/server/prisma";
import { authedRoute, corsPreflight, json } from "@/lib/server/api";
import { taskSchema } from "@/lib/server/schemas";
import { fromGoalScope, fromPriority, fromTaskStatus, mapTask } from "@/lib/server/mappers";
import { listMeta, paginate, parseListQuery, textSearch } from "@/lib/server/query";
import { subtaskCreateData, withSubtasks } from "@/lib/server/relations";

export { corsPreflight as OPTIONS };

export const GET = authedRoute(async ({ request, user }) => {
  const { searchParams } = new URL(request.url);
  const { page, pageSize, q, sortOrder } = parseListQuery(searchParams);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const where = {
    userId: user.id,
    ...(status ? { status: fromTaskStatus(status) } : {}),
    ...(priority ? { priority: fromPriority(priority) } : {}),
    ...textSearch(q, { contains: ["title", "description"], has: ["tags"] }),
  };
  const [total, items] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      include: withSubtasks,
      orderBy: [{ createdAt: sortOrder }],
      ...paginate({ page, pageSize }),
    }),
  ]);
  return json({
    data: items.map(mapTask),
    meta: listMeta(total, page, pageSize),
  });
});

export const POST = authedRoute(async ({ request, user }) => {
  const body = taskSchema.parse(await request.json());
  const item = await prisma.task.create({
    data: {
      userId: user.id,
      title: body.title,
      description: body.description,
      status: fromTaskStatus(body.status),
      priority: fromPriority(body.priority),
      deadline: body.deadline ? new Date(body.deadline) : null,
      tags: body.tags,
      goalScope: fromGoalScope(body.goalScope),
      subtasks: subtaskCreateData(body.subtasks),
    },
    include: withSubtasks,
  });
  return json({ data: mapTask(item) }, { status: 201 });
});
