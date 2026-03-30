// @/lib/panw-parser/network-profiles/ike-gateways.ts
//
// IKE Gateway types and extractor.
// Path: network > ike > gateway > entry[]

import { entries, entryName, str, yesNo, dig } from "../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanwIkeGateway {
  name: string
  comment: string | null

  // General
  version: string                    // "ikev2" | "ikev1" | "ikev2-preferred"
  peerAddress: string | null
  localInterface: string | null
  localIp: string | null
  authenticationType: string         // "pre-shared-key" | "certificate"
  localIdType: string | null
  localIdValue: string | null
  peerIdType: string | null
  peerIdValue: string | null

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

  // Advanced — IKEv1
  ikev1DpdEnabled: boolean
  ikev1CryptoProfile: string | null

  // Advanced — PQ PPK
  pqPpkEnabled: boolean
  pqPpkNegotiationMode: string | null

  // Advanced — PQ KEM
  pqKemEnabled: boolean
  pqKemBlockVulnerableCipher: boolean

  // Advanced — PQ QKD
  pqQkdEnabled: boolean
  pqQkdKeySize: number | null
  pqQkdTimeout: number | null

  templateName: string | null
}

// ─── ID type label mapping ────────────────────────────────────────────────────

export const ID_TYPE_LABELS: Record<string, string> = {
  ufqdn: "User FQDN (email address)",
  fqdn: "FQDN (hostname)",
  keyid: "Key ID",
  ipaddr: "IP Address",
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
    const pqPpkEl = ikev2El?.["pq-ppk"] as Record<string, unknown> | undefined
    const pqKemEl = ikev2El?.["pq-kem"] as Record<string, unknown> | undefined
    const pqQkdEl = ikev2El?.["pq-qkd"] as Record<string, unknown> | undefined

    // IKEv1 settings
    const ikev1El = protocolEl?.["ikev1"] as Record<string, unknown> | undefined

    // Authentication type
    const authenticationType = authEl?.["pre-shared-key"] ? "pre-shared-key" : "certificate"

    return {
      name: entryName(entry),
      comment: str(entry["comment"]) ?? null,

      // General
      version: str(protocolEl?.["version"]) ?? "ikev2-preferred",
      peerAddress: str(peerAddrEl?.["ip"]) ?? str(peerAddrEl?.["fqdn"]) ?? null,
      localInterface: str(localAddrEl?.["interface"]) ?? null,
      localIp: str(localAddrEl?.["ip"]) ?? null,
      authenticationType,
      localIdType: str(localIdEl?.["type"]) ?? null,
      localIdValue: str(localIdEl?.["id"]) ?? null,
      peerIdType: str(peerIdEl?.["type"]) ?? null,
      peerIdValue: str(peerIdEl?.["id"]) ?? null,

      // Advanced — Common
      passiveMode: yesNo(dig(commonEl, "passive-mode")),
      natTraversal: yesNo(dig(commonEl, "nat-traversal", "enable")),
      fragmentation: yesNo(dig(commonEl, "fragmentation", "enable")),

      // Advanced — IKEv2 General
      ikev2CryptoProfile: str(ikev2El?.["ike-crypto-profile"]) ?? null,
      ikev2RequireCookie: yesNo(ikev2El?.["require-cookie"]),
      ikev2Fragmentation: yesNo(ikev2FragEl?.["enable"]),
      ikev2FragmentationSize: ikev2FragEl?.["size"] !== undefined ? Number(ikev2FragEl["size"]) : null,
      ikev2DpdEnabled: yesNo(dig(ikev2El, "dpd", "enable")),

      // Advanced — IKEv1
      ikev1DpdEnabled: yesNo(dig(ikev1El, "dpd", "enable")),
      ikev1CryptoProfile: str(ikev1El?.["ike-crypto-profile"]) ?? null,

      // Advanced — PQ PPK
      pqPpkEnabled: yesNo(pqPpkEl?.["enabled"]),
      pqPpkNegotiationMode: str(pqPpkEl?.["negotiation-mode"]) ?? null,

      // Advanced — PQ KEM
      pqKemEnabled: yesNo(pqKemEl?.["enable"]),
      pqKemBlockVulnerableCipher: pqKemEl?.["block-vulnerable-cipher"] !== undefined ? yesNo(pqKemEl["block-vulnerable-cipher"]) : true,

      // Advanced — PQ QKD
      pqQkdEnabled: yesNo(pqQkdEl?.["enable"]),
      pqQkdKeySize: pqQkdEl?.["key-size"] !== undefined ? Number(pqQkdEl["key-size"]) : null,
      pqQkdTimeout: pqQkdEl?.["timeout"] !== undefined ? Number(pqQkdEl["timeout"]) : null,

      templateName,
    }
  })
}
