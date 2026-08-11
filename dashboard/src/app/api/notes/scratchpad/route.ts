import { NoteKind } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";
import { authedRoute, corsPreflight, json } from "@/lib/server/api";
import { noteSchema } from "@/lib/server/schemas";
import { mapNote } from "@/lib/server/mappers";

const starterNote = `Capture ideas, rough plans, reminders, or anything you want to keep close.

- What matters most today?
- What should not be forgotten this week?
- What is the next tiny step?`;

function findScratchpad(userId: string) {
  return prisma.note.findFirst({ where: { userId, kind: NoteKind.SCRATCHPAD } });
}

export { corsPreflight as OPTIONS };

export const GET = authedRoute(async ({ user }) => {
  const note =
    (await findScratchpad(user.id)) ??
    (await prisma.note.create({
      data: {
        userId: user.id,
        kind: NoteKind.SCRATCHPAD,
        content: starterNote,
      },
    }));

  return json({ data: mapNote(note) });
});

export const PUT = authedRoute(async ({ request, user }) => {
  const body = noteSchema.parse(await request.json());
  const existing = await findScratchpad(user.id);

  const note = existing
    ? await prisma.note.update({
        where: { id: existing.id },
        data: {
          content: body.content,
          title: body.title,
        },
      })
    : await prisma.note.create({
        data: {
          userId: user.id,
          kind: NoteKind.SCRATCHPAD,
          content: body.content,
          title: body.title,
        },
      });

  return json({ data: mapNote(note) });
});
