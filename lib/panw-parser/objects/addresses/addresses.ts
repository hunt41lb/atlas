// @/src/lib/panw-parser/objects/addresses/addresses.ts
//
// Address and Address Group types and extractors.
// Path: address > entry[], address-group > entry[]

import { entries, entryName, str, dig, members, membersAt } from "../../xml-helpers"
import { resolveFirstTagColor } from "../tags"
import type { PanwColorKey, ResolvedColor } from "../tags"

// ─── Types ────────────────────────────────────────────────────────────────────

export type AddressType = "ip-netmask" | "ip-range" | "fqdn" | "ip-wildcard"

export interface PanwAddress {
  name: string
  type: AddressType
  value: string
  description: string | null
  tags: string[]
  /** Resolved from first tag */
  color: ResolvedColor
}

export interface PanwAddressGroup {
  name: string
  type: "static" | "dynamic"
  /** Static: member address/group names. Dynamic: filter expression string */
  members: string[]
  dynamicFilter: string | null
  description: string | null
  tags: string[]
  color: ResolvedColor
}

// ─── Extractors ───────────────────────────────────────────────────────────────

/**
 * Extract Addresses from a shared, device-group, or vsys element.
 * Path: addrEl → entry[]
 */
export function extractAddresses(
  addrEl: unknown,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwAddress[] {
  return entries(addrEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    const ipNetmask = str(entry["ip-netmask"])
    const ipRange = str(entry["ip-range"])
    const fqdn = str(entry["fqdn"])
    const ipWildcard = str(entry["ip-wildcard"])

    const type = ipNetmask ? "ip-netmask"
      : ipRange ? "ip-range"
      : fqdn ? "fqdn"
      : "ip-wildcard"

    const value = ipNetmask ?? ipRange ?? fqdn ?? ipWildcard ?? ""

    return {
      name: entryName(entry),
      type,
      value,
      description: str(entry["description"]),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
    }
  })
}

/**
 * Extract Address Groups from a shared, device-group, or vsys element.
 * Path: agEl → entry[]
 */
export function extractAddressGroups(
  agEl: unknown,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwAddressGroup[] {
  return entries(agEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    const staticEl = entry["static"]
    const dynamicEl = entry["dynamic"]
    const isStatic = staticEl !== undefined && staticEl !== null

    const staticMembers = isStatic ? members(staticEl) : []
    const dynamicFilter = isStatic ? null : str(dig(dynamicEl, "filter"))

    return {
      name: entryName(entry),
      type: isStatic ? "static" : "dynamic",
      members: staticMembers,
      dynamicFilter,
      description: str(entry["description"]),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
    }
  })
}