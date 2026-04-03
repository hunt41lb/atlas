// @/lib/panw-parser/network-profiles/ike-gateways.ts
//
// IKE Gateway types and extractor.
// Path: network > ike > gateway > entry[]

import { entries, entryName, str, yesNo, dig } from "../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanwIkeGatewayPpkKey {
  name: string
  enabled: boolean
}

export interface PanwIkeGateway {
  name: string
  comment: string | null

  // General
  version: string                    // "ikev2" | "ikev1" | "ikev2-preferred"
  addressType: string                // "ipv4" | "ipv6" (derived from peer IP format)
  peerAddressType: string            // "ip" | "fqdn" | "dynamic" (derived from which key exists)
  peerAddress: string | null
  localInterface: string | null
  localIp: string | null

  // Authentication
  authenticationType: string         // "pre-shared-key" | "certificate"

  // Authentication — Certificate fields
  certificateProfile: string | null
  localCertificateName: string | null
  hashAndUrlEnabled: boolean
  hashAndUrlBaseUrl: string | null
  allowIdPayloadMismatch: boolean
  strictValidationRevocation: boolean

  // Identification
  localIdType: string | null
  localIdValue: string | null
  peerIdType: string | null
  peerIdValue: string | null
  peerIdMatching: string | null      // "exact" | "wildcard" | null

  // Advanced — Common
  passiveMode: boolean
  natTraversal: boolean
  fragmentation: boolean

  // Advanced — IKEv2 General
  ikev2CryptoProfile: string | null
  ikev2RequireCookie: boolean
  ikev2Fragmentation: boolean
  ikev2FragmentationSize: number | null
  ikev2DpdEnabled: boolean
  ikev2DpdInterval: number | null

  // Advanced — IKEv1
  ikev1DpdEnabled: boolean
  ikev1DpdInterval: number | null
  ikev1DpdRetry: number | null
  ikev1CryptoProfile: string | null
  ikev1ExchangeMode: string | null   // "main" | "aggressive" | "auto"

  // Advanced — PQ PPK
  pqPpkEnabled: boolean
  pqPpkNegotiationMode: string | null
  pqPpkKeys: PanwIkeGatewayPpkKey[]

  // Advanced — PQ KEM
  pqKemEnabled: boolean
  pqKemBlockVulnerableCipher: boolean

  // Advanced — PQ QKD
  pqQkdEnabled: boolean
  pqQkdKeySize: number | null
  pqQkdTimeout: number | null
  pqQkdProfile: string | null
  pqQkdPeerSaeId: string | null

  templateName: string | null
}

// ─── ID type label mapping ────────────────────────────────────────────────────

export const ID_TYPE_LABELS: Record<string, string> = {
  ufqdn: "User FQDN (email address)",
  fqdn: "FQDN (hostname)",
  keyid: "Key ID",
  ipaddr: "IP Address",
  dn: "Distinguished Name (Subject)",
}

// ─── Extractor ────────────────────────────────────────────────────────────────

/**
 * Extract IKE Gateways from a template's <network> element.
 * Path: networkEl → ike → gateway → entry[]
 */
