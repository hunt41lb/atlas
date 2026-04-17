// @/app/(main)/network/_components/zones/zones-dialog.tsx
//
// Zone detail dialog — mirrors the PAN-OS Zone configuration dialog layout.
// Three-column layout: General | User Identification ACL | Device-ID ACL

"use client"

import { cn } from "@/lib/utils"
import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import type { PanwZone, ZoneType } from "@/lib/panw-parser/network/zones"

// ─── Constants ────────────────────────────────────────────────────────────────

const ZONE_TYPE_OPTIONS: { value: ZoneType; label: string }[] = [
  { value: "tap",          label: "Tap" },
  { value: "virtual-wire", label: "Virtual Wire" },
  { value: "layer2",       label: "Layer2" },
  { value: "layer3",       label: "Layer3" },
  { value: "tunnel",       label: "Tunnel" },
]

const LW = "w-24"
const NONE_VALUE = "__none__"

// ─── Scrollable single-column list table ──────────────────────────────────────
// Sticky header; scrollable body; blank when empty.
// Pass `height` as any Tailwind height class (default h-[160px], use h-full
// inside a flex child with min-h-0 for proportional layouts).

function ScrollListTable({
  header,
  items,
  height = "h-[160px]",
}: {
  header: string
  items: string[]
  height?: string
}) {
  return (
    <div className={cn("rounded-md border overflow-auto", height)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {header}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item}>
              <TableCell className="text-xs font-mono">{item}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// ─── ACL column ───────────────────────────────────────────────────────────────
// Reusable for both User Identification ACL and Device-ID ACL.
// Fills its grid cell vertically: enable checkbox sits at the top at its
// natural height; Include List and Exclude List share the remaining space
// equally via flex-1.

function AclColumn({
  title,
  enableLabel,
  enabled,
  includeList,
  excludeList,
}: {
  title: string
  enableLabel: string
  enabled: boolean
  includeList: string[]
  excludeList: string[]
}) {
  return (
    <Fieldset className="h-full flex flex-col">
      <FieldsetLegend>{title}</FieldsetLegend>
      <FieldsetContent className="space-y-0 flex-1 flex flex-col gap-4 min-h-0">
        <Label className="flex items-center gap-2">
          <Checkbox checked={enabled} disabled />
          <span className="text-xs">{enableLabel}</span>
        </Label>

        <div className="flex-1 min-h-0">
          <ScrollListTable header="Include List" items={includeList} height="h-full" />
        </div>

        <div className="flex-1 min-h-0">
          <ScrollListTable header="Exclude List" items={excludeList} height="h-full" />
        </div>
      </FieldsetContent>
    </Fieldset>
  )
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

export function ZonesDialog({
  zone,
  open,
  onOpenChange,
  zoneProtectionProfileNames,
}: {
  zone: PanwZone | null
  open: boolean
  onOpenChange: (open: boolean) => void
  zoneProtectionProfileNames: string[]
}) {
  if (!zone) return null

  const typeLabel = ZONE_TYPE_OPTIONS.find((o) => o.value === zone.type)?.label ?? zone.type
  const zppLabel  = zone.zoneProtectionProfile ?? "None"

  return (
    <DetailDialog
      title="Zone"
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="sm:max-w-[80vw]"
      height="h-[min(90vh,640px)]"
      noPadding
    >
      <div className="h-full p-5">
        <div className="grid grid-cols-[minmax(260px,1fr)_minmax(240px,1fr)_minmax(240px,1fr)] gap-6 h-full">

          {/* ── Column 1: General ── */}
          {/* flex-col so the Interfaces table can flex-1 between the fixed */}
          {/* top rows and the Zone Protection / Pre-NAT fieldsets below.   */}
          <div className="flex flex-col h-full min-h-0 gap-4">
            {/* Tight cluster: Name / Log Setting / Type */}
            <div className="flex flex-col gap-1.5">
              <DisplayField label="Name" value={zone.name} labelWidth={LW} />
              <DisplayField label="Log Setting" value={zone.logSetting ?? "None"} labelWidth={LW} />

              {/* Type — read-only Select with static options */}
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium text-foreground shrink-0 ${LW}`}>Type</span>
                <Select value={zone.type} onValueChange={() => {}}>
                  <SelectTrigger size="sm" readOnly className="w-full text-xs">
                    <span className="text-xs">{typeLabel}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {ZONE_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Interfaces — fills whatever vertical space is left */}
            <div className="flex-1 min-h-0">
              <ScrollListTable header="Interfaces" items={zone.interfaces} height="h-full" />
            </div>

            {/* Zone Protection */}
            <Fieldset>
              <FieldsetLegend>Zone Protection</FieldsetLegend>
              <FieldsetContent>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground shrink-0">Zone Protection Profile</span>
                  <Select
                    value={zone.zoneProtectionProfile ?? NONE_VALUE}
                    onValueChange={() => {}}
                  >
                    <SelectTrigger size="sm" readOnly className="w-full text-xs">
                      <span className="text-xs">{zppLabel}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>None</SelectItem>
                      {zoneProtectionProfileNames.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Label className="flex items-center gap-2 pl-1">
                  <Checkbox checked={zone.packetBufferProtection} disabled />
                  <span className="text-xs">Enable Packet Buffer Protection</span>
                </Label>
                <Label className="flex items-center gap-2 pl-1">
                  <Checkbox checked={zone.netInspection} disabled />
                  <span className="text-xs">Enable L3 &amp; L4 Header Inspection</span>
                </Label>
              </FieldsetContent>
            </Fieldset>

            {/* Pre-NAT Identification */}
            <Fieldset>
              <FieldsetLegend>Pre-NAT Identification</FieldsetLegend>
              <FieldsetContent>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <Label className="flex items-center gap-2">
                    <Checkbox checked={zone.prenatUserIdentification} disabled />
                    <span className="text-xs">User-ID</span>
                  </Label>
                  <Label className="flex items-center gap-2">
                    <Checkbox checked={zone.prenatSourceLookup} disabled />
                    <span className="text-xs">Source Lookup</span>
                  </Label>
                  <Label className="flex items-center gap-2">
                    <Checkbox checked={zone.prenatDeviceIdentification} disabled />
                    <span className="text-xs">Device-ID</span>
                  </Label>
                  <Label className="flex items-center gap-2">
                    <Checkbox checked={zone.prenatSourceIpDownstream} disabled />
                    <span className="text-xs">Enable Original ID Downstream</span>
                  </Label>
                </div>
              </FieldsetContent>
            </Fieldset>
          </div>

          {/* ── Column 2: User Identification ACL ── */}
          <AclColumn
            title="User Identification ACL"
            enableLabel="Enable User Identification"
            enabled={zone.enableUserIdentification}
            includeList={zone.userAclInclude}
            excludeList={zone.userAclExclude}
          />

          {/* ── Column 3: Device-ID ACL ── */}
          <AclColumn
            title="Device-ID ACL"
            enableLabel="Enable Device Identification"
            enabled={zone.enableDeviceIdentification}
            includeList={zone.deviceAclInclude}
            excludeList={zone.deviceAclExclude}
          />
        </div>
      </div>
    </DetailDialog>
  )
}
