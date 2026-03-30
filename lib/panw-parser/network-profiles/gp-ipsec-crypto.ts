// @/lib/panw-parser/network-profiles/gp-ipsec-crypto.ts
//
// GlobalProtect IPSec Crypto Profile types and extractor.
// Path: network > ike > crypto-profiles > global-protect-app-crypto-profiles > entry[]

import { entries, entryName, members, dig } from "../xml-helpers"

export interface PanwGpIpsecCryptoProfile {
  name: string
  encryption: string[]
  authentication: string[]
  templateName: string | null
}

export function extractGpIpsecCryptoProfiles(
  networkEl: unknown,
  templateName: string | null
): PanwGpIpsecCryptoProfile[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const el = dig(networkEl, "ike", "crypto-profiles", "global-protect-app-crypto-profiles")

  return entries(el).map((entry) => ({
    name: entryName(entry),
    encryption: members(entry["encryption"]),
    authentication: members(entry["authentication"]),
    templateName,
  }))
}
