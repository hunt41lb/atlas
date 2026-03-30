// @/app/(main)/network/_components/network-profiles/qos/qos-view.tsx

"use client"

import * as React from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"

import { DataTable } from "@/components/ui/data-table"
import { TableRow, TableCell } from "@/components/ui/table"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { QosDialog } from "./qos-dialog"
import type { PanwQosProfile } from "@/lib/panw-parser/network-profiles"
import { templateColumn } from "@/app/(main)/_components/ui/table-columns"

// ─── Columns ──────────────────────────────────────────────────────────────────

const col = createColumnHelper<PanwQosProfile>()

function buildColumns(
  isPanorama: boolean,
  onNameClick: (p: PanwQosProfile) => void,
): ColumnDef<PanwQosProfile, unknown>[] {
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
    }) as ColumnDef<PanwQosProfile, unknown>,

    {
      id: "egressGuaranteed",
      header: "Guaranteed Egress",
      enableSorting: true,
      accessorFn: (row) => row.egressGuaranteed,
      cell: ({ row }) => {
        const p = row.original
        const unit = p.bandwidthType === "mbps" ? "Mbps" : "%"
        return <span className="text-xs tabular-nums">{p.egressGuaranteed} ({unit})</span>
      },
    },

    {
      id: "egressMax",
      header: "Maximum Egress",
      enableSorting: true,
      accessorFn: (row) => row.egressMax,
      cell: ({ row }) => {
        const p = row.original
        const unit = p.bandwidthType === "mbps" ? "Mbps" : "%"
        return <span className="text-xs tabular-nums">{p.egressMax} ({unit})</span>
      },
    },

    {
      id: "priority",
      header: "Priority",
      enableSorting: false,
      cell: () => null,  // Only shown on class rows
    },

    ...templateColumn<PanwQosProfile>(isPanorama),
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QosView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwQosProfile | null>(null)

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).qosProfiles
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
      <DataTable
        table={table}
        title="QoS Profiles"
        search={search}
        onSearch={setSearch}
        renderRow={(row) => {
          const profile = row.original
          const unit = profile.bandwidthType === "mbps" ? "Mbps" : "%"

          return (
            <React.Fragment key={profile.name}>
              {/* Profile row */}
              <TableRow>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-3 py-2 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>

              {/* Class rows */}
              {profile.classes.map((cls) => (
                <TableRow key={`${profile.name}-${cls.name}`} className="bg-muted/20 hover:bg-muted/40 border-border/50">
                  <TableCell className="pl-8">
                    <span className="text-xs text-muted-foreground">{cls.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs tabular-nums">{cls.egressGuaranteed} ({unit})</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs tabular-nums">{cls.egressMax} ({unit})</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs">{cls.priority}</span>
                  </TableCell>
                  {isPanorama && <TableCell />}
                </TableRow>
              ))}
            </React.Fragment>
          )
        }}
      />
      <QosDialog
        profile={selected}
        open={selected !== null}
        onOpenChange={(open) => { if (!open) setSelected(null) }}
      />
    </>
  )
}
