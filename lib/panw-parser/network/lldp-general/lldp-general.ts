// @/src/lib/panw-parser/network/lldp-general/lldp-general.ts
//
// LLDP General settings types and extractor.
// Path: network > lldp

import { yesNo } from "../../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanwLldpGeneral {
  enabled: boolean
  transmitInterval: number | null
  transmitDelay: number | null
  holdTimeMultiple: number | null
  notificationInterval: number | null
  templateName: string | null
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const LLDP_GENERAL_DEFAULTS = {
  transmitInterval: 30,
  transmitDelay: 2,
  holdTimeMultiple: 4,
  notificationInterval: 5,
}

// ─── Extractor ────────────────────────────────────────────────────────────────

/**
 * Extract LLDP General settings from a template's <network> element.
 * Path: networkEl → lldp
 */
export function extractLldpGeneral(
  networkEl: unknown,
  templateName: string | null
): PanwLldpGeneral | null {
  if (!networkEl || typeof networkEl !== "object") return null
  const lldpEl = (networkEl as Record<string, unknown>)["lldp"] as Record<string, unknown> | undefined
  if (!lldpEl) return null

  return {
    enabled: yesNo(lldpEl["enable"]),
    transmitInterval: lldpEl["transmit-interval"] !== undefined ? Number(lldpEl["transmit-interval"]) : null,
    transmitDelay: lldpEl["transmit-delay"] !== undefined ? Number(lldpEl["transmit-delay"]) : null,
    holdTimeMultiple: lldpEl["hold-time-multiple"] !== undefined ? Number(lldpEl["hold-time-multiple"]) : null,
    notificationInterval: lldpEl["notification-interval"] !== undefined ? Number(lldpEl["notification-interval"]) : null,
    templateName,
  }
}
