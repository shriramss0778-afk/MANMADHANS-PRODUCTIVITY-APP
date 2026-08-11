import { prisma } from "@/lib/server/prisma";
import { authedRoute, corsPreflight, json } from "@/lib/server/api";
import { timerSettingsSchema } from "@/lib/server/schemas";
import { mapTimerSettings } from "@/lib/server/mappers";

export { corsPreflight as OPTIONS };

export const GET = authedRoute(async ({ user }) => json({ data: mapTimerSettings(user.timerSettings) }));

export const PUT = authedRoute(async ({ request, user }) => {
  const body = timerSettingsSchema.parse(await request.json());
  const values = {
    focus: body.focus,
    short: body.short,
    long: body.long,
  };
  const settings = await prisma.timerSettings.upsert({
    where: { userId: user.id },
    update: values,
    create: { userId: user.id, ...values },
  });
  return json({ data: mapTimerSettings(settings) });
});
