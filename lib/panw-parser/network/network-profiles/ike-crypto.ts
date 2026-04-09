// @/src/lib/panw-parser/network/network-profiles/ike-crypto.ts
//
// IKE Crypto Profile types and extractor.
// Path: network > ike > crypto-profiles > ike-crypto-profiles > entry[]

import { entries, entryName, str, members, dig } from "../../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanwIkeCryptoAke {
  round: number   // 1-7
  groups: string[] // e.g. ["group20"]
}

export interface PanwIkeCryptoProfile {
  name: string
  encryption: string[]    // ["aes-256-gcm", ...]
  authentication: string[] // ["sha512", ...] — XML: <hash>
  dhGroup: string[]       // ["group20", ...]
  lifetimeValue: number
  lifetimeUnit: string    // "hours" | "minutes" | "seconds" | "days"
  authenticationMultiple: number | null
  ake: PanwIkeCryptoAke[] // up to 7 rounds
  templateName: string | null
}

// ─── Extractor ────────────────────────────────────────────────────────────────

const LIFETIME_UNITS = ["hours", "minutes", "seconds", "days"] as const

function extractLifetime(entry: Record<string, unknown>): { value: number; unit: string } {
  const lifetimeEl = entry["lifetime"] as Record<string, unknown> | undefined
  if (!lifetimeEl) return { value: 8, unit: "hours" }

  for (const unit of LIFETIME_UNITS) {
    if (lifetimeEl[unit] !== undefined) {
      return { value: Number(lifetimeEl[unit]), unit }
    }
  }
  return { value: 8, unit: "hours" }
}

function extractAke(entry: Record<string, unknown>): PanwIkeCryptoAke[] {
  const akeEl = entry["ake"] as Record<string, unknown> | undefined
  if (!akeEl) return []

  const rounds: PanwIkeCryptoAke[] = []
  for (let i = 1; i <= 7; i++) {
    const roundEl = akeEl[`ake-${i}`]
    if (roundEl !== undefined) {
      rounds.push({ round: i, groups: members(roundEl) })
    }
  }
  return rounds
}

/**
 * Extract IKE Crypto Profiles from a template's <network> element.
 * Path: networkEl → ike → crypto-profiles → ike-crypto-profiles → entry[]
 */
export function extractIkeCryptoProfiles(
  networkEl: unknown,
  templateName: string | null
): PanwIkeCryptoProfile[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const ikeEl = dig(networkEl, "ike", "crypto-profiles", "ike-crypto-profiles")

  return entries(ikeEl).map((entry) => {
    const lifetime = extractLifetime(entry)
    return {
      name: entryName(entry),
      encryption: members(entry["encryption"]),
      authentication: members(entry["hash"]),
      dhGroup: members(entry["dh-group"]),
      lifetimeValue: lifetime.value,
      lifetimeUnit: lifetime.unit,
      authenticationMultiple: entry["authentication-multiple"] !== undefined
        ? Number(entry["authentication-multiple"])
        : null,
      ake: extractAke(entry),
      templateName,
    }
  })
}
