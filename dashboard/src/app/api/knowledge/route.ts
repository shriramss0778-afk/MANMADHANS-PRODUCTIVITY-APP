import { prisma } from "@/lib/server/prisma";
import { authedRoute, corsPreflight, json } from "@/lib/server/api";
import { knowledgeSchema } from "@/lib/server/schemas";
import { fromRevisionStatus, mapKnowledgeEntry } from "@/lib/server/mappers";
import { listMeta, paginate, parseListQuery, textSearch } from "@/lib/server/query";

export { corsPreflight as OPTIONS };

export const GET = authedRoute(async ({ request, user }) => {
  const { searchParams } = new URL(request.url);
  const { page, pageSize, q, sortOrder } = parseListQuery(searchParams);
  const category = searchParams.get("category");
  const status = searchParams.get("revisionStatus");
  const where = {
    userId: user.id,
    ...(category ? { category } : {}),
    ...(status ? { revisionStatus: fromRevisionStatus(status) } : {}),
    ...textSearch(q, { contains: ["title", "notes"], has: ["tags"] }),
  };

  const [total, items] = await Promise.all([
    prisma.knowledgeEntry.count({ where }),
    prisma.knowledgeEntry.findMany({
      where,
      orderBy: { dateLearned: sortOrder },
      ...paginate({ page, pageSize }),
    }),
  ]);

  return json({
    data: items.map(mapKnowledgeEntry),
    meta: listMeta(total, page, pageSize),
  });
});

export const POST = authedRoute(async ({ request, user }) => {
  const body = knowledgeSchema.parse(await request.json());
  const item = await prisma.knowledgeEntry.create({
    data: {
      userId: user.id,
      title: body.title,
      category: body.category,
      tags: body.tags,
      sourceType: body.sourceType,
      sourceLink: body.sourceLink,
      notes: body.notes,
      dateLearned: new Date(body.dateLearned),
      progress: body.progress,
      revisionStatus: fromRevisionStatus(body.revisionStatus),
      lastReviewed: body.lastReviewed ? new Date(body.lastReviewed) : null,
      nextReview: body.nextReview ? new Date(body.nextReview) : null,
      retention: body.retention,
      thumbnail: body.thumbnail,
    },
  });

  return json({ data: mapKnowledgeEntry(item) }, { status: 201 });
});
