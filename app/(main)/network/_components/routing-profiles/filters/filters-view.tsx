// @/app/(main)/network/_components/routing-profiles/filters/filters-view.tsx

"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"

import { Badge, type BadgeVariant } from "@/components/ui/badge"
import { Accordion } from "@/components/ui/accordion"

import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"

import type {
  PanwAccessList,
  PanwPrefixList,
  PanwCommunityList,
  PanwAsPathAccessList,
  PanwBgpRouteMap,
  PanwRedistRouteMap,
} from "@/lib/panw-parser/routing-profiles"

import { ProfileSection, useSectionTable } from "../_shared"

import { PrefixListDialog } from "./prefix-list/prefix-list-dialog"
import { CommunityListDialog } from "./community-list/community-list-dialog"
import { AsPathAccessListDialog } from "./as-path-access-list/as-path-access-list-dialog"
import { AccessListDialog } from "./access-list/access-list-dialog"
import { RedistRouteMapDialog } from "./route-maps-redistribution/route-maps-redist-dialog"
import { BgpRouteMapDialog } from "./route-maps-bgp/route-maps-bgp-dialog"

// ─── Color maps ───────────────────────────────────────────────────────────────

const PROTOCOL_COLORS: Record<string, BadgeVariant> = {
  ipv4: "blue",
  ipv6: "purple",
}

const COMMUNITY_TYPE_COLORS: Record<string, BadgeVariant> = {
  regular:  "blue",
  extended: "violet",
  large:    "cyan",
}

// ─── Shared cell renderers ───────────────────────────────────────────────────

function NameButton<T>({ value, row, onClick }: { value: string; row: T; onClick: (row: T) => void }) {
  return (
    <button
      type="button"
      className="font-medium text-foreground hover:underline cursor-pointer"
      onClick={() => onClick(row)}
    >
      {value}
    </button>
  )
}

function DescriptionCell({ value }: { value: string | null }) {
  return value
    ? <span className="text-xs text-muted-foreground">{value}</span>
    : <span className="text-muted-foreground text-xs">—</span>
}

function TemplateCell({ value }: { value: string | null }) {
  return value
    ? <span className="text-xs">{value}</span>
    : <span className="text-muted-foreground text-xs">—</span>
}

// ─── Generic template column ─────────────────────────────────────────────────

function templateColumn<T extends { templateName: string | null }>(): ColumnDef<T, unknown> {
  return {
    id: "template",
    header: "Template",
    enableSorting: true,
    accessorFn: (row) => row.templateName ?? "",
    cell: ({ row }) => <TemplateCell value={row.original.templateName} />,
  }
}

// ─── Building block column builders ──────────────────────────────────────────

function buildAccessListColumns(
  isPanorama: boolean,
  onNameClick: (item: PanwAccessList) => void
): ColumnDef<PanwAccessList, unknown>[] {
  return [
    {
      id: "name", header: "Name", enableSorting: true, accessorFn: (row) => row.name,
      cell: ({ row }) => <NameButton value={row.original.name} row={row.original} onClick={onNameClick} />,
    },
    {
      id: "description", header: "Description", enableSorting: false, accessorFn: (row) => row.description ?? "",
      cell: ({ row }) => <DescriptionCell value={row.original.description} />,
    },
    {
      id: "protocol", header: "Protocol", enableSorting: true, accessorFn: (row) => row.type,
      cell: ({ row }) => <Badge variant={PROTOCOL_COLORS[row.original.type] ?? "muted"} size="sm">{row.original.type}</Badge>,
    },
    ...(isPanorama ? [templateColumn<PanwAccessList>()] : []),
  ]
}

function buildPrefixListColumns(
  isPanorama: boolean,
  onNameClick: (item: PanwPrefixList) => void
): ColumnDef<PanwPrefixList, unknown>[] {
  return [
    {
      id: "name", header: "Name", enableSorting: true, accessorFn: (row) => row.name,
      cell: ({ row }) => <NameButton value={row.original.name} row={row.original} onClick={onNameClick} />,
    },
    {
      id: "description", header: "Description", enableSorting: false, accessorFn: (row) => row.description ?? "",
      cell: ({ row }) => <DescriptionCell value={row.original.description} />,
    },
    {
      id: "protocol", header: "Protocol", enableSorting: true, accessorFn: (row) => row.type,
      cell: ({ row }) => <Badge variant={PROTOCOL_COLORS[row.original.type] ?? "muted"} size="sm">{row.original.type}</Badge>,
    },
    ...(isPanorama ? [templateColumn<PanwPrefixList>()] : []),
  ]
}

function buildAsPathColumns(
  isPanorama: boolean,
  onNameClick: (item: PanwAsPathAccessList) => void
): ColumnDef<PanwAsPathAccessList, unknown>[] {
  return [
    {
      id: "name", header: "Name", enableSorting: true, accessorFn: (row) => row.name,
      cell: ({ row }) => <NameButton value={row.original.name} row={row.original} onClick={onNameClick} />,
    },
    {
      id: "description", header: "Description", enableSorting: false, accessorFn: (row) => row.description ?? "",
      cell: ({ row }) => <DescriptionCell value={row.original.description} />,
    },
    ...(isPanorama ? [templateColumn<PanwAsPathAccessList>()] : []),
  ]
}

