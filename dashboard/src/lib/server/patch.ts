/**
 * Helpers for PATCH bodies. Prisma skips `undefined` fields on update, so a
 * partial body can be forwarded directly once each present value is converted.
 */

/** Apply `map` only when `value` was supplied, keeping `undefined` as "no change". */
export function mapDefined<I, O>(value: I | undefined, map: (value: I) => O): O | undefined {
  return value === undefined ? undefined : map(value);
}

/** Convert a supplied date string to a `Date`, leaving absent values untouched. */
export function toDate(value: string | undefined): Date | undefined {
  return mapDefined(value, (date) => new Date(date));
}

/** Convert a supplied date string to a `Date`, clearing the column when empty. */
export function toNullableDate(value: string | undefined | null): Date | null | undefined {
  return value === undefined ? undefined : value ? new Date(value) : null;
}

/** Trim a supplied string, clearing the column when it becomes empty. */
export function toNullableTrimmed(value: string | undefined | null): string | null | undefined {
  return value === undefined ? undefined : (value?.trim() || null);
}
