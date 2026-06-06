import { prisma } from "@/lib/server/prisma";
import { requireAuth } from "@/lib/server/auth";
import { json, handleRouteError, optionsResponse } from "@/lib/server/api";
import { focusSessionSchema } from "@/lib/server/schemas";
import { mapFocusSession } from "@/lib/server/mappers";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const user = await requireAuth();
    const items = await prisma.focusSession.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: "desc" },
      take: 200,
    });
    return json({ data: items.map(mapFocusSession) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = focusSessionSchema.parse(await request.json());
    const item = await prisma.focusSession.create({
      data: {
        userId: user.id,
        mode: body.mode,
        durationMins: body.durationMins,
      },
    });
    return json({ data: mapFocusSession(item) }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
