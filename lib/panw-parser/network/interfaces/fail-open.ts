// @/lib/panw-parser/network/interfaces/fail-open.ts
//
// Fail Open setting type and extractor.
// Path: network > interface > fail-open (simple "yes"/"no" value)

import { str, dig } from "../../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanwFailOpen {
  enabled: boolean
  templateName: string | null
}

// ─── Extractor ────────────────────────────────────────────────────────────────

/**
 * Extract Fail Open setting from a template's <network> element.
 * Path: networkEl → interface → fail-open
 */
export function extractFailOpen(
  networkEl: unknown,
  templateName: string | null,
): PanwFailOpen | null {
  if (!networkEl || typeof networkEl !== "object") return null
  const val = str(dig(networkEl, "interface", "fail-open"))
  if (val === null) return null
  return { enabled: val === "yes", templateName }
}
