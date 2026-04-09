// @/app/(main)/network/_components/routing-profiles/filters/as-path-access-list/as-path-access-list-dialog.tsx

"use client"

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

import type { PanwAsPathAccessList } from "@/lib/panw-parser/network/routing-profiles"
import { ActionBadge } from "@/app/(main)/_components/ui/category-shell"

// ─── AS Path Access List Dialog ───────────────────────────────────────────────

export function AsPathAccessListDialog({
  item,
  open,
  onOpenChange,
}: {
  item: PanwAsPathAccessList | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!item) return null

  return (
    <DetailDialog title="Filters AS Path Access List" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-2xl">
      <div className="space-y-4">
        <div className="space-y-2">
          <DisplayField label="Name" value={item.name} />
          <DisplayField label="Description" value={item.description ?? ""} className={!item.description ? "opacity-50" : ""} />
        </div>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px]">SEQ</TableHead>
                <TableHead className="text-[11px]">ACTION</TableHead>
                <TableHead className="text-[11px]">REGULAR EXPRESSION</TableHead>
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
                <TableRow key={e.sequence}>
                  <TableCell className="text-xs tabular-nums font-medium">{e.sequence}</TableCell>
                  <TableCell><ActionBadge action={e.action} /></TableCell>
                  <TableCell className="text-xs font-mono">{e.regex ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DetailDialog>
  )
}