function buildCommunityListColumns(
  isPanorama: boolean,
  onNameClick: (item: PanwCommunityList) => void
): ColumnDef<PanwCommunityList, unknown>[] {
  return [
    {
      id: "name", header: "Name", enableSorting: true, accessorFn: (row) => row.name,
      cell: ({ row }) => <NameButton value={row.original.name} row={row.original} onClick={onNameClick} />,
    },
    {
      id: "description", header: "Description", enableSorting: false, accessorFn: (row) => row.description ?? "",
      cell: ({ row }) => <DescriptionCell value={row.original.description} />,
    },
    {
      id: "type", header: "Type", enableSorting: true, accessorFn: (row) => row.type,
      cell: ({ row }) => <Badge variant={COMMUNITY_TYPE_COLORS[row.original.type] ?? "muted"} size="sm">{row.original.type}</Badge>,
    },
    ...(isPanorama ? [templateColumn<PanwCommunityList>()] : []),
  ]
}

// ─── Route map column builders ───────────────────────────────────────────────

function buildBgpRouteMapColumns(
  isPanorama: boolean,
  onNameClick: (item: PanwBgpRouteMap) => void
): ColumnDef<PanwBgpRouteMap, unknown>[] {
  return [
    {
      id: "name", header: "Name", enableSorting: true, accessorFn: (row) => row.name,
      cell: ({ row }) => <NameButton value={row.original.name} row={row.original} onClick={onNameClick} />,
    },
    {
      id: "description", header: "Description", enableSorting: false, accessorFn: (row) => row.description ?? "",
      cell: ({ row }) => <DescriptionCell value={row.original.description} />,
    },
    ...(isPanorama ? [templateColumn<PanwBgpRouteMap>()] : []),
  ]
}

const SOURCE_PROTOCOL_LABELS: Record<string, string> = {
  "connected-static": "Connected Static",
  rip: "RIP",
  bgp: "BGP",
  ospf: "OSPF",
  ospfv3: "OSPFv3",
}

const DEST_PROTOCOL_LABELS: Record<string, string> = {
  ospf: "OSPF",
  bgp: "BGP",
  ospfv3: "OSPFv3",
  rip: "RIP",
  rib: "RIB",
}

function buildRedistRouteMapColumns(
  isPanorama: boolean,
  onNameClick: (item: PanwRedistRouteMap) => void
): ColumnDef<PanwRedistRouteMap, unknown>[] {
  return [
    {
      id: "name", header: "Name", enableSorting: true, accessorFn: (row) => row.name,
      cell: ({ row }) => <NameButton value={row.original.name} row={row.original} onClick={onNameClick} />,
    },
    {
      id: "description", header: "Description", enableSorting: false, accessorFn: (row) => row.description ?? "",
      cell: ({ row }) => <DescriptionCell value={row.original.description} />,
    },
    {
      id: "sourceProtocol", header: "Source Protocol", enableSorting: true,
      accessorFn: (row) => row.sourceProtocol,
      cell: ({ row }) => (
        <span className="text-xs font-medium">
          {SOURCE_PROTOCOL_LABELS[row.original.sourceProtocol] ?? row.original.sourceProtocol}
        </span>
      ),
    },
    {
      id: "destProtocol", header: "Dest Protocol", enableSorting: true,
      accessorFn: (row) => row.destProtocol,
      cell: ({ row }) => (
        <span className="text-xs font-medium">
          {DEST_PROTOCOL_LABELS[row.original.destProtocol] ?? row.original.destProtocol}
        </span>
      ),
    },
    ...(isPanorama ? [templateColumn<PanwRedistRouteMap>()] : []),
  ]
}

// ─── Section keys ─────────────────────────────────────────────────────────────

const SECTIONS = {
  accessLists: "accessLists",
  prefixLists: "prefixLists",
  asPathAccessLists: "asPathAccessLists",
  communityLists: "communityLists",
  bgpRouteMaps: "bgpRouteMaps",
  redistRouteMaps: "redistRouteMaps",
} as const

const ALL_SECTION_VALUES = Object.values(SECTIONS)

// ─── Main component ──────────────────────────────────────────────────────────

