// @/app/(main)/network/_components/interfaces/sdwan-tab.tsx

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
  type VisibilityState,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table"
import { templateColumn } from "@/app/(main)/_components/ui/table-columns"
import { RouterCell, ZoneCell } from "./interface-helpers"
import type { PanwSdwanInterface } from "@/lib/panw-parser/network/interfaces"

// ─── Column builder ──────────────────────────────────────────────────────────

const col = createColumnHelper<PanwSdwanInterface>()

function buildColumns(
  isPanorama: boolean,
  ifaceToVirtualRouter: Map<string, string>,
  ifaceToLogicalRouter: Map<string, string>,
  ifaceToZone: Map<string, string>,
  zoneColorMap: Map<string, string>,
  onNameClick: (item: PanwSdwanInterface) => void,
  onRouterClick?: (name: string) => void,
  onZoneClick?: (name: string) => void,
): ColumnDef<PanwSdwanInterface, unknown>[] {
  return [
    col.accessor("name", {
      header: "Interface",
      enableHiding: false,
      meta: { freezeColumn: true },
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
    }) as ColumnDef<PanwSdwanInterface, unknown>,

    col.accessor("linkTag", {
      header: "Link Tag",
      cell: (info) => info.getValue()
        ? <span className="font-mono">{info.getValue()}</span>
        : <span className="text-muted-foreground">—</span>,
    }) as ColumnDef<PanwSdwanInterface, unknown>,

    {
      id: "virtualRouter",
      header: "Virtual Router",
      enableSorting: true,
      accessorFn: (row) => ifaceToVirtualRouter.get(row.name) ?? "",
      cell: ({ row }) => <RouterCell name={ifaceToVirtualRouter.get(row.original.name)} onClick={onRouterClick} />,
    },

    {
      id: "logicalRouter",
      header: "Logical Router",
      enableSorting: true,
      accessorFn: (row) => ifaceToLogicalRouter.get(row.name) ?? "",
      cell: ({ row }) => <RouterCell name={ifaceToLogicalRouter.get(row.original.name)} onClick={onRouterClick} />,
    },

    {
      id: "securityZone",
      header: "Security Zone",
      enableSorting: true,
      meta: { freezeColumn: true },
      accessorFn: (row) => ifaceToZone.get(row.name) ?? "",
      cell: ({ row }) => {
        const zoneName = ifaceToZone.get(row.original.name)
        return <ZoneCell name={zoneName} color={zoneColorMap.get(zoneName ?? "")} onClick={onZoneClick} />
      },
    },

    {
      id: "interfaces",
      header: "Interfaces",
      enableSorting: false,
      cell: ({ row }) => {
        const ifaces = row.original.interfaces
        if (ifaces.length === 0) return <span className="text-muted-foreground">—</span>
        const linkTag = row.original.linkTag
        return (
          <div className="flex flex-col gap-0.5">
            {ifaces.map((i) => (
              <span key={i} className="font-mono">
                {i}{linkTag ? ` (Tag: ${linkTag})` : ""}
              </span>
            ))}
          </div>
        )
      },
    },

    col.accessor("comment", {
      header: "Comment",
      meta: { hidePriority: 1 },
      cell: (info) => info.getValue()
        ? <span className="text-muted-foreground">{info.getValue()}</span>
        : <span className="text-muted-foreground">—</span>,
    }) as ColumnDef<PanwSdwanInterface, unknown>,

    ...templateColumn<PanwSdwanInterface>(isPanorama, { hidePriority: 2 })
  ]
}

// ─── Dialog ──────────────────────────────────────────────────────────────────

