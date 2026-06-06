import { prisma } from "@/lib/server/prisma";
import { hashPassword, requireAuth } from "@/lib/server/auth";
import { ApiError } from "@/lib/server/errors";
import { handleRouteError, json, optionsResponse } from "@/lib/server/api";
import { mapManagedUser } from "@/lib/server/mappers";
import { managedUserSchema } from "@/lib/server/schemas";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const currentUser = await requireAuth();
    if (currentUser.role !== "SUPER_ADMIN") {
      throw new ApiError(403, "FORBIDDEN", "Only super admins can manage users");
    }

    const users = (await prisma.user.findMany({
      orderBy: [{ createdAt: "desc" }],
    })) as Array<{
      id: string;
      email: string;
      name: string;
      role: string;
      isActive: boolean;
      googleLoginEnabled: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>;

    return json({ data: users.map(mapManagedUser) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();
    if (currentUser.role !== "SUPER_ADMIN") {
      throw new ApiError(403, "FORBIDDEN", "Only super admins can manage users");
    }
    const body = managedUserSchema.parse(await request.json());
    const passwordHash = await hashPassword("Welcome@123");

    const user = (await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        name: body.name,
        role: body.role as never,
        isActive: true as never,
        googleLoginEnabled: true as never,
        passwordChangeRequired: true as never,
        readingGoal: 24,
        passwordHash,
        timerSettings: {
          create: {
            focus: 25,
            short: 5,
            long: 15,
          },
        },
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

    return json({ data: mapManagedUser(user) }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
