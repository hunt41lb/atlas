// @/lib/panw-parser/gre-tunnels/gre-tunnels.ts
//
// GRE Tunnel types and extractor.
// Path: network > tunnel > gre > entry[]

import { entries, entryName, str, dig, yesNo } from "../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanwGreTunnel {
  name: string
  localAddress: { interface: string | null; ip: string | null }
  peerAddress: string | null
  tunnelInterface: string | null
  ttl: number
  copyTos: boolean
  erspan: boolean
  keepAliveEnabled: boolean
  keepAliveInterval: number
  keepAliveRetry: number
  keepAliveHoldTimer: number
  templateName: string | null
}

// ─── Extractor ────────────────────────────────────────────────────────────────

/**
 * Extract GRE Tunnels from a template's <network> element.
 * Path: networkEl → tunnel → gre → entry[]
 */
export function extractGreTunnels(
  networkEl: unknown,
  templateName: string | null
): PanwGreTunnel[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const greEl = dig(networkEl, "tunnel", "gre")

  return entries(greEl).map((entry) => {
    const localAddr = entry["local-address"] as Record<string, unknown> | undefined
    const peerAddr = entry["peer-address"] as Record<string, unknown> | undefined
    const kaEl = entry["keep-alive"] as Record<string, unknown> | undefined

    return {
      name: entryName(entry),
      localAddress: {
        interface: str(localAddr?.["interface"]),
        ip: str(localAddr?.["ip"]),
      },
      peerAddress: str(peerAddr?.["ip"]),
      tunnelInterface: str(entry["tunnel-interface"]),
      ttl: entry["ttl"] !== undefined ? Number(entry["ttl"]) : 64,
      copyTos: yesNo(entry["copy-tos"]),
      erspan: yesNo(entry["erspan"]),
      keepAliveEnabled: yesNo(kaEl?.["enable"]),
      keepAliveInterval: kaEl?.["interval"] !== undefined ? Number(kaEl["interval"]) : 10,
      keepAliveRetry: kaEl?.["retry"] !== undefined ? Number(kaEl["retry"]) : 3,
      keepAliveHoldTimer: kaEl?.["hold-timer"] !== undefined ? Number(kaEl["hold-timer"]) : 5,
      templateName,
    }
  })
}
