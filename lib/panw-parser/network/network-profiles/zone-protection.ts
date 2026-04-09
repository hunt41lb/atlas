// @/src/lib/panw-parser/network/network-profiles/zone-protection.ts

import { entries, entryName, str, yesNo, dig } from "../../xml-helpers"

// ─── Supporting types ─────────────────────────────────────────────────────────

export interface PanwScanEntry {
  name: string            // port ID: "8001"=TCP Port Scan, "8002"=Host Sweep, "8003"=UDP Port Scan, "8006"=IP Protocol Scan
  enabled: boolean
  action: string          // "alert" | "block-ip"
  trackBy: string | null  // "source" | "source-and-destination" (block-ip only)
  duration: number | null // seconds (block-ip only)
  interval: number
  threshold: number
}

export interface PanwScanWhiteListEntry {
  name: string
  ipv4: string | null
  ipv6: string | null
}

export interface PanwNonIpProtocolEntry {
  name: string
  etherType: string
  enabled: boolean
}

export interface PanwSgtTagEntry {
  name: string
  tag: number | null
  enabled: boolean
}

// ─── Main type ────────────────────────────────────────────────────────────────

export interface PanwZoneProtectionProfile {
  name: string
  description: string | null

  // ── Tab 1: Flood Protection (fp) ──
  fpSynEnabled: boolean
  fpSynAction: string             // "red" (Random Early Drop) | "syn-cookies"
  fpSynAlarmRate: number
  fpSynActivateRate: number
  fpSynMaxRate: number

  fpUdpEnabled: boolean
  fpUdpAlarmRate: number
  fpUdpActivateRate: number
  fpUdpMaxRate: number

  fpIcmpEnabled: boolean
  fpIcmpAlarmRate: number
  fpIcmpActivateRate: number
  fpIcmpMaxRate: number

  fpIcmpv6Enabled: boolean
  fpIcmpv6AlarmRate: number
  fpIcmpv6ActivateRate: number
  fpIcmpv6MaxRate: number

  fpOtherIpEnabled: boolean
  fpOtherIpAlarmRate: number
  fpOtherIpActivateRate: number
  fpOtherIpMaxRate: number

  // ── Tab 2: Reconnaissance Protection (rp) ──
  rpScanEntries: PanwScanEntry[]
  rpScanWhiteList: PanwScanWhiteListEntry[]

  // ── Tab 3: Packet-Based Attack Protection — IP Drop ──
  pbapIpDropSpoofedIpAddress: boolean
  pbapIpDropStrictIpAddressCheck: boolean
  pbapIpDropFragmentedTraffic: boolean
  pbapIpDropStrictSourceRouting: boolean
  pbapIpDropLooseSourceRouting: boolean
  pbapIpDropTimestamp: boolean
  pbapIpDropRecordRoute: boolean
  pbapIpDropSecurity: boolean
  pbapIpDropStreamId: boolean
  pbapIpDropUnknown: boolean
  pbapIpDropMalformed: boolean

  // ── Tab 3: Packet-Based Attack Protection — TCP Drop ──
  pbapTcpDropMismatchedOverlappingSegment: boolean
  pbapTcpDropSplitHandshake: boolean
  pbapTcpDropSynWithData: boolean         // default: true
  pbapTcpDropSynackWithData: boolean      // default: true
  pbapTcpDropRejectNonSyn: string         // "global" | "yes" | "no"
  pbapTcpDropAsymmetricPath: string       // "global" | "drop" | "bypass"
  pbapTcpDropStripTcpTimestamp: boolean
  pbapTcpDropStripTcpFastOpen: boolean
  pbapTcpDropStripMptcpOption: string     // "global" | "yes" | "no"

  // ── Tab 3: Packet-Based Attack Protection — ICMP Drop ──
  pbapIcmpDropPingZeroId: boolean
  pbapIcmpDropFragment: boolean
  pbapIcmpDropLargePacket: boolean
  pbapIcmpDropEmbeddedErrorMessage: boolean
  pbapIcmpDropSuppressTtlExpiredError: boolean
  pbapIcmpDropSuppressFragNeeded: boolean

  // ── Tab 3: Packet-Based Attack Protection — IPv6 Drop ──
  pbapIpv6DropRoutingHeaderType0: boolean         // default: true
  pbapIpv6DropRoutingHeaderType1: boolean         // default: true
  pbapIpv6DropRoutingHeaderType3: boolean
  pbapIpv6DropRoutingHeaderType4To252: boolean    // default: true
  pbapIpv6DropRoutingHeaderType253: boolean
  pbapIpv6DropRoutingHeaderType254: boolean
  pbapIpv6DropRoutingHeaderType255: boolean
  pbapIpv6DropHopByHopExtension: boolean
  pbapIpv6DropRoutingExtension: boolean
  pbapIpv6DropDestinationExtension: boolean
  pbapIpv6DropInvalidIpv6OptionsInExtHeader: boolean
  pbapIpv6DropNonZeroReservedField: boolean
  pbapIpv6DropAnycastSourceAddress: boolean
  pbapIpv6DropNeedlessFragmentHeader: boolean
  pbapIpv6DropIcmpv6PacketTooBigSmallMtu: boolean
  pbapIpv6DropIpv4CompatibleAddress: boolean

