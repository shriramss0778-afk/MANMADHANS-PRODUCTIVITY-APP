import { prisma } from "@/lib/server/prisma";
import { authedRoute, corsPreflight, json, noContent } from "@/lib/server/api";
import { knowledgeSchema } from "@/lib/server/schemas";
import { fromRevisionStatus, mapKnowledgeEntry } from "@/lib/server/mappers";
import { mapDefined, toDate, toNullableDate } from "@/lib/server/patch";
import { findOwnedOrThrow } from "@/lib/server/query";

function findEntry(userId: string, id: string) {
  return findOwnedOrThrow(
    prisma.knowledgeEntry.findFirst({ where: { id, userId } }),
    "Knowledge entry",
  );
}

export { corsPreflight as OPTIONS };

export const PATCH = authedRoute<{ id: string }>(async ({ request, user, params }) => {
  const entry = await findEntry(user.id, params.id);
  const body = knowledgeSchema.partial().parse(await request.json());
  const item = await prisma.knowledgeEntry.update({
    where: { id: entry.id },
    data: {
      title: body.title,
      category: body.category,
      tags: body.tags,
      sourceType: body.sourceType,
      sourceLink: body.sourceLink,
      notes: body.notes,
      dateLearned: toDate(body.dateLearned),
      progress: body.progress,
      revisionStatus: mapDefined(body.revisionStatus, fromRevisionStatus),
      lastReviewed: toNullableDate(body.lastReviewed),
      nextReview: toNullableDate(body.nextReview),
      retention: body.retention,
      thumbnail: body.thumbnail,
    },
  });

  return json({ data: mapKnowledgeEntry(item) });
});

export const DELETE = authedRoute<{ id: string }>(async ({ user, params }) => {
  const entry = await findEntry(user.id, params.id);
  await prisma.knowledgeEntry.delete({ where: { id: entry.id } });
  return noContent();
});
