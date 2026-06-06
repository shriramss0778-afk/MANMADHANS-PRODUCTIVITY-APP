import { prisma } from "@/lib/server/prisma";
import { requireAuth } from "@/lib/server/auth";
import { handleRouteError, json, optionsResponse } from "@/lib/server/api";
import { profileSchema } from "@/lib/server/schemas";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const user = await requireAuth();

    return json({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        passwordChangeRequired: user.passwordChangeRequired,
        readingGoal: user.readingGoal,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await requireAuth();
    const body = profileSchema.parse(await request.json());

    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.readingGoal !== undefined ? { readingGoal: body.readingGoal } : {}),
      },
    });

    return json({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        passwordChangeRequired: user.passwordChangeRequired,
        readingGoal: user.readingGoal,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
