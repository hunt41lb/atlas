// @/lib/panw-parser/network/dhcp/dhcp.ts
//
// DHCP Server and Relay types and extractors.
// Path: network > dhcp > interface > entry[]

import { entries, entryName, str, dig, members, yesNo } from "../../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanwDhcpCustomOption {
  name: string
  code: number
  type: "ip" | "ascii" | "hex" | "inherited"
  values: string[]
}

export interface PanwDhcpReservation {
  ip: string
  mac: string
  description: string | null
}

export interface PanwDhcpServerOptions {
  leaseType: "unlimited" | "timeout"
  leaseTimeout: number | null
  gateway: string | null
  subnetMask: string | null
  dnsPrimary: string | null
  dnsSecondary: string | null
  winsPrimary: string | null
  winsSecondary: string | null
  nisPrimary: string | null
  nisSecondary: string | null
  ntpPrimary: string | null
  ntpSecondary: string | null
  dnsSuffix: string | null
  pop3Server: string | null
  smtpServer: string | null
  inheritanceSource: string | null
  customOptions: PanwDhcpCustomOption[]
}

export interface PanwDhcpServer {
  interface: string
  mode: string | null
  probeIp: boolean
  ipPools: string[]
  reservations: PanwDhcpReservation[]
  options: PanwDhcpServerOptions
  templateName: string | null
}

export interface PanwDhcpRelayIpv6Server {
  address: string
  interface: string | null
}

export interface PanwDhcpRelay {
  interface: string
  ipv4Enabled: boolean
  ipv4Servers: string[]
  ipv6Enabled: boolean
  ipv6Servers: PanwDhcpRelayIpv6Server[]
  templateName: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const OPTION_TYPES = ["ip", "ascii", "hex"] as const

function detectCustomOptionType(entry: Record<string, unknown>): { type: PanwDhcpCustomOption["type"]; values: string[] } {
  if (yesNo(entry["inherited"])) return { type: "inherited", values: [] }

  for (const type of OPTION_TYPES) {
    const el = entry[type]
    if (el !== undefined) {
      // Self-closing tag (e.g. <ip/>) parses to "" — treat as empty
      if (el === "") return { type, values: [] }
      return { type, values: members(el) }
    }
  }

  return { type: "inherited", values: [] }
}

function extractCustomOptions(optionEl: Record<string, unknown>): PanwDhcpCustomOption[] {
  const udEl = optionEl["user-defined"]
  return entries(udEl).map((entry) => {
    const { type, values } = detectCustomOptionType(entry)
    return {
      name: entryName(entry),
      code: entry["code"] !== undefined ? Number(entry["code"]) : 0,
      type,
      values,
    }
  })
}

function extractOptions(serverEl: Record<string, unknown>): PanwDhcpServerOptions {
  const opt = (serverEl["option"] ?? {}) as Record<string, unknown>
  const leaseEl = opt["lease"] as Record<string, unknown> | undefined

  const hasTimeout = leaseEl?.["timeout"] !== undefined
  const dnsEl = opt["dns"] as Record<string, unknown> | undefined
  const winsEl = opt["wins"] as Record<string, unknown> | undefined
  const nisEl = opt["nis"] as Record<string, unknown> | undefined
  const ntpEl = opt["ntp"] as Record<string, unknown> | undefined

  return {
    leaseType: hasTimeout ? "timeout" : "unlimited",
    leaseTimeout: hasTimeout ? Number(leaseEl!["timeout"]) : null,
    gateway: str(opt["gateway"]),
    subnetMask: str(opt["subnet-mask"]),
    dnsPrimary: str(dnsEl?.["primary"]),
    dnsSecondary: str(dnsEl?.["secondary"]),
    winsPrimary: str(winsEl?.["primary"]),
    winsSecondary: str(winsEl?.["secondary"]),
    nisPrimary: str(nisEl?.["primary"]),
    nisSecondary: str(nisEl?.["secondary"]),
    ntpPrimary: str(ntpEl?.["primary"]),
    ntpSecondary: str(ntpEl?.["secondary"]),
    dnsSuffix: str(opt["dns-suffix"]),
    pop3Server: str(opt["pop3-server"]),
    smtpServer: str(opt["smtp-server"]),
    inheritanceSource: str(dig(opt, "inheritance", "source")),
    customOptions: extractCustomOptions(opt),
  }
}

// ─── Extractors ───────────────────────────────────────────────────────────────

/**
 * Extract DHCP Servers from a template's <network> element.
 * Path: networkEl → dhcp → interface → entry[] (those with a <server> child)
 */
export function extractDhcpServers(
  networkEl: unknown,
  templateName: string | null
): PanwDhcpServer[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const ifaceEntries = entries(dig(networkEl, "dhcp", "interface"))

  return ifaceEntries
    .filter((entry) => entry["server"] !== undefined)
    .map((entry) => {
      const serverEl = entry["server"] as Record<string, unknown>

      return {
        interface: entryName(entry),
        mode: str(serverEl["mode"]),
        probeIp: yesNo(serverEl["probe-ip"]),
        ipPools: members(serverEl["ip-pool"]),
        reservations: entries(serverEl["reserved"]).map((r) => ({
          ip: entryName(r),
          mac: str(r["mac"]) ?? "",
          description: str(r["description"]),
        })),
        options: extractOptions(serverEl),
        templateName,
      }
    })
}

/**
 * Extract DHCP Relays from a template's <network> element.
 * Path: networkEl → dhcp → interface → entry[] (those with a <relay> child)
 */
export function extractDhcpRelays(
  networkEl: unknown,
  templateName: string | null
): PanwDhcpRelay[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const ifaceEntries = entries(dig(networkEl, "dhcp", "interface"))

  return ifaceEntries
    .filter((entry) => entry["relay"] !== undefined)
    .map((entry) => {
      const relayEl = entry["relay"] as Record<string, unknown>
      const ipEl = relayEl["ip"] as Record<string, unknown> | undefined
      const ipv6El = relayEl["ipv6"] as Record<string, unknown> | undefined

      return {
        interface: entryName(entry),
        ipv4Enabled: yesNo(ipEl?.["enabled"]),
        ipv4Servers: members(ipEl?.["server"]),
        ipv6Enabled: yesNo(ipv6El?.["enabled"]),
        ipv6Servers: entries(ipv6El?.["server"]).map((s) => ({
          address: entryName(s),
          interface: str(s["interface"]),
        })),
        templateName,
      }
    })
}