  // ── Tab 3: Packet-Based Attack Protection — ICMPv6 Drop ──
  pbapIcmpv6DropDestUnreachable: boolean
  pbapIcmpv6DropPacketTooBig: boolean
  pbapIcmpv6DropTimeExceeded: boolean
  pbapIcmpv6DropParamProblem: boolean
  pbapIcmpv6DropRedirect: boolean

  // ── Tab 4: Protocol Protection (pp) ──
  ppNonIpProtocols: PanwNonIpProtocolEntry[]
  ppListType: string | null       // "exclude" | "include"

  // ── Tab 5: Ethernet SGT Protection ──
  sgtTags: PanwSgtTagEntry[]

  // ── Tab 6: L3 & L4 Header Inspection ──
  netInspectionRuleCount: number

  templateName: string | null
}

// ─── Flood helpers ────────────────────────────────────────────────────────────

const FP_DEFAULTS = { alarmRate: 10000, activateRate: 10000, maxRate: 40000 }

function extractFloodRates(protoEl: Record<string, unknown> | undefined, rateKey: "red" | "syn-cookies") {
  if (!protoEl) return FP_DEFAULTS
  const rateEl = protoEl[rateKey] as Record<string, unknown> | undefined
  if (!rateEl) return FP_DEFAULTS
  return {
    alarmRate:    rateEl["alarm-rate"]    !== undefined ? Number(rateEl["alarm-rate"])    : FP_DEFAULTS.alarmRate,
    activateRate: rateEl["activate-rate"] !== undefined ? Number(rateEl["activate-rate"]) : FP_DEFAULTS.activateRate,
    maxRate:      rateEl["maximal-rate"]  !== undefined ? Number(rateEl["maximal-rate"])  : FP_DEFAULTS.maxRate,
  }
}

// ─── Scan entry helper ────────────────────────────────────────────────────────

function extractScanEntries(scanEl: unknown): PanwScanEntry[] {
  return entries(scanEl).map((entry) => {
    const actionEl = entry["action"] as Record<string, unknown> | undefined
    const blockIpEl = actionEl?.["block-ip"] as Record<string, unknown> | undefined
    const isBlockIp = !!blockIpEl

    return {
      name: entryName(entry),
      enabled: yesNo(entry["enable"]) || !actionEl?.["alert"],  // enabled if explicitly set or has non-default action
      action: isBlockIp ? "block-ip" : "alert",
      trackBy: isBlockIp ? (str(blockIpEl!["track-by"]) ?? null) : null,
      duration: isBlockIp && blockIpEl!["duration"] !== undefined ? Number(blockIpEl!["duration"]) : null,
      interval:  entry["interval"]  !== undefined ? Number(entry["interval"])  : 2,
      threshold: entry["threshold"] !== undefined ? Number(entry["threshold"]) : 100,
    }
  })
}

// ─── Main extractor ───────────────────────────────────────────────────────────

/**
 * Extract Zone Protection Profiles from a template's <network> element.
 * Path: networkEl → profiles → zone-protection-profile → entry[]
 */
