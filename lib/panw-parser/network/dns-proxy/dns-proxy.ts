// @/src/lib/panw-parser/network/dns-proxy/dns-proxy.ts
//
// DNS Proxy types and extractor.
// Path: network > dns-proxy > entry[]

import { entries, entryName, str, members, yesNo } from "../../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanwDnsProxyRule {
  name: string
  domainNames: string[]
  primary: string | null
  secondary: string | null
  serverProfile: string | null
  cacheable: boolean
}

export interface PanwDnsProxyStaticEntry {
  name: string
  domain: string | null
  addresses: string[]
}

export interface PanwDnsProxyEncryptedDns {
  enabled: boolean
  // Server settings
  connectionType: string | null
  enableFallback: boolean
  tcpTimeout: number | null
  // Client settings
  doh: boolean
  dot: boolean
  cleartext: boolean
  sslTlsServiceProfile: string | null
}

export interface PanwDnsProxyAdvanced {
  tcpQueriesEnabled: boolean
  tcpMaxPendingRequests: number | null
  udpRetriesInterval: number | null
  udpRetriesAttempts: number | null
  cacheEnabled: boolean
  maxTtlEnabled: boolean
  maxTtlValue: number | null
  cacheEdns: boolean
}

export interface PanwDnsProxy {
  name: string
  interfaces: string[]
  serverProfile: string | null
  defaultPrimary: string | null
  defaultSecondary: string | null
  domainServers: PanwDnsProxyRule[]
  staticEntries: PanwDnsProxyStaticEntry[]
  encryptedDns: PanwDnsProxyEncryptedDns
  advanced: PanwDnsProxyAdvanced
  templateName: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractEncryptedDns(entry: Record<string, unknown>): PanwDnsProxyEncryptedDns {
  const edEl = entry["encrypted-dns"] as Record<string, unknown> | undefined
  if (!edEl) {
    return {
      enabled: false,
      connectionType: null, enableFallback: false, tcpTimeout: null,
      doh: false, dot: false, cleartext: true, sslTlsServiceProfile: null,
    }
  }

  const serverEl = edEl["server-side-config"] as Record<string, unknown> | undefined
  const clientEl = edEl["client-side-config"] as Record<string, unknown> | undefined
  const allowedEl = clientEl?.["allowed-dns-types"] as Record<string, unknown> | undefined

  // Connection type is determined by which child element is present under connection-type
  const connTypeEl = serverEl?.["connection-type"] as Record<string, unknown> | undefined
  let connectionType: string | null = null
  if (connTypeEl) {
    for (const key of ["origin", "dns-over-https", "dns-over-tls"]) {
      if (connTypeEl[key] !== undefined) { connectionType = key; break }
    }
  }

  return {
    enabled: yesNo(edEl["enabled"]),
    connectionType: connectionType === "origin" ? "Origin" : connectionType,
    enableFallback: yesNo(serverEl?.["enable-fallback"]),
    tcpTimeout: serverEl?.["tcp-timeout"] !== undefined ? Number(serverEl["tcp-timeout"]) : null,
    doh: yesNo(allowedEl?.["dns-over-https"]),
    dot: yesNo(allowedEl?.["dns-over-tls"]),
    cleartext: allowedEl ? yesNo(allowedEl["cleartext"]) : true,
    sslTlsServiceProfile: str(clientEl?.["ssl-tls-service-profile"]),
  }
}

function extractAdvanced(entry: Record<string, unknown>): PanwDnsProxyAdvanced {
  const cacheEl = entry["cache"] as Record<string, unknown> | undefined
  const tcpEl = entry["tcp-queries"] as Record<string, unknown> | undefined
  const udpEl = entry["udp-queries"] as Record<string, unknown> | undefined
  const retriesEl = udpEl?.["retries"] as Record<string, unknown> | undefined
  const maxTtlEl = cacheEl?.["max-ttl"] as Record<string, unknown> | undefined

  return {
    tcpQueriesEnabled: yesNo(tcpEl?.["enabled"]),
    tcpMaxPendingRequests: tcpEl?.["max-pending-requests"] !== undefined
      ? Number(tcpEl["max-pending-requests"]) : null,
    udpRetriesInterval: retriesEl?.["interval"] !== undefined ? Number(retriesEl["interval"]) : null,
    udpRetriesAttempts: retriesEl?.["attempts"] !== undefined ? Number(retriesEl["attempts"]) : null,
    cacheEnabled: yesNo(cacheEl?.["enabled"]),
    maxTtlEnabled: yesNo(maxTtlEl?.["enabled"]),
    maxTtlValue: maxTtlEl?.["time-to-live"] !== undefined ? Number(maxTtlEl["time-to-live"]) : null,
    cacheEdns: cacheEl?.["cache-edns"] !== undefined ? yesNo(cacheEl["cache-edns"]) : true,
  }
}

// ─── Extractor ────────────────────────────────────────────────────────────────

/**
 * Extract DNS Proxies from a template's <network> element.
 * Path: networkEl → dns-proxy → entry[]
 */
export function extractDnsProxies(
  networkEl: unknown,
  templateName: string | null,
  vsysEl?: unknown
): PanwDnsProxy[] {
  const networkProxies = (networkEl && typeof networkEl === "object")
    ? entries((networkEl as Record<string, unknown>)["dns-proxy"])
    : []
  const vsysProxies = (vsysEl && typeof vsysEl === "object")
    ? entries((vsysEl as Record<string, unknown>)["dns-proxy"])
    : []
  const allEntries = [...networkProxies, ...vsysProxies]

  return allEntries.map((entry) => {
    const defaultEl = entry["default"] as Record<string, unknown> | undefined

    return {
      name: entryName(entry),
      interfaces: members(entry["interface"]),
      serverProfile: str(entry["server-profile"]),
      defaultPrimary: str(defaultEl?.["primary"]),
      defaultSecondary: str(defaultEl?.["secondary"]),
      domainServers: entries(entry["domain-servers"]).map((ds) => ({
        name: entryName(ds),
        domainNames: members(ds["domain-name"]),
        primary: str(ds["primary"]),
        secondary: str(ds["secondary"]),
        serverProfile: str(ds["server-profile"]),
        cacheable: yesNo(ds["cacheable"]),
      })),
      staticEntries: entries(entry["static-entries"]).map((se) => ({
        name: entryName(se),
        domain: str(se["domain"]),
        addresses: members(se["address"]),
      })),
      encryptedDns: extractEncryptedDns(entry),
      advanced: extractAdvanced(entry),
      templateName,
    }
  })
}