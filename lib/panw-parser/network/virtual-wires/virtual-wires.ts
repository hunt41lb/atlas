// @/src/lib/panw-parser/network/virtual-wires/virtual-wires.ts
//
// Virtual Wire types and extractor.
// Path: network > virtual-wire > entry[]

import { entries, entryName, str, dig } from "../../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanwVirtualWire {
  name: string
  interface1: string | null
  interface2: string | null
  tagAllowed: string | null
  multicastFirewalling: boolean
  /** Panorama: which template this came from */
  templateName: string | null
}

// ─── Extractor ────────────────────────────────────────────────────────────────

/**
 * Extract Virtual Wires from a template's <network> element.
 * Path: networkEl → virtual-wire → entry[]
 */
export function extractVirtualWires(
  networkEl: unknown,
  templateName: string | null
): PanwVirtualWire[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const net = networkEl as Record<string, unknown>
  const vwEl = net["virtual-wire"]

  return entries(vwEl).map((entry) => ({
    name: entryName(entry),
    interface1: str(entry["interface1"]) ?? null,
    interface2: str(entry["interface2"]) ?? null,
    tagAllowed: str(entry["tag-allowed"]) ?? null,
    multicastFirewalling: str(dig(entry, "multicast-firewalling", "enable")) === "yes",
    templateName,
  }))
}