// @/app/(main)/network/_components/global-protect/clientless-app-groups/clientless-app-groups-view.tsx

"use client"

import * as React from "react"
import {
  useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel,
  createColumnHelper, type ColumnDef, type SortingState,
} from "@tanstack/react-table"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { DataTable } from "@/components/ui/data-table"
import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { templateColumn } from "@/app/(main)/_components/ui/table-columns"
import type { PanwGpClientlessAppGroup } from "@/lib/panw-parser/network/global-protect"

const col = createColumnHelper<PanwGpClientlessAppGroup>()

function buildColumns(
  isPanorama: boolean,
  onNameClick: (g: PanwGpClientlessAppGroup) => void,
): ColumnDef<PanwGpClientlessAppGroup, unknown>[] {
  return [
    col.accessor("name", {
      header: "Name",
      enableHiding: false,
      cell: (info) => (
        <button type="button" className="text-xs font-medium text-foreground hover:underline cursor-pointer" onClick={() => onNameClick(info.row.original)}>
          {info.getValue()}
        </button>
      ),
    }) as ColumnDef<PanwGpClientlessAppGroup, unknown>,
    {
      id: "applications",
      header: "Applications",
      enableSorting: false,
      cell: ({ row }) => <span className="text-xs">{row.original.applications.join(", ") || "—"}</span>,
    },
    ...templateColumn<PanwGpClientlessAppGroup>(isPanorama),
  ]
}

function ClientlessAppGroupDialog({ group, open, onOpenChange }: { group: PanwGpClientlessAppGroup | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  if (!group) return null
  return (
    <DetailDialog title="Clientless Application Group" open={open} onOpenChange={onOpenChange}>
      <DisplayField label="Name" value={group.name} />
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow><TableHead className="text-[11px]">APPLICATIONS</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {group.applications.length === 0 ? (
              <TableRow><TableCell className="py-6 text-center text-sm text-muted-foreground">No applications.</TableCell></TableRow>
            ) : group.applications.map((app) => (
              <TableRow key={app}><TableCell className="text-xs">{app}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DetailDialog>
  )
}

export function ClientlessAppGroupsView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwGpClientlessAppGroup | null>(null)
  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).gpClientlessAppGroups
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
      <DataTable table={table} title="Clientless App Groups" search={search} onSearch={setSearch} />
      <ClientlessAppGroupDialog group={selected} open={selected !== null} onOpenChange={(o) => { if (!o) setSelected(null) }} />
    </>
  )
}
