// @/src/lib/panw-parser/network/network-profiles/qos.ts
//
// QoS Profile types and extractor.
// Path: network > qos > profile > entry[]

import { entries, entryName, dig } from "../../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanwQosClass {
  name: string          // "class1" - "class8"
  priority: string      // "real-time" | "high" | "medium" | "low"
  egressMax: number
  egressGuaranteed: number
}

export interface PanwQosProfile {
  name: string
  bandwidthType: string   // "mbps" | "percentage"
  egressMax: number
  egressGuaranteed: number
  classes: PanwQosClass[]
  templateName: string | null
}

// ─── Extractor ────────────────────────────────────────────────────────────────

/**
 * Extract QoS Profiles from a template's <network> element.
 * Path: networkEl → qos → profile → entry[]
 */
export function extractQosProfiles(
  networkEl: unknown,
  templateName: string | null
): PanwQosProfile[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const qosEl = dig(networkEl, "qos", "profile")

  return entries(qosEl).map((entry) => {
    const bwTypeEl = entry["class-bandwidth-type"] as Record<string, unknown> | undefined
    const isMbps = !!bwTypeEl?.["mbps"]
    const bandwidthType = isMbps ? "mbps" : "percentage"
    const typeEl = (isMbps ? bwTypeEl?.["mbps"] : bwTypeEl?.["percentage"]) as Record<string, unknown> | undefined

    const aggEl = entry["aggregate-bandwidth"] as Record<string, unknown> | undefined

    return {
      name: entryName(entry),
      bandwidthType,
      egressMax: aggEl?.["egress-max"] !== undefined ? Number(aggEl["egress-max"]) : 0,
      egressGuaranteed: aggEl?.["egress-guaranteed"] !== undefined ? Number(aggEl["egress-guaranteed"]) : 0,
      classes: entries(dig(typeEl, "class")).map((cls) => {
        const bw = cls["class-bandwidth"] as Record<string, unknown> | undefined
        return {
          name: entryName(cls),
          priority: String(cls["priority"] ?? "medium"),
          egressMax: bw?.["egress-max"] !== undefined ? Number(bw["egress-max"]) : 0,
          egressGuaranteed: bw?.["egress-guaranteed"] !== undefined ? Number(bw["egress-guaranteed"]) : 0,
        }
      }),
      templateName,
    }
  })
}
