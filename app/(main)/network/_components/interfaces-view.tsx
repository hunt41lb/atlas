// @/app/(main)/network/_components/interfaces-view.tsx

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
import { ChevronDown, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { CategoryShell, TypeBadge, MonoValue } from "@/app/(main)/_components/ui/category-shell"
import { cn } from "@/lib/utils"
import type { PanwInterface, PanwSubInterface, PanwVirtualRouter, PanwZone } from "@/lib/panw-parser/types"

// ─── Lookup map builders ──────────────────────────────────────────────────────

function buildIfaceToRouter(routers: PanwVirtualRouter[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const router of routers) {
    for (const iface of router.interfaces) {
      if (iface) map.set(iface, router.name)
    }
  }
  return map
}

function buildIfaceToZone(zones: PanwZone[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const zone of zones) {
    for (const iface of zone.interfaces) {
      if (iface) map.set(iface, zone.name)
    }
  }
  return map
}

// ─── Cell helpers ─────────────────────────────────────────────────────────────

function InterfaceTypeBadge({ iface }: { iface: PanwInterface }) {
  if (iface.aggregateGroup) {
    return (
      <TypeBadge
        label={`Aggregate (${iface.aggregateGroup})`}
        className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
      />
    )
  }
  if (iface.type === "ae") {
    return (
      <TypeBadge
        label="Layer3"
        className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
      />
    )
  }
  return <TypeBadge label={iface.type} />
}

function ModeBadge({ mode }: { mode: string }) {
  if (mode === "none") return <span className="text-muted-foreground text-xs">—</span>
  const colors: Record<string, string> = {
    layer3: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    layer2: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    tap:    "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    ha:     "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  }
  return (
    <span className={cn(
      "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium",
      colors[mode] ?? "bg-muted/40 text-muted-foreground border-border"
    )}>
      {mode}
    </span>
  )
}

function IpCell({ iface }: { iface: PanwInterface }) {
  if (iface.dhcpClient) {
    return (
      <span className="inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20">
        Dynamic-DHCP Client
      </span>
    )
  }
  if (iface.ipAddresses.length === 0) {
    return <span className="text-muted-foreground text-xs">—</span>
  }
  return (
    <div className="flex flex-col gap-0.5">
      {iface.ipAddresses.map((ip) => (
        <MonoValue key={ip} className="text-xs">{ip}</MonoValue>
      ))}
    </div>
  )
}

function TagCell() {
  // Parent interfaces are always untagged; sub-interfaces carry the VLAN tag
  return <span className="text-xs text-muted-foreground">Untagged</span>
}

function RouterCell({ name }: { name: string | undefined }) {
  if (!name) return <span className="text-muted-foreground text-xs">—</span>
  return <span className="text-xs font-medium">{name}</span>
}

function ZoneCell({ name }: { name: string | undefined }) {
  if (!name) return <span className="text-muted-foreground text-xs">none</span>
  return <span className="text-xs font-medium">{name}</span>
}

function SortHeader({
  label,
  column,
}: {
  label: string
  column: { getIsSorted: () => false | "asc" | "desc"; toggleSorting: (desc?: boolean) => void }
}) {
  const sorted = column.getIsSorted()
  return (
    <button
      className="flex items-center gap-1 hover:text-foreground transition-colors"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {label}
      {sorted === "asc"  ? <ArrowUp className="size-3" /> :
       sorted === "desc" ? <ArrowDown className="size-3" /> :
       <ArrowUpDown className="size-3 opacity-40" />}
    </button>
  )
}

// ─── Sub-interface rows ───────────────────────────────────────────────────────

function SubInterfaceRows({
  subs,
  isPanorama,
  templateName,
  ifaceToZone,
  ifaceToRouter,
}: {
  subs: PanwSubInterface[]
  isPanorama: boolean
  templateName: string | null
  ifaceToZone: Map<string, string>
  ifaceToRouter: Map<string, string>
}) {
  return (
    <>
      {subs.map((sub) => (
        <TableRow key={sub.name} className="bg-muted/20 hover:bg-muted/40 border-border/50">
          {/* Indent/expand placeholder */}
          <TableCell className="w-8 pl-8 pr-0">
            <div className="size-3.5 border border-dashed border-border/50 rounded-sm" />
          </TableCell>
          {/* Name */}
          <TableCell className="pl-2">
            <span className="text-muted-foreground mr-1 text-xs">↳</span>
            <span className="font-medium text-sm">{sub.name}</span>
          </TableCell>
          {/* Interface Type */}
          <TableCell>
            <TypeBadge label="sub-if" className="text-[10px]" />
          </TableCell>
          {/* Mode */}
          <TableCell><ModeBadge mode="layer3" /></TableCell>
          {/* Mgmt Profile */}
          <TableCell>
            {sub.managementProfile
              ? <span className="text-xs">{sub.managementProfile}</span>
              : <span className="text-muted-foreground text-xs">—</span>}
          </TableCell>
          {/* IP Address */}
          <TableCell>
            {sub.ipAddresses.length > 0
              ? <div className="flex flex-col gap-0.5">
                  {sub.ipAddresses.map((ip) => (
                    <MonoValue key={ip} className="text-xs">{ip}</MonoValue>
                  ))}
                </div>
              : <span className="text-muted-foreground text-xs">—</span>}
          </TableCell>
          {/* Sub-ifs count — n/a */}
          <TableCell />
          {/* Aggregate Group — n/a */}
          <TableCell />
          {/* Tag */}
          <TableCell>
            {sub.tag !== null
              ? <span className="text-xs font-mono">{sub.tag}</span>
              : <span className="text-muted-foreground text-xs">Untagged</span>}
          </TableCell>
          {/* Logical/Virtual Router */}
          <TableCell><RouterCell name={ifaceToRouter.get(sub.name)} /></TableCell>
          {/* Security Zone */}
          <TableCell><ZoneCell name={ifaceToZone.get(sub.name)} /></TableCell>
          {/* Template */}
          {isPanorama && (
            <TableCell>
              {templateName && <span className="text-xs text-muted-foreground">{templateName}</span>}
            </TableCell>
          )}
          {/* Comment */}
          <TableCell>
            {sub.comment
              ? <span className="text-xs text-muted-foreground">{sub.comment}</span>
              : <span className="text-muted-foreground text-xs">—</span>}
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

// ─── Column definitions ───────────────────────────────────────────────────────

const columnHelper = createColumnHelper<PanwInterface>()

function buildColumns(
  isPanorama: boolean,
  ifaceToRouter: Map<string, string>,
  ifaceToZone: Map<string, string>
): ColumnDef<PanwInterface, unknown>[] {
  return [
    { id: "expand", enableSorting: false, size: 32, cell: () => null },

    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }) as ColumnDef<PanwInterface, unknown>,

    {
      id: "interfaceType",
      header: "Interface Type",
      enableSorting: true,
      accessorFn: (row) => row.aggregateGroup
        ? `Aggregate (${row.aggregateGroup})`
        : row.type === "ae" ? "Layer3" : row.type,
      cell: ({ row }) => <InterfaceTypeBadge iface={row.original} />,
    },

    {
      id: "mode",
      header: "Mode",
      enableSorting: true,
      accessorFn: (row) => row.mode,
      cell: ({ row }) => <ModeBadge mode={row.original.mode} />,
    },

    columnHelper.accessor("managementProfile", {
      header: "Mgmt Profile",
      cell: (info) => info.getValue()
        ? <span className="text-xs">{info.getValue()}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    }) as ColumnDef<PanwInterface, unknown>,

    {
      id: "ipAddresses",
      header: "IP Address",
      enableSorting: false,
      cell: ({ row }) => <IpCell iface={row.original} />,
    },

    {
      id: "subIfCount",
      header: "Sub-ifs",
      enableSorting: true,
      accessorFn: (row) => row.subInterfaces.length,
      cell: ({ row }) => {
        const count = row.original.subInterfaces.length
        return count > 0
          ? <span className="tabular-nums text-xs font-medium">{count}</span>
          : <span className="text-muted-foreground text-xs">—</span>
      },
    },

    {
      id: "aggregateGroup",
      header: "Aggregate Group",
      enableSorting: true,
      accessorFn: (row) => row.aggregateGroup ?? "",
      cell: ({ row }) => row.original.aggregateGroup
        ? <MonoValue className="text-xs">{row.original.aggregateGroup}</MonoValue>
        : <span className="text-muted-foreground text-xs">—</span>,
    },

    {
      id: "tag",
      header: "Tag",
      enableSorting: false,
      cell: () => <TagCell />,
    },

    {
      id: "logicalRouter",
      header: "Logical Router",
      enableSorting: true,
      accessorFn: (row) => ifaceToRouter.get(row.name) ?? "",
      cell: ({ row }) => <RouterCell name={ifaceToRouter.get(row.original.name)} />,
    },

    {
      id: "securityZone",
      header: "Security Zone",
      enableSorting: true,
      accessorFn: (row) => ifaceToZone.get(row.name) ?? "",
      cell: ({ row }) => <ZoneCell name={ifaceToZone.get(row.original.name)} />,
    },

    ...(isPanorama ? [{
      id: "template",
      header: "Template",
      enableSorting: true,
      accessorFn: (row: PanwInterface) => row.templateName ?? "",
      cell: ({ row }: { row: { original: PanwInterface } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwInterface, unknown>] : []),

    columnHelper.accessor("comment", {
      header: "Comment",
      cell: (info) => info.getValue()
        ? <span className="text-xs text-muted-foreground">{info.getValue()}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    }) as ColumnDef<PanwInterface, unknown>,
  ]
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function InterfacesView() {
  "use no memo"

  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set())
  const expandedInitialized = React.useRef(false)

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const { interfaces, zones, virtualRouters, logicalRouters } = React.useMemo(() => {
    if (!activeConfig) return { interfaces: [], zones: [], virtualRouters: [], logicalRouters: [] }
    const data = resolveNetworkData(activeConfig.parsedConfig, selectedScope)
    return {
      interfaces:     data.interfaces     ?? [],
      zones:          data.zones          ?? [],
      virtualRouters: data.virtualRouters ?? [],
      logicalRouters: data.logicalRouters ?? [],
    }
  }, [activeConfig, selectedScope])

  // Build lookup maps: interface name → router name, interface name → zone name
  const ifaceToRouter = React.useMemo(
    () => buildIfaceToRouter([...virtualRouters, ...logicalRouters]),
    [virtualRouters, logicalRouters]
  )

  const ifaceToZone = React.useMemo(
    () => buildIfaceToZone(zones),
    [zones]
  )

  // Default all rows with sub-interfaces to expanded on first load
  React.useEffect(() => {
    if (interfaces.length > 0 && !expandedInitialized.current) {
      expandedInitialized.current = true
      setExpandedRows(new Set(
        interfaces
          .filter((i) => i.subInterfaces.length > 0)
          .map((i) => `${i.templateName ?? "fw"}-${i.name}`)
      ))
    }
  }, [interfaces])

  const columns = React.useMemo(
    () => buildColumns(isPanorama, ifaceToRouter, ifaceToZone),
    [isPanorama, ifaceToRouter, ifaceToZone]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: interfaces,
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
  })

  const rows = table.getRowModel().rows

  function toggleRow(key: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(key)) { next.delete(key) } else { next.add(key) }
      return next
    })
  }

  return (
    <CategoryShell
      title="Interfaces"
      count={rows.length}
      search={search}
      onSearch={setSearch}
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="hover:bg-transparent border-b border-border">
              {hg.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap px-3 h-9"
                  style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                >
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <SortHeader
                      label={String(header.column.columnDef.header ?? "")}
                      column={header.column}
                    />
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-16 text-center text-sm text-muted-foreground"
              >
                {search
                  ? `No results matching "${search}"`
                  : "No interfaces found in this configuration."}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const iface = row.original
              const rowKey = `${iface.templateName ?? "fw"}-${iface.name}`
              const hasSubIfs = iface.subInterfaces.length > 0
              const isExpanded = expandedRows.has(rowKey)

              return (
                <React.Fragment key={rowKey}>
                  <TableRow className={cn(
                    "transition-colors",
                    hasSubIfs && isExpanded && "border-b-0"
                  )}>
                    {/* Expand toggle */}
                    <TableCell className="w-8 px-2">
                      {hasSubIfs ? (
                        <button
                          onClick={() => toggleRow(rowKey)}
                          className="flex items-center justify-center size-5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded
                            ? <ChevronDown className="size-3.5" />
                            : <ChevronRight className="size-3.5" />}
                        </button>
                      ) : (
                        <div className="size-5" />
                      )}
                    </TableCell>

                    {row.getVisibleCells().slice(1).map((cell) => (
                      <TableCell key={cell.id} className="px-3 py-2 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>

                  {hasSubIfs && isExpanded && (
                    <SubInterfaceRows
                      subs={iface.subInterfaces}
                      isPanorama={isPanorama}
                      templateName={iface.templateName}
                      ifaceToZone={ifaceToZone}
                      ifaceToRouter={ifaceToRouter}
                    />
                  )}
                </React.Fragment>
              )
            })
          )}
        </TableBody>
      </Table>
    </CategoryShell>
  )
}
