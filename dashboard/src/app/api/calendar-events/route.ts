import { prisma } from "@/lib/server/prisma";
import { authedRoute, corsPreflight, json } from "@/lib/server/api";
import { calendarEventSchema } from "@/lib/server/schemas";
import { fromEventType, mapCalendarEvent } from "@/lib/server/mappers";
import { dateRange, listMeta, paginate, parseListQuery } from "@/lib/server/query";

export { corsPreflight as OPTIONS };

export const GET = authedRoute(async ({ request, user }) => {
  const { searchParams } = new URL(request.url);
  const { page, pageSize } = parseListQuery(searchParams);
  const where = {
    userId: user.id,
    ...dateRange("date", searchParams.get("from"), searchParams.get("to")),
  };
  const [total, items] = await Promise.all([
    prisma.calendarEvent.count({ where }),
    prisma.calendarEvent.findMany({
      where,
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      ...paginate({ page, pageSize }),
    }),
  ]);
  return json({
    data: items.map(mapCalendarEvent),
    meta: listMeta(total, page, pageSize),
  });
});

export const POST = authedRoute(async ({ request, user }) => {
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
});
