// @/lib/panw-parser/network/global-protect/clientless-apps/clientless-apps.ts

import { entries, entryName, str, dig } from "../../../xml-helpers"

export interface PanwGpClientlessApp {
  name: string
  description: string | null
  applicationHomeUrl: string | null
  templateName: string | null
}

export function extractGpClientlessApps(
  networkEl: unknown,
  templateName: string | null,
  vsysEl?: unknown
): PanwGpClientlessApp[] {
  const fromNetwork = (networkEl && typeof networkEl === "object")
    ? entries(dig(networkEl, "global-protect", "clientless-app"))
    : []
  const fromVsys = (vsysEl && typeof vsysEl === "object")
    ? entries(dig(vsysEl, "global-protect", "clientless-app"))
    : []

  return [...fromNetwork, ...fromVsys].map((entry) => ({
    name: entryName(entry),
    description: str(entry["description"]) ?? null,
    applicationHomeUrl: str(entry["application-home-url"]) ?? null,
    templateName,
  }))
}
