// @/lib/panw-parser/network/interfaces/sdwan-interfaces.ts
//
// SD-WAN interface types and extractor.
// Path: network > interface > sdwan > units > entry[]

import { entries, entryName, str, dig, members } from "../../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanwSdwanInterface {
  name: string
  linkTag: string | null
  comment: string | null
  protocol: string | null
  interfaces: string[]
  templateName: string | null
}

// ─── Extractor ────────────────────────────────────────────────────────────────

/**
 * Extract SD-WAN interfaces from a template's <network> element.
 * Path: networkEl → interface → sdwan → units → entry[]
 */
export function extractSdwanInterfaces(
  networkEl: unknown,
  templateName: string | null,
): PanwSdwanInterface[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const ifaceEl = (networkEl as Record<string, unknown>)["interface"] as Record<string, unknown> | undefined
  if (!ifaceEl) return []

  const unitsEl = dig(ifaceEl, "sdwan", "units")
  return entries(unitsEl).map((entry) => ({
    name: entryName(entry),
    linkTag: str(entry["link-tag"]) ?? null,
    comment: str(entry["comment"]) ?? null,
    protocol: str(entry["protocol"]) ?? null,
    interfaces: members(entry["interface"]),
    templateName,
  }))
}
