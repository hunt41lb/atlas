// @/lib/panw-parser/network-profiles/interface-mgmt.ts

import { entries, entryName, yesNo } from "../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanwInterfaceMgmtProfile {
  name: string
  permittedIps: string[]
  // Network services
  http: boolean
  https: boolean
  httpOcsp: boolean
  ssh: boolean
  telnet: boolean
  ping: boolean
  snmp: boolean
  responsePages: boolean
  // User-ID services
  useridService: boolean
  useridSyslogListenerSsl: boolean
  useridSyslogListenerUdp: boolean
  templateName: string | null
}

// ─── Extractor ────────────────────────────────────────────────────────────────

/**
 * Extract Interface Management Profiles from a template's <network> element.
 * Path: networkEl → profiles → interface-management-profile → entry[]
 */
export function extractInterfaceMgmtProfiles(
  networkEl: unknown,
  templateName: string | null
): PanwInterfaceMgmtProfile[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const net = networkEl as Record<string, unknown>
  const profilesEl = net["profiles"] as Record<string, unknown> | undefined
  if (!profilesEl) return []

  const impEl = profilesEl["interface-management-profile"]
  return entries(impEl).map((entry) => ({
    name: entryName(entry),
    permittedIps: entries(entry["permitted-ip"]).map((e) => entryName(e)),
    http: yesNo(entry["http"]),
    https: yesNo(entry["https"]),
    httpOcsp: yesNo(entry["http-ocsp"]),
    ssh: yesNo(entry["ssh"]),
    telnet: yesNo(entry["telnet"]),
    ping: yesNo(entry["ping"]),
    snmp: yesNo(entry["snmp"]),
    responsePages: yesNo(entry["response-pages"]),
    useridService: yesNo(entry["userid-service"]),
    useridSyslogListenerSsl: yesNo(entry["userid-syslog-listener-ssl"]),
    useridSyslogListenerUdp: yesNo(entry["userid-syslog-listener-udp"]),
    templateName,
  }))
}
