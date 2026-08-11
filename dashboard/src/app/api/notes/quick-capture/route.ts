import { NoteKind } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";
import { authedRoute, corsPreflight, json } from "@/lib/server/api";
import { noteSchema } from "@/lib/server/schemas";
import { mapNote } from "@/lib/server/mappers";

export { corsPreflight as OPTIONS };

export const GET = authedRoute(async ({ user }) => {
  const items = await prisma.note.findMany({
    where: { userId: user.id, kind: NoteKind.QUICK_CAPTURE },
    orderBy: { createdAt: "desc" },
  });
  return json({ data: items.map(mapNote) });
});

export const POST = authedRoute(async ({ request, user }) => {
  const body = noteSchema.parse(await request.json());
  const item = await prisma.note.create({
    data: {
      userId: user.id,
      kind: NoteKind.QUICK_CAPTURE,
      title: body.title,
      content: body.content,
    },
  });
  return json({ data: mapNote(item) }, { status: 201 });
});
