// @/app/(main)/network/_components/routing-profiles/filters/route-map-dialogs.tsx
//
// Outer dialogs for Route Maps. Shows header fields + entry table (SEQ, DESCRIPTION, ACTION).
// Clicking an entry row opens the Entry|Match|Set detail dialog.

"use client"

import * as React from "react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type {
  PanwBgpRouteMap,
  PanwBgpRouteMapEntry,
  PanwRedistRouteMap,
  PanwRedistRouteMapEntry,
} from "@/lib/panw-parser/routing-profiles"

import {
  BgpRouteMapEntryDialog,
  RedistRouteMapEntryDialog,
} from "./route-map-entry-dialogs"

// ─── Shared ───────────────────────────────────────────────────────────────────

function ActionBadge({ action }: { action: string }) {
  return (
    <Badge variant={action === "permit" ? "green" : "red"} size="sm">
      {action}
    </Badge>
  )
}

function Dash() {
  return <span className="text-muted-foreground text-xs">—</span>
}

function HeaderField({ label, value }: { label: string; value: string }) {
  return (
    <>
      <Label className="text-right text-sm">{label}</Label>
      <Input readOnly value={value} className="h-8 text-sm" />
    </>
  )
}

function DialogFooterBar() {
  return (
    <div className="shrink-0 border-t bg-muted/50 rounded-b-xl px-5 py-3 flex justify-end">
      <DialogClose render={<Button variant="outline">Close</Button>} />
    </div>
  )
}

// ─── BGP Route Map Dialog ─────────────────────────────────────────────────────

export function BgpRouteMapDialog({
  item,
  open,
  onOpenChange,
}: {
  item: PanwBgpRouteMap | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [selectedEntry, setSelectedEntry] = React.useState<PanwBgpRouteMapEntry | null>(null)

  // Reset entry selection when outer dialog closes or item changes
  React.useEffect(() => {
    if (!open) setSelectedEntry(null)
  }, [open])

  if (!item) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
          <DialogHeader className="shrink-0 border-b px-5 pt-4 pb-3">
            <DialogTitle>Filters Route Maps BGP</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 mb-5">
              <HeaderField label="Name" value={item.name} />
              <HeaderField label="Description" value={item.description ?? ""} />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">SEQ</TableHead>
                    <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">DESCRIPTION</TableHead>
                    <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">ACTION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {item.entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                        No entries configured.
                      </TableCell>
                    </TableRow>
                  ) : item.entries.map((e) => (
                    <TableRow
                      key={e.sequence}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedEntry(e)}
                    >
                      <TableCell>
                        <span className="text-xs tabular-nums font-medium text-foreground hover:underline">
                          {e.sequence}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{e.description ?? <Dash />}</TableCell>
                      <TableCell><ActionBadge action={e.action} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooterBar />
        </DialogContent>
      </Dialog>

      <BgpRouteMapEntryDialog
        entry={selectedEntry}
        open={selectedEntry !== null}
        onOpenChange={(open) => { if (!open) setSelectedEntry(null) }}
      />
    </>
  )
}

// ─── Redistribution Route Map Dialog ──────────────────────────────────────────

const SOURCE_PROTOCOL_LABELS: Record<string, string> = {
  "connected-static": "Connected Static",
  rip: "RIP",
  bgp: "BGP",
  ospf: "OSPF",
  ospfv3: "OSPFv3",
}

const DEST_PROTOCOL_LABELS: Record<string, string> = {
  ospf: "OSPF",
  bgp: "BGP",
  ospfv3: "OSPFv3",
  rip: "RIP",
  rib: "RIB",
}

export function RedistRouteMapDialog({
  item,
  open,
  onOpenChange,
}: {
  item: PanwRedistRouteMap | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [selectedEntry, setSelectedEntry] = React.useState<PanwRedistRouteMapEntry | null>(null)

  React.useEffect(() => {
    if (!open) setSelectedEntry(null)
  }, [open])

  if (!item) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
          <DialogHeader className="shrink-0 border-b px-5 pt-4 pb-3">
            <DialogTitle>Filters Route Maps Redistribution</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 mb-5">
              <HeaderField label="Name" value={item.name} />
              <HeaderField label="Description" value={item.description ?? ""} />
              <HeaderField label="Source Protocol" value={SOURCE_PROTOCOL_LABELS[item.sourceProtocol] ?? item.sourceProtocol} />
              <HeaderField label="Destination Protocol" value={DEST_PROTOCOL_LABELS[item.destProtocol] ?? item.destProtocol} />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">SEQ</TableHead>
                    <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">DESCRIPTION</TableHead>
                    <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">ACTION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {item.entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                        No entries configured.
                      </TableCell>
                    </TableRow>
                  ) : item.entries.map((e) => (
                    <TableRow
                      key={e.sequence}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedEntry(e)}
                    >
                      <TableCell>
                        <span className="text-xs tabular-nums font-medium text-foreground hover:underline">
                          {e.sequence}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{e.description ?? <Dash />}</TableCell>
                      <TableCell><ActionBadge action={e.action} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooterBar />
        </DialogContent>
      </Dialog>

      <RedistRouteMapEntryDialog
        entry={selectedEntry}
        sourceProtocol={item.sourceProtocol}
        destProtocol={item.destProtocol}
        open={selectedEntry !== null}
        onOpenChange={(open) => { if (!open) setSelectedEntry(null) }}
      />
    </>
  )
}
