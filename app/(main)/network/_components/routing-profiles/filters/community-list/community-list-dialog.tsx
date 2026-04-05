// @/app/(main)/network/_components/routing-profiles/filters/community-list/community-list-dialog.tsx

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

import type { PanwCommunityList } from "@/lib/panw-parser/routing-profiles"
import { ActionBadge } from "@/app/(main)/_components/ui/category-shell"

// ─── Community List Dialog ────────────────────────────────────────────────────

const COMMUNITY_TYPE_LABELS: Record<string, string> = {
  regular: "Regular",
  extended: "Extended",
  large: "Large",
}

const COMMUNITY_VALUES_HEADER: Record<string, string> = {
  regular: "COMMUNITY",
  extended: "REGEX",
  large: "REGEX",
}

export function CommunityListDialog({
  item,
  open,
  onOpenChange,
}: {
  item: PanwCommunityList | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!item) return null

  const valuesHeader = COMMUNITY_VALUES_HEADER[item.type] ?? "VALUES"

  return (
    <DetailDialog title="Filters Community List" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-2xl">
      <div className="space-y-4">
        <div className="space-y-2">
          <DisplayField label="Name" value={item.name} />
          <DisplayField label="Description" value={item.description ?? ""} className={!item.description ? "opacity-50" : ""} />
          <DisplayField label="Type" value={COMMUNITY_TYPE_LABELS[item.type] ?? item.type} />
        </div>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px]">SEQ</TableHead>
                <TableHead className="text-[11px]">ACTION</TableHead>
                <TableHead className="text-[11px]">{valuesHeader}</TableHead>
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
                  <TableCell className="text-xs font-mono">
                    {e.values.length === 0 ? "—" : (
                      <div className="flex flex-col gap-0.5">
                        {e.values.map((v) => (
                          <span key={v}>{v}</span>
                        ))}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DetailDialog>
  )
}
