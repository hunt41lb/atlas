// @/src/lib/panw-parser/network/network-profiles/ipsec-crypto.ts
//
// IPSec Crypto Profile types and extractor.
// Path: network > ike > crypto-profiles > ipsec-crypto-profiles > entry[]

import { entries, entryName, str, members, dig } from "../../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanwIpsecCryptoAke {
  round: number   // 1-7
  group: string   // e.g. "group20" — single value per round
}

export interface PanwIpsecCryptoProfile {
  name: string
  protocol: string          // "esp" | "ah"
  encryption: string[]      // ["aes-256-gcm", ...]
  authentication: string[]  // ["sha512", ...]
  dhGroup: string | null    // single value, e.g. "group20"
  lifetimeValue: number
  lifetimeUnit: string      // "hours" | "minutes" | "seconds" | "days"
  lifesizeEnabled: boolean
  lifesizeValue: number | null
  lifesizeUnit: string | null  // "mb" | "gb" | "kb" | "tb"
  ake: PanwIpsecCryptoAke[]    // up to 7 rounds
  templateName: string | null
}

// ─── Extractor ────────────────────────────────────────────────────────────────

const LIFETIME_UNITS = ["hours", "minutes", "seconds", "days"] as const
const LIFESIZE_UNITS = ["mb", "gb", "kb", "tb"] as const

function extractLifetime(entry: Record<string, unknown>): { value: number; unit: string } {
  const el = entry["lifetime"] as Record<string, unknown> | undefined
  if (!el) return { value: 1, unit: "hours" }
  for (const unit of LIFETIME_UNITS) {
    if (el[unit] !== undefined) return { value: Number(el[unit]), unit }
  }
  return { value: 1, unit: "hours" }
}

function extractLifesize(entry: Record<string, unknown>): { enabled: boolean; value: number | null; unit: string | null } {
  const el = entry["lifesize"] as Record<string, unknown> | undefined
  if (!el) return { enabled: false, value: null, unit: null }
  for (const unit of LIFESIZE_UNITS) {
    if (el[unit] !== undefined) return { enabled: true, value: Number(el[unit]), unit }
  }
  return { enabled: false, value: null, unit: null }
}

function extractAke(entry: Record<string, unknown>): PanwIpsecCryptoAke[] {
  const akeEl = entry["ake"] as Record<string, unknown> | undefined
  if (!akeEl) return []
  const rounds: PanwIpsecCryptoAke[] = []
  for (let i = 1; i <= 7; i++) {
    const val = str(akeEl[`ake-${i}`])
    if (val) rounds.push({ round: i, group: val })
  }
  return rounds
}

/**
 * Extract IPSec Crypto Profiles from a template's <network> element.
 * Path: networkEl → ike → crypto-profiles → ipsec-crypto-profiles → entry[]
 */
export function extractIpsecCryptoProfiles(
  networkEl: unknown,
  templateName: string | null
): PanwIpsecCryptoProfile[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const ipsecEl = dig(networkEl, "ike", "crypto-profiles", "ipsec-crypto-profiles")

  return entries(ipsecEl).map((entry) => {
    const espEl = entry["esp"] as Record<string, unknown> | undefined
    const ahEl = entry["ah"] as Record<string, unknown> | undefined
    const protocol = espEl ? "esp" : "ah"
    const protoEl = espEl ?? ahEl

    const lifetime = extractLifetime(entry)
    const lifesize = extractLifesize(entry)

    return {
      name: entryName(entry),
      protocol,
      encryption: members(protoEl?.["encryption"]),
      authentication: members(protoEl?.["authentication"]),
      dhGroup: str(entry["dh-group"]) ?? null,
      lifetimeValue: lifetime.value,
      lifetimeUnit: lifetime.unit,
      lifesizeEnabled: lifesize.enabled,
      lifesizeValue: lifesize.value,
      lifesizeUnit: lifesize.unit,
      ake: extractAke(entry),
      templateName,
    }
  })
}
