// @/app/(main)/network/_components/routing-profiles/filters/access-list/access-list-dialog.tsx

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

import type { PanwAccessList } from "@/lib/panw-parser/routing-profiles"
import { ActionBadge } from "@/app/(main)/_components/ui/category-shell"

export function AccessListDialog({
  item,
  open,
  onOpenChange,
}: {
  item: PanwAccessList | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!item) return null

  return (
    <DetailDialog title="Filters Access List" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-4xl">
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
                {item.type === "ipv4" ? (
                  <>
                    <TableHead className="text-[11px]">SRC NETWORK</TableHead>
                    <TableHead className="text-[11px]">SRC WILDCARD</TableHead>
                    <TableHead className="text-[11px]">DST NETWORK</TableHead>
                    <TableHead className="text-[11px]">DST WILDCARD</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="text-[11px]">SRC NETWORK/MASK</TableHead>
                    <TableHead className="text-[11px]">EXACT MATCH</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {item.entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={item.type === "ipv4" ? 6 : 4} className="py-8 text-center text-sm text-muted-foreground">
                    No entries configured.
                  </TableCell>
                </TableRow>
              ) : item.entries.map((e) => (
                <TableRow key={e.sequence}>
                  <TableCell className="text-xs tabular-nums font-medium">{e.sequence}</TableCell>
                  <TableCell><ActionBadge action={e.action} /></TableCell>
                  {item.type === "ipv4" ? (
                    <>
                      <TableCell className="text-xs font-mono">{e.sourceAddress ?? "—"}</TableCell>
                      <TableCell className="text-xs font-mono">{e.sourceWildcard ?? "—"}</TableCell>
                      <TableCell className="text-xs font-mono">{e.destinationAddress ?? "—"}</TableCell>
                      <TableCell className="text-xs font-mono">{e.destinationWildcard ?? "—"}</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="text-xs font-mono">{e.sourceAddress ?? "—"}</TableCell>
                      <TableCell className="text-xs">{e.sourceExactMatch === true ? "true" : e.sourceExactMatch === false ? "false" : "—"}</TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DetailDialog>
  )
}
