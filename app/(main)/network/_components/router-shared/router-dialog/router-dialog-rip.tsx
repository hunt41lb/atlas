// @/app/(main)/network/_components/router-shared/router-dialog/router-dialog-rip.tsx

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

import { MonoValue } from "@/app/(main)/_components/ui/category-shell"
import {
  LabeledValue,
  FieldGroup,
  HeaderField,
  DetailDialog
} from "./field-display"
import type { RouterDialogPageProps } from "./router-dialog-general"
import type { PanwRipInterface } from "@/lib/panw-parser/types"

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
      <HeaderField labelWidth="w-44" label="Interface" value={iface.name} />

      <div className="flex items-center gap-2 pl-46">
        <Checkbox checked={iface.enabled} disabled />
        <span className="text-xs">Enable</span>
      </div>

      <LabeledValue label="Split Horizon" value={(iface as { splitHorizon?: string | null }).splitHorizon ?? "None"} />
      <LabeledValue label="Mode" value={iface.mode ?? "None"} />
      <LabeledValue label="Authentication" value={iface.authProfile ?? "None"} />
      <LabeledValue label="BFD Profile" value={iface.bfdProfile ?? "None"} />

      <div className="grid grid-cols-2 gap-4 pt-2">
        <FieldGroup title="Interface Inbound Distribute List">
          <LabeledValue label="Access List" value={ifaceRef?.inboundDistList ?? "None"} />
          <LabeledValue label="Metric" value={ifaceRef?.inboundDistMetric ?? "—"} />
        </FieldGroup>
        <FieldGroup title="Interface Outbound Distribute List">
          <LabeledValue label="Access List" value={ifaceRef?.outboundDistList ?? "None"} />
          <LabeledValue label="Metric" value={ifaceRef?.outboundDistMetric ?? "—"} />
        </FieldGroup>
      </div>
    </DetailDialog>
  )
}

// ─── RIPv2 Page (exported) ────────────────────────────────────────────────────

export function RipPage({ router }: RouterDialogPageProps) {
  const refs = router.ripRefs
  const cfg = router.rip

  const [selectedIface, setSelectedIface] = React.useState<PanwRipInterface | null>(null)

  // Match interface refs by name
  const getIfaceRef = (name: string) =>
    refs?.interfaces?.find(r => r.name === name) ?? null

  return (
    <div className="flex h-full flex-col min-h-0">
      {/* Header fields — matching PAN-OS layout */}
      <div className="shrink-0 border-b px-4 py-3">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 pl-46">
              <Checkbox checked={refs?.enabled ?? cfg?.enabled ?? false} disabled />
              <span className="text-xs">Enable</span>
            </div>
            <div className="flex items-center gap-2 pl-46">
              <Checkbox checked={(cfg as { defaultInformationOriginate?: boolean })?.defaultInformationOriginate ?? false} disabled />
              <span className="text-xs">default-information originate</span>
            </div>
            <HeaderField labelWidth="w-44" label="BFD Profile" value={refs?.globalBfdProfile ?? cfg?.globalBfdProfile ?? "None"} />
            <HeaderField labelWidth="w-44" label="Global Inbound Distribute List" value={refs?.globalInboundDistList ?? "None"} />
          </div>
          <div className="space-y-2">
            <HeaderField labelWidth="w-44" label="Global General Timer" value={refs?.globalTimerName ?? "None"} />
            <HeaderField labelWidth="w-44" label="Auth Profile" value={refs?.authProfileName ?? "None"} />
            <HeaderField labelWidth="w-44" label="Redistribution Profile" value={refs?.redistProfileName ?? "None"} />
            <HeaderField labelWidth="w-44" label="Global Outbound Distribute List" value={refs?.globalOutboundDistList ?? "None"} />
          </div>
        </div>
      </div>

      {/* Interface table */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="rounded-md border">
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
                  <TableCell><span className="text-xs">{iface.enabled ? "true" : "false"}</span></TableCell>
                  <TableCell><span className="text-xs">{iface.authProfile ?? "—"}</span></TableCell>
                  <TableCell><span className="text-xs">{iface.bfdProfile ?? "—"}</span></TableCell>
                  <TableCell><span className="text-xs">{iface.mode ?? "—"}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Interface detail dialog */}
      <InterfaceDetailDialog
        iface={selectedIface}
        ifaceRef={selectedIface ? getIfaceRef(selectedIface.name) : null}
        open={selectedIface !== null}
        onOpenChange={(open) => { if (!open) setSelectedIface(null) }}
      />
    </div>
  )
}
