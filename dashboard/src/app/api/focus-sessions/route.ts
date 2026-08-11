import { prisma } from "@/lib/server/prisma";
import { authedRoute, corsPreflight, json } from "@/lib/server/api";
import { focusSessionSchema } from "@/lib/server/schemas";
import { mapFocusSession } from "@/lib/server/mappers";

export { corsPreflight as OPTIONS };

export const GET = authedRoute(async ({ user }) => {
  const items = await prisma.focusSession.findMany({
    where: { userId: user.id },
    orderBy: { completedAt: "desc" },
    take: 200,
  });
  return json({ data: items.map(mapFocusSession) });
});

export const POST = authedRoute(async ({ request, user }) => {
  const body = focusSessionSchema.parse(await request.json());
  const item = await prisma.focusSession.create({
    data: {
      userId: user.id,
      mode: body.mode,
      durationMins: body.durationMins,
    },
  });
  return json({ data: mapFocusSession(item) }, { status: 201 });
});