export function FiltersView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  // Dialog state — building blocks
  const [accessListDialog, setAccessListDialog] = React.useState<PanwAccessList | null>(null)
  const [prefixListDialog, setPrefixListDialog] = React.useState<PanwPrefixList | null>(null)
  const [communityListDialog, setCommunityListDialog] = React.useState<PanwCommunityList | null>(null)
  const [asPathDialog, setAsPathDialog] = React.useState<PanwAsPathAccessList | null>(null)

  // Dialog state — route maps
  const [bgpRouteMapDialog, setBgpRouteMapDialog] = React.useState<PanwBgpRouteMap | null>(null)
  const [redistRouteMapDialog, setRedistRouteMapDialog] = React.useState<PanwRedistRouteMap | null>(null)

  const filters = React.useMemo(() => {
    if (!activeConfig) return null
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).routingFilters
  }, [activeConfig, selectedScope])

  // Build columns — building blocks
  const accessListCols = React.useMemo(() => buildAccessListColumns(isPanorama, setAccessListDialog), [isPanorama])
  const prefixListCols = React.useMemo(() => buildPrefixListColumns(isPanorama, setPrefixListDialog), [isPanorama])
  const communityListCols = React.useMemo(() => buildCommunityListColumns(isPanorama, setCommunityListDialog), [isPanorama])
  const asPathCols = React.useMemo(() => buildAsPathColumns(isPanorama, setAsPathDialog), [isPanorama])

  // Build columns — route maps
  const bgpRouteMapCols = React.useMemo(() => buildBgpRouteMapColumns(isPanorama, setBgpRouteMapDialog), [isPanorama])
  const redistRouteMapCols = React.useMemo(() => buildRedistRouteMapColumns(isPanorama, setRedistRouteMapDialog), [isPanorama])

  // Create tables — building blocks
  const accessListTable = useSectionTable(filters?.accessLists ?? [], accessListCols)
  const prefixListTable = useSectionTable(filters?.prefixLists ?? [], prefixListCols)
  const communityListTable = useSectionTable(filters?.communityLists ?? [], communityListCols)
  const asPathTable = useSectionTable(filters?.asPathAccessLists ?? [], asPathCols)

  // Create tables — route maps
  const bgpRouteMapTable = useSectionTable(filters?.bgpRouteMaps ?? [], bgpRouteMapCols)
  const redistRouteMapTable = useSectionTable(filters?.redistRouteMaps ?? [], redistRouteMapCols)

  const totalFilters =
    (filters?.accessLists.length ?? 0) +
    (filters?.prefixLists.length ?? 0) +
    (filters?.communityLists.length ?? 0) +
    (filters?.asPathAccessLists.length ?? 0) +
    (filters?.bgpRouteMaps.length ?? 0) +
    (filters?.redistRouteMaps.length ?? 0)

  return (
    <div className="flex h-full flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Routing Filters</h2>
          <Badge variant="secondary" size="sm" className="tabular-nums">
            {totalFilters}
          </Badge>
        </div>
      </div>

      {/* Accordion sections — order matches PAN-OS GUI */}
      <div className="flex-1 overflow-y-auto p-4">
        <Accordion multiple defaultValue={ALL_SECTION_VALUES} className="gap-3">
          <ProfileSection value={SECTIONS.accessLists} title="Filters Access List" count={filters?.accessLists.length ?? 0} table={accessListTable} />
          <ProfileSection value={SECTIONS.prefixLists} title="Filters Prefix List" count={filters?.prefixLists.length ?? 0} table={prefixListTable} />
          <ProfileSection value={SECTIONS.asPathAccessLists} title="Filters AS Path Access List" count={filters?.asPathAccessLists.length ?? 0} table={asPathTable} />
          <ProfileSection value={SECTIONS.communityLists} title="Filters Community List" count={filters?.communityLists.length ?? 0} table={communityListTable} />
          <ProfileSection value={SECTIONS.bgpRouteMaps} title="Filters Route Maps BGP" count={filters?.bgpRouteMaps.length ?? 0} table={bgpRouteMapTable} />
          <ProfileSection value={SECTIONS.redistRouteMaps} title="Filters Route Maps Redistribution" count={filters?.redistRouteMaps.length ?? 0} table={redistRouteMapTable} />
        </Accordion>
      </div>

      {/* Dialogs — building blocks */}
      <AccessListDialog
        item={accessListDialog}
        open={accessListDialog !== null}
        onOpenChange={(open) => { if (!open) setAccessListDialog(null) }}
      />
      <PrefixListDialog
        item={prefixListDialog}
        open={prefixListDialog !== null}
        onOpenChange={(open) => { if (!open) setPrefixListDialog(null) }}
      />
      <CommunityListDialog
        item={communityListDialog}
        open={communityListDialog !== null}
        onOpenChange={(open) => { if (!open) setCommunityListDialog(null) }}
      />
      <AsPathAccessListDialog
        item={asPathDialog}
        open={asPathDialog !== null}
        onOpenChange={(open) => { if (!open) setAsPathDialog(null) }}
      />

      {/* Dialogs — route maps */}
      <BgpRouteMapDialog
        item={bgpRouteMapDialog}
        open={bgpRouteMapDialog !== null}
        onOpenChange={(open) => { if (!open) setBgpRouteMapDialog(null) }}
      />
      <RedistRouteMapDialog
        item={redistRouteMapDialog}
        open={redistRouteMapDialog !== null}
        onOpenChange={(open) => { if (!open) setRedistRouteMapDialog(null) }}
      />
    </div>
  )
}
