// @/src/lib/panw-parser/network/proxy/proxy.ts
//
// Proxy (Secure Web Gateway) types and extractor.
// Path: network > secure-web-gateway

import { str, yesNo } from "../../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProxyType = "explicit-proxy" | "transparent-proxy" | null

export interface PanwExplicitProxy {
  connectTimeout: number | null
  listeningInterface: string | null
  upstreamInterface: string | null
  proxyIp: string | null
  dnsProxy: string | null
  checkDomainSni: boolean
  authenticationMethod: string | null
  stripAlpn: boolean
  authenticationProfile: string | null
  authenticationLogForwarding: string | null
}

export interface PanwTransparentProxy {
  connectTimeout: number | null
  upstreamInterface: string | null
  proxyIp: string | null
  dnsProxy: string | null
}

export interface PanwProxy {
  proxyType: ProxyType
  explicitProxy: PanwExplicitProxy | null
  transparentProxy: PanwTransparentProxy | null
  templateName: string | null
}

// ─── Extractor ────────────────────────────────────────────────────────────────

/**
 * Extract Proxy (Secure Web Gateway) settings from a template's <network> element.
 * Path: networkEl → secure-web-gateway
 */
export function extractProxy(
  networkEl: unknown,
  templateName: string | null
): PanwProxy | null {
  if (!networkEl || typeof networkEl !== "object") return null
  const swgEl = (networkEl as Record<string, unknown>)["secure-web-gateway"] as Record<string, unknown> | undefined
  if (!swgEl) return null

  const enablementEl = swgEl["enablement"] as Record<string, unknown> | undefined
  let proxyType: ProxyType = null
  if (enablementEl) {
    if (enablementEl["explicit-proxy"] !== undefined) proxyType = "explicit-proxy"
    else if (enablementEl["transparent-proxy"] !== undefined) proxyType = "transparent-proxy"
  }

  let explicitProxy: PanwExplicitProxy | null = null
  let transparentProxy: PanwTransparentProxy | null = null

  if (proxyType === "explicit-proxy") {
    const el = swgEl["explicit-web-gateway"] as Record<string, unknown> | undefined
    const ipEl = el?.["proxy-ip"] as Record<string, unknown> | undefined
    explicitProxy = {
      connectTimeout: el?.["connect-timeout"] !== undefined ? Number(el["connect-timeout"]) : null,
      listeningInterface: str(el?.["interface"]),
      upstreamInterface: str(el?.["upstream-interface"]),
      proxyIp: str(ipEl?.["ipv4"]) ?? str(ipEl?.["ipv6"]),
      dnsProxy: str(el?.["dns-proxy"]),
      checkDomainSni: el?.["check-domain-sni"] !== undefined ? yesNo(el["check-domain-sni"]) : true,
      authenticationMethod: str(el?.["authentication-method"]),
      stripAlpn: el?.["strip-alpn"] !== undefined ? yesNo(el["strip-alpn"]) : true,
      authenticationProfile: str(el?.["authentication-profile"]),
      authenticationLogForwarding: str(el?.["authentication-log-forwarding"]),
    }
  }

  if (proxyType === "transparent-proxy") {
    const el = swgEl["transparent-web-gateway"] as Record<string, unknown> | undefined
    const ipEl = el?.["proxy-ip"] as Record<string, unknown> | undefined
    transparentProxy = {
      connectTimeout: el?.["connect-timeout"] !== undefined ? Number(el["connect-timeout"]) : null,
      upstreamInterface: str(el?.["upstream-interface"]),
      proxyIp: str(ipEl?.["ipv4"]) ?? str(ipEl?.["ipv6"]),
      dnsProxy: str(el?.["dns-proxy"]),
    }
  }

  return { proxyType, explicitProxy, transparentProxy, templateName }
}
