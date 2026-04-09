// @/src/lib/panw-parser/network/vlans/vlans.ts
//
// VLAN types and extractor.
// Path: network > vlan > entry[]

import { entries, entryName, str, dig, members } from "../../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanwVlanMac {
  mac: string
  interface: string | null
}

export interface PanwVlan {
  name: string
  virtualInterface: string | null
  memberInterfaces: string[]
  staticMacs: PanwVlanMac[]
  /** Panorama: which template this came from */
  templateName: string | null
}

// ─── Extractor ────────────────────────────────────────────────────────────────

/**
 * Extract VLANs from a template's <network> element.
 * Path: networkEl → vlan → entry[]
 */
export function extractVlans(
  networkEl: unknown,
  templateName: string | null
): PanwVlan[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const net = networkEl as Record<string, unknown>
  const vlanEl = net["vlan"]

  return entries(vlanEl).map((entry) => {
    const macEntries = entries(dig(entry, "mac"))
    const staticMacs: PanwVlanMac[] = macEntries.map((m) => ({
      mac: entryName(m),
      interface: str(m["interface"]) ?? null,
    }))

    return {
      name: entryName(entry),
      virtualInterface: str(dig(entry, "virtual-interface", "interface")) ?? null,
      memberInterfaces: members(dig(entry, "interface")),
      staticMacs,
      templateName,
    }
  })
}