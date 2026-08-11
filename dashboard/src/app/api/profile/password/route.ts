import { prisma } from "@/lib/server/prisma";
import { ApiError } from "@/lib/server/errors";
import { hashPassword, verifyPassword } from "@/lib/server/auth";
import { authedRoute, corsPreflight, json } from "@/lib/server/api";
import { mapProfile } from "@/lib/server/mappers";
import { changePasswordSchema } from "@/lib/server/schemas";

export { corsPreflight as OPTIONS };

export const POST = authedRoute(async ({ request, user: currentUser }) => {
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

  return json({ data: mapProfile(user) });
});
