// @/lib/panw-parser/network-profiles/macsec.ts
//
// MACsec Crypto Profile types and extractor.
// Path: network > macsec > crypto-profiles > entry[]

import { entries, entryName, str, yesNo, dig } from "../xml-helpers"

export interface PanwMacsecProfile {
  name: string
  encryption: string           // "aes-128-gcm" | "aes-256-gcm"
  confidentialityOffset: number
  sciInclude: boolean
  antiReplay: boolean
  antiReplayWindow: number
  rekeyInterval: number        // SAK Rekey Interval (sec)
  templateName: string | null
}

export const MACSEC_DEFAULTS = {
  encryption: "aes-128-gcm",
  confidentialityOffset: 0,
  antiReplayWindow: 16384,
  rekeyInterval: 3600,
} as const

export function extractMacsecProfiles(
  networkEl: unknown,
  templateName: string | null
): PanwMacsecProfile[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const el = dig(networkEl, "macsec", "crypto-profiles")

  return entries(el).map((entry) => ({
    name: entryName(entry),
    encryption: str(entry["encryption"]) ?? MACSEC_DEFAULTS.encryption,
    confidentialityOffset: entry["confidentiality-offset"] !== undefined ? Number(entry["confidentiality-offset"]) : MACSEC_DEFAULTS.confidentialityOffset,
    sciInclude: yesNo(entry["sci-include"]),
    antiReplay: yesNo(entry["anti-replay"]),
    antiReplayWindow: entry["anti-replay-window"] !== undefined ? Number(entry["anti-replay-window"]) : MACSEC_DEFAULTS.antiReplayWindow,
    rekeyInterval: entry["rekey-interval"] !== undefined ? Number(entry["rekey-interval"]) : MACSEC_DEFAULTS.rekeyInterval,
    templateName,
  }))
}
