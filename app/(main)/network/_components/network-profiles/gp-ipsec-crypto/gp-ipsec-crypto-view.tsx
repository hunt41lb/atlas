// @/app/(main)/network/_components/network-profiles/gp-ipsec-crypto/gp-ipsec-crypto-view.tsx

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

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { templateColumn } from "@/app/(main)/_components/ui/table-columns"
import { GpIpsecCryptoDialog } from "./gp-ipsec-crypto-dialog"
import type { PanwGpIpsecCryptoProfile } from "@/lib/panw-parser/network/network-profiles"

// ─── Columns ──────────────────────────────────────────────────────────────────

const col = createColumnHelper<PanwGpIpsecCryptoProfile>()

function buildColumns(
  isPanorama: boolean,
  onNameClick: (p: PanwGpIpsecCryptoProfile) => void,
): ColumnDef<PanwGpIpsecCryptoProfile, unknown>[] {
  return [
    col.accessor("name", {
      header: "Name",
      enableHiding: false,
      cell: (info) => (
        <Button
          variant="link"
          size="sm"
          className="text-foreground font-medium cursor-pointer"
          onClick={() => onNameClick(info.row.original)}
        >
          {info.getValue()}
        </Button>
      ),
    }) as ColumnDef<PanwGpIpsecCryptoProfile, unknown>,

    {
      id: "encryption",
      header: "Encryption",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-xs">{row.original.encryption.join(", ") || "—"}</span>
      ),
    },

    ...templateColumn<PanwGpIpsecCryptoProfile>(isPanorama),
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GpIpsecCryptoView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwGpIpsecCryptoProfile | null>(null)

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).gpIpsecCryptoProfiles
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
      <DataTable table={table} title="GlobalProtect IPSec Crypto Profiles" search={search} onSearch={setSearch} />
      <GpIpsecCryptoDialog profile={selected} open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null) }} />
    </>
  )
}
