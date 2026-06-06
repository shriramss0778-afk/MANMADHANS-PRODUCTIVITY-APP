import { prisma } from "@/lib/server/prisma";
import { requireAuth } from "@/lib/server/auth";
import { ApiError } from "@/lib/server/errors";
import { handleRouteError, json, optionsResponse } from "@/lib/server/api";
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

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "SUPER_ADMIN") {
      throw new ApiError(403, "FORBIDDEN", "Only super admins can manage app settings");
    }

    const settings = await getOrCreateSettings();
    return json({
      data: {
        accessPortalUrl: settings.accessPortalUrl,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== "SUPER_ADMIN") {
      throw new ApiError(403, "FORBIDDEN", "Only super admins can manage app settings");
    }

    const body = appSettingsSchema.parse(await request.json());
    const settings = await getOrCreateSettings();
    const saved = await prisma.appSettings.update({
      where: { id: settings.id },
      data: {
        accessPortalUrl: body.accessPortalUrl,
      },
    });

    return json({
      data: {
        accessPortalUrl: saved.accessPortalUrl,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
