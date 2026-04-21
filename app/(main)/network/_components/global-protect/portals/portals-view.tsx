// @/app/(main)/network/_components/global-protect/portals/portals-view.tsx

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
import { PortalDialog } from "./portals-dialog"
import type { PanwGpPortal } from "@/lib/panw-parser/network/global-protect"

// ─── Columns ──────────────────────────────────────────────────────────────────

const col = createColumnHelper<PanwGpPortal>()

function buildColumns(
  isPanorama: boolean,
  onNameClick: (p: PanwGpPortal) => void,
): ColumnDef<PanwGpPortal, unknown>[] {
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
    }) as ColumnDef<PanwGpPortal, unknown>,

    {
      id: "interface",
      header: "Interface",
      enableSorting: true,
      accessorFn: (row) => row.general.interface ?? "",
      cell: ({ row }) => <span className="text-xs">{row.original.general.interface ?? "—"}</span>,
    },

    {
      id: "ip",
      header: "IP",
      enableSorting: false,
      cell: ({ row }) => {
        const { ipv4, ipv6 } = row.original.general
        if (!ipv4 && !ipv6) return <span className="text-muted-foreground text-xs">—</span>
        return (
          <div className="flex flex-col gap-0.5">
            {ipv4 && <span className="text-xs font-mono">{ipv4}</span>}
            {ipv6 && <span className="text-xs font-mono">{ipv6}</span>}
          </div>
        )
      },
    },

    {
      id: "sslTlsServiceProfile",
      header: "SSL/TLS Service Profile",
      enableSorting: true,
      accessorFn: (row) => row.general.sslTlsServiceProfile ?? "",
      cell: ({ row }) => <span className="text-xs">{row.original.general.sslTlsServiceProfile ?? "—"}</span>,
    },

    {
      id: "authenticationProfile",
      header: "Authentication Profile",
      enableSorting: false,
      cell: ({ row }) => {
        const profiles = row.original.clientAuth.map((ca) => ca.authenticationProfile).filter(Boolean)
        return profiles.length > 0
          ? <span className="text-xs">{profiles.join(", ")}</span>
          : <span className="text-muted-foreground text-xs">—</span>
      },
    },

    {
      id: "certificateProfile",
      header: "Certificate Profile",
      enableSorting: true,
      accessorFn: (row) => row.general.certificateProfile ?? "",
      cell: ({ row }) => <span className="text-xs">{row.original.general.certificateProfile ?? "—"}</span>,
    },

    ...templateColumn<PanwGpPortal>(isPanorama),
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PortalsView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwGpPortal | null>(null)

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).gpPortals
  }, [activeConfig, selectedScope])

  const columns = React.useMemo(
    () => buildColumns(isPanorama, setSelected),
    [isPanorama],
  )

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
        title="GlobalProtect Portals"
        search={search}
        onSearch={setSearch}
      />
      <PortalDialog
        portal={selected}
        open={selected !== null}
        onOpenChange={(open) => { if (!open) setSelected(null) }}
      />
    </>
  )
}
