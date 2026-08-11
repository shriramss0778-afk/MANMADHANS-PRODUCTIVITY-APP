import { prisma } from "@/lib/server/prisma";
import { authedRoute, corsPreflight, json, noContent } from "@/lib/server/api";
import { calendarEventSchema } from "@/lib/server/schemas";
import { fromEventType, mapCalendarEvent } from "@/lib/server/mappers";
import { mapDefined, toDate, toNullableTrimmed } from "@/lib/server/patch";
import { findOwnedOrThrow } from "@/lib/server/query";

function findEvent(userId: string, id: string) {
  return findOwnedOrThrow(
    prisma.calendarEvent.findFirst({ where: { id, userId } }),
    "Calendar event",
  );
}

export { corsPreflight as OPTIONS };

export const PATCH = authedRoute<{ id: string }>(async ({ request, user, params }) => {
  const event = await findEvent(user.id, params.id);
  const body = calendarEventSchema.partial().parse(await request.json());
  const item = await prisma.calendarEvent.update({
    where: { id: event.id },
    data: {
      title: body.title,
      type: mapDefined(body.type, fromEventType),
      typeLabel: toNullableTrimmed(body.typeLabel),
      date: toDate(body.date),
      startTime: body.startTime,
      endTime: body.endTime,
      color: body.color,
    },
  });
  return json({ data: mapCalendarEvent(item) });
});

export const DELETE = authedRoute<{ id: string }>(async ({ user, params }) => {
  const event = await findEvent(user.id, params.id);
  await prisma.calendarEvent.delete({ where: { id: event.id } });
  return noContent();
});
