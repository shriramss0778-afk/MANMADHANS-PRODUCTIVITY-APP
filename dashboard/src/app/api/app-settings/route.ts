import { prisma } from "@/lib/server/prisma";
import { corsPreflight, json, superAdminRoute } from "@/lib/server/api";
import { appSettingsSchema } from "@/lib/server/schemas";
import { env } from "@/lib/server/env";

async function getOrCreateSettings() {
  const existing = await prisma.appSettings.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (existing) {
    return existing;
  }

  return prisma.appSettings.create({
    data: {
      accessPortalUrl: env.APP_URL,
    },
  });
}

export { corsPreflight as OPTIONS };

export const GET = superAdminRoute("app settings", async () => {
  const settings = await getOrCreateSettings();
  return json({ data: { accessPortalUrl: settings.accessPortalUrl } });
});

export const PUT = superAdminRoute("app settings", async ({ request }) => {
  const body = appSettingsSchema.parse(await request.json());
  const settings = await getOrCreateSettings();
  const saved = await prisma.appSettings.update({
    where: { id: settings.id },
    data: {
      accessPortalUrl: body.accessPortalUrl,
    },
  });

  return json({ data: { accessPortalUrl: saved.accessPortalUrl } });
});
