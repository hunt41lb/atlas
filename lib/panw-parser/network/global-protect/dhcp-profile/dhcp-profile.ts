// @/lib/panw-parser/network/global-protect/dhcp-profile/dhcp-profile.ts

import { entries, entryName, str, members, dig } from "../../../xml-helpers"

export interface PanwGpDhcpProfile {
  name: string
  ipAddress: string | null
  ipPools: string[]
  templateName: string | null
}

export function extractGpDhcpProfiles(
  networkEl: unknown,
  templateName: string | null,
  vsysEl?: unknown
): PanwGpDhcpProfile[] {
  const fromNetwork = (networkEl && typeof networkEl === "object")
    ? entries(dig(networkEl, "global-protect", "dhcp-server-profile"))
    : []
  const fromVsys = (vsysEl && typeof vsysEl === "object")
    ? entries(dig(vsysEl, "global-protect", "dhcp-server-profile"))
    : []

  return [...fromNetwork, ...fromVsys].map((entry) => ({
    name: entryName(entry),
    ipAddress: str(entry["ip-address"]) ?? null,
    ipPools: members(entry["ip-pool"]),
    templateName,
  }))
}
