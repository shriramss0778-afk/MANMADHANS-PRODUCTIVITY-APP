import { prisma } from "@/lib/server/prisma";
import { authedRoute, corsPreflight, json } from "@/lib/server/api";
import { mapProfile } from "@/lib/server/mappers";
import { profileSchema } from "@/lib/server/schemas";

export { corsPreflight as OPTIONS };

export const GET = authedRoute(async ({ user }) => json({ data: mapProfile(user) }));

export const PATCH = authedRoute(async ({ request, user: currentUser }) => {
  const body = profileSchema.parse(await request.json());

  const user = await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      name: body.name,
      readingGoal: body.readingGoal,
    },
  });

  return json({ data: mapProfile(user) });
});
