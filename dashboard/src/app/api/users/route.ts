import { prisma } from "@/lib/server/prisma";
import { hashPassword } from "@/lib/server/auth";
import { corsPreflight, json, superAdminRoute } from "@/lib/server/api";
import { mapManagedUser, type ManagedUserRecord } from "@/lib/server/mappers";
import { managedUserSchema } from "@/lib/server/schemas";
import { DEFAULT_READING_GOAL, DEFAULT_TIMER_SETTINGS } from "@/lib/defaults";

export { corsPreflight as OPTIONS };

export const GET = superAdminRoute("users", async () => {
  const users = (await prisma.user.findMany({
    orderBy: [{ createdAt: "desc" }],
  })) as ManagedUserRecord[];

  return json({ data: users.map(mapManagedUser) });
});

export const POST = superAdminRoute("users", async ({ request }) => {
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
      readingGoal: DEFAULT_READING_GOAL,
      passwordHash,
      timerSettings: {
        create: DEFAULT_TIMER_SETTINGS,
      },
    },
  })) as ManagedUserRecord;

  return json({ data: mapManagedUser(user) }, { status: 201 });
});
