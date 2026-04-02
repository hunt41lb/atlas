// @/app/(main)/network/_components/network-profiles/zone-protection/zone-protection-dialog.tsx

"use client"

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import {
  FieldGroup,
  HeaderField,
  LabeledValue,
  ProfileDialog,
} from "../../router-shared/router-dialog/field-display"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import type { PanwZoneProtectionProfile } from "@/lib/panw-parser/network-profiles"

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1: FLOOD PROTECTION
// ═══════════════════════════════════════════════════════════════════════════════

function FloodProtectionTab({ profile }: { profile: PanwZoneProtectionProfile }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {/* Row 1: SYN, ICMP, Other IP */}
        <FieldGroup title="SYN">
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={profile.fpSynEnabled} disabled />
            <span className="text-xs">Enable</span>
          </Label>
          <LabeledValue label="Action" value={profile.fpSynAction === "syn-cookies" ? "SYN Cookies" : "Random Early Drop"} />
          <LabeledValue label="Alarm Rate (conn/sec)" value={profile.fpSynAlarmRate} />
          <LabeledValue label="Activate (conn/sec)" value={profile.fpSynActivateRate} />
          <LabeledValue label="Maximum (conn/sec)" value={profile.fpSynMaxRate} />
        </FieldGroup>

        <FieldGroup title="ICMP">
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={profile.fpIcmpEnabled} disabled />
            <span className="text-xs">Enable</span>
          </Label>
          <LabeledValue label="Alarm Rate (conn/sec)" value={profile.fpIcmpAlarmRate} />
          <LabeledValue label="Activate (conn/sec)" value={profile.fpIcmpActivateRate} />
          <LabeledValue label="Maximum (conn/sec)" value={profile.fpIcmpMaxRate} />
        </FieldGroup>

        <FieldGroup title="Other IP">
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={profile.fpOtherIpEnabled} disabled />
            <span className="text-xs">Enable</span>
          </Label>
          <LabeledValue label="Alarm Rate (conn/sec)" value={profile.fpOtherIpAlarmRate} />
          <LabeledValue label="Activate (conn/sec)" value={profile.fpOtherIpActivateRate} />
          <LabeledValue label="Maximum (conn/sec)" value={profile.fpOtherIpMaxRate} />
        </FieldGroup>

        {/* Row 2: UDP, ICMPv6 */}
        <FieldGroup title="UDP">
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={profile.fpUdpEnabled} disabled />
            <span className="text-xs">Enable</span>
          </Label>
          <LabeledValue label="Alarm Rate (conn/sec)" value={profile.fpUdpAlarmRate} />
          <LabeledValue label="Activate (conn/sec)" value={profile.fpUdpActivateRate} />
          <LabeledValue label="Maximum (conn/sec)" value={profile.fpUdpMaxRate} />
        </FieldGroup>

        <FieldGroup title="ICMPv6">
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={profile.fpIcmpv6Enabled} disabled />
            <span className="text-xs">Enable</span>
          </Label>
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
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapIpDropSpoofedIpAddress} disabled />
          <span className="text-xs">Spoofed IP address</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapIpDropStrictIpAddressCheck} disabled />
          <span className="text-xs">Strict IP Address Check</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapIpDropFragmentedTraffic} disabled />
          <span className="text-xs">Fragmented traffic</span>
        </Label>
      </div>

      <FieldGroup title="IP Option Drop">
        <div className="grid grid-cols-2 gap-x-6">
          <div className="space-y-1">
            <Label className="flex items-center gap-2 py-1">
              <Checkbox checked={profile.pbapIpDropStrictSourceRouting} disabled />
              <span className="text-xs">Strict Source Routing</span>
            </Label>
            <Label className="flex items-center gap-2 py-1">
              <Checkbox checked={profile.pbapIpDropLooseSourceRouting} disabled />
              <span className="text-xs">Loose Source Routing</span>
            </Label>
            <Label className="flex items-center gap-2 py-1">
              <Checkbox checked={profile.pbapIpDropTimestamp} disabled />
              <span className="text-xs">Timestamp</span>
            </Label>
            <Label className="flex items-center gap-2 py-1">
              <Checkbox checked={profile.pbapIpDropRecordRoute} disabled />
              <span className="text-xs">Record Route</span>
            </Label>
          </div>
          <div className="space-y-1">
            <Label className="flex items-center gap-2 py-1">
              <Checkbox checked={profile.pbapIpDropSecurity} disabled />
              <span className="text-xs">Security</span>
            </Label>
            <Label className="flex items-center gap-2 py-1">
              <Checkbox checked={profile.pbapIpDropStreamId} disabled />
              <span className="text-xs">Stream ID</span>
            </Label>
            <Label className="flex items-center gap-2 py-1">
              <Checkbox checked={profile.pbapIpDropUnknown} disabled />
              <span className="text-xs">Unknown</span>
            </Label>
            <Label className="flex items-center gap-2 py-1">
              <Checkbox checked={profile.pbapIpDropMalformed} disabled />
              <span className="text-xs">Malformed</span>
            </Label>
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
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapTcpDropMismatchedOverlappingSegment} disabled />
          <span className="text-xs">Mismatched overlapping TCP segment</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapTcpDropSplitHandshake} disabled />
          <span className="text-xs">Split Handshake</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapTcpDropSynWithData} disabled />
          <span className="text-xs">TCP SYN with Data</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapTcpDropSynackWithData} disabled />
          <span className="text-xs">TCP SYNACK with Data</span>
        </Label>
      </div>

      <LabeledValue label="Reject Non-SYN TCP" value={profile.pbapTcpDropRejectNonSyn} />
      <LabeledValue label="Asymmetric Path" value={profile.pbapTcpDropAsymmetricPath} />

      <FieldGroup title="Strip TCP Options">
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapTcpDropStripTcpTimestamp} disabled />
          <span className="text-xs">TCP Timestamp</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapTcpDropStripTcpFastOpen} disabled />
          <span className="text-xs">TCP Fast Open</span>
        </Label>
        <LabeledValue label="Multipath TCP (MPTCP) Options" value={profile.pbapTcpDropStripMptcpOption} />
      </FieldGroup>
    </div>
  )
}

