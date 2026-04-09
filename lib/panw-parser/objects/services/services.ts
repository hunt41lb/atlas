// @/src/lib/panw-parser/objects/services/services.ts
//
// Service and Service Group types and extractors.
// Path: service > entry[], service-group > entry[]

import { entries, entryName, str, dig, members, membersAt } from "../../xml-helpers"
import { resolveFirstTagColor } from "../tags"
import type { PanwColorKey, ResolvedColor } from "../tags"

// ─── Types ────────────────────────────────────────────────────────────────────

export type ServiceProtocol = "tcp" | "udp" | "sctp"

export interface PanwService {
  name: string
  protocol: ServiceProtocol
  port: string
  description: string | null
  tags: string[]
  color: ResolvedColor
}

export interface PanwServiceGroup {
  name: string
  members: string[]
  tags: string[]
  color: ResolvedColor
}

// ─── Extractors ───────────────────────────────────────────────────────────────

/**
 * Extract Services from a shared, device-group, or vsys element.
 * Path: svcEl → entry[]
 */
export function extractServices(
  svcEl: unknown,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwService[] {
  return entries(svcEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    const proto = entry["protocol"] as Record<string, unknown> | undefined
    const tcpEl = dig(proto, "tcp")
    const udpEl = dig(proto, "udp")
    const sctpEl = dig(proto, "sctp")

    const protocol = tcpEl ? "tcp" : udpEl ? "udp" : "sctp"
    const protoData = (tcpEl ?? udpEl ?? sctpEl) as Record<string, unknown> | undefined
    const port = str(protoData?.["port"]) ?? ""

    return {
      name: entryName(entry),
      protocol,
      port,
      description: str(entry["description"]),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
    }
  })
}

/**
 * Extract Service Groups from a shared, device-group, or vsys element.
 * Path: sgEl → entry[]
 */
export function extractServiceGroups(
  sgEl: unknown,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwServiceGroup[] {
  return entries(sgEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    return {
      name: entryName(entry),
      members: members(entry["members"]),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
    }
  })
}