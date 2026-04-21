// @/app/(main)/network/_components/routing-profiles/bgp/bgp-redist-dialog.tsx

"use client"

import * as React from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"

import type {
  PanwBgpRedistributionProfile,
  PanwBgpRedistSubConfig,
  PanwBgpRedistEntry,
} from "@/lib/panw-parser/network/routing-profiles"

// ─── Protocol card ───────────────────────────────────────────────────────────

type ProtocolKey = "static" | "connected" | "ospf" | "ospfv3" | "rip"

const PROTOCOL_LABELS: Record<ProtocolKey, string> = {
  static: "Static",
  connected: "Connected",
  ospf: "OSPF",
  ospfv3: "OSPFv3",
  rip: "RIP",
}

function ProtocolCard({
  protocol,
  entry,
}: {
  protocol: ProtocolKey
  entry: PanwBgpRedistEntry | null
}) {
  // Outer section checkbox in PAN-OS reflects "is this protocol configured",
  // which maps to "XML element exists" → entry !== null.
  const configured = entry !== null
  // Inner Enable checkbox is the <enable>yes</enable> value.
  const enabled = entry?.enabled ?? false

  return (
    <Fieldset>
      <FieldsetLegend className="flex items-center gap-2">
        <Checkbox checked={configured} disabled />
        {PROTOCOL_LABELS[protocol]}
      </FieldsetLegend>
      <FieldsetContent className="gap-2">
        <div className="flex items-center gap-2">
          <Checkbox checked={enabled} disabled />
          <Label className="text-sm">Enable</Label>
        </div>
        <div className="grid grid-cols-[6rem_1fr] items-center gap-x-3 gap-y-2">
          <Label className="text-right text-sm">Metric</Label>
          <Input
            readOnly
            value={entry?.metric ?? ""}
            placeholder="—"
            className="h-8 text-sm tabular-nums"
          />
          <Label className="text-right text-sm">Route-Map</Label>
          <Input
            readOnly
            value={entry?.routeMap ?? ""}
            placeholder="—"
            className="h-8 text-sm"
          />
        </div>
      </FieldsetContent>
    </Fieldset>
  )
}

// ─── AFI panel (protocol grid per IPv4 / IPv6 tab) ───────────────────────────
// IPv4: Static, Connected, OSPF, RIP   (2×2 grid)
// IPv6: Static, Connected, OSPFv3       (2×2 grid, bottom-right empty)

function AfiPanel({
  afi,
  sub,
}: {
  afi: "ipv4" | "ipv6"
  sub: PanwBgpRedistSubConfig | null
}) {
  // Arrange matching the PAN-OS layout: Static top-left, OSPF/OSPFv3 top-right,
  // Connected bottom-left, RIP (IPv4 only) bottom-right.
  const cards: Array<{ protocol: ProtocolKey; entry: PanwBgpRedistEntry | null }> =
    afi === "ipv4"
      ? [
          { protocol: "static",    entry: sub?.static    ?? null },
          { protocol: "ospf",      entry: sub?.ospf      ?? null },
          { protocol: "connected", entry: sub?.connected ?? null },
          { protocol: "rip",       entry: sub?.rip       ?? null },
        ]
      : [
          { protocol: "static",    entry: sub?.static    ?? null },
          { protocol: "ospfv3",    entry: sub?.ospfv3    ?? null },
          { protocol: "connected", entry: sub?.connected ?? null },
        ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((c) => (
        <ProtocolCard key={c.protocol} protocol={c.protocol} entry={c.entry} />
      ))}
    </div>
  )
}

// ─── Dialog ──────────────────────────────────────────────────────────────────

export function RedistProfileDialog({
  profile,
  open,
  onOpenChange,
}: {
  profile: PanwBgpRedistributionProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [afi, setAfi] = React.useState<"ipv4" | "ipv6">("ipv4")

  // Reset AFI when a new profile is opened
  React.useEffect(() => {
    if (profile) setAfi("ipv4")
  }, [profile])

  if (!profile) return null

  const sub = afi === "ipv4" ? profile.ipv4Unicast : profile.ipv6Unicast

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>BGP Redistribution Profile</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3">
            <Label className="text-right text-sm">Name</Label>
            <Input readOnly value={profile.name} className="h-8 text-sm" />
            <Label className="text-right text-sm">AFI</Label>
            <RadioGroup
              value={afi}
              onValueChange={(v) => setAfi(v as "ipv4" | "ipv6")}
              className="flex items-center gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="ipv4" id="afi-ipv4" />
                <Label htmlFor="afi-ipv4" className="text-sm cursor-pointer">IPv4</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="ipv6" id="afi-ipv6" />
                <Label htmlFor="afi-ipv6" className="text-sm cursor-pointer">IPv6</Label>
              </div>
            </RadioGroup>
          </div>

          <AfiPanel afi={afi} sub={sub} />
        </div>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
