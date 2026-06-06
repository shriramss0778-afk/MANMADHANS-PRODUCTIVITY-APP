import { prisma } from "@/lib/server/prisma";
import { requireAuth } from "@/lib/server/auth";
import { ApiError } from "@/lib/server/errors";
import { json, handleRouteError, noContent, optionsResponse } from "@/lib/server/api";
import { bookSchema } from "@/lib/server/schemas";
import { fromBookStatus, mapBook } from "@/lib/server/mappers";

async function findBook(userId: string, id: string) {
  const item = await prisma.book.findFirst({ where: { id, userId } });
  if (!item) {
    throw new ApiError(404, "NOT_FOUND", "Book not found");
  }
  return item;
}

export async function OPTIONS() {
  return optionsResponse();
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    await findBook(user.id, id);
    const body = bookSchema.partial().parse(await request.json());
    const item = await prisma.book.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.author !== undefined ? { author: body.author } : {}),
        ...(body.cover !== undefined ? { cover: body.cover } : {}),
        ...(body.category !== undefined ? { category: body.category } : {}),
        ...(body.status !== undefined ? { status: fromBookStatus(body.status) } : {}),
        ...(body.totalPages !== undefined ? { totalPages: body.totalPages } : {}),
        ...(body.pagesRead !== undefined ? { pagesRead: body.pagesRead } : {}),
        ...(body.rating !== undefined ? { rating: body.rating } : {}),
        ...(body.startedAt !== undefined ? { startedAt: body.startedAt ? new Date(body.startedAt) : null } : {}),
        ...(body.finishedAt !== undefined ? { finishedAt: body.finishedAt ? new Date(body.finishedAt) : null } : {}),
        ...(body.highlights !== undefined ? { highlights: body.highlights } : {}),
        ...(body.favoriteQuote !== undefined ? { favoriteQuote: body.favoriteQuote } : {}),
      },
    });
    return json({ data: mapBook(item) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    await findBook(user.id, id);
    await prisma.book.delete({ where: { id } });
    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
