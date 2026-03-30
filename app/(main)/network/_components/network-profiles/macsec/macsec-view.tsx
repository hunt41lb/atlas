// @/app/(main)/network/_components/network-profiles/macsec/macsec-view.tsx

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
import { MacsecDialog } from "./macsec-dialog"
import type { PanwMacsecProfile } from "@/lib/panw-parser/network-profiles"

// ─── Columns ──────────────────────────────────────────────────────────────────

const col = createColumnHelper<PanwMacsecProfile>()

function buildColumns(
  isPanorama: boolean,
  onNameClick: (p: PanwMacsecProfile) => void,
): ColumnDef<PanwMacsecProfile, unknown>[] {
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
    }) as ColumnDef<PanwMacsecProfile, unknown>,

    {
      id: "encryption",
      header: "Encryption",
      enableSorting: true,
      accessorFn: (row) => row.encryption,
      cell: ({ row }) => <span className="text-xs">{row.original.encryption.toUpperCase()}</span>,
    },

    {
      id: "confidentialityOffset",
      header: "Confidentiality Offset",
      enableSorting: true,
      accessorFn: (row) => row.confidentialityOffset,
      cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.confidentialityOffset}</span>,
    },

    {
      id: "sciInclude",
      header: "SCI Include",
      enableSorting: false,
      cell: ({ row }) => <Checkbox checked={row.original.sciInclude} disabled />,
    },

    {
      id: "antiReplay",
      header: "Anti Replay",
      enableSorting: false,
      cell: ({ row }) => <Checkbox checked={row.original.antiReplay} disabled />,
    },

    {
      id: "replayWindow",
      header: "Replay Window",
      enableSorting: true,
      accessorFn: (row) => row.antiReplayWindow,
      cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.antiReplayWindow}</span>,
    },

    {
      id: "rekeyInterval",
      header: "SAK Rekey Interval",
      enableSorting: true,
      accessorFn: (row) => row.rekeyInterval,
      cell: ({ row }) => <span className="text-xs tabular-nums">{row.original.rekeyInterval}</span>,
    },

    ...(isPanorama ? [{
      id: "template",
      header: "Template",
      enableSorting: true,
      accessorFn: (row: PanwMacsecProfile) => row.templateName ?? "",
      cell: ({ row }: { row: { original: PanwMacsecProfile } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwMacsecProfile, unknown>] : []),
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MacsecView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwMacsecProfile | null>(null)

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).macsecProfiles
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
      <DataTable table={table} title="MACsec Profiles" search={search} onSearch={setSearch} />
      <MacsecDialog profile={selected} open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null) }} />
    </>
  )
}
