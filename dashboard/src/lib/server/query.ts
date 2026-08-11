import { ApiError } from "./errors";

export function parseListQuery(searchParams: URLSearchParams) {
  return {
    page: Math.max(1, Number(searchParams.get("page") ?? "1") || 1),
    pageSize: Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "50") || 50)),
    q: searchParams.get("q")?.trim() ?? "",
    sortBy: searchParams.get("sortBy")?.trim() ?? undefined,
    sortOrder: searchParams.get("sortOrder") === "asc" ? "asc" : "desc",
  } as const;
}

export function listMeta(total: number, page: number, pageSize: number) {
  return {
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Prisma `skip`/`take` for a 1-based page. */
export function paginate({ page, pageSize }: { page: number; pageSize: number }) {
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

/**
 * Case-insensitive `OR` filter over text columns, plus exact matches on string
 * array columns. Returns an empty filter when there is no search term.
 */
export function textSearch(q: string, fields: { contains?: string[]; has?: string[] }) {
  if (!q) {
    return {};
  }

  return {
    OR: [
      ...(fields.contains ?? []).map((field) => ({
        [field]: { contains: q, mode: "insensitive" as const },
      })),
      ...(fields.has ?? []).map((field) => ({ [field]: { has: q } })),
    ],
  };
}

/** Prisma date filter for an optional `from`/`to` range. */
export function dateRange(field: string, from: string | null, to: string | null) {
  if (!from && !to) {
    return {};
  }

  return {
    [field]: {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    },
  };
}

/** Resolve a lookup scoped to the owning user, or throw a 404 for `label`. */
export async function findOwnedOrThrow<T>(lookup: Promise<T | null>, label: string): Promise<T> {
  const item = await lookup;
  if (!item) {
    throw new ApiError(404, "NOT_FOUND", `${label} not found`);
  }
  return item;
}
