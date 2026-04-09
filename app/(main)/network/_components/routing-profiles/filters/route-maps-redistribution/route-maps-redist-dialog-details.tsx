// @/app/(main)/network/_components/routing-profiles/filters/route-maps-redistribution/route-maps-redist-dialog-details.tsx

"use client"

import * as React from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import type {
  PanwRedistRouteMapEntry,
  PanwRedistRouteMapMatch,
  PanwRedistRouteMapSet,
  PanwRouteMapFilterRef,
} from "@/lib/panw-parser/network/routing-profiles"

// ─── Shared helpers ───────────────────────────────────────────────────────────

function FilterRefFields({ filterRef }: { filterRef: PanwRouteMapFilterRef | null }) {
  return (
    <>
      <DisplayField label="Access List" value={filterRef?.accessList ?? "None"} />
      <DisplayField label="Prefix List" value={filterRef?.prefixList ?? "None"} />
    </>
  )
}

// ─── Entry Tab ────────────────────────────────────────────────────────────────

function EntryTab({ entry }: { entry: PanwRedistRouteMapEntry }) {
  return (
    <div className="p-5 space-y-2">
      <DisplayField label="Seq" value={entry.sequence} />
      <DisplayField label="Description" value={entry.description ?? "None"} className={!entry.description ? "opacity-50" : ""} />

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground shrink-0">Action</span>
        <RadioGroup value={entry.action} disabled className="flex gap-4">
          <Label className="flex items-center gap-1.5 text-xs">
            <RadioGroupItem value="deny" />
            Deny
          </Label>
          <Label className="flex items-center gap-1.5 text-xs">
            <RadioGroupItem value="permit" />
            Permit
          </Label>
        </RadioGroup>
      </div>
    </div>
  )
}

// ─── Match Tab ────────────────────────────────────────────────────────────────

function RedistMatchTab({
  match,
  sourceProtocol,
}: {
  match: PanwRedistRouteMapMatch
  sourceProtocol: string
}) {
  const isBgpSource = sourceProtocol === "bgp"
  const [ipVersion, setIpVersion] = React.useState<"ipv4" | "ipv6">("ipv4")
  const [addressTab, setAddressTab] = React.useState("address")

  const getFilterRef = (tab: string) => {
    if (ipVersion === "ipv6") {
      return tab === "address" ? match.ipv6Address : match.ipv6NextHop
    }
    const hasIpv4Wrapped = match.ipv4Address !== null || match.ipv4NextHop !== null
    if (hasIpv4Wrapped) {
      return tab === "address" ? match.ipv4Address
        : tab === "next-hop" ? match.ipv4NextHop
        : (match.ipv4RouteSource ?? null)
    }
    return tab === "address" ? match.address : match.nextHop
  }

  const filterRef = getFilterRef(addressTab)

  return (
    <div className="p-5 space-y-4">
      {isBgpSource ? (
        <>
          <Fieldset>
            <FieldsetLegend>Match Criteria</FieldsetLegend>
            <FieldsetContent>
              <div className="grid grid-cols-2 gap-x-6">
                <div className="space-y-1.5">
                  <DisplayField label="AS Path Access List" value={match.asPathAccessList ?? "None"} />
                  <DisplayField label="Regular Community" value={match.regularCommunity ?? "None"} />
                  <DisplayField label="Large Community" value={match.largeCommunity ?? "None"} />
                  <DisplayField label="Extended Community" value={match.extendedCommunity ?? "None"} />
                  <DisplayField label="Metric" value={String(match.metric ?? "None")} />
                </div>
                <div className="space-y-1.5">
                  <DisplayField label="Interface" value={match.interface ?? "None"} />
                  <DisplayField label="Origin" value={match.origin ?? "None"} />
                  <DisplayField label="Tag" value={String(match.tag ?? "None")} />
                  <DisplayField label="Local Preference" value={String(match.localPreference ?? "None")} />
                  <DisplayField label="Peer" value={match.peer ?? "None"} />
                </div>
              </div>
            </FieldsetContent>
          </Fieldset>

          <Fieldset>
            <FieldsetLegend>Address Filters</FieldsetLegend>
            <FieldsetContent>
              <Tabs value={ipVersion} onValueChange={(v) => { setIpVersion(v as "ipv4" | "ipv6"); setAddressTab("address") }}>
                <TabsList variant="line">
                  <TabsTrigger value="ipv4">IPv4</TabsTrigger>
                  <TabsTrigger value="ipv6">IPv6</TabsTrigger>
                </TabsList>
              </Tabs>

              <Tabs value={addressTab} onValueChange={setAddressTab} className="flex flex-col pt-2">
                <TabsList variant="line">
                  <TabsTrigger value="address">Address</TabsTrigger>
                  <TabsTrigger value="next-hop">Next Hop</TabsTrigger>
                  {ipVersion === "ipv4" && (
                    <TabsTrigger value="route-source">Route Source</TabsTrigger>
                  )}
                </TabsList>
                <TabsContent value={addressTab} className="pt-3">
                  <FilterRefFields filterRef={filterRef} />
                </TabsContent>
              </Tabs>
            </FieldsetContent>
          </Fieldset>
        </>
      ) : (
        <>
          <Fieldset>
            <FieldsetLegend>Match Criteria</FieldsetLegend>
            <FieldsetContent>
              <DisplayField label="Metric" value={String(match.metric ?? "None")} />
              <DisplayField label="Interface" value={match.interface ?? "None"} />
              <DisplayField label="Tag" value={String(match.tag ?? "None")} />
            </FieldsetContent>
          </Fieldset>

          <Fieldset>
            <FieldsetLegend>Address Filters</FieldsetLegend>
            <FieldsetContent>
              <Tabs value={ipVersion} onValueChange={(v) => { setIpVersion(v as "ipv4" | "ipv6"); setAddressTab("address") }}>
                <TabsList variant="line">
                  <TabsTrigger value="ipv4">IPv4</TabsTrigger>
                  <TabsTrigger value="ipv6">IPv6</TabsTrigger>
                </TabsList>
              </Tabs>

              <Tabs value={addressTab} onValueChange={setAddressTab} className="flex flex-col pt-2">
                <TabsList variant="line">
                  <TabsTrigger value="address">Address</TabsTrigger>
                  <TabsTrigger value="next-hop">Next Hop</TabsTrigger>
                </TabsList>
                <TabsContent value={addressTab} className="pt-3">
                  <FilterRefFields filterRef={filterRef} />
                </TabsContent>
              </Tabs>
            </FieldsetContent>
          </Fieldset>
        </>
      )}
    </div>
  )
}

