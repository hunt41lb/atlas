// @/app/(main)/network/_components/network-profiles/zone-protection/zone-protection-dialog.tsx
//
// Detail dialog for Zone Protection Profiles.
// 6 tabs matching the PAN-OS GUI:
//   1. Flood Protection
//   2. Reconnaissance Protection
//   3. Packet-Based Attack Protection (5 sub-tabs)
//   4. Protocol Protection
//   5. Ethernet SGT Protection
//   6. L3 & L4 Header Inspection

"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import {
  ReadOnlyCheckbox,
  FieldGroup,
  HeaderField,
  LabeledValue,
} from "../../router-shared/router-dialog/field-display"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import type { PanwZoneProtectionProfile } from "@/lib/panw-parser/network-profiles"
import { Button } from "@/components/ui/button"

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: FLOOD PROTECTION
// ═══════════════════════════════════════════════════════════════════════════════

function FloodProtectionTab({ profile }: { profile: PanwZoneProtectionProfile }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {/* Row 1: SYN, ICMP, Other IP */}
        <FieldGroup title="SYN">
          <ReadOnlyCheckbox checked={profile.fpSynEnabled} label="Enable" />
          <LabeledValue label="Action" value={profile.fpSynAction === "syn-cookies" ? "SYN Cookies" : "Random Early Drop"} />
          <LabeledValue label="Alarm Rate (conn/sec)" value={profile.fpSynAlarmRate} />
          <LabeledValue label="Activate (conn/sec)" value={profile.fpSynActivateRate} />
          <LabeledValue label="Maximum (conn/sec)" value={profile.fpSynMaxRate} />
        </FieldGroup>

        <FieldGroup title="ICMP">
          <ReadOnlyCheckbox checked={profile.fpIcmpEnabled} label="Enable" />
          <LabeledValue label="Alarm Rate (conn/sec)" value={profile.fpIcmpAlarmRate} />
          <LabeledValue label="Activate (conn/sec)" value={profile.fpIcmpActivateRate} />
          <LabeledValue label="Maximum (conn/sec)" value={profile.fpIcmpMaxRate} />
        </FieldGroup>

        <FieldGroup title="Other IP">
          <ReadOnlyCheckbox checked={profile.fpOtherIpEnabled} label="Enable" />
          <LabeledValue label="Alarm Rate (conn/sec)" value={profile.fpOtherIpAlarmRate} />
          <LabeledValue label="Activate (conn/sec)" value={profile.fpOtherIpActivateRate} />
          <LabeledValue label="Maximum (conn/sec)" value={profile.fpOtherIpMaxRate} />
        </FieldGroup>

        {/* Row 2: UDP, ICMPv6 */}
        <FieldGroup title="UDP">
          <ReadOnlyCheckbox checked={profile.fpUdpEnabled} label="Enable" />
          <LabeledValue label="Alarm Rate (conn/sec)" value={profile.fpUdpAlarmRate} />
          <LabeledValue label="Activate (conn/sec)" value={profile.fpUdpActivateRate} />
          <LabeledValue label="Maximum (conn/sec)" value={profile.fpUdpMaxRate} />
        </FieldGroup>

        <FieldGroup title="ICMPv6">
          <ReadOnlyCheckbox checked={profile.fpIcmpv6Enabled} label="Enable" />
          <LabeledValue label="Alarm Rate (conn/sec)" value={profile.fpIcmpv6AlarmRate} />
          <LabeledValue label="Activate (conn/sec)" value={profile.fpIcmpv6ActivateRate} />
          <LabeledValue label="Maximum (conn/sec)" value={profile.fpIcmpv6MaxRate} />
        </FieldGroup>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2: RECONNAISSANCE PROTECTION
// ═══════════════════════════════════════════════════════════════════════════════

const SCAN_LABELS: Record<string, string> = {
  "8001": "TCP Port Scan",
  "8002": "Host Sweep",
  "8003": "UDP Port Scan",
  "8006": "IP Protocol Scan",
}

const SCAN_ORDER = ["8001", "8002", "8003", "8006"]

function ReconProtectionTab({ profile }: { profile: PanwZoneProtectionProfile }) {
  // Build a lookup for scan entries, fill in defaults for missing IDs
  const scanMap = new Map(profile.rpScanEntries.map((e) => [e.name, e]))

  return (
    <div className="space-y-6">
      {/* Scan table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[11px]">Scan</TableHead>
            <TableHead className="text-[11px]">Enable</TableHead>
            <TableHead className="text-[11px]">Action</TableHead>
            <TableHead className="text-[11px]">Interval (sec)</TableHead>
            <TableHead className="text-[11px]">Threshold (events)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {SCAN_ORDER.map((id) => {
            const entry = scanMap.get(id)
            return (
              <TableRow key={id}>
                <TableCell className="text-xs">{SCAN_LABELS[id]}</TableCell>
                <TableCell><Checkbox checked={entry?.enabled ?? false} disabled /></TableCell>
                <TableCell className="text-xs">{entry?.action ?? "alert"}</TableCell>
                <TableCell className="text-xs tabular-nums">{entry?.interval ?? 2}</TableCell>
                <TableCell className="text-xs tabular-nums">{entry?.threshold ?? 100}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {/* Source Address Exclusion */}
      <FieldGroup title="Source Address Exclusion">
        {profile.rpScanWhiteList.length === 0 ? (
          <span className="text-xs text-muted-foreground">None</span>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px]">Source Address Exclusion</TableHead>
                <TableHead className="text-[11px]">Address Type</TableHead>
                <TableHead className="text-[11px]">IP Address(es)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profile.rpScanWhiteList.map((entry) => (
                <TableRow key={entry.name}>
                  <TableCell className="text-xs">{entry.name}</TableCell>
                  <TableCell className="text-xs">{entry.ipv4 ? "IPv4" : entry.ipv6 ? "IPv6" : "—"}</TableCell>
                  <TableCell className="text-xs font-mono">{entry.ipv4 ?? entry.ipv6 ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </FieldGroup>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3: PACKET-BASED ATTACK PROTECTION (5 sub-tabs)
// ═══════════════════════════════════════════════════════════════════════════════

function IpDropSubTab({ profile }: { profile: PanwZoneProtectionProfile }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <ReadOnlyCheckbox checked={profile.pbapIpDropSpoofedIpAddress} label="Spoofed IP address" />
        <ReadOnlyCheckbox checked={profile.pbapIpDropStrictIpAddressCheck} label="Strict IP Address Check" />
        <ReadOnlyCheckbox checked={profile.pbapIpDropFragmentedTraffic} label="Fragmented traffic" />
      </div>

      <FieldGroup title="IP Option Drop">
        <div className="grid grid-cols-2 gap-x-6">
          <div className="space-y-1">
            <ReadOnlyCheckbox checked={profile.pbapIpDropStrictSourceRouting} label="Strict Source Routing" />
            <ReadOnlyCheckbox checked={profile.pbapIpDropLooseSourceRouting} label="Loose Source Routing" />
            <ReadOnlyCheckbox checked={profile.pbapIpDropTimestamp} label="Timestamp" />
            <ReadOnlyCheckbox checked={profile.pbapIpDropRecordRoute} label="Record Route" />
          </div>
          <div className="space-y-1">
            <ReadOnlyCheckbox checked={profile.pbapIpDropSecurity} label="Security" />
            <ReadOnlyCheckbox checked={profile.pbapIpDropStreamId} label="Stream ID" />
            <ReadOnlyCheckbox checked={profile.pbapIpDropUnknown} label="Unknown" />
            <ReadOnlyCheckbox checked={profile.pbapIpDropMalformed} label="Malformed" />
          </div>
        </div>
      </FieldGroup>
    </div>
  )
}

function TcpDropSubTab({ profile }: { profile: PanwZoneProtectionProfile }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <ReadOnlyCheckbox checked={profile.pbapTcpDropMismatchedOverlappingSegment} label="Mismatched overlapping TCP segment" />
        <ReadOnlyCheckbox checked={profile.pbapTcpDropSplitHandshake} label="Split Handshake" />
        <ReadOnlyCheckbox checked={profile.pbapTcpDropSynWithData} label="TCP SYN with Data" />
        <ReadOnlyCheckbox checked={profile.pbapTcpDropSynackWithData} label="TCP SYNACK with Data" />
      </div>

      <LabeledValue label="Reject Non-SYN TCP" value={profile.pbapTcpDropRejectNonSyn} />
      <LabeledValue label="Asymmetric Path" value={profile.pbapTcpDropAsymmetricPath} />

      <FieldGroup title="Strip TCP Options">
        <ReadOnlyCheckbox checked={profile.pbapTcpDropStripTcpTimestamp} label="TCP Timestamp" />
        <ReadOnlyCheckbox checked={profile.pbapTcpDropStripTcpFastOpen} label="TCP Fast Open" />
        <LabeledValue label="Multipath TCP (MPTCP) Options" value={profile.pbapTcpDropStripMptcpOption} />
      </FieldGroup>
    </div>
  )
}

function IcmpDropSubTab({ profile }: { profile: PanwZoneProtectionProfile }) {
  return (
    <div className="space-y-1">
      <ReadOnlyCheckbox checked={profile.pbapIcmpDropPingZeroId} label="ICMP Ping ID 0" />
      <ReadOnlyCheckbox checked={profile.pbapIcmpDropFragment} label="ICMP Fragment" />
      <ReadOnlyCheckbox checked={profile.pbapIcmpDropLargePacket} label="ICMP Large Packet(>1024)" />
      <ReadOnlyCheckbox checked={profile.pbapIcmpDropEmbeddedErrorMessage} label="Discard ICMP embedded with error message" />
      <ReadOnlyCheckbox checked={profile.pbapIcmpDropSuppressTtlExpiredError} label="Suppress ICMP TTL Expired Error" />
      <ReadOnlyCheckbox checked={profile.pbapIcmpDropSuppressFragNeeded} label="Suppress ICMP Frag Needed" />
    </div>
  )
}

function Ipv6DropSubTab({ profile }: { profile: PanwZoneProtectionProfile }) {
  return (
    <div className="grid grid-cols-2 gap-x-6">
      <div className="space-y-1">
        <ReadOnlyCheckbox checked={profile.pbapIpv6DropRoutingHeaderType0} label="Drop packets with type 0 routing header" />
        <ReadOnlyCheckbox checked={profile.pbapIpv6DropRoutingHeaderType1} label="Drop packets with type 1 routing header" />
        <ReadOnlyCheckbox checked={profile.pbapIpv6DropRoutingHeaderType3} label="Drop packets with type 3 routing header" />
        <ReadOnlyCheckbox checked={profile.pbapIpv6DropRoutingHeaderType4To252} label="Drop packets with type 4 to type 252 routing header" />
        <ReadOnlyCheckbox checked={profile.pbapIpv6DropRoutingHeaderType253} label="Drop packets with type 253 routing header" />
        <ReadOnlyCheckbox checked={profile.pbapIpv6DropRoutingHeaderType254} label="Drop packets with type 254 routing header" />
        <ReadOnlyCheckbox checked={profile.pbapIpv6DropRoutingHeaderType255} label="Drop packets with type 255 routing header" />
        <ReadOnlyCheckbox checked={profile.pbapIpv6DropIpv4CompatibleAddress} label="IPv4 compatible address" />
      </div>
      <div className="space-y-1">
        <ReadOnlyCheckbox checked={profile.pbapIpv6DropHopByHopExtension} label="Hop-by-Hop extension" />
        <ReadOnlyCheckbox checked={profile.pbapIpv6DropRoutingExtension} label="Routing extension" />
        <ReadOnlyCheckbox checked={profile.pbapIpv6DropDestinationExtension} label="Destination extension" />
        <ReadOnlyCheckbox checked={profile.pbapIpv6DropInvalidIpv6OptionsInExtHeader} label="Invalid IPv6 options in extension header" />
        <ReadOnlyCheckbox checked={profile.pbapIpv6DropNonZeroReservedField} label="Non-zero reserved field" />
        <ReadOnlyCheckbox checked={profile.pbapIpv6DropAnycastSourceAddress} label="Anycast source address" />
        <ReadOnlyCheckbox checked={profile.pbapIpv6DropNeedlessFragmentHeader} label="Needless fragment header" />
        <ReadOnlyCheckbox checked={profile.pbapIpv6DropIcmpv6PacketTooBigSmallMtu} label="MTU in ICMPv6 'Packet Too Big' less than 1280 bytes" />
      </div>
    </div>
  )
}

function Icmpv6DropSubTab({ profile }: { profile: PanwZoneProtectionProfile }) {
  return (
    <div className="space-y-1">
      <ReadOnlyCheckbox checked={profile.pbapIcmpv6DropDestUnreachable} label="ICMPv6 destination unreachable - require explicit security rule match" />
      <ReadOnlyCheckbox checked={profile.pbapIcmpv6DropPacketTooBig} label="ICMPv6 packet too big - require explicit security rule match" />
      <ReadOnlyCheckbox checked={profile.pbapIcmpv6DropTimeExceeded} label="ICMPv6 time exceeded - require explicit security rule match" />
      <ReadOnlyCheckbox checked={profile.pbapIcmpv6DropParamProblem} label="ICMPv6 parameter problem - require explicit security rule match" />
      <ReadOnlyCheckbox checked={profile.pbapIcmpv6DropRedirect} label="ICMPv6 redirect - require explicit security rule match" />
    </div>
  )
}

function PacketBasedAttackTab({ profile }: { profile: PanwZoneProtectionProfile }) {
  return (
    <Tabs defaultValue="ip-drop" className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 border-b">
        <TabsList variant="line">
          <TabsTrigger value="ip-drop">IP Drop</TabsTrigger>
          <TabsTrigger value="tcp-drop">TCP Drop</TabsTrigger>
          <TabsTrigger value="icmp-drop">ICMP Drop</TabsTrigger>
          <TabsTrigger value="ipv6-drop">IPv6 Drop</TabsTrigger>
          <TabsTrigger value="icmpv6-drop">ICMPv6 Drop</TabsTrigger>
        </TabsList>
      </div>
      <div className="pt-4">
        <TabsContent value="ip-drop"><IpDropSubTab profile={profile} /></TabsContent>
        <TabsContent value="tcp-drop"><TcpDropSubTab profile={profile} /></TabsContent>
        <TabsContent value="icmp-drop"><IcmpDropSubTab profile={profile} /></TabsContent>
        <TabsContent value="ipv6-drop"><Ipv6DropSubTab profile={profile} /></TabsContent>
        <TabsContent value="icmpv6-drop"><Icmpv6DropSubTab profile={profile} /></TabsContent>
      </div>
    </Tabs>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4: PROTOCOL PROTECTION
// ═══════════════════════════════════════════════════════════════════════════════

function ProtocolProtectionTab({ profile }: { profile: PanwZoneProtectionProfile }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground">Rule Type</span>
        <label className="flex items-center gap-1.5 text-xs">
          <input type="radio" checked={profile.ppListType === "exclude"} readOnly className="accent-primary" />
          Exclude List
        </label>
        <label className="flex items-center gap-1.5 text-xs">
          <input type="radio" checked={profile.ppListType === "include"} readOnly className="accent-primary" />
          Include List
        </label>
      </div>

      {profile.ppNonIpProtocols.length === 0 ? (
        <span className="text-xs text-muted-foreground">No protocols configured</span>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px]">Protocol Name</TableHead>
              <TableHead className="text-[11px]">Enable</TableHead>
              <TableHead className="text-[11px]">Ethertype (hex)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profile.ppNonIpProtocols.map((p) => (
              <TableRow key={p.name}>
                <TableCell className="text-xs">{p.name}</TableCell>
                <TableCell><Checkbox checked={p.enabled} disabled /></TableCell>
                <TableCell className="text-xs font-mono">{p.etherType}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 5: ETHERNET SGT PROTECTION
// ═══════════════════════════════════════════════════════════════════════════════

function SgtProtectionTab({ profile }: { profile: PanwZoneProtectionProfile }) {
  if (profile.sgtTags.length === 0) {
    return <span className="text-xs text-muted-foreground">No SGT tags configured</span>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-[11px]">Layer 2 SGT Exclude List</TableHead>
          <TableHead className="text-[11px]">Tag</TableHead>
          <TableHead className="text-[11px]">Enable</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {profile.sgtTags.map((tag) => (
          <TableRow key={tag.name}>
            <TableCell className="text-xs">{tag.name}</TableCell>
            <TableCell className="text-xs tabular-nums">{tag.tag ?? "—"}</TableCell>
            <TableCell><Checkbox checked={tag.enabled} disabled /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 6: L3 & L4 HEADER INSPECTION
// ═══════════════════════════════════════════════════════════════════════════════

function L3L4InspectionTab({ profile }: { profile: PanwZoneProtectionProfile }) {
  return (
    <FieldGroup title="Custom Rules">
      <LabeledValue label="Rules configured" value={profile.netInspectionRuleCount} />
      {profile.netInspectionRuleCount === 0 && (
        <span className="text-xs text-muted-foreground">No custom inspection rules configured</span>
      )}
    </FieldGroup>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DIALOG
// ═══════════════════════════════════════════════════════════════════════════════

export function ZoneProtectionDialog({
  profile,
  open,
  onOpenChange,
}: {
  profile: PanwZoneProtectionProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!profile) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[85vw] h-[min(85vh,700px)] flex flex-col gap-0 p-0 overflow-hidden"
      >
        <DialogHeader className="shrink-0 border-b px-5 pt-4 pb-3">
          <DialogTitle>Zone Protection Profile</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Name + Description */}
          <div className="shrink-0 space-y-2 px-5 pt-4 pb-2">
            <HeaderField label="Name" value={profile.name} />
            <HeaderField label="Description" value={profile.description ?? ""} />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="flood" className="flex-1 flex flex-col min-h-0">
            <div className="shrink-0 border-b px-5">
              <TabsList variant="line">
                <TabsTrigger value="flood">Flood Protection</TabsTrigger>
                <TabsTrigger value="recon">Reconnaissance Protection</TabsTrigger>
                <TabsTrigger value="packet">Packet Based Attack Protection</TabsTrigger>
                <TabsTrigger value="protocol">Protocol Protection</TabsTrigger>
                <TabsTrigger value="sgt">Ethernet SGT Protection</TabsTrigger>
                <TabsTrigger value="l3l4">L3 & L4 Header Inspection</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <TabsContent value="flood">
                <FloodProtectionTab profile={profile} />
              </TabsContent>
              <TabsContent value="recon">
                <ReconProtectionTab profile={profile} />
              </TabsContent>
              <TabsContent value="packet">
                <PacketBasedAttackTab profile={profile} />
              </TabsContent>
              <TabsContent value="protocol">
                <ProtocolProtectionTab profile={profile} />
              </TabsContent>
              <TabsContent value="sgt">
                <SgtProtectionTab profile={profile} />
              </TabsContent>
              <TabsContent value="l3l4">
                <L3L4InspectionTab profile={profile} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="shrink-0 border-t bg-muted/50 rounded-b-xl px-5 py-3 flex justify-end">
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
