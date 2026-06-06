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
