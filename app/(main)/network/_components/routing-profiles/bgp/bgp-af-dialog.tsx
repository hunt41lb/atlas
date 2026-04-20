// @/app/(main)/network/_components/routing-profiles/bgp/bgp-af-dialog.tsx

"use client"

import * as React from "react"
import {
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

import type {
  PanwBgpAddressFamilyProfile,
  PanwBgpAddressFamilySubConfig,
} from "@/lib/panw-parser/network/routing-profiles"

// ─── PAN-OS Defaults ──────────────────────────────────────────────────────────

const AF_SUB_DEFAULTS: PanwBgpAddressFamilySubConfig = {
  enabled: false,
  softReconfiguration: true,
  asOverride: false,
  defaultOriginate: false,
  defaultOriginateMap: null,
  routeReflectorClient: false,
  addPathTxAllPaths: false,
  addPathTxBestpathPerAs: false,
  orfPrefixList: null,
  maximumPrefixAction: "warning-only",
  maximumPrefixNumPrefixes: 1000,
  maximumPrefixThreshold: 100,
  nextHop: null,
  removePrivateAs: null,
  sendCommunity: null,
  allowasIn: null,
}

// ─── Capitalize helper ────────────────────────────────────────────────────────

function cap(s: string | null): string {
  if (!s) return "None"
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ─── Sub-Config Panel ─────────────────────────────────────────────────────────

function AfSubConfigPanel({
  sub,
  showDefaults,
}: {
  sub: PanwBgpAddressFamilySubConfig | null
  showDefaults: boolean
}) {
  if (!sub && !showDefaults) {
    return <p className="py-4 text-xs text-muted-foreground text-center">Not configured.</p>
  }

  const d = showDefaults ? AF_SUB_DEFAULTS : (sub ?? AF_SUB_DEFAULTS)

  return (
    <div className="pt-3 pl-3 border-l-[3px] border-primary ml-1">
      {/* Checkboxes */}
      <div className="ml-37 space-y-0.5">
        <Label className="flex items-center gap-2 py-0.75">
          <Checkbox checked={d.enabled} disabled />
          <span className="text-[13px]">Enable</span>
        </Label>
        <Label className="flex items-center gap-2 py-0.75">
          <Checkbox checked={d.softReconfiguration} disabled />
          <span className="text-[13px]">Soft reconfiguration of peer with stored routes</span>
        </Label>
        <Label className="flex items-center gap-2 py-0.75">
          <Checkbox checked={d.addPathTxAllPaths} disabled />
          <span className="text-[13px]">Advertise all paths to peer</span>
        </Label>
        <Label className="flex items-center gap-2 py-0.75">
          <Checkbox checked={d.addPathTxBestpathPerAs} disabled />
          <span className="text-[13px]">Advertise the bestpath per each neighboring AS</span>
        </Label>
        <Label className="flex items-center gap-2 py-0.75">
          <Checkbox checked={d.asOverride} disabled />
          <span className="text-[13px]">Override ASNs in outbound updates if AS-Path equals Remote-AS</span>
        </Label>
        <Label className="flex items-center gap-2 py-0.75">
          <Checkbox checked={d.routeReflectorClient} disabled />
          <span className="text-[13px]">Route Reflector Client</span>
        </Label>
        <Label className="flex items-center gap-2 py-0.75">
          <Checkbox checked={d.defaultOriginate} disabled />
          <span className="text-[13px]">Originate Default Route</span>
        </Label>
      </div>

      {/* Form fields */}
      <div className="mt-3 space-y-0.5">
        <div className="flex items-center gap-2 py-1.25">
          <span className="w-35 shrink-0 text-right text-[13px] text-muted-foreground">Default Originate Route-Map</span>
          <Input readOnly value={d.defaultOriginateMap ?? "None"} className="h-7 flex-1 text-[13px]" />
        </div>
        <div className="flex items-center gap-2 py-1.25">
          <span className="w-35 shrink-0 text-right text-[13px] text-muted-foreground">Allow AS In</span>
          <Input readOnly value={cap(d.allowasIn)} className="h-7 flex-1 text-[13px]" />
        </div>
        <div className="flex items-center gap-2 py-1.25">
          <span className="w-35 shrink-0 text-right text-[13px] text-muted-foreground">Number Prefixes</span>
          <Input readOnly value={d.maximumPrefixNumPrefixes ?? 1000} className="h-7 flex-1 text-[13px] tabular-nums" />
        </div>
        <div className="flex items-center gap-2 py-1.25">
          <span className="w-35 shrink-0 text-right text-[13px] text-muted-foreground">Threshold</span>
          <Input readOnly value={d.maximumPrefixThreshold ?? 100} className="h-7 flex-1 text-[13px] tabular-nums" />
        </div>
        <div className="flex items-center gap-2 py-1.25">
          <span className="w-35 shrink-0 text-right text-[13px] text-muted-foreground">Action</span>
          <RadioGroup value={d.maximumPrefixAction ?? "warning-only"} disabled className="flex gap-5">
            <label className="flex items-center gap-2">
              <RadioGroupItem value="warning-only" />
              <span className="text-[13px]">Warning Only</span>
            </label>
            <label className="flex items-center gap-2">
              <RadioGroupItem value="restart" />
              <span className="text-[13px]">Restart</span>
            </label>
          </RadioGroup>
        </div>
        <div className="flex items-center gap-2 py-1.25">
          <span className="w-35 shrink-0 text-right text-[13px] text-muted-foreground">Next Hop</span>
          <Input readOnly value={cap(d.nextHop)} className="h-7 flex-1 text-[13px]" />
        </div>
        <div className="flex items-center gap-2 py-1.25">
          <span className="w-35 shrink-0 text-right text-[13px] text-muted-foreground">Remove Private AS</span>
          <Input readOnly value={cap(d.removePrivateAs)} className="h-7 flex-1 text-[13px]" />
        </div>
        <div className="flex items-center gap-2 py-1.25">
          <span className="w-35 shrink-0 text-right text-[13px] text-muted-foreground">Send Community</span>
          <Input readOnly value={cap(d.sendCommunity)} className="h-7 flex-1 text-[13px]" />
        </div>
        <div className="flex items-center gap-2 py-1.25">
          <span className="w-35 shrink-0 text-right text-[13px] text-muted-foreground">ORF List</span>
          <Input readOnly value={d.orfPrefixList ?? "none"} className="h-7 flex-1 text-[13px]" />
        </div>
      </div>
    </div>
  )
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

export function AfProfileDialog({
  profile,
  open,
  onOpenChange,
}: {
  profile: PanwBgpAddressFamilyProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [afi, setAfi] = React.useState<"ipv4" | "ipv6">("ipv4")
  const [activeTab, setActiveTab] = React.useState<"unicast" | "multicast">("unicast")
  const [showDefaults, setShowDefaults] = React.useState(false)

  React.useEffect(() => {
    if (profile) {
      if (profile.ipv4Unicast || profile.ipv4Multicast) setAfi("ipv4")
      else if (profile.ipv6Unicast || profile.ipv6Multicast) setAfi("ipv6")
      else setAfi("ipv4")
      setActiveTab("unicast")
      setShowDefaults(false)
    }
  }, [profile])

  if (!profile) return null

  const unicast = afi === "ipv4" ? profile.ipv4Unicast : profile.ipv6Unicast
  const multicast = afi === "ipv4" ? profile.ipv4Multicast : profile.ipv6Multicast
  const hasMulticast = multicast !== null
  const activeSub = activeTab === "unicast" ? unicast : multicast

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-170 max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="shrink-0 border-b px-5 pt-4 pb-3">
          <DialogTitle>BGP AFI Profile</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Name */}
          <div className="flex items-center gap-2 py-1.25">
            <span className="w-35 shrink-0 text-right text-[13px] text-muted-foreground">Name</span>
            <Input readOnly value={profile.name} className="h-7 flex-1 text-[13px]" />
          </div>

          {/* AFI Radio */}
          <div className="flex items-center gap-2 py-1.25">
            <span className="w-35 shrink-0 text-right text-[13px] text-muted-foreground">AFI</span>
            <RadioGroup value={afi} onValueChange={(v) => { setAfi(v as "ipv4" | "ipv6"); setActiveTab("unicast") }} className="flex gap-5">
              <label className="flex items-center gap-2">
                <RadioGroupItem value="ipv4" />
                <span className="text-[13px]">IPv4</span>
              </label>
              <label className="flex items-center gap-2">
                <RadioGroupItem value="ipv6" />
                <span className="text-[13px]">IPv6</span>
              </label>
            </RadioGroup>
          </div>

          {/* Tabs — PAN-OS style */}
          <div className="mt-4 mb-1 border-b">
            <div className="flex">
              <button
                type="button"
                onClick={() => setActiveTab("unicast")}
                className={`px-5 py-1.75 text-[13px] font-medium border border-b-0 rounded-t relative -mb-px transition-colors ${
                  activeTab === "unicast"
                    ? "bg-primary text-primary-foreground border-primary z-10"
                    : "bg-muted/50 text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                unicast
              </button>
              {hasMulticast && (
                <button
                  type="button"
                  onClick={() => setActiveTab("multicast")}
                  className={`px-5 py-1.75 text-[13px] font-medium border border-b-0 rounded-t relative -mb-px transition-colors ${
                    activeTab === "multicast"
                      ? "bg-primary text-primary-foreground border-primary z-10"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:text-foreground"
                  }`}
                >
                  multicast
                </button>
              )}
            </div>
          </div>

          {/* Tab content */}
          <AfSubConfigPanel sub={activeSub} showDefaults={showDefaults} />
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t bg-muted/50 rounded-b-xl px-4 py-3 flex items-center justify-between">
          <DialogClose render={<Button variant="outline" size="sm">Close</Button>} />
          <ButtonGroup>
            <Button size="sm" variant={!showDefaults ? "default" : "outline"} onClick={() => setShowDefaults(false)}>
              Configuration
            </Button>
            <Button size="sm" variant={showDefaults ? "default" : "outline"} onClick={() => setShowDefaults(true)}>
              Defaults
            </Button>
          </ButtonGroup>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Summary (for table cell) ─────────────────────────────────────────────────

export function AfSummary({ sub }: { sub: PanwBgpAddressFamilyProfile["ipv4Unicast"] }) {
  if (!sub) return <span className="text-muted-foreground text-xs">—</span>

  if (!sub.enabled) return <Badge variant="outline" size="sm">Disabled</Badge>

  const flags: string[] = []
  if (sub.asOverride) flags.push("AS Override")
  if (sub.defaultOriginate) flags.push("Default Originate")
  if (sub.routeReflectorClient) flags.push("RR Client")
  if (sub.nextHop) flags.push(`NH: ${sub.nextHop}`)
  if (sub.removePrivateAs) flags.push("Remove Private AS")
  if (sub.sendCommunity) flags.push(`Community: ${sub.sendCommunity}`)

  return (
    <div className="flex flex-wrap gap-1">
      <Badge variant="green" size="sm">Enabled</Badge>
      {flags.map((f) => (
        <Badge key={f} variant="outline" size="sm">{f}</Badge>
      ))}
    </div>
  )
}

// ─── Flattened row for the table ──────────────────────────────────────────────

export interface BgpAfTableRow {
  name: string
  afi: string
  safi: string
  profile: PanwBgpAddressFamilyProfile
  templateName: string | null
}

/** Flatten profiles into one row per AFI/SAFI combination */
export function flattenAfProfiles(profiles: PanwBgpAddressFamilyProfile[]): BgpAfTableRow[] {
  const rows: BgpAfTableRow[] = []
  for (const p of profiles) {
    if (p.ipv4Unicast)   rows.push({ name: p.name, afi: "ipv4", safi: "Unicast",   profile: p, templateName: p.templateName })
    if (p.ipv4Multicast) rows.push({ name: p.name, afi: "ipv4", safi: "Multicast", profile: p, templateName: p.templateName })
    if (p.ipv6Unicast)   rows.push({ name: p.name, afi: "ipv6", safi: "Unicast",   profile: p, templateName: p.templateName })
    if (p.ipv6Multicast) rows.push({ name: p.name, afi: "ipv6", safi: "Multicast", profile: p, templateName: p.templateName })
  }
  return rows
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const afHelper = createColumnHelper<BgpAfTableRow>()

export function buildAfColumns(
  isPanorama: boolean,
  onNameClick: (profile: PanwBgpAddressFamilyProfile) => void
): ColumnDef<BgpAfTableRow, unknown>[] {
  return [
    afHelper.accessor("name", {
      header: "Name",
      cell: (info) => (
        <Button
          variant="link"
          size="sm"
          className="text-foreground font-medium cursor-pointer"
          onClick={() => onNameClick(info.row.original.profile)}
        >
          {info.getValue()}
        </Button>
      ),
    }) as ColumnDef<BgpAfTableRow, unknown>,

    afHelper.accessor("afi", {
      header: "AFI",
      cell: (info) => <span className="text-xs">{info.getValue()}</span>,
    }) as ColumnDef<BgpAfTableRow, unknown>,

    afHelper.accessor("safi", {
      header: "SAFI",
      cell: (info) => <span className="text-xs">{info.getValue()}</span>,
    }) as ColumnDef<BgpAfTableRow, unknown>,

    ...(isPanorama ? [{
      id: "template",
      header: "Template",
      enableSorting: true,
      accessorFn: (row: BgpAfTableRow) => row.templateName ?? "",
      cell: ({ row }: { row: { original: BgpAfTableRow } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<BgpAfTableRow, unknown>] : []),
  ]
}
