// @/app/(main)/network/_components/routing-profiles/filters/prefix-list/prefix-list-dialog.tsx

"use client"

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

import type { PanwPrefixList } from "@/lib/panw-parser/network/routing-profiles"
import { ActionBadge } from "@/app/(main)/_components/ui/category-shell"

export function PrefixListDialog({
  item,
  open,
  onOpenChange,
}: {
  item: PanwPrefixList | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!item) return null

  return (
    <DetailDialog title="Filters Prefix List" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-3xl">
      <div className="space-y-4">
        <div className="space-y-2">
          <DisplayField label="Name" value={item.name} />
          <DisplayField label="Description" value={item.description ?? ""} className={!item.description ? "opacity-50" : ""} />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground shrink-0">Type</span>
            <Badge variant={item.type === "ipv4" ? "blue" : "purple"} size="sm">
              {item.type.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px]">SEQ</TableHead>
                <TableHead className="text-[11px]">ACTION</TableHead>
                <TableHead className="text-[11px]">NETWORK</TableHead>
                <TableHead className="text-[11px]">{">="} MIN PREFIX LENGTH</TableHead>
                <TableHead className="text-[11px]">{"<="} MAX PREFIX LENGTH</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {item.entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    No entries configured.
                  </TableCell>
                </TableRow>
              ) : item.entries.map((e) => (
                <TableRow key={e.sequence}>
                  <TableCell className="text-xs tabular-nums font-medium">{e.sequence}</TableCell>
                  <TableCell><ActionBadge action={e.action} /></TableCell>
                  <TableCell className="text-xs font-mono">{e.network ?? "—"}</TableCell>
                  <TableCell className="text-xs tabular-nums">{e.greaterThanOrEqual !== null ? e.greaterThanOrEqual : "—"}</TableCell>
                  <TableCell className="text-xs tabular-nums">{e.lessThanOrEqual !== null ? e.lessThanOrEqual : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DetailDialog>
  )
}

