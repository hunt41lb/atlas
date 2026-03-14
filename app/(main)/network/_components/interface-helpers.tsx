// @/app/(main)/network/_components/interface-helpers.tsx
//
// Shared cell renderers and helper components used across interface tabs
// (Ethernet, Aggregate Ethernet, Unit interfaces, PoE, etc.)
//
// Extracted from interfaces-view.tsx for reuse across table components.

"use client"

import {
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { IpAddressCell, type VariableMap } from "@/app/(main)/_components/ui/ip-address-cell"
import { INTERFACE_MODE_COLORS } from "@/lib/colors"
import { ZoneBadge } from "@/app/(main)/_components/ui/category-shell"
import type { PanwInterface, PanwSubInterface } from "@/lib/panw-parser/types"

// ─── Constants ────────────────────────────────────────────────────────────────

export const MODE_LABELS: Record<string, string> = {
  layer3: "Layer3",
  layer2: "Layer2",
  "virtual-wire": "Virtual Wire",
  tap: "Tap",
  ha: "HA",
  "decrypt-mirror": "Decrypt Mirror",
}

// ─── Cell Renderers ──────────────────────────────────────────────────────────

/** Badge showing interface type with aggregate-group handling (Ethernet tab) */
export function InterfaceTypeBadge({ iface }: { iface: PanwInterface }) {
  if (iface.aggregateGroup) {
    return (
      <Badge variant={INTERFACE_MODE_COLORS["aggregate"]} size="sm">
        Aggregate ({iface.aggregateGroup})
      </Badge>
    )
  }
  if (iface.mode !== "none") {
    return (
      <Badge variant={INTERFACE_MODE_COLORS[iface.mode]} size="sm">
        {MODE_LABELS[iface.mode] ?? iface.mode}
      </Badge>
    )
  }
  return <Badge variant="muted" size="sm">{iface.type}</Badge>
}

/** Badge showing interface mode (AE tab, simpler than InterfaceTypeBadge) */
export function ModeBadge({ iface }: { iface: PanwInterface }) {
  if (iface.mode !== "none") {
    return (
      <Badge variant={INTERFACE_MODE_COLORS[iface.mode]} size="sm">
        {MODE_LABELS[iface.mode] ?? iface.mode}
      </Badge>
    )
  }
  return <Badge variant="muted" size="sm">{iface.type}</Badge>
}

/** Displays "Untagged" for VLAN tag column */
export function TagCell() {
  return <span className="text-xs text-muted-foreground">Untagged</span>
}

/** Displays router name or dash */
export function RouterCell({ name }: { name: string | undefined }) {
  if (!name) return <span className="text-muted-foreground text-xs">—</span>
  return <span className="text-xs font-medium">{name}</span>
}

/** Displays zone name or "none" */
export function ZoneCell({ name, color }: { name?: string; color?: string }) {
  return <ZoneBadge name={name} color={color} />
}

/** Sorted list of feature labels */
export function FeaturesList({ features }: { features: string[] }) {
  if (features.length === 0) return <span className="text-muted-foreground text-xs">—</span>
  const sorted = [...features].sort((a, b) => a.localeCompare(b))
  return (
    <div className="flex flex-col gap-0.5">
      {sorted.map((f) => (
        <span key={f} className="text-xs text-muted-foreground">{f}</span>
      ))}
    </div>
  )
}

// ─── Sub-interface rows (shared between Ethernet & AE tabs) ──────────────────

export function SubInterfaceRows({
  subs,
  isPanorama,
  templateName,
  ifaceToZone,
  ifaceToRouter,
  dhcpRelaySet,
  showMemberPorts = false,
  visibleColumns,
  variableMap,
  zoneColorMap,
}: {
  subs: PanwSubInterface[]
  isPanorama: boolean
  templateName: string | null
  ifaceToZone: Map<string, string>
  ifaceToRouter: Map<string, string>
  dhcpRelaySet: Set<string>
  showMemberPorts?: boolean
  visibleColumns?: Set<string>
  variableMap?: VariableMap
  zoneColorMap?: Map<string, string>
}) {
  const show = (colId: string) => !visibleColumns || visibleColumns.has(colId)

  return (
    <>
      {subs.map((sub) => (
        <TableRow key={sub.name} className="bg-muted/20 hover:bg-muted/40 border-border/50">
          {show("expand") && <TableCell className="w-8" />}
          {show("name") && (
            <TableCell className="pl-2">
              <span className="text-muted-foreground mr-1 text-xs">↳</span>
              <span className="font-medium text-sm">{sub.name}</span>
            </TableCell>
          )}
          {show("interfaceType") && (
            <TableCell>
              <Badge variant="muted" size="sm">Sub Interface</Badge>
            </TableCell>
          )}
          {showMemberPorts && show("members") && <TableCell />}
          {show("managementProfile") && (
            <TableCell>
              {sub.managementProfile
                ? <span className="text-xs">{sub.managementProfile}</span>
                : <span className="text-muted-foreground text-xs">—</span>}
            </TableCell>
          )}
          {show("ipAddresses") && (
            <TableCell>
              <IpAddressCell ipv4={sub.ipAddresses} ipv6={sub.ipv6Addresses ?? []} dhcpClient={sub.dhcpClient} variableMap={variableMap} />
            </TableCell>
          )}
          {show("subIfCount") && <TableCell />}
          {!showMemberPorts && show("aggregateGroup") && <TableCell />}
          {show("tag") && (
            <TableCell>
              {sub.tag !== null
                ? <span className="text-xs font-mono">{sub.tag}</span>
                : <span className="text-muted-foreground text-xs">Untagged</span>}
            </TableCell>
          )}
          {show("logicalRouter") && (
            <TableCell><RouterCell name={ifaceToRouter.get(sub.name)} /></TableCell>
          )}
          {show("securityZone") && (
            <TableCell>
              <ZoneCell
                name={ifaceToZone.get(sub.name)}
                color={zoneColorMap?.get(ifaceToZone.get(sub.name) ?? "")}
              />
            </TableCell>
          )}
          {show("features") && (
            <TableCell>
              <FeaturesList features={[
                ...(sub.bonjourEnabled ? ["Bonjour"] : []),
                ...(sub.dhcpClient ? ["DHCP Client"] : []),
                ...(dhcpRelaySet.has(sub.name) ? ["DHCP Relay"] : []),
                ...(sub.ndpProxy ? ["NDP Proxy"] : []),
                ...(sub.adjustTcpMss ? ["TCP MSS"] : []),
                ...(sub.sdwanEnabled ? ["SD-WAN"] : []),
              ]} />
            </TableCell>
          )}
          {isPanorama && show("template") && (
            <TableCell>
              {templateName && <span className="text-xs text-muted-foreground">{templateName}</span>}
            </TableCell>
          )}
          {show("comment") && (
            <TableCell>
              {sub.comment
                ? <span className="text-xs text-muted-foreground">{sub.comment}</span>
                : <span className="text-muted-foreground text-xs">—</span>}
            </TableCell>
          )}
        </TableRow>
      ))}
    </>
  )
}
