// @/src/lib/panw-parser/objects/profile-groups/profile-groups.ts
//
// Security Profile Group types and extractor.
// Path: profile-group > entry[]

import { entries, entryName, str } from "../../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanwProfileGroup {
  name: string
  virus: string | null
  spyware: string | null
  vulnerability: string | null
  urlFiltering: string | null
  fileBlocking: string | null
  wildfireAnalysis: string | null
  dataFiltering: string | null
}

// ─── Extractor ────────────────────────────────────────────────────────────────

/**
 * Extract Security Profile Groups from a shared, device-group, or vsys element.
 * Path: pgEl → entry[]
 */
export function extractProfileGroups(pgEl: unknown): PanwProfileGroup[] {
  return entries(pgEl).map((entry) => ({
    name: entryName(entry),
    virus: str(entry["virus"]),
    spyware: str(entry["spyware"]),
    vulnerability: str(entry["vulnerability"]),
    urlFiltering: str(entry["url-filtering"]),
    fileBlocking: str(entry["file-blocking"]),
    wildfireAnalysis: str(entry["wildfire-analysis"]),
    dataFiltering: str(entry["data-filtering"]),
  }))
}