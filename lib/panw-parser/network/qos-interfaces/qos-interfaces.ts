// @/src/lib/panw-parser/network/qos-interfaces/qos-interfaces.ts
//
// QoS Interface types and extractor.
// Path: network > qos > interface > entry[]

import { entries, entryName, str, dig, members } from "../../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanwQosTrafficMember {
  name: string
  qosProfile: string | null
  sourceInterface: string | null
  destinationInterface: string | null
  sourceSubnet: string[]
}

export interface PanwQosTrafficGroup {
  egressGuaranteed: number | null
  egressMax: number | null
  defaultProfile: string | null
  members: PanwQosTrafficMember[]
}

export interface PanwQosInterface {
  interface: string
  enabled: boolean
  egressMax: number | null
  defaultClearTextProfile: string | null
  defaultTunnelProfile: string | null
  clearTextTraffic: PanwQosTrafficGroup
  tunneledTraffic: PanwQosTrafficGroup
  templateName: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractTrafficMembers(groupsEl: unknown): PanwQosTrafficMember[] {
  // groups > entry[] > members > entry[]
  return entries(groupsEl).flatMap((group) =>
    entries(group["members"]).map((member) => {
      const matchEl = member["match"] as Record<string, unknown> | undefined
      const localAddr = matchEl?.["local-address"] as Record<string, unknown> | undefined

      return {
        name: entryName(member),
        qosProfile: str(member["qos-profile"]),
        sourceInterface: str(localAddr?.["interface"]),
        destinationInterface: str(localAddr?.["destination_interface"]),
        sourceSubnet: members(localAddr?.["address"]),
      }
    })
  )
}

function extractTrafficGroup(trafficEl: unknown): PanwQosTrafficGroup {
  if (!trafficEl || typeof trafficEl !== "object") {
    return { egressGuaranteed: null, egressMax: null, defaultProfile: null, members: [] }
  }
  const el = trafficEl as Record<string, unknown>
  const bwEl = el["bandwidth"] as Record<string, unknown> | undefined
  const defaultEl = el["default-group"] as Record<string, unknown> | undefined

  return {
    egressGuaranteed: bwEl?.["egress-guaranteed"] !== undefined ? Number(bwEl["egress-guaranteed"]) : null,
    egressMax: bwEl?.["egress-max"] !== undefined ? Number(bwEl["egress-max"]) : null,
    defaultProfile: str(defaultEl?.["qos-profile"]) ?? str(defaultEl?.["per-tunnel-qos-profile"]),
    members: extractTrafficMembers(el["groups"]),
  }
}

// ─── Extractor ────────────────────────────────────────────────────────────────

/**
 * Extract QoS Interface entries from a template's <network> element.
 * Path: networkEl → qos → interface → entry[]
 */
export function extractQosInterfaces(
  networkEl: unknown,
  templateName: string | null
): PanwQosInterface[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const qosIfaceEl = dig(networkEl, "qos", "interface")

  return entries(qosIfaceEl).map((entry) => {
    const regularEl = entry["regular-traffic"]
    const tunnelEl = entry["tunnel-traffic"]
    const defaultGroupReg = (regularEl as Record<string, unknown> | undefined)?.["default-group"] as Record<string, unknown> | undefined
    const defaultGroupTun = (tunnelEl as Record<string, unknown> | undefined)?.["default-group"] as Record<string, unknown> | undefined

    return {
      interface: entryName(entry),
      enabled: entry["enabled"] !== undefined ? str(entry["enabled"]) !== "no" : true,
      egressMax: entry["egress-max"] !== undefined ? Number(entry["egress-max"]) : null,
      defaultClearTextProfile: str(defaultGroupReg?.["qos-profile"]),
      defaultTunnelProfile: str(defaultGroupTun?.["qos-profile"]) ?? str(defaultGroupTun?.["per-tunnel-qos-profile"]),
      clearTextTraffic: extractTrafficGroup(regularEl),
      tunneledTraffic: extractTrafficGroup(tunnelEl),
      templateName,
    }
  })
}
