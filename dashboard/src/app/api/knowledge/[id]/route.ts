import { prisma } from "@/lib/server/prisma";
import { requireAuth } from "@/lib/server/auth";
import { ApiError } from "@/lib/server/errors";
import { json, handleRouteError, noContent, optionsResponse } from "@/lib/server/api";
import { knowledgeSchema } from "@/lib/server/schemas";
import { fromRevisionStatus, mapKnowledgeEntry } from "@/lib/server/mappers";

async function findEntry(userId: string, id: string) {
  const entry = await prisma.knowledgeEntry.findFirst({ where: { id, userId } });
  if (!entry) {
    throw new ApiError(404, "NOT_FOUND", "Knowledge entry not found");
  }
  return entry;
}

export async function OPTIONS() {
  return optionsResponse();
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    await findEntry(user.id, id);
    const body = knowledgeSchema.partial().parse(await request.json());
    const item = await prisma.knowledgeEntry.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.category !== undefined ? { category: body.category } : {}),
        ...(body.tags !== undefined ? { tags: body.tags } : {}),
        ...(body.sourceType !== undefined ? { sourceType: body.sourceType } : {}),
        ...(body.sourceLink !== undefined ? { sourceLink: body.sourceLink } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
        ...(body.dateLearned !== undefined ? { dateLearned: new Date(body.dateLearned) } : {}),
        ...(body.progress !== undefined ? { progress: body.progress } : {}),
        ...(body.revisionStatus !== undefined ? { revisionStatus: fromRevisionStatus(body.revisionStatus) } : {}),
        ...(body.lastReviewed !== undefined ? { lastReviewed: body.lastReviewed ? new Date(body.lastReviewed) : null } : {}),
        ...(body.nextReview !== undefined ? { nextReview: body.nextReview ? new Date(body.nextReview) : null } : {}),
        ...(body.retention !== undefined ? { retention: body.retention } : {}),
        ...(body.thumbnail !== undefined ? { thumbnail: body.thumbnail } : {}),
      },
    });

    return json({ data: mapKnowledgeEntry(item) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    await findEntry(user.id, id);
    await prisma.knowledgeEntry.delete({ where: { id } });
    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