export function extractIkeGateways(
  networkEl: unknown,
  templateName: string | null
): PanwIkeGateway[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const gwEl = dig(networkEl, "ike", "gateway")

  return entries(gwEl).map((entry) => {
    const authEl = entry["authentication"] as Record<string, unknown> | undefined
    const protocolEl = entry["protocol"] as Record<string, unknown> | undefined
    const commonEl = entry["protocol-common"] as Record<string, unknown> | undefined
    const localAddrEl = entry["local-address"] as Record<string, unknown> | undefined
    const peerAddrEl = entry["peer-address"] as Record<string, unknown> | undefined
    const localIdEl = entry["local-id"] as Record<string, unknown> | undefined
    const peerIdEl = entry["peer-id"] as Record<string, unknown> | undefined

    // IKEv2 settings
    const ikev2El = protocolEl?.["ikev2"] as Record<string, unknown> | undefined
    const ikev2FragEl = ikev2El?.["ikev2-fragment"] as Record<string, unknown> | undefined
    const ikev2DpdEl = ikev2El?.["dpd"] as Record<string, unknown> | undefined
    const pqPpkEl = ikev2El?.["pq-ppk"] as Record<string, unknown> | undefined
    const pqKemEl = ikev2El?.["pq-kem"] as Record<string, unknown> | undefined
    const pqQkdEl = ikev2El?.["pq-qkd"] as Record<string, unknown> | undefined

    // IKEv1 settings
    const ikev1El = protocolEl?.["ikev1"] as Record<string, unknown> | undefined
    const ikev1DpdEl = ikev1El?.["dpd"] as Record<string, unknown> | undefined

    // Authentication type & certificate fields
    const authenticationType = authEl?.["pre-shared-key"] ? "pre-shared-key" : "certificate"
    const certEl = authEl?.["certificate"] as Record<string, unknown> | undefined
    const localCertEl = certEl?.["local-certificate"] as Record<string, unknown> | undefined
    const hashUrlEl = localCertEl?.["hash-and-url"] as Record<string, unknown> | undefined

    // Derive address type from peer IP format
    const peerIp = str(peerAddrEl?.["ip"])
    const peerFqdn = str(peerAddrEl?.["fqdn"])
    const addressType = peerIp
      ? (peerIp.includes(":") ? "ipv6" : "ipv4")
      : "ipv4"
    const peerAddressType = peerIp
      ? "ip"
      : peerFqdn
        ? "fqdn"
        : "dynamic"

    // PPK keys
    const ppkKeysEl = pqPpkEl?.["keys"] as Record<string, unknown> | undefined
    const pqPpkKeys: PanwIkeGatewayPpkKey[] = entries(ppkKeysEl).map((k) => ({
      name: entryName(k),
      enabled: yesNo(k["enabled"]),
    }))

    return {
      name: entryName(entry),
      comment: str(entry["comment"]) ?? null,

      // General
      version: str(protocolEl?.["version"]) ?? "ikev2-preferred",
      addressType,
      peerAddressType,
      peerAddress: peerIp ?? peerFqdn ?? null,
      localInterface: str(localAddrEl?.["interface"]) ?? null,
      localIp: str(localAddrEl?.["ip"]) ?? null,

      // Authentication
      authenticationType,
      certificateProfile: str(certEl?.["certificate-profile"]) ?? null,
      localCertificateName: str(localCertEl?.["name"]) ?? null,
      hashAndUrlEnabled: yesNo(hashUrlEl?.["enable"]),
      hashAndUrlBaseUrl: str(hashUrlEl?.["base-url"]) ?? null,
      allowIdPayloadMismatch: yesNo(certEl?.["allow-id-payload-mismatch"]),
      strictValidationRevocation: yesNo(certEl?.["strict-validation-revocation"]),

      // Identification
      localIdType: str(localIdEl?.["type"]) ?? null,
      localIdValue: str(localIdEl?.["id"]) ?? null,
      peerIdType: str(peerIdEl?.["type"]) ?? null,
      peerIdValue: str(peerIdEl?.["id"]) ?? null,
      peerIdMatching: str(peerIdEl?.["matching"]) ?? null,

      // Advanced — Common
      passiveMode: yesNo(dig(commonEl, "passive-mode")),
      natTraversal: yesNo(dig(commonEl, "nat-traversal", "enable")),
      fragmentation: yesNo(dig(commonEl, "fragmentation", "enable")),

      // Advanced — IKEv2 General
      ikev2CryptoProfile: str(ikev2El?.["ike-crypto-profile"]) ?? null,
      ikev2RequireCookie: yesNo(ikev2El?.["require-cookie"]),
      ikev2Fragmentation: yesNo(ikev2FragEl?.["enable"]),
      ikev2FragmentationSize: ikev2FragEl?.["size"] !== undefined
        ? Number(ikev2FragEl["size"])
        : yesNo(ikev2FragEl?.["enable"])
          ? 576   // PAN-OS default when fragmentation enabled but no explicit size
          : null,
      ikev2DpdEnabled: yesNo(ikev2DpdEl?.["enable"]),
      ikev2DpdInterval: ikev2DpdEl?.["interval"] !== undefined ? Number(ikev2DpdEl["interval"]) : null,

      // Advanced — IKEv1
      ikev1DpdEnabled: yesNo(ikev1DpdEl?.["enable"]),
      ikev1DpdInterval: ikev1DpdEl?.["interval"] !== undefined ? Number(ikev1DpdEl["interval"]) : null,
      ikev1DpdRetry: ikev1DpdEl?.["retry"] !== undefined ? Number(ikev1DpdEl["retry"]) : null,
      ikev1CryptoProfile: str(ikev1El?.["ike-crypto-profile"]) ?? null,
      ikev1ExchangeMode: str(ikev1El?.["exchange-mode"]) ?? null,

      // Advanced — PQ PPK
      pqPpkEnabled: yesNo(pqPpkEl?.["enabled"]),
      pqPpkNegotiationMode: str(pqPpkEl?.["negotiation-mode"]) ?? null,
      pqPpkKeys,

      // Advanced — PQ KEM
      pqKemEnabled: yesNo(pqKemEl?.["enable"]),
      pqKemBlockVulnerableCipher: pqKemEl?.["block-vulnerable-cipher"] !== undefined ? yesNo(pqKemEl["block-vulnerable-cipher"]) : true,

      // Advanced — PQ QKD
      pqQkdEnabled: yesNo(pqQkdEl?.["enable"]),
      pqQkdKeySize: pqQkdEl?.["key-size"] !== undefined ? Number(pqQkdEl["key-size"]) : null,
      pqQkdTimeout: pqQkdEl?.["timeout"] !== undefined ? Number(pqQkdEl["timeout"]) : null,
      pqQkdProfile: str(pqQkdEl?.["qkd-profile"]) ?? null,
      pqQkdPeerSaeId: str(pqQkdEl?.["peer-sae-id"]) ?? null,

      templateName,
    }
  })
}
