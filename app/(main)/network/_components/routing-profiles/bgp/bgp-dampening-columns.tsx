// @/app/(main)/network/_components/routing-profiles/bgp/bgp-dampening-columns.tsx

"use client"

import {
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table"

import type { PanwBgpDampeningProfile } from "@/lib/panw-parser/routing-profiles"
import { BGP_DAMPENING_DEFAULTS } from "@/lib/panw-parser/routing-profiles"
import { DefaultCell } from "../_shared"

// ─── Columns ──────────────────────────────────────────────────────────────────

const dampHelper = createColumnHelper<PanwBgpDampeningProfile>()

export function buildDampeningColumns(isPanorama: boolean): ColumnDef<PanwBgpDampeningProfile, unknown>[] {
  return [
    dampHelper.accessor("name", {
      header: "Name",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }) as ColumnDef<PanwBgpDampeningProfile, unknown>,

    dampHelper.accessor("description", {
      header: "Description",
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
      accessorFn: (row: PanwBgpDampeningProfile) => row.templateName ?? "",
      cell: ({ row }: { row: { original: PanwBgpDampeningProfile } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwBgpDampeningProfile, unknown>] : []),
  ]
}
