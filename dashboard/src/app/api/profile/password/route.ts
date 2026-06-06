import { prisma } from "@/lib/server/prisma";
import { ApiError } from "@/lib/server/errors";
import { hashPassword, requireAuth, verifyPassword } from "@/lib/server/auth";
import { handleRouteError, json, optionsResponse } from "@/lib/server/api";
import { changePasswordSchema } from "@/lib/server/schemas";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();
    const body = changePasswordSchema.parse(await request.json());

    if (!currentUser.passwordHash || !(await verifyPassword(body.oldPassword, currentUser.passwordHash))) {
      throw new ApiError(400, "INVALID_OLD_PASSWORD", "Current password is incorrect");
    }

    if (body.oldPassword === body.newPassword) {
      throw new ApiError(400, "PASSWORD_REUSE", "New password must be different from the current password");
    }

    const passwordHash = await hashPassword(body.newPassword);
    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        passwordHash,
        passwordChangeRequired: false,
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
