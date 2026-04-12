// @/app/(main)/network/_components/global-protect/clientless-apps/clientless-apps-view.tsx

"use client"

import * as React from "react"
import {
  useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel,
  createColumnHelper, type ColumnDef, type SortingState,
} from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { templateColumn } from "@/app/(main)/_components/ui/table-columns"
import type { PanwGpClientlessApp } from "@/lib/panw-parser/network/global-protect"

const col = createColumnHelper<PanwGpClientlessApp>()

function buildColumns(
  isPanorama: boolean,
  onNameClick: (a: PanwGpClientlessApp) => void,
): ColumnDef<PanwGpClientlessApp, unknown>[] {
  return [
    col.accessor("name", {
      header: "Name",
      enableHiding: false,
      cell: (info) => (
        <button type="button" className="text-xs font-medium text-foreground hover:underline cursor-pointer" onClick={() => onNameClick(info.row.original)}>
          {info.getValue()}
        </button>
      ),
    }) as ColumnDef<PanwGpClientlessApp, unknown>,
    col.accessor("applicationHomeUrl", {
      header: "Application URL",
      cell: (info) => <span className="text-xs font-mono">{info.getValue() ?? "—"}</span>,
    }) as ColumnDef<PanwGpClientlessApp, unknown>,
    ...templateColumn<PanwGpClientlessApp>(isPanorama),
  ]
}

function ClientlessAppDialog({ app, open, onOpenChange }: { app: PanwGpClientlessApp | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  if (!app) return null
  return (
    <DetailDialog title="Clientless Application" open={open} onOpenChange={onOpenChange}>
      <DisplayField label="Name" value={app.name} />
      <DisplayField label="Application Home URL" value={app.applicationHomeUrl ?? "None"} />
      <DisplayField label="Application Description" value={app.description ?? "None"} />
      <DisplayField label="Application Icon" value="None" />
    </DetailDialog>
  )
}

export function ClientlessAppsView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwGpClientlessApp | null>(null)
  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).gpClientlessApps
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
      <DataTable table={table} title="Clientless Apps" search={search} onSearch={setSearch} />
      <ClientlessAppDialog app={selected} open={selected !== null} onOpenChange={(o) => { if (!o) setSelected(null) }} />
    </>
  )
}
