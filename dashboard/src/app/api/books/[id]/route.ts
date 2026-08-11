import { prisma } from "@/lib/server/prisma";
import { authedRoute, corsPreflight, json, noContent } from "@/lib/server/api";
import { bookSchema } from "@/lib/server/schemas";
import { fromBookStatus, mapBook } from "@/lib/server/mappers";
import { mapDefined, toNullableDate } from "@/lib/server/patch";
import { findOwnedOrThrow } from "@/lib/server/query";

function findBook(userId: string, id: string) {
  return findOwnedOrThrow(prisma.book.findFirst({ where: { id, userId } }), "Book");
}

export { corsPreflight as OPTIONS };

export const PATCH = authedRoute<{ id: string }>(async ({ request, user, params }) => {
  const book = await findBook(user.id, params.id);
  const body = bookSchema.partial().parse(await request.json());
  const item = await prisma.book.update({
    where: { id: book.id },
    data: {
      title: body.title,
      author: body.author,
      cover: body.cover,
      category: body.category,
      status: mapDefined(body.status, fromBookStatus),
      totalPages: body.totalPages,
      pagesRead: body.pagesRead,
      rating: body.rating,
      startedAt: toNullableDate(body.startedAt),
      finishedAt: toNullableDate(body.finishedAt),
      highlights: body.highlights,
      favoriteQuote: body.favoriteQuote,
    },
  });
  return json({ data: mapBook(item) });
});

export const DELETE = authedRoute<{ id: string }>(async ({ user, params }) => {
  const book = await findBook(user.id, params.id);
  await prisma.book.delete({ where: { id: book.id } });
  return noContent();
});
