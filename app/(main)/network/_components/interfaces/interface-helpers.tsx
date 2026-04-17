// @/app/(main)/network/_components/interfaces/interface-helpers.tsx
//
// Shared cell renderers, helper components, and types used across interface tabs
// (Ethernet, Aggregate Ethernet, Unit interfaces, PoE, etc.)

"use client"

import {
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { IpAddressCell, type VariableMap } from "@/app/(main)/_components/ui/ip-address-cell"
import { INTERFACE_MODE_COLORS } from "@/lib/colors"
import { ZoneBadge } from "@/app/(main)/_components/ui/category-shell"
import type { PanwInterface, PanwSubInterface } from "@/lib/panw-parser/network/interfaces"

// ─── Shared tab props type ────────────────────────────────────────────────────

export interface SharedInterfaceTabProps {
  interfaces: PanwInterface[]
  isPanorama: boolean
  ifaceToVirtualRouter: Map<string, string>
  ifaceToLogicalRouter: Map<string, string>
  hasVirtualRouters: boolean
  hasLogicalRouters: boolean
  ifaceToZone: Map<string, string>
  zoneColorMap: Map<string, string>
  dhcpRelaySet: Set<string>
  dhcpServerSet: Set<string>
  variableMap?: VariableMap
  onMgmtProfileClick?: (name: string) => void
  onRouterClick?: (name: string) => void
  onZoneClick?: (name: string) => void
  ifaceToVlan?: Map<string, string>
}

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

/** Displays router name or dash, optionally clickable */
export function RouterCell({ name, onClick }: { name: string | undefined; onClick?: (name: string) => void }) {
  if (!name) return <span className="text-muted-foreground text-xs">—</span>
  if (!onClick) return <span className="text-xs font-medium">{name}</span>
  return (
    <button
      type="button"
      className="text-xs font-medium text-foreground hover:underline cursor-pointer"
      onClick={() => onClick(name)}
    >
      {name}
    </button>
  )
}

/** Displays zone name or "none", optionally clickable */
export function ZoneCell({
  name,
  color,
  onClick,
}: {
  name?: string
  color?: string
  onClick?: (name: string) => void
}) {
  if (!name || !onClick) return <ZoneBadge name={name} color={color} />
  return (
    <button
      type="button"
      className="cursor-pointer hover:opacity-80"
      onClick={() => onClick(name)}
    >
      <ZoneBadge name={name} color={color} />
    </button>
  )
}

/** Clickable management profile name, or dash if unset */
export function MgmtProfileCell({ name, onClick }: { name: string | null; onClick?: (name: string) => void }) {
  if (!name) return <span className="text-muted-foreground text-xs">—</span>
  if (!onClick) return <span className="text-xs">{name}</span>
  return (
    <button
      type="button"
      className="text-xs text-foreground hover:underline cursor-pointer"
      onClick={() => onClick(name)}
    >
      {name}
    </button>
  )
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
  ifaceToVirtualRouter,
  ifaceToLogicalRouter,
  dhcpRelaySet,
  dhcpServerSet,
  showMemberPorts = false,
  visibleColumns,
  variableMap,
  zoneColorMap,
  onMgmtProfileClick,
  onSubInterfaceClick,
  onRouterClick,
  onZoneClick,
}: {
  subs: PanwSubInterface[]
  isPanorama: boolean
  templateName: string | null
  ifaceToZone: Map<string, string>
  ifaceToVirtualRouter: Map<string, string>
  ifaceToLogicalRouter: Map<string, string>
  dhcpRelaySet: Set<string>
  dhcpServerSet: Set<string>
  showMemberPorts?: boolean
  visibleColumns?: Set<string>
  variableMap?: VariableMap
  zoneColorMap?: Map<string, string>
  onMgmtProfileClick?: (name: string) => void
  onSubInterfaceClick?: (sub: PanwSubInterface) => void
  onRouterClick?: (name: string) => void
  onZoneClick?: (name: string) => void
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
              {onSubInterfaceClick ? (
                <button
                  type="button"
                  className="text-xs font-medium text-foreground hover:underline cursor-pointer"
                  onClick={() => onSubInterfaceClick(sub)}
                >
                  {sub.name}
                </button>
              ) : (
                <span className="font-medium text-xs">{sub.name}</span>
              )}
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
              <MgmtProfileCell name={sub.managementProfile} onClick={onMgmtProfileClick} />
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
          {show("virtualRouter") && (
            <TableCell><RouterCell name={ifaceToVirtualRouter.get(sub.name)} onClick={onRouterClick} /></TableCell>
          )}
          {show("logicalRouter") && (
            <TableCell><RouterCell name={ifaceToLogicalRouter.get(sub.name)} onClick={onRouterClick} /></TableCell>
          )}
          {show("securityZone") && (
            <TableCell>
              <ZoneCell
                name={ifaceToZone.get(sub.name)}
                color={zoneColorMap?.get(ifaceToZone.get(sub.name) ?? "")}
                onClick={onZoneClick}
              />
            </TableCell>
          )}
          {show("features") && (
            <TableCell>
              <FeaturesList features={[
                ...(sub.bonjourEnabled ? ["Bonjour"] : []),
                ...(sub.dhcpClient ? ["DHCP Client"] : []),
                ...(dhcpServerSet.has(sub.name) ? ["DHCP Server"] : []),
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
