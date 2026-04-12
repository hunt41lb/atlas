// @/app/(main)/network/_components/global-protect/mdm/mdm-view.tsx

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
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { templateColumn } from "@/app/(main)/_components/ui/table-columns"
import type { PanwGpMdmServer } from "@/lib/panw-parser/network/global-protect"

const col = createColumnHelper<PanwGpMdmServer>()

function buildColumns(
  isPanorama: boolean,
  onNameClick: (m: PanwGpMdmServer) => void,
): ColumnDef<PanwGpMdmServer, unknown>[] {
  return [
    col.accessor("name", {
      header: "Name",
      enableHiding: false,
      cell: (info) => (
        <button type="button" className="text-xs font-medium text-foreground hover:underline cursor-pointer" onClick={() => onNameClick(info.row.original)}>
          {info.getValue()}
        </button>
      ),
    }) as ColumnDef<PanwGpMdmServer, unknown>,
    col.accessor("server", {
      header: "Server",
      cell: (info) => <span className="text-xs font-mono">{info.getValue() ?? "—"}</span>,
    }) as ColumnDef<PanwGpMdmServer, unknown>,
    col.accessor("clientCertificate", {
      header: "Client Certificate",
      cell: (info) => <span className="text-xs">{info.getValue() ?? "—"}</span>,
    }) as ColumnDef<PanwGpMdmServer, unknown>,
    ...templateColumn<PanwGpMdmServer>(isPanorama),
  ]
}

function MdmDialog({ mdm, open, onOpenChange }: { mdm: PanwGpMdmServer | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  if (!mdm) return null
  return (
    <DetailDialog title="MDM" open={open} onOpenChange={onOpenChange}>
      <DisplayField label="Name" value={mdm.name} />
      <Fieldset>
        <FieldsetLegend>Connection Settings</FieldsetLegend>
        <FieldsetContent>
          <DisplayField label="Server" value={mdm.server ?? "None"} />
          <DisplayField label="Connection Port" value={String(mdm.port ?? "—")} />
          <DisplayField label="Client Certificate" value={mdm.clientCertificate ?? "None"} />
        </FieldsetContent>
      </Fieldset>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow><TableHead className="text-[11px]">TRUSTED ROOT CA</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {mdm.rootCas.length === 0 ? (
              <TableRow><TableCell className="py-6 text-center text-sm text-muted-foreground">No trusted root CAs.</TableCell></TableRow>
            ) : mdm.rootCas.map((ca) => (
              <TableRow key={ca}><TableCell className="text-xs">{ca}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DetailDialog>
  )
}

export function MdmView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwGpMdmServer | null>(null)
  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).gpMdmServers
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
      <DataTable table={table} title="MDM Servers" search={search} onSearch={setSearch} />
      <MdmDialog mdm={selected} open={selected !== null} onOpenChange={(o) => { if (!o) setSelected(null) }} />
    </>
  )
}