export function extractZoneProtectionProfiles(
  networkEl: unknown,
  templateName: string | null
): PanwZoneProtectionProfile[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const net = networkEl as Record<string, unknown>
  const profilesEl = net["profiles"] as Record<string, unknown> | undefined
  if (!profilesEl) return []

  const zppEl = profilesEl["zone-protection-profile"]
  return entries(zppEl).map((entry) => {
    // ── Flood Protection ──
    const floodEl = entry["flood"] as Record<string, unknown> | undefined
    const synEl = floodEl?.["tcp-syn"] as Record<string, unknown> | undefined
    const udpEl = floodEl?.["udp"] as Record<string, unknown> | undefined
    const icmpEl = floodEl?.["icmp"] as Record<string, unknown> | undefined
    const icmpv6El = floodEl?.["icmpv6"] as Record<string, unknown> | undefined
    const otherIpEl = floodEl?.["other-ip"] as Record<string, unknown> | undefined

    // SYN action: determined by which child node contains the rates
    const synHasCookies = !!synEl?.["syn-cookies"]
    const synAction = synHasCookies ? "syn-cookies" : "red"
    const synRates = extractFloodRates(synEl, synHasCookies ? "syn-cookies" : "red")
    const udpRates = extractFloodRates(udpEl, "red")
    const icmpRates = extractFloodRates(icmpEl, "red")
    const icmpv6Rates = extractFloodRates(icmpv6El, "red")
    const otherIpRates = extractFloodRates(otherIpEl, "red")

    // ── IPv6 ──
    const ipv6El = entry["ipv6"] as Record<string, unknown> | undefined
    const extHdrEl = dig(ipv6El, "filter-ext-hdr") as Record<string, unknown> | undefined
    const invPktEl = dig(ipv6El, "ignore-inv-pkt") as Record<string, unknown> | undefined

    // ── Non-IP Protocol ──
    const nonIpEl = entry["non-ip-protocol"] as Record<string, unknown> | undefined

    // ── SGT ──
    const sgtEl = dig(entry, "l2-sec-group-tag-protection", "tags") as unknown

    // ── L3 & L4 Header Inspection ──
    const netInspEl = dig(entry, "net-inspection", "rule") as unknown
    const ruleCount = entries(netInspEl).length

    return {
      name: entryName(entry),
      description: str(entry["description"]) ?? null,

      // Flood Protection
      fpSynEnabled:       yesNo(synEl?.["enable"]),
      fpSynAction:        synAction,
      fpSynAlarmRate:     synRates.alarmRate,
      fpSynActivateRate:  synRates.activateRate,
      fpSynMaxRate:       synRates.maxRate,

      fpUdpEnabled:       yesNo(udpEl?.["enable"]),
      fpUdpAlarmRate:     udpRates.alarmRate,
      fpUdpActivateRate:  udpRates.activateRate,
      fpUdpMaxRate:       udpRates.maxRate,

      fpIcmpEnabled:      yesNo(icmpEl?.["enable"]),
      fpIcmpAlarmRate:    icmpRates.alarmRate,
      fpIcmpActivateRate: icmpRates.activateRate,
      fpIcmpMaxRate:      icmpRates.maxRate,

      fpIcmpv6Enabled:      yesNo(icmpv6El?.["enable"]),
      fpIcmpv6AlarmRate:    icmpv6Rates.alarmRate,
      fpIcmpv6ActivateRate: icmpv6Rates.activateRate,
      fpIcmpv6MaxRate:      icmpv6Rates.maxRate,

      fpOtherIpEnabled:      yesNo(otherIpEl?.["enable"]),
      fpOtherIpAlarmRate:    otherIpRates.alarmRate,
      fpOtherIpActivateRate: otherIpRates.activateRate,
      fpOtherIpMaxRate:      otherIpRates.maxRate,

      // Reconnaissance Protection
      rpScanEntries: extractScanEntries(entry["scan"]),
      rpScanWhiteList: entries(entry["scan-white-list"]).map((e) => ({
        name: entryName(e),
        ipv4: str(e["ipv4"]) ?? null,
        ipv6: str(e["ipv6"]) ?? null,
      })),

      // Packet-Based Attack — IP Drop
      pbapIpDropSpoofedIpAddress:     yesNo(entry["discard-ip-spoof"]),
      pbapIpDropStrictIpAddressCheck:  yesNo(entry["strict-ip-check"]),
      pbapIpDropFragmentedTraffic:     yesNo(entry["discard-ip-frag"]),
      pbapIpDropStrictSourceRouting:   yesNo(entry["discard-strict-source-routing"]),
      pbapIpDropLooseSourceRouting:    yesNo(entry["discard-loose-source-routing"]),
      pbapIpDropTimestamp:             yesNo(entry["discard-timestamp"]),
      pbapIpDropRecordRoute:           yesNo(entry["discard-record-route"]),
      pbapIpDropSecurity:              yesNo(entry["discard-security"]),
      pbapIpDropStreamId:              yesNo(entry["discard-stream-id"]),
      pbapIpDropUnknown:               yesNo(entry["discard-unknown-option"]),
      pbapIpDropMalformed:             yesNo(entry["discard-malformed-option"]),

      // Packet-Based Attack — TCP Drop
      pbapTcpDropMismatchedOverlappingSegment: yesNo(entry["discard-overlapping-tcp-segment-mismatch"]),
      pbapTcpDropSplitHandshake:               yesNo(entry["discard-tcp-split-handshake"]),
      pbapTcpDropSynWithData:                  entry["tcp-syn-with-data"] !== undefined ? yesNo(entry["tcp-syn-with-data"]) : true,
      pbapTcpDropSynackWithData:               entry["tcp-synack-with-data"] !== undefined ? yesNo(entry["tcp-synack-with-data"]) : true,
      pbapTcpDropRejectNonSyn:                 str(entry["tcp-reject-non-syn"]) ?? "global",
      pbapTcpDropAsymmetricPath:               str(entry["asymmetric-path"]) ?? "global",
      pbapTcpDropStripTcpTimestamp:            yesNo(entry["remove-tcp-timestamp"]),
      pbapTcpDropStripTcpFastOpen:             yesNo(entry["strip-tcp-fast-open-and-data"]),
      pbapTcpDropStripMptcpOption:             str(entry["strip-mptcp-option"]) ?? "global",

      // Packet-Based Attack — ICMP Drop
      pbapIcmpDropPingZeroId:              yesNo(entry["discard-icmp-ping-zero-id"]),
      pbapIcmpDropFragment:                yesNo(entry["discard-icmp-frag"]),
      pbapIcmpDropLargePacket:             yesNo(entry["discard-icmp-large-packet"]),
      pbapIcmpDropEmbeddedErrorMessage:    yesNo(entry["discard-icmp-error"]),
      pbapIcmpDropSuppressTtlExpiredError: yesNo(entry["suppress-icmp-timeexceeded"]),
      pbapIcmpDropSuppressFragNeeded:      yesNo(entry["suppress-icmp-needfrag"]),

      // Packet-Based Attack — IPv6 Drop
      // Routing header types: 0, 1, 4-252 default to true in PAN-OS
      pbapIpv6DropRoutingHeaderType0:     entry["drop-routing-header-type-0"]      !== undefined ? yesNo(entry["drop-routing-header-type-0"])      : true,
      pbapIpv6DropRoutingHeaderType1:     entry["drop-routing-header-type-1"]      !== undefined ? yesNo(entry["drop-routing-header-type-1"])      : true,
      pbapIpv6DropRoutingHeaderType3:     yesNo(ipv6El?.["routing-header-3"]),
      pbapIpv6DropRoutingHeaderType4To252: entry["drop-routing-header-type-4-252"] !== undefined ? yesNo(entry["drop-routing-header-type-4-252"]) : true,
      pbapIpv6DropRoutingHeaderType253:   yesNo(ipv6El?.["routing-header-253"]),
      pbapIpv6DropRoutingHeaderType254:   yesNo(ipv6El?.["routing-header-254"]),
      pbapIpv6DropRoutingHeaderType255:   yesNo(ipv6El?.["routing-header-255"]),
      pbapIpv6DropHopByHopExtension:                yesNo(extHdrEl?.["hop-by-hop-hdr"]),
      pbapIpv6DropRoutingExtension:                 yesNo(extHdrEl?.["routing-hdr"]),
      pbapIpv6DropDestinationExtension:             yesNo(extHdrEl?.["dest-option-hdr"]),
      pbapIpv6DropInvalidIpv6OptionsInExtHeader:    yesNo(ipv6El?.["options-invalid-ipv6-discard"]),
      pbapIpv6DropNonZeroReservedField:             yesNo(ipv6El?.["reserved-field-set-discard"]),
      pbapIpv6DropAnycastSourceAddress:             yesNo(ipv6El?.["anycast-source"]),
      pbapIpv6DropNeedlessFragmentHeader:           yesNo(ipv6El?.["needless-fragment-hdr"]),
      pbapIpv6DropIcmpv6PacketTooBigSmallMtu:       yesNo(ipv6El?.["icmpv6-too-big-small-mtu-discard"]),
      pbapIpv6DropIpv4CompatibleAddress:            yesNo(ipv6El?.["ipv4-compatible-address"]),

      // Packet-Based Attack — ICMPv6 Drop
      pbapIcmpv6DropDestUnreachable: yesNo(invPktEl?.["dest-unreach"]),
      pbapIcmpv6DropPacketTooBig:    yesNo(invPktEl?.["pkt-too-big"]),
      pbapIcmpv6DropTimeExceeded:    yesNo(invPktEl?.["time-exceeded"]),
      pbapIcmpv6DropParamProblem:    yesNo(invPktEl?.["param-problem"]),
      pbapIcmpv6DropRedirect:        yesNo(invPktEl?.["redirect"]),

      // Protocol Protection
      ppNonIpProtocols: entries(dig(nonIpEl, "protocol")).map((e) => ({
        name: entryName(e),
        etherType: str(e["ether-type"]) ?? "",
        enabled: yesNo(e["enable"]),
      })),
      ppListType: str(nonIpEl?.["list-type"]) ?? null,

      // Ethernet SGT Protection
      sgtTags: entries(sgtEl).map((e) => ({
        name: entryName(e),
        tag: e["tag"] !== undefined ? Number(e["tag"]) : null,
        enabled: yesNo(e["enable"]),
      })),

      // L3 & L4 Header Inspection
      netInspectionRuleCount: ruleCount,

      templateName,
    }
  })
}
