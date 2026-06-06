import { NoteKind } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";
import { requireAuth } from "@/lib/server/auth";
import { ApiError } from "@/lib/server/errors";
import { handleRouteError, noContent, optionsResponse } from "@/lib/server/api";

export async function OPTIONS() {
  return optionsResponse();
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    const note = await prisma.note.findFirst({
      where: { id, userId: user.id, kind: NoteKind.QUICK_CAPTURE },
    });
    if (!note) {
      throw new ApiError(404, "NOT_FOUND", "Quick capture note not found");
    }
    await prisma.note.delete({ where: { id } });
    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