// ─── Set Tab ──────────────────────────────────────────────────────────────────

function RedistSetTab({
  set,
  destProtocol,
}: {
  set: PanwRedistRouteMapSet
  destProtocol: string
}) {
  const isBgpDest = destProtocol === "bgp"
  const isOspfDest = destProtocol === "ospf" || destProtocol === "ospfv3"
  const isRibDest = destProtocol === "rib"

  if (isBgpDest) {
    return (
      <div className="p-5 space-y-4">
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={set.atomicAggregate} disabled />
          <span className="text-xs">Enable BGP atomic aggregate</span>
        </Label>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <Fieldset>
              <FieldsetLegend>Aggregator</FieldsetLegend>
              <FieldsetContent>
                <DisplayField label="Aggregator AS" value={String(set.aggregator?.as ?? "None")} />
                <DisplayField label="Router ID" value={set.aggregator?.routerId ?? "None"} />
              </FieldsetContent>
            </Fieldset>

            <Fieldset>
              <FieldsetLegend>IP</FieldsetLegend>
              <FieldsetContent>
                <Tabs defaultValue="ipv4" className="flex flex-col">
                  <TabsList variant="line">
                    <TabsTrigger value="ipv4">IPv4</TabsTrigger>
                    <TabsTrigger value="ipv6">IPv6</TabsTrigger>
                  </TabsList>
                  <TabsContent value="ipv4" className="pt-3 space-y-1.5">
                    <DisplayField label="Source Address" value={set.ipv4SourceAddress ?? "None"} />
                    <DisplayField label="IPv4 Next-Hop" value={set.ipv4NextHop ?? "None"} />
                  </TabsContent>
                  <TabsContent value="ipv6" className="pt-3 space-y-1.5">
                    <DisplayField label="Source Address" value={set.ipv6SourceAddress ?? "None"} />
                    <DisplayField label="IPv6 Next-Hop" value={set.ipv6NextHop ?? "None"} />
                  </TabsContent>
                </Tabs>
              </FieldsetContent>
            </Fieldset>
          </div>

          <Fieldset>
            <FieldsetLegend>Attributes</FieldsetLegend>
            <FieldsetContent>
              <DisplayField label="Local Preference" value={String(set.localPreference ?? "None")} />
              <DisplayField label="Tag" value={String(set.tag ?? "None")} />
              <DisplayField label="Metric Action" value={set.metric?.action ?? "None"} />
              <DisplayField label="Metric Value" value={String(set.metric?.value ?? "None")} />
              <DisplayField label="Weight" value={String(set.weight ?? "None")} />
              <DisplayField label="Origin" value={set.origin ?? "None"} />
              <DisplayField label="Originator ID" value={set.originatorId ?? "None"} />
            </FieldsetContent>
          </Fieldset>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px]">ASPATH PREPEND</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {set.aspathPrepend.length === 0 ? (
                  <TableRow><TableCell className="text-xs text-muted-foreground">None</TableCell></TableRow>
                ) : set.aspathPrepend.map((item, i) => (
                  <TableRow key={i}><TableCell className="text-xs font-mono">{item}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px]">REGULAR COMMUNITY</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {set.regularCommunity.length === 0 ? (
                  <TableRow><TableCell className="text-xs text-muted-foreground">None</TableCell></TableRow>
                ) : set.regularCommunity.map((item, i) => (
                  <TableRow key={i}><TableCell className="text-xs font-mono">{item}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px]">LARGE COMMUNITY</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {set.largeCommunity.length === 0 ? (
                  <TableRow><TableCell className="text-xs text-muted-foreground">None</TableCell></TableRow>
                ) : set.largeCommunity.map((item, i) => (
                  <TableRow key={i}><TableCell className="text-xs font-mono">{item}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    )
  }

  // Non-BGP destination — OSPF, OSPFv3, RIP, or RIB
  return (
    <div className="p-5 space-y-4">
      <Fieldset>
        <FieldsetLegend>Metric</FieldsetLegend>
        <FieldsetContent>
          <DisplayField label="Metric Action" value={set.metric?.action ?? "None"} />
          <DisplayField label="Metric Value" value={String(set.metric?.value ?? "None")} />
        </FieldsetContent>
      </Fieldset>

      <Fieldset>
        <FieldsetLegend>Options</FieldsetLegend>
        <FieldsetContent>
          {isOspfDest && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground shrink-0">Metric Type</span>
              <RadioGroup value={set.metricType ?? ""} disabled className="flex gap-4">
                <Label className="flex items-center gap-1.5 text-xs">
                  <RadioGroupItem value="type-1" />
                  Type 1
                </Label>
                <Label className="flex items-center gap-1.5 text-xs">
                  <RadioGroupItem value="type-2" />
                  Type 2
                </Label>
              </RadioGroup>
            </div>
          )}
          <DisplayField label="Next Hop" value={set.nextHop ?? "None"} />
          <DisplayField label="Tag" value={String(set.tag ?? "None")} />
          {isRibDest && (
            <DisplayField label="Source Address" value={set.sourceAddress ?? "None"} />
          )}
        </FieldsetContent>
      </Fieldset>
    </div>
  )
}

