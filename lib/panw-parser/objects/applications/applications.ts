// @/src/lib/panw-parser/objects/applications/applications.ts
//
// Application Group and Application Filter types and extractors.
// Path: application-group > entry[], application-filter > entry[]

import { entries, entryName, members, membersAt } from "../../xml-helpers"
import { resolveFirstTagColor } from "../tags"
import type { PanwColorKey, ResolvedColor } from "../tags"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanwApplicationGroup {
  name: string
  members: string[]
  tags: string[]
  color: ResolvedColor
}

export interface PanwApplicationFilter {
  name: string
  tags: string[]
  color: ResolvedColor
}

// ─── Extractors ───────────────────────────────────────────────────────────────

/**
 * Extract Application Groups from a shared, device-group, or vsys element.
 * Path: agEl → entry[]
 */
export function extractApplicationGroups(
  agEl: unknown,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwApplicationGroup[] {
  return entries(agEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    return {
      name: entryName(entry),
      members: members(entry["members"]),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
    }
  })
}

/**
 * Extract Application Filters from a shared, device-group, or vsys element.
 * Path: afEl → entry[]
 */
export function extractApplicationFilters(
  afEl: unknown,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwApplicationFilter[] {
  return entries(afEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    return {
      name: entryName(entry),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
    }
  })
}