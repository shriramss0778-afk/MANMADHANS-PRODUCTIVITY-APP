import { prisma } from "@/lib/server/prisma";
import { requireAuth } from "@/lib/server/auth";
import { ApiError } from "@/lib/server/errors";
import { json, handleRouteError, noContent, optionsResponse } from "@/lib/server/api";
import { calendarEventSchema } from "@/lib/server/schemas";
import { fromEventType, mapCalendarEvent } from "@/lib/server/mappers";

async function findEvent(userId: string, id: string) {
  const item = await prisma.calendarEvent.findFirst({ where: { id, userId } });
  if (!item) {
    throw new ApiError(404, "NOT_FOUND", "Calendar event not found");
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
    await findEvent(user.id, id);
    const body = calendarEventSchema.partial().parse(await request.json());
    const item = await prisma.calendarEvent.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.type !== undefined ? { type: fromEventType(body.type) } : {}),
        ...(body.typeLabel !== undefined ? { typeLabel: body.typeLabel.trim() || null } : {}),
        ...(body.date !== undefined ? { date: new Date(body.date) } : {}),
        ...(body.startTime !== undefined ? { startTime: body.startTime } : {}),
        ...(body.endTime !== undefined ? { endTime: body.endTime } : {}),
        ...(body.color !== undefined ? { color: body.color } : {}),
      },
    });
    return json({ data: mapCalendarEvent(item) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    await findEvent(user.id, id);
    await prisma.calendarEvent.delete({ where: { id } });
    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
