// @/lib/panw-parser/network/sd-wan-interface-profile/sd-wan-interface-profile.ts

import { entries, entryName, str, yesNo } from "../../xml-helpers"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanwSdwanInterfaceProfile {
  name: string
  linkTag: string | null
  comment: string | null
  linkType: string | null
  maximumDownload: number | null
  maximumUpload: number | null
  errorCorrection: boolean
  pathMonitoring: string | null
  probeFrequency: number | null
  probeIdleTime: number | null
  failbackHoldTime: number | null
  vpnDataTunnelSupport: boolean
  vpnFailoverMetric: number | null
  templateName: string | null
}

// ─── Extractor ────────────────────────────────────────────────────────────────

/**
 * Extract SD-WAN Interface Profiles from a template's <network> element.
 * Path: networkEl → sdwan-interface-profile → entry[]
 */
export function extractSdwanInterfaceProfiles(
  networkEl: unknown,
  templateName: string | null,
  vsysEl?: unknown
): PanwSdwanInterfaceProfile[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const networkProfiles = (networkEl && typeof networkEl === "object")
    ? entries((networkEl as Record<string, unknown>)["sdwan-interface-profile"])
    : []
  const vsysProfiles = (vsysEl && typeof vsysEl === "object")
    ? entries((vsysEl as Record<string, unknown>)["sdwan-interface-profile"])
    : []
  const allEntries = [...networkProfiles, ...vsysProfiles]

  return allEntries.map((entry) => ({
    name: entryName(entry),
    linkTag: str(entry["link-tag"]) ?? null,
    comment: str(entry["comment"]) ?? null,
    linkType: str(entry["link-type"]) ?? null,
    maximumDownload: entry["maximum-download"] !== undefined ? Number(entry["maximum-download"]) : null,
    maximumUpload: entry["maximum-upload"] !== undefined ? Number(entry["maximum-upload"]) : null,
    errorCorrection: yesNo(entry["error-correction"]),
    pathMonitoring: str(entry["path-monitoring"]) ?? null,
    probeFrequency: entry["probe-frequency"] !== undefined ? Number(entry["probe-frequency"]) : null,
    probeIdleTime: entry["probe-idle-time"] !== undefined ? Number(entry["probe-idle-time"]) : null,
    failbackHoldTime: entry["failback-hold-time"] !== undefined ? Number(entry["failback-hold-time"]) : null,
    vpnDataTunnelSupport: yesNo(entry["vpn-data-tunnel-support"]),
    vpnFailoverMetric: entry["vpn-failover-metric"] !== undefined ? Number(entry["vpn-failover-metric"]) : null,
    templateName,
  }))
}
