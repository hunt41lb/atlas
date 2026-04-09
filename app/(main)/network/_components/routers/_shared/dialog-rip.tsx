// @/app/(main)/network/_components/routers/_shared/dialog-rip.tsx

"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import { Label } from "@/components/ui/label"
import { MonoValue } from "@/app/(main)/_components/ui/category-shell"
import type { RouterDialogPageProps } from "./dialog-general"
import type { PanwRipInterface } from "@/lib/panw-parser/network/routers"

// ─── Shared label width ───────────────────────────────────────────────────────

const LW = "w-48"

// ─── Interface Detail Dialog ──────────────────────────────────────────────────

function InterfaceDetailDialog({
  iface,
  ifaceRef,
  open,
  onOpenChange,
}: {
  iface: PanwRipInterface | null
  ifaceRef: {
    inboundDistList: string | null
    inboundDistMetric: number | null
    outboundDistList: string | null
    outboundDistMetric: number | null
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!iface) return null

  return (
    <DetailDialog title="Interface" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-3xl">
      <DisplayField label="Interface" value={iface.name} />

      <Label className="flex items-center gap-2 py-1 pl-1">
        <Checkbox checked={iface.enabled} disabled />
        <span className="text-xs">Enable</span>
      </Label>

      <DisplayField label="Split Horizon" value={(iface as { splitHorizon?: string | null }).splitHorizon ?? "None"} />
      <DisplayField label="Mode" value={iface.mode ?? "None"} />
      <DisplayField label="Authentication" value={iface.authProfile ?? "None"} />
      <DisplayField label="BFD Profile" value={iface.bfdProfile ?? "None"} />

      <div className="grid grid-cols-2 gap-4 pt-2">
        <Fieldset className="h-full">
          <FieldsetLegend>Interface Inbound Distribute List</FieldsetLegend>
          <FieldsetContent>
            <DisplayField label="Access List" value={ifaceRef?.inboundDistList ?? "None"} />
            <DisplayField label="Metric" value={String(ifaceRef?.inboundDistMetric ?? "—")} />
          </FieldsetContent>
        </Fieldset>
        <Fieldset className="h-full">
          <FieldsetLegend>Interface Outbound Distribute List</FieldsetLegend>
          <FieldsetContent>
            <DisplayField label="Access List" value={ifaceRef?.outboundDistList ?? "None"} />
            <DisplayField label="Metric" value={String(ifaceRef?.outboundDistMetric ?? "—")} />
          </FieldsetContent>
        </Fieldset>
      </div>
    </DetailDialog>
  )
}

// ─── RIPv2 Page (exported) ────────────────────────────────────────────────────

export function RipPage({ router }: RouterDialogPageProps) {
  const refs = router.ripRefs
  const cfg = router.rip

  const [selectedIface, setSelectedIface] = React.useState<PanwRipInterface | null>(null)

  const getIfaceRef = (name: string) =>
    refs?.interfaces?.find(r => r.name === name) ?? null

  return (
    <div className="flex h-full flex-col min-h-0">
      {/* Header fields */}
      <div className="shrink-0 border-b px-4 py-3">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 py-1">
              <Checkbox checked={refs?.enabled ?? cfg?.enabled ?? false} disabled />
              <span className="text-xs">Enable</span>
            </Label>
            <Label className="flex items-center gap-2 py-1">
              <Checkbox checked={(cfg as { defaultInformationOriginate?: boolean })?.defaultInformationOriginate ?? false} disabled />
              <span className="text-xs">default-information originate</span>
            </Label>
            <DisplayField labelWidth={LW} label="BFD Profile" value={refs?.globalBfdProfile ?? cfg?.globalBfdProfile ?? "None"} />
            <DisplayField labelWidth={LW} label="Global Inbound Distribute List" value={refs?.globalInboundDistList ?? "None"} />
          </div>
          <div className="space-y-2">
            <DisplayField labelWidth={LW} label="Global General Timer" value={refs?.globalTimerName ?? "None"} />
            <DisplayField labelWidth={LW} label="Auth Profile" value={refs?.authProfileName ?? "None"} />
            <DisplayField labelWidth={LW} label="Redistribution Profile" value={refs?.redistProfileName ?? "None"} />
            <DisplayField labelWidth={LW} label="Global Outbound Distribute List" value={refs?.globalOutboundDistList ?? "None"} />
          </div>
        </div>
      </div>

      {/* Interface table */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px]">INTERFACE</TableHead>
                <TableHead className="text-[11px]">ENABLE</TableHead>
                <TableHead className="text-[11px]">AUTH PROFILE</TableHead>
                <TableHead className="text-[11px]">BFD</TableHead>
                <TableHead className="text-[11px]">MODE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(cfg?.interfaces ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-xs text-muted-foreground">
                    No interfaces configured.
                  </TableCell>
                </TableRow>
              ) : cfg!.interfaces.map((iface) => (
                <TableRow
                  key={iface.name}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedIface(iface)}
                >
                  <TableCell><MonoValue className="text-xs">{iface.name}</MonoValue></TableCell>
                  <TableCell><Checkbox checked={iface.enabled} disabled /></TableCell>
                  <TableCell><span className="text-xs">{iface.authProfile ?? "—"}</span></TableCell>
                  <TableCell><span className="text-xs">{iface.bfdProfile ?? "—"}</span></TableCell>
                  <TableCell><span className="text-xs">{iface.mode ?? "—"}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <InterfaceDetailDialog
        iface={selectedIface}
        ifaceRef={selectedIface ? getIfaceRef(selectedIface.name) : null}
        open={selectedIface !== null}
        onOpenChange={(open) => { if (!open) setSelectedIface(null) }}
      />
    </div>
  )
}

