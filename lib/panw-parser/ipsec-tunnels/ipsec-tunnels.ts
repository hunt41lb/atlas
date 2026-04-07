// @/lib/panw-parser/ipsec-tunnels/ipsec-tunnels.ts
//
// IPSec Tunnel types and extractor.
// Path: network > tunnel > ipsec > entry[]

import { entries, entryName, str, dig, members, yesNo } from "../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export type IpsecTunnelKeyType = "auto-key" | "manual-key" | "global-protect-satellite"

export interface PanwIpsecProxyIdProtocol {
  type: "any" | "tcp" | "udp" | "number"
  localPort: number | null
  remotePort: number | null
  number: number | null // custom protocol number
}

export interface PanwIpsecProxyId {
  name: string
  local: string | null
  remote: string | null
  protocol: PanwIpsecProxyIdProtocol
}

export interface PanwIpsecAutoKey {
  ikeGateways: string[]
  ipsecCryptoProfile: string | null
  proxyIds: PanwIpsecProxyId[]
  proxyIdsV6: PanwIpsecProxyId[]
  enableGreEncapsulation: boolean
  copyTos: boolean
  proxyIdStrictMatching: boolean
  antiReplay: boolean
  antiReplayWindow: number | null
  ipsecMode: "tunnel" | "transport"
}

export interface PanwIpsecManualKey {
  protocol: "esp" | "ah"
  authenticationAlgorithm: string | null
  encryptionAlgorithm: string | null
  encryptionSalt: string | null
  localAddress: { interface: string | null; ip: string | null }
  peerAddress: string | null
  localSpi: string | null
  remoteSpi: string | null
}

export interface PanwIpsecGpSatellite {
  portalAddress: string | null
  localAddress: {
    interface: string | null
    ipv4: string | null
    ipv6: string | null
  }
  publishConnectedRoutes: boolean
  publishRoutes: string[]
  externalCa: {
    certificateProfile: string | null
    localCertificate: string | null
  } | null
  ipv6Preferred: boolean
}

export interface PanwIpsecTunnelMonitor {
  enabled: boolean
  destinationIp: string | null
  monitorProfile: string | null
}

