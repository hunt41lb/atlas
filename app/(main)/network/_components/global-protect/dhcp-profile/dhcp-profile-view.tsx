// @/app/(main)/network/_components/global-protect/dhcp-profile/dhcp-profile-view.tsx

"use client"

import * as React from "react"
import {
  useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel,
  createColumnHelper, type ColumnDef, type SortingState,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { DataTable } from "@/components/ui/data-table"
import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { templateColumn } from "@/app/(main)/_components/ui/table-columns"
import type { PanwGpDhcpProfile } from "@/lib/panw-parser/network/global-protect"

const col = createColumnHelper<PanwGpDhcpProfile>()

function buildColumns(
  isPanorama: boolean,
  onNameClick: (p: PanwGpDhcpProfile) => void,
): ColumnDef<PanwGpDhcpProfile, unknown>[] {
  return [
    col.accessor("name", {
      header: "Name",
      enableHiding: false,
      cell: (info) => (
        <Button
          variant="link"
          size="sm"
          className="text-foreground font-medium cursor-pointer"
          onClick={() => onNameClick(info.row.original)}>
          {info.getValue()}
        </Button>
      ),
    }) as ColumnDef<PanwGpDhcpProfile, unknown>,
    col.accessor("ipAddress", {
      header: "IP Address",
      cell: (info) => <span className="text-xs font-mono">{info.getValue() ?? "—"}</span>,
    }) as ColumnDef<PanwGpDhcpProfile, unknown>,
    {
      id: "ipPools",
      header: "IP Pools",
      enableSorting: false,
      cell: ({ row }) => <span className="text-xs font-mono">{row.original.ipPools.join(", ") || "—"}</span>,
    },
    ...templateColumn<PanwGpDhcpProfile>(isPanorama),
  ]
}

function DhcpProfileDialog({ profile, open, onOpenChange }: { profile: PanwGpDhcpProfile | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  if (!profile) return null
  return (
    <DetailDialog title="DHCP Profile" open={open} onOpenChange={onOpenChange}>
      <DisplayField label="Name" value={profile.name} />
      <DisplayField label="IP Address" value={profile.ipAddress ?? "None"} />
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow><TableHead className="text-[11px]">IP POOLS</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {profile.ipPools.length === 0 ? (
              <TableRow><TableCell className="py-6 text-center text-sm text-muted-foreground">No IP pools configured.</TableCell></TableRow>
            ) : profile.ipPools.map((pool) => (
              <TableRow key={pool}><TableCell className="text-xs font-mono">{pool}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DetailDialog>
  )
}

export function DhcpProfileView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwGpDhcpProfile | null>(null)
  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).gpDhcpProfiles
  }, [activeConfig, selectedScope])

  const columns = React.useMemo(() => buildColumns(isPanorama, setSelected), [isPanorama])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data, columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting, onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
  })

  return (
    <>
      <DataTable table={table} title="DHCP Profiles" search={search} onSearch={setSearch} />
      <DhcpProfileDialog profile={selected} open={selected !== null} onOpenChange={(o) => { if (!o) setSelected(null) }} />
    </>
  )
}
