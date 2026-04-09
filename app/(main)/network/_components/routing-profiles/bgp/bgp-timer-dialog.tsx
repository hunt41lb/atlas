// @/app/(main)/network/_components/routing-profiles/bgp/bgp-timer-dialog.tsx

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

import type { PanwBgpTimerProfile } from "@/lib/panw-parser/network/routing-profiles"
import { BGP_TIMER_DEFAULTS } from "@/lib/panw-parser/network/routing-profiles"
import { DefaultCell } from "../_shared"

// ─── Dialog ───────────────────────────────────────────────────────────────────

export function TimerProfileDialog({
  profile,
  open,
  onOpenChange,
}: {
  profile: PanwBgpTimerProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!profile) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>BGP Timer Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3">
            <Label className="text-right text-sm">Name</Label>
            <Input readOnly value={profile.name} className="h-8 text-sm" />
            <Label className="text-right text-sm">Keep Alive Interval (sec)</Label>
            <Input readOnly value={profile.keepAliveInterval} className="h-8 text-sm tabular-nums" />
            <Label className="text-right text-sm">Hold Time (sec)</Label>
            <Input readOnly value={profile.holdTime} className="h-8 text-sm tabular-nums" />
            <Label className="text-right text-sm">Reconnect Retry Interval</Label>
            <Input readOnly value={profile.reconnectRetryInterval} className="h-8 text-sm tabular-nums" />
            <Label className="text-right text-sm">Open Delay Time (sec)</Label>
            <Input readOnly value={profile.openDelayTime} className="h-8 text-sm tabular-nums" />
            <Label className="text-right text-sm">Minimum Route Advertise Interval (sec)</Label>
            <Input readOnly value={profile.minRouteAdvInterval} className="h-8 text-sm tabular-nums" />
          </div>
        </div>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const timerHelper = createColumnHelper<PanwBgpTimerProfile>()

export function buildTimerColumns(
  isPanorama: boolean,
  onNameClick: (profile: PanwBgpTimerProfile) => void
): ColumnDef<PanwBgpTimerProfile, unknown>[] {
  return [
    timerHelper.accessor("name", {
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
    }) as ColumnDef<PanwBgpTimerProfile, unknown>,

    {
      id: "keepAlive",
      header: "Keep Alive (s)",
      enableSorting: true,
      accessorFn: (row) => row.keepAliveInterval,
      cell: ({ row }) => <DefaultCell value={row.original.keepAliveInterval} defaultValue={BGP_TIMER_DEFAULTS.keepAliveInterval} />,
    },

    {
      id: "holdTime",
      header: "Hold Time (s)",
      enableSorting: true,
      accessorFn: (row) => row.holdTime,
      cell: ({ row }) => <DefaultCell value={row.original.holdTime} defaultValue={BGP_TIMER_DEFAULTS.holdTime} />,
    },

    {
      id: "minRouteAdv",
      header: "MRAI (s)",
      enableSorting: true,
      accessorFn: (row) => row.minRouteAdvInterval,
      cell: ({ row }) => <DefaultCell value={row.original.minRouteAdvInterval} defaultValue={BGP_TIMER_DEFAULTS.minRouteAdvInterval} />,
    },

    ...(isPanorama ? [{
      id: "template",
      header: "Template",
      enableSorting: true,
      accessorFn: (row: PanwBgpTimerProfile) => row.templateName ?? "",
      cell: ({ row }: { row: { original: PanwBgpTimerProfile } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwBgpTimerProfile, unknown>] : []),
  ]
}

