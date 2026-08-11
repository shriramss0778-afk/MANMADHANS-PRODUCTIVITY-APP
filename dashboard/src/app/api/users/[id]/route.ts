import { prisma } from "@/lib/server/prisma";
import { ApiError } from "@/lib/server/errors";
import { corsPreflight, json, noContent, superAdminRoute } from "@/lib/server/api";
import { mapManagedUser, type ManagedUserRecord } from "@/lib/server/mappers";
import { managedUserSchema } from "@/lib/server/schemas";

export { corsPreflight as OPTIONS };

export const PATCH = superAdminRoute<{ id: string }>("users", async ({ request, user: currentUser, params }) => {
  const body = managedUserSchema.partial().parse(await request.json());

  if (currentUser.id === params.id && body.role && body.role !== "SUPER_ADMIN") {
    throw new ApiError(400, "ROLE_CHANGE_BLOCKED", "You cannot remove your own super admin role");
  }

  const user = (await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(body.email ? { email: body.email.toLowerCase() } : {}),
      name: body.name,
      ...(body.role ? { role: body.role as never } : {}),
      isActive: body.isActive as never,
      googleLoginEnabled: body.googleLoginEnabled as never,
    },
  })) as ManagedUserRecord;

  return json({ data: mapManagedUser(user) });
});

export const DELETE = superAdminRoute<{ id: string }>("users", async ({ user: currentUser, params }) => {
  if (currentUser.id === params.id) {
    throw new ApiError(400, "DELETE_SELF_BLOCKED", "You cannot delete your own account");
  }

  await prisma.user.delete({ where: { id: params.id } });

  return noContent();
});
