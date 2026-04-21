// @/app/(main)/network/_components/routing-profiles/bgp/bgp-redist-columns.tsx

"use client"

import {
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import type { PanwBgpRedistributionProfile } from "@/lib/panw-parser/network/routing-profiles"

// ─── Summary renderer ─────────────────────────────────────────────────────────

function RedistSummary({ sub }: { sub: PanwBgpRedistributionProfile["ipv4Unicast"] }) {
  if (!sub) return <span className="text-muted-foreground text-xs">—</span>

  const protocols = [
    { key: "static", label: "Static", entry: sub.static },
    { key: "connected", label: "Connected", entry: sub.connected },
    { key: "rip", label: "RIP", entry: sub.rip },
    { key: "ospf", label: "OSPF", entry: sub.ospf },
    { key: "ospfv3", label: "OSPFv3", entry: sub.ospfv3 },
  ].filter((p) => p.entry?.enabled)

  if (protocols.length === 0) return <span className="text-muted-foreground text-xs">None enabled</span>

  return (
    <div className="flex flex-wrap gap-1">
      {protocols.map((p) => (
        <Badge key={p.key} variant="blue" size="sm">
          {p.label}{p.entry?.metric != null ? ` (${p.entry.metric})` : ""}
        </Badge>
      ))}
    </div>
  )
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const redistHelper = createColumnHelper<PanwBgpRedistributionProfile>()

export function buildRedistColumns(
  isPanorama: boolean,
  onNameClick: (profile: PanwBgpRedistributionProfile) => void,
): ColumnDef<PanwBgpRedistributionProfile, unknown>[] {
  return [
    redistHelper.accessor("name", {
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
    }) as ColumnDef<PanwBgpRedistributionProfile, unknown>,

    {
      id: "ipv4Unicast",
      header: "IPv4 Unicast",
      enableSorting: false,
      cell: ({ row }) => <RedistSummary sub={row.original.ipv4Unicast} />,
    },

    {
      id: "ipv6Unicast",
      header: "IPv6 Unicast",
      enableSorting: false,
      cell: ({ row }) => <RedistSummary sub={row.original.ipv6Unicast} />,
    },

    ...(isPanorama ? [{
      id: "template",
      header: "Template",
      enableSorting: true,
      meta: { hidePriority: 1 },
      accessorFn: (row: PanwBgpRedistributionProfile) => row.templateName ?? "",
      cell: ({ row }: { row: { original: PanwBgpRedistributionProfile } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwBgpRedistributionProfile, unknown>] : []),
  ]
}
