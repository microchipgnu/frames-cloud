import type { Entity } from "./types.ts";

export function encodeCursor(entity_id: string): string {
  return Buffer.from(entity_id, "utf8").toString("base64url");
}

export function decodeCursor(cursor: string | undefined): string | null {
  if (!cursor) return null;
  try {
    return Buffer.from(cursor, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

export type EntityFilter = Record<string, string[]>; // field -> allowed values (OR)

export function parseFilters(query: URLSearchParams): EntityFilter {
  const filters: EntityFilter = {};
  for (const [key, value] of query.entries()) {
    const m = key.match(/^filter\[([a-zA-Z0-9_]+)\]$/);
    if (!m) continue;
    const field = m[1]!;
    filters[field] = value.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return filters;
}

export function entityMatches(ent: Entity, filters: EntityFilter): boolean {
  for (const [field, allowed] of Object.entries(filters)) {
    const v = ent.fields[field];
    if (v === undefined || v === null) return false;
    if (!allowed.includes(String(v))) return false;
  }
  return true;
}

export function paginate(
  entities: Iterable<Entity>,
  cursor: string | null,
  limit: number,
  filters: EntityFilter,
): { rows: Entity[]; next_cursor: string | null; has_more: boolean } {
  const sorted = [...entities].sort((a, b) => a.entity_id.localeCompare(b.entity_id));
  let start = 0;
  if (cursor) {
    const idx = sorted.findIndex((e) => e.entity_id > cursor);
    start = idx === -1 ? sorted.length : idx;
  }
  const matching: Entity[] = [];
  let i = start;
  while (i < sorted.length && matching.length < limit) {
    const ent = sorted[i]!;
    if (!ent.removed && entityMatches(ent, filters)) matching.push(ent);
    i++;
  }
  const has_more = i < sorted.length;
  const next_cursor = has_more && matching.length > 0
    ? encodeCursor(matching[matching.length - 1]!.entity_id)
    : null;
  return { rows: matching, next_cursor, has_more };
}
