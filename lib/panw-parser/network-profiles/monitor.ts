// @/lib/panw-parser/network-profiles/monitor.ts
//
// Monitor Profile types and extractor.
// Path: network > profiles > monitor-profile > entry[]

import { entries, entryName, str } from "../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanwMonitorProfile {
  name: string
  interval: number
  threshold: number
  action: string
  templateName: string | null
}

// ─── PAN-OS Defaults ──────────────────────────────────────────────────────────

export const MONITOR_DEFAULTS = {
  interval: 3,
  threshold: 5,
  action: "wait-recover",
} as const

// ─── Extractor ────────────────────────────────────────────────────────────────

/**
 * Extract Monitor Profiles from a template's <network> element.
 * Path: networkEl → profiles → monitor-profile → entry[]
 */
export function extractMonitorProfiles(
  networkEl: unknown,
  templateName: string | null
): PanwMonitorProfile[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const net = networkEl as Record<string, unknown>
  const profilesEl = net["profiles"] as Record<string, unknown> | undefined
  if (!profilesEl) return []

  const mpEl = profilesEl["monitor-profile"]
  return entries(mpEl).map((entry) => ({
    name: entryName(entry),
    interval: entry["interval"] !== undefined
      ? Number(entry["interval"])
      : MONITOR_DEFAULTS.interval,
    threshold: entry["threshold"] !== undefined
      ? Number(entry["threshold"])
      : MONITOR_DEFAULTS.threshold,
    action: str(entry["action"]) ?? MONITOR_DEFAULTS.action,
    templateName,
  }))
}
