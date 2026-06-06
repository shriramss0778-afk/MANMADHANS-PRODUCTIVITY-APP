import { NoteKind } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";
import { requireAuth } from "@/lib/server/auth";
import { json, handleRouteError, optionsResponse } from "@/lib/server/api";
import { noteSchema } from "@/lib/server/schemas";
import { mapNote } from "@/lib/server/mappers";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const user = await requireAuth();
    const items = await prisma.note.findMany({
      where: { userId: user.id, kind: NoteKind.QUICK_CAPTURE },
      orderBy: { createdAt: "desc" },
    });
    return json({ data: items.map(mapNote) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
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
  } catch (error) {
    return handleRouteError(error);
  }
}
