import { prisma } from "@/lib/server/prisma";
import { ApiError } from "@/lib/server/errors";
import { requireAuth } from "@/lib/server/auth";
import { handleRouteError, json, noContent, optionsResponse } from "@/lib/server/api";
import { mapManagedUser } from "@/lib/server/mappers";
import { managedUserSchema } from "@/lib/server/schemas";

export async function OPTIONS() {
  return optionsResponse();
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    if (currentUser.role !== "SUPER_ADMIN") {
      throw new ApiError(403, "FORBIDDEN", "Only super admins can manage users");
    }
    const { id } = await context.params;
    const body = managedUserSchema.partial().parse(await request.json());

    if (currentUser.id === id && body.role && body.role !== "SUPER_ADMIN") {
      throw new ApiError(400, "ROLE_CHANGE_BLOCKED", "You cannot remove your own super admin role");
    }

    const user = (await prisma.user.update({
      where: { id },
      data: {
        ...(body.email ? { email: body.email.toLowerCase() } : {}),
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.role ? { role: body.role as never } : {}),
        ...(body.isActive !== undefined ? { isActive: body.isActive as never } : {}),
        ...(body.googleLoginEnabled !== undefined
          ? { googleLoginEnabled: body.googleLoginEnabled as never }
          : {}),
      },
    })) as {
      id: string;
      email: string;
      name: string;
      role: string;
      isActive: boolean;
      googleLoginEnabled: boolean;
      createdAt: Date;
      updatedAt: Date;
    };

    return json({ data: mapManagedUser(user) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    if (currentUser.role !== "SUPER_ADMIN") {
      throw new ApiError(403, "FORBIDDEN", "Only super admins can manage users");
    }
    const { id } = await context.params;

    if (currentUser.id === id) {
      throw new ApiError(400, "DELETE_SELF_BLOCKED", "You cannot delete your own account");
    }

    await prisma.user.delete({
      where: { id },
    });

    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
