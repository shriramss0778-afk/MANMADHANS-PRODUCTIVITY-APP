import { prisma } from "@/lib/server/prisma";
import { requireAuth } from "@/lib/server/auth";
import { json, handleRouteError, optionsResponse } from "@/lib/server/api";
import { bookSchema } from "@/lib/server/schemas";
import { fromBookStatus, mapBook } from "@/lib/server/mappers";
import { listMeta, parseListQuery } from "@/lib/server/query";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const { page, pageSize, q, sortOrder } = parseListQuery(searchParams);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const where = {
      userId: user.id,
      ...(status ? { status: fromBookStatus(status) } : {}),
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" as const } },
              { author: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        orderBy: { createdAt: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return json({
      data: items.map(mapBook),
      meta: listMeta(total, page, pageSize),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
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
  } catch (error) {
    return handleRouteError(error);
  }
}
