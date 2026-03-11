// @/lib/panw-parser/xml-helpers.ts

/**
 * Typed helpers for working with fast-xml-parser output.
 * fast-xml-parser returns arrays for repeated elements and plain values
 * for single elements, so we normalize everything here.
 */

/** Coerce a value that may be a single item or array into an array */
export function toArray<T>(val: T | T[] | undefined | null): T[] {
  if (val === undefined || val === null) return []
  return Array.isArray(val) ? val : [val]
}

/** Safely get a string value, trimming whitespace */
export function str(val: unknown): string | null {
  if (val === undefined || val === null) return null
  const s = String(val).trim()
  return s.length > 0 ? s : null
}

/** Get member list from a <member> or <members> element */
export function members(val: unknown): string[] {
  if (!val || typeof val !== "object") return []
  const obj = val as Record<string, unknown>
  const raw = obj["member"]
  return toArray(raw)
    .map((m) => str(m))
    .filter((m): m is string => m !== null)
}

/** Get named entries from an element - handles single entry or array */
export function entries(val: unknown): Array<Record<string, unknown>> {
  if (!val || typeof val !== "object") return []
  const obj = val as Record<string, unknown>
  const raw = obj["entry"]
  if (!raw) return []
  return toArray(raw as Record<string, unknown> | Record<string, unknown>[])
}

/** Get the @_name attribute from a parsed XML entry */
export function entryName(entry: Record<string, unknown>): string {
  return str(entry["@_name"]) ?? ""
}

/** Get the @_uuid attribute from a parsed XML entry */
export function entryUuid(entry: Record<string, unknown>): string | null {
  return str(entry["@_uuid"])
}

/** Safely navigate a nested path on an object */
export function dig(
  obj: unknown,
  ...keys: string[]
): unknown {
  let current: unknown = obj
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined
    }
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

/** Get members at a nested path */
export function membersAt(obj: unknown, ...keys: string[]): string[] {
  return members(dig(obj, ...keys))
}

/** Boolean coercion for PANW yes/no strings */
export function yesNo(val: unknown): boolean {
  return str(val) === "yes"
}