function IcmpDropSubTab({ profile }: { profile: PanwZoneProtectionProfile }) {
  return (
    <div className="space-y-1">
      <Label className="flex items-center gap-2 py-1">
        <Checkbox checked={profile.pbapIcmpDropPingZeroId} disabled />
        <span className="text-xs">ICMP Ping ID 0</span>
      </Label>
      <Label className="flex items-center gap-2 py-1">
        <Checkbox checked={profile.pbapIcmpDropFragment} disabled />
        <span className="text-xs">ICMP Fragment</span>
      </Label>
      <Label className="flex items-center gap-2 py-1">
        <Checkbox checked={profile.pbapIcmpDropLargePacket} disabled />
        <span className="text-xs">ICMP Large Packet(&gt;1024)</span>
      </Label>
      <Label className="flex items-center gap-2 py-1">
        <Checkbox checked={profile.pbapIcmpDropEmbeddedErrorMessage} disabled />
        <span className="text-xs">Discard ICMP embedded with error message</span>
      </Label>
      <Label className="flex items-center gap-2 py-1">
        <Checkbox checked={profile.pbapIcmpDropSuppressTtlExpiredError} disabled />
        <span className="text-xs">Suppress ICMP TTL Expired Error</span>
      </Label>
      <Label className="flex items-center gap-2 py-1">
        <Checkbox checked={profile.pbapIcmpDropSuppressFragNeeded} disabled />
        <span className="text-xs">Suppress ICMP Frag Needed</span>
      </Label>
    </div>
  )
}

