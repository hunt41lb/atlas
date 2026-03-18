// @/app/(main)/network/_components/routing-profiles/bgp/bgp-auth-dialog.tsx

"use client"

import {
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

import type { PanwBgpAuthProfile } from "@/lib/panw-parser/routing-profiles"

// ─── Dialog ───────────────────────────────────────────────────────────────────

export function AuthProfileDialog({
  profile,
  open,
  onOpenChange,
}: {
  profile: PanwBgpAuthProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!profile) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>BGP Auth Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3">
            <Label className="text-right text-sm">Name</Label>
            <Input readOnly value={profile.name} className="h-8 text-sm" />
            <Label className="text-right text-sm">Secret</Label>
            <Input readOnly type="password" value="••••••••" className="h-8 text-sm" />
            <Label className="text-right text-sm">Confirm Secret</Label>
            <Input readOnly type="password" value="••••••••" className="h-8 text-sm" />
          </div>
        </div>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const authHelper = createColumnHelper<PanwBgpAuthProfile>()

export function buildAuthColumns(
  isPanorama: boolean,
  onNameClick: (profile: PanwBgpAuthProfile) => void
): ColumnDef<PanwBgpAuthProfile, unknown>[] {
  return [
    authHelper.accessor("name", {
      header: "Name",
      cell: (info) => (
        <button
          type="button"
          className="font-medium text-primary hover:underline cursor-pointer"
          onClick={() => onNameClick(info.row.original)}
        >
          {info.getValue()}
        </button>
      ),
    }) as ColumnDef<PanwBgpAuthProfile, unknown>,

    ...(isPanorama ? [{
      id: "template",
      header: "Template",
      enableSorting: true,
      accessorFn: (row: PanwBgpAuthProfile) => row.templateName ?? "",
      cell: ({ row }: { row: { original: PanwBgpAuthProfile } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwBgpAuthProfile, unknown>] : []),
  ]
}