// ─── Protocol Labels ──────────────────────────────────────────────────────────

const SOURCE_LABELS: Record<string, string> = {
  "connected-static": "Static/Connected",
  rip: "RIP",
  bgp: "BGP",
  ospf: "OSPF",
  ospfv3: "OSPFv3",
}

const DEST_LABELS: Record<string, string> = {
  ospf: "OSPF",
  bgp: "BGP",
  ospfv3: "OSPFv3",
  rip: "RIP",
  rib: "RIB",
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

export function RedistRouteMapDetailsDialog({
  entry,
  sourceProtocol,
  destProtocol,
  open,
  onOpenChange,
}: {
  entry: PanwRedistRouteMapEntry | null
  sourceProtocol: string
  destProtocol: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!entry) return null

  const srcLabel = SOURCE_LABELS[sourceProtocol] ?? sourceProtocol
  const destLabel = DEST_LABELS[destProtocol] ?? destProtocol

  return (
    <DetailDialog title={`Redistribution - ${srcLabel} - ${destLabel}`} open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-[75vw]" height="h-[min(94vh,875px)]" noPadding>
      <Tabs defaultValue="entry" className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 border-b px-5">
          <TabsList variant="line">
            <TabsTrigger value="entry">Entry</TabsTrigger>
            <TabsTrigger value="match">Match</TabsTrigger>
            <TabsTrigger value="set">Set</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="entry"><EntryTab entry={entry} /></TabsContent>
          <TabsContent value="match"><RedistMatchTab match={entry.match} sourceProtocol={sourceProtocol} /></TabsContent>
          <TabsContent value="set"><RedistSetTab set={entry.set} destProtocol={destProtocol} /></TabsContent>
        </div>
      </Tabs>
    </DetailDialog>
  )
}

