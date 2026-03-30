// @/lib/panw-parser/network-profiles/bfd.ts
//
// Network BFD Profile types and extractor.
// Path: network > profiles > bfd-profile > entry[]
// Note: This is the NETWORK profile, separate from routing-profiles BFD.

import { entries, entryName, str } from "../xml-helpers"

export interface PanwNetworkBfdProfile {
  name: string
  mode: string               // "active" | "passive"
  minTxInterval: number      // ms
  minRxInterval: number      // ms
  detectionMultiplier: number
  holdTime: number
  multihopEnabled: boolean
  multihopMinRxTtl: number | null
  templateName: string | null
}

export const NETWORK_BFD_DEFAULTS = {
  mode: "active",
  minTxInterval: 1000,
  minRxInterval: 1000,
  detectionMultiplier: 3,
  holdTime: 0,
} as const

export function extractNetworkBfdProfiles(
  networkEl: unknown,
  templateName: string | null
): PanwNetworkBfdProfile[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const net = networkEl as Record<string, unknown>
  const profilesEl = net["profiles"] as Record<string, unknown> | undefined
  if (!profilesEl) return []

  const bfdEl = profilesEl["bfd-profile"]
  return entries(bfdEl).map((entry) => {
    const mh = entry["multihop"] as Record<string, unknown> | undefined
    const hasMultihop = mh?.["min-received-ttl"] !== undefined

    return {
      name: entryName(entry),
      mode: str(entry["mode"]) ?? NETWORK_BFD_DEFAULTS.mode,
      minTxInterval: entry["min-tx-interval"] !== undefined ? Number(entry["min-tx-interval"]) : NETWORK_BFD_DEFAULTS.minTxInterval,
      minRxInterval: entry["min-rx-interval"] !== undefined ? Number(entry["min-rx-interval"]) : NETWORK_BFD_DEFAULTS.minRxInterval,
      detectionMultiplier: entry["detection-multiplier"] !== undefined ? Number(entry["detection-multiplier"]) : NETWORK_BFD_DEFAULTS.detectionMultiplier,
      holdTime: entry["hold-time"] !== undefined ? Number(entry["hold-time"]) : NETWORK_BFD_DEFAULTS.holdTime,
      multihopEnabled: hasMultihop,
      multihopMinRxTtl: hasMultihop ? Number(mh!["min-received-ttl"]) : null,
      templateName,
    }
  })
}
