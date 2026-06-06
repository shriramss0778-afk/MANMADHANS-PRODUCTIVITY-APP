import { NoteKind } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";
import { requireAuth } from "@/lib/server/auth";
import { json, handleRouteError, optionsResponse } from "@/lib/server/api";
import { noteSchema } from "@/lib/server/schemas";
import { mapNote } from "@/lib/server/mappers";

const starterNote = `Capture ideas, rough plans, reminders, or anything you want to keep close.

- What matters most today?
- What should not be forgotten this week?
- What is the next tiny step?`;

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const user = await requireAuth();
    let note = await prisma.note.findFirst({
      where: { userId: user.id, kind: NoteKind.SCRATCHPAD },
    });

    if (!note) {
      note = await prisma.note.create({
        data: {
          userId: user.id,
          kind: NoteKind.SCRATCHPAD,
          content: starterNote,
        },
      });
    }

    return json({ data: mapNote(note) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth();
    const body = noteSchema.parse(await request.json());
    const existing = await prisma.note.findFirst({
      where: { userId: user.id, kind: NoteKind.SCRATCHPAD },
    });

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
  } catch (error) {
    return handleRouteError(error);
  }
}