function SdwanDialog({
  item,
  open,
  onOpenChange,
  ifaceToVirtualRouter,
  ifaceToLogicalRouter,
  ifaceToZone,
  onRouterClick,
}: {
  item: PanwSdwanInterface | null
  open: boolean
  onOpenChange: (o: boolean) => void
  ifaceToVirtualRouter: Map<string, string>
  ifaceToLogicalRouter: Map<string, string>
  ifaceToZone: Map<string, string>
  onRouterClick?: (name: string) => void
}) {
  if (!item) return null

  return (
    <DetailDialog title="SD-WAN Interface" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-2xl">
      <DisplayField label="Interface Name" value={item.name} />
      <DisplayField label="Comment" value={item.comment ?? "None"} />
      <DisplayField label="Link Tag" value={item.linkTag ?? "None"} />
      <DisplayField label="Protocol" value={item.protocol ?? "None"} />

      <Tabs defaultValue="config" className="mt-3 flex flex-col">
        <div className="shrink-0 border-b">
          <TabsList variant="line">
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="config" className="pt-3">
          <Fieldset>
            <FieldsetLegend>Assign Interface To</FieldsetLegend>
            <FieldsetContent>
              <div className="flex items-center gap-2">
                <span className="w-32 shrink-0 font-medium text-foreground">Virtual Router</span>
                <RouterCell name={ifaceToVirtualRouter.get(item.name)} onClick={onRouterClick} />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-32 shrink-0 font-medium text-foreground">Logical Router</span>
                <RouterCell name={ifaceToLogicalRouter.get(item.name)} onClick={onRouterClick} />
              </div>
              <DisplayField label="Security Zone" value={ifaceToZone.get(item.name) ?? "None"} />
            </FieldsetContent>
          </Fieldset>
        </TabsContent>

        <TabsContent value="advanced" className="pt-3">
          <Fieldset>
            <FieldsetLegend>Interface Group</FieldsetLegend>
            <FieldsetContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px]">INTERFACES</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {item.interfaces.length === 0 ? (
                      <TableRow>
                        <TableCell className="py-6 text-center text-muted-foreground">
                          No interfaces configured.
                        </TableCell>
                      </TableRow>
                    ) : item.interfaces.map((iface) => (
                      <TableRow key={iface}>
                        <TableCell className="font-mono">
                          {iface}{item.linkTag ? ` (Link Tag: ${item.linkTag})` : ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </FieldsetContent>
          </Fieldset>
        </TabsContent>
      </Tabs>
    </DetailDialog>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SdwanTab({
  data,
  isPanorama,
  ifaceToVirtualRouter,
  ifaceToLogicalRouter,
  hasVirtualRouters,
  hasLogicalRouters,
  ifaceToZone,
  zoneColorMap,
  onRouterClick,
  onZoneClick,
}: {
  data: PanwSdwanInterface[]
  isPanorama: boolean
  ifaceToVirtualRouter: Map<string, string>
  ifaceToLogicalRouter: Map<string, string>
  hasVirtualRouters: boolean
  hasLogicalRouters: boolean
  ifaceToZone: Map<string, string>
  zoneColorMap: Map<string, string>
  onRouterClick?: (name: string) => void
  onZoneClick?: (name: string) => void
}) {
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwSdwanInterface | null>(null)
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    virtualRouter: hasVirtualRouters,
    logicalRouter: hasLogicalRouters,
  })

  const columns = React.useMemo(
    () => buildColumns(isPanorama, ifaceToVirtualRouter, ifaceToLogicalRouter, ifaceToZone, zoneColorMap, setSelected, onRouterClick, onZoneClick),
    [isPanorama, ifaceToVirtualRouter, ifaceToLogicalRouter, ifaceToZone, zoneColorMap, onRouterClick, onZoneClick],
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: search, columnVisibility },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
  })

  return (
    <>
      <DataTable table={table} title="SD-WAN Interfaces" search={search} onSearch={setSearch} />
      <SdwanDialog
        item={selected}
        open={selected !== null}
        onOpenChange={(open) => { if (!open) setSelected(null) }}
        ifaceToVirtualRouter={ifaceToVirtualRouter}
        ifaceToLogicalRouter={ifaceToLogicalRouter}
        ifaceToZone={ifaceToZone}
        onRouterClick={onRouterClick}
      />
    </>
  )
}
