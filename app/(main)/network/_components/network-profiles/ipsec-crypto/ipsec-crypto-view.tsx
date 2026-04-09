// @/app/(main)/network/_components/network-profiles/ipsec-crypto/ipsec-crypto-view.tsx

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

import { DataTable } from "@/components/ui/data-table"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { IpsecCryptoDialog } from "./ipsec-crypto-dialog"
import type { PanwIpsecCryptoProfile } from "@/lib/panw-parser/network/network-profiles"
import { templateColumn } from "@/app/(main)/_components/ui/table-columns"

// ─── Columns ──────────────────────────────────────────────────────────────────

const col = createColumnHelper<PanwIpsecCryptoProfile>()

function buildColumns(
  isPanorama: boolean,
  onNameClick: (p: PanwIpsecCryptoProfile) => void,
): ColumnDef<PanwIpsecCryptoProfile, unknown>[] {
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
    }) as ColumnDef<PanwIpsecCryptoProfile, unknown>,

    {
      id: "protocol",
      header: "ESP/AH",
      enableSorting: true,
      accessorFn: (row) => row.protocol,
      cell: ({ row }) => (
        <span className="text-xs">{row.original.protocol.toUpperCase()}</span>
      ),
    },

    {
      id: "encryption",
      header: "Encryption",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-xs">{row.original.encryption.join(", ") || "—"}</span>
      ),
    },

    {
      id: "authentication",
      header: "Authentication",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-xs">{row.original.authentication.join(", ") || "—"}</span>
      ),
    },

    {
      id: "dhGroup",
      header: "DH Group",
      enableSorting: true,
      accessorFn: (row) => row.dhGroup ?? "",
      cell: ({ row }) => (
        <span className="text-xs">{row.original.dhGroup ?? "—"}</span>
      ),
    },

    {
      id: "lifetime",
      header: "Lifetime",
      enableSorting: true,
      accessorFn: (row) => row.lifetimeValue,
      cell: ({ row }) => (
        <span className="text-xs tabular-nums">
          {row.original.lifetimeValue} {row.original.lifetimeUnit}
        </span>
      ),
    },

    {
      id: "lifesize",
      header: "Lifesize",
      enableSorting: true,
      accessorFn: (row) => row.lifesizeValue ?? 0,
      cell: ({ row }) => {
        if (!row.original.lifesizeEnabled) return <span className="text-muted-foreground text-xs">—</span>
        return (
          <span className="text-xs tabular-nums">
            {row.original.lifesizeValue} {row.original.lifesizeUnit?.toUpperCase()}
          </span>
        )
      },
    },

    ...templateColumn<PanwIpsecCryptoProfile>(isPanorama),
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function IpsecCryptoView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwIpsecCryptoProfile | null>(null)

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).ipsecCryptoProfiles
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
        title="IPSec Crypto Profiles"
        search={search}
        onSearch={setSearch}
      />
      <IpsecCryptoDialog
        profile={selected}
        open={selected !== null}
        onOpenChange={(open) => { if (!open) setSelected(null) }}
      />
    </>
  )
}

