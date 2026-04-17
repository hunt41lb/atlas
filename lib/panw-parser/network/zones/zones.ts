// @/lib/panw-parser/network/zones/zones.ts
//
// Zone types and extractor.
// Path: vsys > entry > zone > entry[]

import { entries, entryName, str, dig, members, membersAt } from "../../xml-helpers"
import { type PanwColorKey, type ResolvedColor, resolveFirstTagColor } from "../../objects/tags"

// ─── Types ────────────────────────────────────────────────────────────────────

export type ZoneType = "layer3" | "layer2" | "virtual-wire" | "tap" | "tunnel" | "external" | "unknown"

export interface PanwZone {
  name: string
  type: ZoneType
  interfaces: string[]
  tags: string[]
  color: ResolvedColor
  zoneProtectionProfile: string | null
  logSetting: string | null
  packetBufferProtection: boolean
  netInspection: boolean
  enableUserIdentification: boolean
  enableDeviceIdentification: boolean
  userAclInclude: string[]
  userAclExclude: string[]
  deviceAclInclude: string[]
  deviceAclExclude: string[]
  prenatUserIdentification: boolean
  prenatDeviceIdentification: boolean
  prenatSourceLookup: boolean
  prenatSourceIpDownstream: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectZoneType(entry: Record<string, unknown>): ZoneType {
  // PAN-OS nests zone type under <network>: <entry><network><layer3>...</layer3></network></entry>
  const net = entry["network"] as Record<string, unknown> | undefined
  if (!net) return "unknown"
  if (net["layer3"] !== undefined) return "layer3"
  if (net["layer2"] !== undefined) return "layer2"
  if (net["virtual-wire"] !== undefined) return "virtual-wire"
  if (net["tap"] !== undefined) return "tap"
  if (net["tunnel"] !== undefined) return "tunnel"
  if (net["external"] !== undefined) return "external"
  return "unknown"
}

function zoneInterfaces(entry: Record<string, unknown>, type: ZoneType): string[] {
  // PAN-OS: <entry><network><layer3><member>eth1/1</member></layer3></network></entry>
  const net = entry["network"] as Record<string, unknown> | undefined
  if (!net) return []
  const typeEl = net[type]
  if (!typeEl) return []
  return membersAt(typeEl, "member").length > 0
    ? membersAt(typeEl, "member")
    : members(typeEl)
}

// ─── Extractor ────────────────────────────────────────────────────────────────

/**
 * Extract Zones from a vsys or template-stack element.
 * Path: zoneEl → entry[]
 */
export function extractZones(
  zoneEl: unknown,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwZone[] {
  return entries(zoneEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    const type = detectZoneType(entry)
    const networkEl = entry["network"] as Record<string, unknown> | undefined

    const tagColor = resolveFirstTagColor(tagNames, tagColorMap)
    const color = tagColor !== "var(--muted-foreground)"
      ? tagColor
      : resolveFirstTagColor([entryName(entry)], tagColorMap)

    // PAN-OS defaults packet buffer protection to enabled when a zone
    // protection profile is assigned.  The XML element only appears
    // when explicitly set; absence → default-on when ZPP is present.
    const pbpEl = dig(networkEl, "enable-packet-buffer-protection")
    const hasZpp = str(dig(networkEl, "zone-protection-profile")) != null

    return {
      name: entryName(entry),
      type,
      interfaces: zoneInterfaces(entry, type),
      tags: tagNames,
      color,
      zoneProtectionProfile: str(dig(networkEl, "zone-protection-profile")) ?? null,
      logSetting: str(dig(networkEl, "log-setting")) ?? null,
      packetBufferProtection: pbpEl !== undefined ? str(pbpEl) !== "no" : hasZpp,
      netInspection: str(dig(networkEl, "net-inspection")) === "yes",
      enableUserIdentification: str(entry["enable-user-identification"]) === "yes",
      enableDeviceIdentification: str(entry["enable-device-identification"]) === "yes",
      prenatUserIdentification: str(dig(networkEl, "prenat-identification", "enable-prenat-user-identification")) === "yes",
      prenatDeviceIdentification: str(dig(networkEl, "prenat-identification", "enable-prenat-device-identification")) === "yes",
      prenatSourceLookup: str(dig(networkEl, "prenat-identification", "enable-prenat-source-policy-lookup")) === "yes",
      prenatSourceIpDownstream: str(dig(networkEl, "prenat-identification", "enable-prenat-source-ip-downstream")) === "yes",
      userAclInclude: members(dig(entry, "user-acl", "include-list")),
      userAclExclude: members(dig(entry, "user-acl", "exclude-list")),
      deviceAclInclude: members(dig(entry, "device-acl", "include-list")),
      deviceAclExclude: members(dig(entry, "device-acl", "exclude-list")),
    }
  })
}
