// @/app/(main)/network/_components/routing-profiles/bgp/bgp-dampening-columns.tsx

"use client"

import {
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import type { PanwBgpDampeningProfile } from "@/lib/panw-parser/network/routing-profiles"
import { BGP_DAMPENING_DEFAULTS } from "@/lib/panw-parser/network/routing-profiles"
import { DefaultCell } from "../_shared"

// ─── Columns ──────────────────────────────────────────────────────────────────

const dampHelper = createColumnHelper<PanwBgpDampeningProfile>()

export function buildDampeningColumns(
  isPanorama: boolean,
  onNameClick: (profile: PanwBgpDampeningProfile) => void,
  ): ColumnDef<PanwBgpDampeningProfile, unknown>[] {
  return [
    dampHelper.accessor("name", {
      header: "Name",
      cell: (info) => (
        <Button
          variant="link"
          size="sm"
          className="text-foreground font-medium cursor-pointer"
          onClick={() => onNameClick(info.row.original)}
        >
          {info.getValue()}
        </Button>
      )
    }) as ColumnDef<PanwBgpDampeningProfile, unknown>,

    dampHelper.accessor("description", {
      header: "Description",
      meta: { hidePriority: 1 },
      cell: (info) => info.getValue()
        ? <span className="text-xs text-muted-foreground">{info.getValue()}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    }) as ColumnDef<PanwBgpDampeningProfile, unknown>,

    {
      id: "suppress",
      header: "Suppress Limit",
      enableSorting: true,
      accessorFn: (row) => row.suppressLimit,
      cell: ({ row }) => <DefaultCell value={row.original.suppressLimit} defaultValue={BGP_DAMPENING_DEFAULTS.suppressLimit} />,
    },

    {
      id: "reuse",
      header: "Reuse Limit",
      enableSorting: true,
      accessorFn: (row) => row.reuseLimit,
      cell: ({ row }) => <DefaultCell value={row.original.reuseLimit} defaultValue={BGP_DAMPENING_DEFAULTS.reuseLimit} />,
    },

    {
      id: "halfLife",
      header: "Half Life (min)",
      enableSorting: true,
      accessorFn: (row) => row.halfLife,
      cell: ({ row }) => <DefaultCell value={row.original.halfLife} defaultValue={BGP_DAMPENING_DEFAULTS.halfLife} />,
    },

    {
      id: "maxSuppress",
      header: "Max Suppress (min)",
      enableSorting: true,
      accessorFn: (row) => row.maxSuppressLimit,
      cell: ({ row }) => <DefaultCell value={row.original.maxSuppressLimit} defaultValue={BGP_DAMPENING_DEFAULTS.maxSuppressLimit} />,
    },

    ...(isPanorama ? [{
      id: "template",
      header: "Template",
      enableSorting: true,
      meta: { hidePriority: 2 },
      accessorFn: (row: PanwBgpDampeningProfile) => row.templateName ?? "",
      cell: ({ row }: { row: { original: PanwBgpDampeningProfile } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwBgpDampeningProfile, unknown>] : []),
  ]
}
