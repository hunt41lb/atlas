// @/app/(main)/network/_components/network-profiles/bfd/bfd-view.tsx

"use client"

import * as React from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  createColumnHelper,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"

import { Checkbox } from "@/components/ui/checkbox"
import { DataTable } from "@/components/ui/data-table"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { BfdDialog } from "./bfd-dialog"
import type { PanwNetworkBfdProfile } from "@/lib/panw-parser/network-profiles"

// ─── Columns ──────────────────────────────────────────────────────────────────

const col = createColumnHelper<PanwNetworkBfdProfile>()

function buildColumns(
  isPanorama: boolean,
  onNameClick: (p: PanwNetworkBfdProfile) => void,
): ColumnDef<PanwNetworkBfdProfile, unknown>[] {
  return [
    col.accessor("name", {
      header: "Name",
      enableHiding: false,
      cell: (info) => (
        <button
          type="button"
          className="text-xs font-medium text-foreground hover:underline cursor-pointer"
          onClick={() => onNameClick(info.row.original)}
        >
          {info.getValue()}
        </button>
      ),
    }) as ColumnDef<PanwNetworkBfdProfile, unknown>,

    {
      id: "mode",
      header: "Mode",
      enableSorting: true,
      accessorFn: (row) => row.mode,
      cell: ({ row }) => <span className="text-xs">{row.original.mode}</span>,
    },

    {
      id: "minTx",
      header: "Desired Minimum TX Interval (ms)",
      enableSorting: true,
      accessorFn: (row) => row.minTxInterval,
      cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.minTxInterval}</span>,
    },

    {
      id: "minRx",
      header: "Required Minimum RX Interval (ms)",
      enableSorting: true,
      accessorFn: (row) => row.minRxInterval,
      cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.minRxInterval}</span>,
    },

    {
      id: "detectionMultiplier",
      header: "Detection Time Multiplier",
      enableSorting: true,
      accessorFn: (row) => row.detectionMultiplier,
      cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.detectionMultiplier}</span>,
    },

    {
      id: "holdTime",
      header: "Hold Time (ms)",
      enableSorting: true,
      accessorFn: (row) => row.holdTime,
      cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.holdTime}</span>,
    },

    {
      id: "multihop",
      header: "Enable Multihop",
      enableSorting: false,
      cell: ({ row }) => <Checkbox checked={row.original.multihopEnabled} disabled />,
    },

    ...(isPanorama ? [{
      id: "template",
      header: "Template",
      enableSorting: true,
      accessorFn: (row: PanwNetworkBfdProfile) => row.templateName ?? "",
      cell: ({ row }: { row: { original: PanwNetworkBfdProfile } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwNetworkBfdProfile, unknown>] : []),
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NetworkBfdView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwNetworkBfdProfile | null>(null)

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).networkBfdProfiles
  }, [activeConfig, selectedScope])

  const columns = React.useMemo(() => buildColumns(isPanorama, setSelected), [isPanorama])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
  })

  return (
    <>
      <DataTable table={table} title="BFD Profiles" search={search} onSearch={setSearch} />
      <BfdDialog profile={selected} open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null) }} />
    </>
  )
}
