// @/lib/panw-parser/routing-profiles/bfd.ts
//
// BFD (Bidirectional Forwarding Detection) routing profile types and extractor.
// These are LOGICAL ROUTER routing profiles, NOT Virtual Router BFD profiles.

import { entries, entryName } from "../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanwBfdProfile {
  name: string
  /** Minimum TX interval in ms — PAN-OS default: 1000 */
  minTxInterval: number
  /** Minimum RX interval in ms — PAN-OS default: 1000 */
  minRxInterval: number
  /** Detection time multiplier — PAN-OS default: 3 */
  detectionMultiplier: number
  /** Hold time in ms — null = not configured */
  holdTime: number | null
  /** Multihop: minimum received TTL — null = not configured */
  multihopMinReceivedTtl: number | null
  /** Panorama: which template this came from */
  templateName: string | null
}

// ─── PAN-OS Defaults ──────────────────────────────────────────────────────────

export const BFD_DEFAULTS = {
  minTxInterval: 1000,
  minRxInterval: 1000,
  detectionMultiplier: 3,
} as const

// ─── Extractor ────────────────────────────────────────────────────────────────

/**
 * Extract BFD routing profiles from a template's <network> element.
 * Path: networkEl → routing-profile → bfd → entry[]
 *
 * Note: This is the Logical Router routing-profile BFD, NOT the
 * Virtual Router <profiles><bfd-profile> which is a separate thing.
 */
export function extractBfdProfiles(
  networkEl: unknown,
  templateName: string | null
): PanwBfdProfile[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const net = networkEl as Record<string, unknown>
  const routingProfileEl = net["routing-profile"] as Record<string, unknown> | undefined
  if (!routingProfileEl) return []

  const bfdEl = routingProfileEl["bfd"]
  return entries(bfdEl).map((entry) => ({
    name: entryName(entry),
    minTxInterval: entry["min-tx-interval"] !== undefined
      ? Number(entry["min-tx-interval"])
      : BFD_DEFAULTS.minTxInterval,
    minRxInterval: entry["min-rx-interval"] !== undefined
      ? Number(entry["min-rx-interval"])
      : BFD_DEFAULTS.minRxInterval,
    detectionMultiplier: entry["detection-multiplier"] !== undefined
      ? Number(entry["detection-multiplier"])
      : BFD_DEFAULTS.detectionMultiplier,
    holdTime: entry["hold-time"] !== undefined
      ? Number(entry["hold-time"])
      : null,
    multihopMinReceivedTtl: (() => {
      const mh = entry["multihop"] as Record<string, unknown> | undefined
      if (!mh) return null
      return mh["min-received-ttl"] !== undefined
        ? Number(mh["min-received-ttl"])
        : null
    })(),
    templateName,
  }))
}
