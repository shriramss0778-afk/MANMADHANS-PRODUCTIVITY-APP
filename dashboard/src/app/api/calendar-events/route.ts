import { prisma } from "@/lib/server/prisma";
import { requireAuth } from "@/lib/server/auth";
import { json, handleRouteError, optionsResponse } from "@/lib/server/api";
import { calendarEventSchema } from "@/lib/server/schemas";
import { fromEventType, mapCalendarEvent } from "@/lib/server/mappers";
import { listMeta, parseListQuery } from "@/lib/server/query";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parseListQuery(searchParams);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const where = {
      userId: user.id,
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    };
    const [total, items] = await Promise.all([
      prisma.calendarEvent.count({ where }),
      prisma.calendarEvent.findMany({
        where,
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return json({
      data: items.map(mapCalendarEvent),
      meta: listMeta(total, page, pageSize),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = calendarEventSchema.parse(await request.json());
    const item = await prisma.calendarEvent.create({
      data: {
        userId: user.id,
        title: body.title,
        type: fromEventType(body.type),
        typeLabel: body.typeLabel?.trim() || null,
        date: new Date(body.date),
        startTime: body.startTime,
        endTime: body.endTime,
        color: body.color,
      },
    });
    return json({ data: mapCalendarEvent(item) }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
