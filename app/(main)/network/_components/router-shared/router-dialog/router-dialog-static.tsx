// @/app/(main)/network/_components/router-shared/router-dialog/router-dialog-static.tsx
//
// Static Routes page for the RouterDialog — shows IPv4 and IPv6
// static routes in separate tabs with sortable columns matching
// the PAN-OS GUI layout.

"use client"

import * as React from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SortHeader } from "@/components/ui/sort-header"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { MonoValue } from "@/app/(main)/_components/ui/category-shell"
import type { RouterDialogPageProps } from "./router-dialog-general"
import type { PanwStaticRoute } from "@/lib/panw-parser/types"

// ─── Nexthop type labels ──────────────────────────────────────────────────────

const NEXTHOP_TYPE_LABELS: Record<string, string> = {
  "ip-address":  "IP Address",
  "ipv6-address": "IP Address",
  "next-vr":     "Next VR",
  "next-lr":     "Next LR",
  "fqdn":        "FQDN",
  "discard":     "Discard",
  "none":        "None",
}

// ─── Column builder ──────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<PanwStaticRoute>()

function buildColumns(protocol: "ipv4" | "ipv6"): ColumnDef<PanwStaticRoute, unknown>[] {
  return [
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => <span className="font-medium text-xs">{info.getValue()}</span>,
    }) as ColumnDef<PanwStaticRoute, unknown>,

    columnHelper.accessor("destination", {
      header: "Destination",
      cell: (info) => <MonoValue className="text-xs">{info.getValue()}</MonoValue>,
    }) as ColumnDef<PanwStaticRoute, unknown>,

    {
      id: "interface",
      header: "Interface",
      enableSorting: true,
      accessorFn: (row) => row.interface ?? "",
      cell: ({ row }) => row.original.interface
        ? <MonoValue className="text-xs">{row.original.interface}</MonoValue>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    // IPv4 shows Type + Value as separate columns (matching PAN-OS "Next Hop" group)
    // IPv6 shows a single "Next Hop" column
    ...(protocol === "ipv4" ? [
      {
        id: "nexthopType",
        header: "Type",
        enableSorting: true,
        accessorFn: (row: PanwStaticRoute) => row.nexthopType,
        cell: ({ row }: { row: { original: PanwStaticRoute } }) => (
          <span className="text-xs">
            {NEXTHOP_TYPE_LABELS[row.original.nexthopType] ?? row.original.nexthopType}
          </span>
        ),
      } as ColumnDef<PanwStaticRoute, unknown>,
      {
        id: "nexthopValue",
        header: "Value",
        enableSorting: true,
        accessorFn: (row: PanwStaticRoute) => row.nexthop ?? "",
        cell: ({ row }: { row: { original: PanwStaticRoute } }) => row.original.nexthop
          ? <MonoValue className="text-xs">{row.original.nexthop}</MonoValue>
          : <span className="text-muted-foreground text-xs">—</span>,
      } as ColumnDef<PanwStaticRoute, unknown>,
    ] : [
      {
        id: "nexthop",
        header: "Next Hop",
        enableSorting: true,
        accessorFn: (row: PanwStaticRoute) => row.nexthop ?? row.nexthopType,
        cell: ({ row }: { row: { original: PanwStaticRoute } }) => {
          const { nexthopType, nexthop } = row.original
          if (nexthop) return <MonoValue className="text-xs">{nexthopType !== "none" ? `${NEXTHOP_TYPE_LABELS[nexthopType] ?? nexthopType}: ${nexthop}` : nexthop}</MonoValue>
          if (nexthopType !== "none") return <span className="text-xs">{NEXTHOP_TYPE_LABELS[nexthopType] ?? nexthopType}</span>
          return <span className="text-muted-foreground text-xs">—</span>
        },
      } as ColumnDef<PanwStaticRoute, unknown>,
    ]),

    {
      id: "adminDistance",
      header: "Admin Distance",
      enableSorting: true,
      accessorFn: (row) => row.adminDistance ?? -1,
      cell: ({ row }) => row.original.adminDistance !== null
        ? <span className="tabular-nums text-xs font-medium">{row.original.adminDistance}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "metric",
      header: "Metric",
      enableSorting: true,
      accessorFn: (row) => row.metric ?? 0,
      cell: ({ row }) => row.original.metric !== null
        ? <span className="tabular-nums text-xs font-medium">{row.original.metric}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "bfdProfile",
      header: "BFD Profile",
      enableSorting: true,
      accessorFn: (row) => row.bfdProfile ?? "",
      cell: ({ row }) => row.original.bfdProfile
        ? <span className="text-xs">{row.original.bfdProfile}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "pathMonitorEnabled",
      header: "Path Monitor Enable",
      enableSorting: true,
      accessorFn: (row) => row.pathMonitorEnabled ? "true" : "false",
      cell: ({ row }) => (
        <span className="text-xs">{row.original.pathMonitorEnabled ? "true" : "false"}</span>
      ),
    },

    {
      id: "failureCondition",
      header: "Failure Condition",
      enableSorting: true,
      accessorFn: (row) => row.pathMonitorFailureCondition ?? "",
      cell: ({ row }) => row.original.pathMonitorFailureCondition
        ? <span className="text-xs">{row.original.pathMonitorFailureCondition}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "holdTime",
      header: "Preemptive Hold Time (min)",
      enableSorting: true,
      accessorFn: (row) => row.pathMonitorHoldTime ?? 0,
      cell: ({ row }) => row.original.pathMonitorHoldTime !== null
        ? <span className="tabular-nums text-xs">{row.original.pathMonitorHoldTime}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "monitorDestinations",
      header: "Monitor Destinations",
      enableSorting: true,
      accessorFn: (row) => (row.monitorDestinations ?? []).length,
      cell: ({ row }) => {
        const dests = row.original.monitorDestinations ?? []
        if (dests.length === 0) return <span className="text-muted-foreground text-xs">—</span>
        return (
          <div className="flex flex-col gap-1">
            {dests.map((d) => (
              <div key={d.name} className="text-xs space-y-0.5">
                <div>
                  <span className="font-medium">{d.name}</span>
                  {d.enabled && <span className="text-muted-foreground"> Enable: yes</span>}
                </div>
                {d.source && (
                  <div className="text-muted-foreground">Source IP: <span className="text-foreground">{d.source}</span></div>
                )}
                {d.sourceOverride && (
                  <div className="text-muted-foreground">Source Override: <span className="text-foreground">{d.sourceOverride}</span></div>
                )}
                {d.destinationIp && (
                  <div className="text-muted-foreground">Dest IP: <span className="text-foreground font-mono">{d.destinationIp}</span></div>
                )}
                {d.destinationFqdn && (
                  <div className="text-muted-foreground">Dest FQDN: <span className="text-foreground font-mono">{d.destinationFqdn}</span></div>
                )}
                {(d.interval !== null || d.count !== null) && (
                  <div className="text-muted-foreground">
                    {d.interval !== null && <>Ping Interval: <span className="text-foreground">{d.interval}</span> </>}
                    {d.count !== null && <>Ping Count: <span className="text-foreground">{d.count}</span></>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      },
    },
  ]
}

// ─── Route table sub-component ────────────────────────────────────────────────

function RouteTable({
  routes,
  protocol,
}: {
  routes: PanwStaticRoute[]
  protocol: "ipv4" | "ipv6"
}) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [search, setSearch] = React.useState("")

  const columns = React.useMemo(() => buildColumns(protocol), [protocol])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: routes,
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
    <div className="flex flex-col h-full min-h-0">
      {/* Search + count */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 w-48 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <span className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} item{table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs">
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <SortHeader
                        label={typeof header.column.columnDef.header === "string" ? header.column.columnDef.header : ""}
                        column={header.column}
                      />
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-xs text-muted-foreground">
                  {search ? "No matching routes" : "No static routes configured"}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-1.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// ─── Static Page (exported) ───────────────────────────────────────────────────

export function StaticPage({ router }: RouterDialogPageProps) {
  return (
    <Tabs defaultValue="ipv4" className="flex h-full flex-col min-h-0">
      <div className="shrink-0 border-b px-4">
        <TabsList variant="line">
          <TabsTrigger value="ipv4">IPv4</TabsTrigger>
          <TabsTrigger value="ipv6">IPv6</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="ipv4" className="flex-1 min-h-0">
        <RouteTable routes={router.staticRoutes ?? []} protocol="ipv4" />
      </TabsContent>

      <TabsContent value="ipv6" className="flex-1 min-h-0">
        <RouteTable routes={router.staticRoutesV6 ?? []} protocol="ipv6" />
      </TabsContent>
    </Tabs>
  )
}
