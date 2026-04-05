// @/app/(main)/network/_components/routing-profiles/filters/route-maps-redistribution/route-maps-redist-dialog.tsx
//
// Outer dialog for Redistribution Route Maps. Shows header fields + entry table.
// Clicking an entry row opens the Entry|Match|Set detail dialog.

"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"

import type { PanwRedistRouteMap, PanwRedistRouteMapEntry } from "@/lib/panw-parser/routing-profiles"
import { RedistRouteMapDetailsDialog } from "./route-maps-redist-dialog-details"

// ─── Shared ───────────────────────────────────────────────────────────────────

function ActionBadge({ action }: { action: string }) {
  return (
    <Badge variant={action === "permit" ? "green" : "red"} size="sm">
      {action}
    </Badge>
  )
}

// ─── Labels ───────────────────────────────────────────────────────────────────

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

// ─── Dialog ───────────────────────────────────────────────────────────────────

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
      <DetailDialog title="Filters Route Maps Redistribution" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-2xl">
        <div className="space-y-4">
          <div className="space-y-2">
            <DisplayField label="Name" value={item.name} />
            <DisplayField label="Description" value={item.description ?? ""} className={!item.description ? "opacity-50" : ""} />
            <DisplayField label="Source Protocol" value={SOURCE_PROTOCOL_LABELS[item.sourceProtocol] ?? item.sourceProtocol} />
            <DisplayField label="Destination Protocol" value={DEST_PROTOCOL_LABELS[item.destProtocol] ?? item.destProtocol} />
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px]">SEQ</TableHead>
                  <TableHead className="text-[11px]">DESCRIPTION</TableHead>
                  <TableHead className="text-[11px]">ACTION</TableHead>
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
                    <TableCell className="text-xs text-muted-foreground">{e.description ?? "—"}</TableCell>
                    <TableCell><ActionBadge action={e.action} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DetailDialog>

      <RedistRouteMapDetailsDialog
        entry={selectedEntry}
        sourceProtocol={item.sourceProtocol}
        destProtocol={item.destProtocol}
        open={selectedEntry !== null}
        onOpenChange={(open) => { if (!open) setSelectedEntry(null) }}
      />
    </>
  )
}
