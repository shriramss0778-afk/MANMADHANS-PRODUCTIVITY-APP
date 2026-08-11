import { NoteKind } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";
import { authedRoute, corsPreflight, noContent } from "@/lib/server/api";
import { findOwnedOrThrow } from "@/lib/server/query";

export { corsPreflight as OPTIONS };

export const DELETE = authedRoute<{ id: string }>(async ({ user, params }) => {
  const note = await findOwnedOrThrow(
    prisma.note.findFirst({
      where: { id: params.id, userId: user.id, kind: NoteKind.QUICK_CAPTURE },
    }),
    "Quick capture note",
  );
  await prisma.note.delete({ where: { id: note.id } });
  return noContent();
});
