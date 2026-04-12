// @/lib/panw-parser/network/global-protect/mdm/mdm.ts

import { entries, entryName, str, members, dig } from "../../../xml-helpers"

export interface PanwGpMdmServer {
  name: string
  server: string | null
  port: number | null
  clientCertificate: string | null
  rootCas: string[]
  templateName: string | null
}

export function extractGpMdmServers(
  networkEl: unknown,
  templateName: string | null,
  vsysEl?: unknown
): PanwGpMdmServer[] {
  const fromNetwork = (networkEl && typeof networkEl === "object")
    ? entries(dig(networkEl, "global-protect", "global-protect-mdm"))
    : []
  const fromVsys = (vsysEl && typeof vsysEl === "object")
    ? entries(dig(vsysEl, "global-protect", "global-protect-mdm"))
    : []

  return [...fromNetwork, ...fromVsys].map((entry) => ({
    name: entryName(entry),
    server: str(entry["host"]) ?? null,
    port: entry["port"] !== undefined ? Number(entry["port"]) : null,
    clientCertificate: str(entry["client-certificate"]) ?? null,
    rootCas: members(entry["root-ca"]),
    templateName,
  }))
}
