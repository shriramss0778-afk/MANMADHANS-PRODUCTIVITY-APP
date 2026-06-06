import { prisma } from "@/lib/server/prisma";
import { requireAuth } from "@/lib/server/auth";
import { json, handleRouteError, optionsResponse } from "@/lib/server/api";
import { timerSettingsSchema } from "@/lib/server/schemas";
import { mapTimerSettings } from "@/lib/server/mappers";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const user = await requireAuth();
    return json({ data: mapTimerSettings(user.timerSettings) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth();
    const body = timerSettingsSchema.parse(await request.json());
    const settings = await prisma.timerSettings.upsert({
      where: { userId: user.id },
      update: {
        focus: body.focus,
        short: body.short,
        long: body.long,
      },
      create: {
        userId: user.id,
        focus: body.focus,
        short: body.short,
        long: body.long,
      },
    });
    return json({ data: mapTimerSettings(settings) });
  } catch (error) {
    return handleRouteError(error);
  }
}