function Ipv6DropSubTab({ profile }: { profile: PanwZoneProtectionProfile }) {
  return (
    <div className="grid grid-cols-2 gap-x-6">
      <div className="space-y-1">
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapIpv6DropRoutingHeaderType0} disabled />
          <span className="text-xs">Drop packets with type 0 routing header</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapIpv6DropRoutingHeaderType1} disabled />
          <span className="text-xs">Drop packets with type 1 routing header</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapIpv6DropRoutingHeaderType3} disabled />
          <span className="text-xs">Drop packets with type 3 routing header</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapIpv6DropRoutingHeaderType4To252} disabled />
          <span className="text-xs">Drop packets with type 4 to type 252 routing header</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapIpv6DropRoutingHeaderType253} disabled />
          <span className="text-xs">Drop packets with type 253 routing header</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapIpv6DropRoutingHeaderType254} disabled />
          <span className="text-xs">Drop packets with type 254 routing header</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapIpv6DropRoutingHeaderType255} disabled />
          <span className="text-xs">Drop packets with type 255 routing header</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapIpv6DropIpv4CompatibleAddress} disabled />
          <span className="text-xs">IPv4 compatible address</span>
        </Label>
      </div>
      <div className="space-y-1">
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapIpv6DropHopByHopExtension} disabled />
          <span className="text-xs">Hop-by-Hop extension</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapIpv6DropRoutingExtension} disabled />
          <span className="text-xs">Routing extension</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapIpv6DropDestinationExtension} disabled />
          <span className="text-xs">Destination extension</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapIpv6DropInvalidIpv6OptionsInExtHeader} disabled />
          <span className="text-xs">Invalid IPv6 options in extension header</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapIpv6DropNonZeroReservedField} disabled />
          <span className="text-xs">Non-zero reserved field</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapIpv6DropAnycastSourceAddress} disabled />
          <span className="text-xs">Anycast source address</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapIpv6DropNeedlessFragmentHeader} disabled />
          <span className="text-xs">Needless fragment header</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.pbapIpv6DropIcmpv6PacketTooBigSmallMtu} disabled />
          <span className="text-xs">MTU in ICMPv6 &apos;Packet Too Big&apos; less than 1280 bytes</span>
        </Label>
      </div>
    </div>
  )
}

function Icmpv6DropSubTab({ profile }: { profile: PanwZoneProtectionProfile }) {
  return (
    <div className="space-y-1">
      <Label className="flex items-center gap-2 py-1">
        <Checkbox checked={profile.pbapIcmpv6DropDestUnreachable} disabled />
        <span className="text-xs">ICMPv6 destination unreachable - require explicit security rule match</span>
      </Label>
      <Label className="flex items-center gap-2 py-1">
        <Checkbox checked={profile.pbapIcmpv6DropPacketTooBig} disabled />
        <span className="text-xs">ICMPv6 packet too big - require explicit security rule match</span>
      </Label>
      <Label className="flex items-center gap-2 py-1">
        <Checkbox checked={profile.pbapIcmpv6DropTimeExceeded} disabled />
        <span className="text-xs">ICMPv6 time exceeded - require explicit security rule match</span>
      </Label>
      <Label className="flex items-center gap-2 py-1">
        <Checkbox checked={profile.pbapIcmpv6DropParamProblem} disabled />
        <span className="text-xs">ICMPv6 parameter problem - require explicit security rule match</span>
      </Label>
      <Label className="flex items-center gap-2 py-1">
        <Checkbox checked={profile.pbapIcmpv6DropRedirect} disabled />
        <span className="text-xs">ICMPv6 redirect - require explicit security rule match</span>
      </Label>
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
        <span className="text-xs text-muted-foreground shrink-0 text-right w-36">Mode</span>
        <RadioGroup value={profile.ppListType ?? ""} disabled className="flex flex-row gap-4">
          <Label className="flex items-center gap-1.5 text-xs">
            <RadioGroupItem value="exclude" />
            Exclude List
          </Label>
          <Label className="flex items-center gap-1.5 text-xs">
            <RadioGroupItem value="include" />
            Include List
          </Label>
        </RadioGroup>
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
    <ProfileDialog title="Zone Protection Profile" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-[85vw]" height="h-[min(85vh,700px)]" noPadding>
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
    </ProfileDialog>
  )
}