export interface PanwIpsecTunnel {
  name: string
  keyType: IpsecTunnelKeyType
  tunnelInterface: string | null
  hwAcceleration: string | null
  comment: string | null
  tunnelMonitor: PanwIpsecTunnelMonitor
  autoKey: PanwIpsecAutoKey | null
  manualKey: PanwIpsecManualKey | null
  gpSatellite: PanwIpsecGpSatellite | null
  templateName: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PROTOCOL_TYPES = ["tcp", "udp"] as const

function extractProxyIdProtocol(entry: Record<string, unknown>): PanwIpsecProxyIdProtocol {
  const protoEl = entry["protocol"] as Record<string, unknown> | undefined
  if (!protoEl) return { type: "any", localPort: null, remotePort: null, number: null }

  for (const type of PROTOCOL_TYPES) {
    const el = protoEl[type] as Record<string, unknown> | undefined
    if (el) {
      return {
        type,
        localPort: el["local-port"] !== undefined ? Number(el["local-port"]) : null,
        remotePort: el["remote-port"] !== undefined ? Number(el["remote-port"]) : null,
        number: null,
      }
    }
  }

  const num = protoEl["number"] as Record<string, unknown> | undefined
  if (num) {
    return {
      type: "number",
      localPort: null,
      remotePort: null,
      number: num["ip-protocol"] !== undefined ? Number(num["ip-protocol"]) : null,
    }
  }

  return { type: "any", localPort: null, remotePort: null, number: null }
}

function extractProxyIds(el: unknown): PanwIpsecProxyId[] {
  return entries(el).map((entry) => ({
    name: entryName(entry),
    local: str(entry["local"]),
    remote: str(entry["remote"]),
    protocol: extractProxyIdProtocol(entry),
  }))
}

function extractAutoKey(entry: Record<string, unknown>): PanwIpsecAutoKey | null {
  const akEl = entry["auto-key"] as Record<string, unknown> | undefined
  if (!akEl) return null

  return {
    ikeGateways: entries(akEl["ike-gateway"]).map(entryName),
    ipsecCryptoProfile: str(akEl["ipsec-crypto-profile"]),
    proxyIds: extractProxyIds(akEl["proxy-id"]),
    proxyIdsV6: extractProxyIds(akEl["proxy-id-v6"]),
    enableGreEncapsulation: yesNo(entry["enable-gre-encapsulation"]),
    copyTos: yesNo(entry["copy-tos"]),
    proxyIdStrictMatching: yesNo(entry["proxy-id-strict-matching"]),
    antiReplay: entry["anti-replay"] !== undefined ? yesNo(entry["anti-replay"]) : true,
    antiReplayWindow: entry["anti-replay-window"] !== undefined
      ? Number(entry["anti-replay-window"])
      : null,
    ipsecMode: str(entry["ipsec-mode"]) === "transport" ? "transport" : "tunnel",
  }
}

function extractManualKey(entry: Record<string, unknown>): PanwIpsecManualKey | null {
  const mkEl = entry["manual-key"] as Record<string, unknown> | undefined
  if (!mkEl) return null

  const espEl = mkEl["esp"] as Record<string, unknown> | undefined
  const ahEl = mkEl["ah"] as Record<string, unknown> | undefined
  const protocol = espEl ? "esp" : "ah"
  const protoEl = espEl ?? ahEl

  // Authentication algorithm is the key name under authentication (e.g. "sha256", "sha1", "md5")
  const authEl = protoEl?.["authentication"] as Record<string, unknown> | undefined
  const authAlgorithm = authEl ? Object.keys(authEl).find((k) => !k.startsWith("@_")) ?? null : null

  // Encryption (ESP only)
  const encEl = espEl?.["encryption"] as Record<string, unknown> | undefined

  const localAddr = mkEl["local-address"] as Record<string, unknown> | undefined
  const peerAddr = mkEl["peer-address"] as Record<string, unknown> | undefined

  return {
    protocol,
    authenticationAlgorithm: authAlgorithm,
    encryptionAlgorithm: str(encEl?.["algorithm"]),
    encryptionSalt: str(encEl?.["salt"]),
    localAddress: {
      interface: str(localAddr?.["interface"]),
      ip: str(localAddr?.["ip"]),
    },
    peerAddress: str(peerAddr?.["ip"]),
    localSpi: str(mkEl["local-spi"]),
    remoteSpi: str(mkEl["remote-spi"]),
  }
}

function extractGpSatellite(entry: Record<string, unknown>): PanwIpsecGpSatellite | null {
  const gpEl = entry["global-protect-satellite"] as Record<string, unknown> | undefined
  if (!gpEl) return null

  const localAddr = gpEl["local-address"] as Record<string, unknown> | undefined
  const ipEl = localAddr?.["ip"] as Record<string, unknown> | undefined
  const extCaEl = gpEl["external-ca"] as Record<string, unknown> | undefined

  return {
    portalAddress: str(gpEl["portal-address"]),
    localAddress: {
      interface: str(localAddr?.["interface"]),
      ipv4: str(ipEl?.["ipv4"]),
      ipv6: str(ipEl?.["ipv6"]),
    },
    publishConnectedRoutes: yesNo(dig(gpEl, "publish-connected-routes", "enable")),
    publishRoutes: members(gpEl["publish-routes"]),
    externalCa: extCaEl
      ? {
          certificateProfile: str(extCaEl["certificate-profile"]),
          localCertificate: str(extCaEl["local-certificate"]),
        }
      : null,
    ipv6Preferred: yesNo(gpEl["ipv6-preferred"]),
  }
}

function detectKeyType(entry: Record<string, unknown>): IpsecTunnelKeyType {
  if (entry["auto-key"]) return "auto-key"
  if (entry["manual-key"]) return "manual-key"
  if (entry["global-protect-satellite"]) return "global-protect-satellite"
  return "auto-key" // PAN-OS default
}

// ─── Extractor ────────────────────────────────────────────────────────────────

/**
 * Extract IPSec Tunnels from a template's <network> element.
 * Path: networkEl → tunnel → ipsec → entry[]
 */
export function extractIpsecTunnels(
  networkEl: unknown,
  templateName: string | null
): PanwIpsecTunnel[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const ipsecEl = dig(networkEl, "tunnel", "ipsec")

  const monitorEl = (entry: Record<string, unknown>) => {
    const tm = entry["tunnel-monitor"] as Record<string, unknown> | undefined
    return {
      enabled: yesNo(tm?.["enable"]),
      destinationIp: str(tm?.["destination-ip"]),
      monitorProfile: str(tm?.["tunnel-monitor-profile"]),
    }
  }

  return entries(ipsecEl).map((entry) => {
    const keyType = detectKeyType(entry)

    return {
      name: entryName(entry),
      keyType,
      tunnelInterface: str(entry["tunnel-interface"]),
      hwAcceleration: str(entry["hw-acceleration"]),
      comment: str(entry["comment"]),
      tunnelMonitor: monitorEl(entry),
      autoKey: keyType === "auto-key" ? extractAutoKey(entry) : null,
      manualKey: keyType === "manual-key" ? extractManualKey(entry) : null,
      gpSatellite: keyType === "global-protect-satellite" ? extractGpSatellite(entry) : null,
      templateName,
    }
  })
}
