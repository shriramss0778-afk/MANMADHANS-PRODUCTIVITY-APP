import { prisma } from "@/lib/server/prisma";
import { requireAuth } from "@/lib/server/auth";
import { json, handleRouteError, optionsResponse } from "@/lib/server/api";
import { taskSchema } from "@/lib/server/schemas";
import { fromGoalScope, fromPriority, fromTaskStatus, mapTask } from "@/lib/server/mappers";
import { listMeta, parseListQuery } from "@/lib/server/query";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const { page, pageSize, q, sortOrder } = parseListQuery(searchParams);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const where = {
      userId: user.id,
      ...(status ? { status: fromTaskStatus(status) } : {}),
      ...(priority ? { priority: fromPriority(priority) } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" as const } },
              { description: { contains: q, mode: "insensitive" as const } },
              { tags: { has: q } },
            ],
          }
        : {}),
    };
    const [total, items] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        include: { subtasks: { orderBy: { createdAt: "asc" } } },
        orderBy: [{ createdAt: sortOrder }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return json({
      data: items.map(mapTask),
      meta: listMeta(total, page, pageSize),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
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
        subtasks: {
          create: body.subtasks.map((subtask) => ({
            title: subtask.title,
            done: subtask.done,
          })),
        },
      },
      include: { subtasks: { orderBy: { createdAt: "asc" } } },
    });
    return json({ data: mapTask(item) }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
