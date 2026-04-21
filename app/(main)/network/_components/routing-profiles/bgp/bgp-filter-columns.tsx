// @/app/(main)/network/_components/routing-profiles/bgp/bgp-filter-columns.tsx

"use client"

import {
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import type { PanwBgpFilteringProfile } from "@/lib/panw-parser/network/routing-profiles"

// ─── Summary renderer ─────────────────────────────────────────────────────────

function FilterSummary({ sub }: { sub: PanwBgpFilteringProfile["ipv4Unicast"] }) {
  if (!sub) return <span className="text-muted-foreground text-xs">—</span>

  if (sub.inherit) return <Badge variant="blue" size="sm">Inherit</Badge>

  const items: string[] = []
  if (sub.conditionalAdvertExist) items.push("Cond Advert (Exist)")
  if (sub.conditionalAdvertNonExist) items.push("Cond Advert (Non-Exist)")
  if (sub.routeMapInbound) items.push(`In: ${sub.routeMapInbound}`)
  if (sub.routeMapOutbound) items.push(`Out: ${sub.routeMapOutbound}`)
  if (sub.unsuppressMap) items.push(`Unsuppress: ${sub.unsuppressMap}`)
  // New fields
  if (sub.filterListInbound) items.push(`FL In: ${sub.filterListInbound}`)
  if (sub.filterListOutbound) items.push(`FL Out: ${sub.filterListOutbound}`)
  if (sub.inboundDistributeList) items.push(`NF In (ACL): ${sub.inboundDistributeList}`)
  if (sub.inboundPrefixList) items.push(`NF In (PL): ${sub.inboundPrefixList}`)
  if (sub.outboundDistributeList) items.push(`NF Out (ACL): ${sub.outboundDistributeList}`)
  if (sub.outboundPrefixList) items.push(`NF Out (PL): ${sub.outboundPrefixList}`)

  if (items.length === 0) return <span className="text-muted-foreground text-xs">—</span>

  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <Badge key={item} variant="outline" size="sm">{item}</Badge>
      ))}
    </div>
  )
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const filterHelper = createColumnHelper<PanwBgpFilteringProfile>()

export function buildFilterColumns(
  isPanorama: boolean,
  onNameClick: (profile: PanwBgpFilteringProfile) => void,
): ColumnDef<PanwBgpFilteringProfile, unknown>[] {
  return [
    filterHelper.accessor("name", {
      header: "Name",
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
    }) as ColumnDef<PanwBgpFilteringProfile, unknown>,

    filterHelper.accessor("description", {
      header: "Description",
      meta: { hidePriority: 1 },
      cell: (info) => info.getValue()
        ? <span className="text-xs text-muted-foreground">{info.getValue()}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    }) as ColumnDef<PanwBgpFilteringProfile, unknown>,

    {
      id: "ipv4Unicast",
      header: "IPv4 Unicast",
      enableSorting: false,
      cell: ({ row }) => <FilterSummary sub={row.original.ipv4Unicast} />,
    },

    {
      id: "ipv4Multicast",
      header: "IPv4 Multicast",
      enableSorting: false,
      cell: ({ row }) => <FilterSummary sub={row.original.ipv4Multicast} />,
    },

    {
      id: "ipv6Unicast",
      header: "IPv6 Unicast",
      enableSorting: false,
      cell: ({ row }) => <FilterSummary sub={row.original.ipv6Unicast} />,
    },

    ...(isPanorama ? [{
      id: "template",
      header: "Template",
      enableSorting: true,
      meta: { hidePriority: 2 },
      accessorFn: (row: PanwBgpFilteringProfile) => row.templateName ?? "",
      cell: ({ row }: { row: { original: PanwBgpFilteringProfile } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwBgpFilteringProfile, unknown>] : []),
  ]
}
