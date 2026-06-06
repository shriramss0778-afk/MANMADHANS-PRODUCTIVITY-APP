import { prisma } from "@/lib/server/prisma";
import { requireAuth } from "@/lib/server/auth";
import { json, handleRouteError, optionsResponse } from "@/lib/server/api";
import { knowledgeSchema } from "@/lib/server/schemas";
import { fromRevisionStatus, mapKnowledgeEntry } from "@/lib/server/mappers";
import { listMeta, parseListQuery } from "@/lib/server/query";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const { page, pageSize, q, sortOrder } = parseListQuery(searchParams);
    const category = searchParams.get("category");
    const status = searchParams.get("revisionStatus");
    const where = {
      userId: user.id,
      ...(category ? { category } : {}),
      ...(status ? { revisionStatus: fromRevisionStatus(status) } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" as const } },
              { notes: { contains: q, mode: "insensitive" as const } },
              { tags: { has: q } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.knowledgeEntry.count({ where }),
      prisma.knowledgeEntry.findMany({
        where,
        orderBy: { dateLearned: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return json({
      data: items.map(mapKnowledgeEntry),
      meta: listMeta(total, page, pageSize),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
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
  } catch (error) {
    return handleRouteError(error);
  }
}
