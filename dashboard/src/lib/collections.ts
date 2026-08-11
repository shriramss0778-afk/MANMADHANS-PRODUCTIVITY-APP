/** Replace the entry sharing `next`'s id, leaving the order untouched. */
export function replaceById<T extends { id: string }>(items: T[], next: T): T[] {
  return items.map((item) => (item.id === next.id ? next : item));
}

/** Drop the entry with `id`. */
export function removeById<T extends { id: string }>(items: T[], id: string): T[] {
  return items.filter((item) => item.id !== id);
}
