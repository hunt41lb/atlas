// @/lib/panw-parser/network-profiles/lldp.ts
//
// LLDP Profile types and extractor.
// Path: network > profiles > lldp-profile > entry[]

import { entries, entryName, str, yesNo, dig } from "../xml-helpers"

export interface PanwLldpMgmtAddress {
  name: string
  ipv4: string | null
  interface: string | null
}

export interface PanwLldpProfile {
  name: string
  snmpSyslogNotification: boolean
  portDescription: boolean
  systemName: boolean
  systemDescription: boolean
  systemCapabilities: boolean
  managementAddressEnabled: boolean
  managementAddresses: PanwLldpMgmtAddress[]
  templateName: string | null
}

export function extractLldpProfiles(
  networkEl: unknown,
  templateName: string | null
): PanwLldpProfile[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const net = networkEl as Record<string, unknown>
  const profilesEl = net["profiles"] as Record<string, unknown> | undefined
  if (!profilesEl) return []

  const lldpEl = profilesEl["lldp-profile"]
  return entries(lldpEl).map((entry) => {
    const tlvs = entry["option-tlvs"] as Record<string, unknown> | undefined
    const mgmtEl = tlvs?.["management-address"] as Record<string, unknown> | undefined

    return {
      name: entryName(entry),
      snmpSyslogNotification: yesNo(entry["snmp-syslog-notification"]),
      portDescription: yesNo(tlvs?.["port-description"]),
      systemName: yesNo(tlvs?.["system-name"]),
      systemDescription: yesNo(tlvs?.["system-description"]),
      systemCapabilities: yesNo(tlvs?.["system-capabilities"]),
      managementAddressEnabled: yesNo(mgmtEl?.["enabled"]),
      managementAddresses: entries(dig(mgmtEl, "iplist")).map((e) => ({
        name: entryName(e),
        ipv4: str(e["ipv4"]) ?? null,
        interface: str(e["interface"]) ?? null,
      })),
      templateName,
    }
  })
}
