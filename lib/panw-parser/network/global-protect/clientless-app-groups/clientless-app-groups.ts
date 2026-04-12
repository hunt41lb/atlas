// @/lib/panw-parser/network/global-protect/clientless-app-groups/clientless-app-groups.ts

import { entries, entryName, members, dig } from "../../../xml-helpers"

export interface PanwGpClientlessAppGroup {
  name: string
  applications: string[]
  templateName: string | null
}

export function extractGpClientlessAppGroups(
  networkEl: unknown,
  templateName: string | null,
  vsysEl?: unknown
): PanwGpClientlessAppGroup[] {
  const fromNetwork = (networkEl && typeof networkEl === "object")
    ? entries(dig(networkEl, "global-protect", "clientless-app-group"))
    : []
  const fromVsys = (vsysEl && typeof vsysEl === "object")
    ? entries(dig(vsysEl, "global-protect", "clientless-app-group"))
    : []

  return [...fromNetwork, ...fromVsys].map((entry) => ({
    name: entryName(entry),
    applications: members(entry["members"]),
    templateName,
  }))
}
