import { prisma } from "@/lib/server/prisma";
import { authedRoute, corsPreflight, json } from "@/lib/server/api";
import { bookSchema } from "@/lib/server/schemas";
import { fromBookStatus, mapBook } from "@/lib/server/mappers";
import { listMeta, paginate, parseListQuery, textSearch } from "@/lib/server/query";

export { corsPreflight as OPTIONS };

export const GET = authedRoute(async ({ request, user }) => {
  const { searchParams } = new URL(request.url);
  const { page, pageSize, q, sortOrder } = parseListQuery(searchParams);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const where = {
    userId: user.id,
    ...(status ? { status: fromBookStatus(status) } : {}),
    ...(category ? { category } : {}),
    ...textSearch(q, { contains: ["title", "author"] }),
  };

  const [total, items] = await Promise.all([
    prisma.book.count({ where }),
    prisma.book.findMany({
      where,
      orderBy: { createdAt: sortOrder },
      ...paginate({ page, pageSize }),
    }),
  ]);

  return json({
    data: items.map(mapBook),
    meta: listMeta(total, page, pageSize),
  });
});

export const POST = authedRoute(async ({ request, user }) => {
  const body = bookSchema.parse(await request.json());
  const item = await prisma.book.create({
    data: {
      userId: user.id,
      title: body.title,
      author: body.author,
      cover: body.cover,
      category: body.category,
      status: fromBookStatus(body.status),
      totalPages: body.totalPages,
      pagesRead: body.pagesRead,
      rating: body.rating,
      startedAt: body.startedAt ? new Date(body.startedAt) : null,
      finishedAt: body.finishedAt ? new Date(body.finishedAt) : null,
      highlights: body.highlights,
      favoriteQuote: body.favoriteQuote,
    },
  });

  return json({ data: mapBook(item) }, { status: 201 });
});
