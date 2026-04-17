// @/app/(main)/network/_components/interfaces/interfaces-view.tsx

"use client"

import * as React from "react"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { InterfaceMgmtDialog } from "../network-profiles/interface-mgmt/interface-mgmt-dialog"
import { RouterDialog } from "../routers/_shared/router-dialog"
import { ZonesDialog } from "../zones/zones-dialog"
import { EthernetTab } from "./ethernet-tab"
import { AggregateEthernetTab } from "./aggregate-ethernet-tab"
import { InterfaceTable } from "./interface-table"
import { PoeTable } from "./poe-table"
import { SdwanTab } from "./sdwan-tab"
import { CellularTab } from "./cellular-tab"
import { FailOpenTab } from "./fail-open-tab"

import type { ParsedPanoramaConfig  } from "@/lib/panw-parser/general/config"
import type { PanwInterfaceMgmtProfile, PanwZoneProtectionProfile } from "@/lib/panw-parser/network/network-profiles"
import type { PanwVirtualRouter } from "@/lib/panw-parser/network/routers"
import type { PanwZone } from "@/lib/panw-parser/network/zones"
import type { PanwVlan } from "@/lib/panw-parser/network/vlans"
import type { VariableMap } from "@/app/(main)/_components/ui/ip-address-cell"

// ─── Tab definitions ─────────────────────────────────────────────────────────

const INTERFACE_TABS = [
  { value: "ethernet",           label: "Ethernet" },
  { value: "aggregate-ethernet", label: "Aggregate Ethernet" },
  { value: "vlan",               label: "VLAN" },
  { value: "loopback",           label: "Loopback" },
  { value: "tunnel",             label: "Tunnel" },
  { value: "sd-wan",             label: "SD-WAN" },
  { value: "poe",                label: "PoE" },
  { value: "cellular",           label: "Cellular" },
  { value: "fail-open",          label: "Fail Open" },
] as const

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

// ─── Main view ────────────────────────────────────────────────────────────────

export function InterfacesView() {
  "use no memo"

  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const { interfaces, zones, zoneProtectionProfiles, virtualRouters, logicalRouters, dhcpRelays, dhcpServers, interfaceMgmtProfiles, sdwanInterfaces, cellularInterfaces, failOpen, vlans } = React.useMemo(() => {
    if (!activeConfig) return { interfaces: [], zones: [], zoneProtectionProfiles: [] as PanwZoneProtectionProfile[], virtualRouters: [], logicalRouters: [], dhcpRelays: [], dhcpServers: [], interfaceMgmtProfiles: [], sdwanInterfaces: [], cellularInterfaces: [], failOpen: [], vlans: [] as PanwVlan[] }
    const data = resolveNetworkData(activeConfig.parsedConfig, selectedScope)
    return {
      interfaces:             data.interfaces             ?? [],
      zones:                  data.zones                  ?? [],
      zoneProtectionProfiles: data.zoneProtectionProfiles ?? [],
      virtualRouters:         data.virtualRouters         ?? [],
      logicalRouters:         data.logicalRouters         ?? [],
      dhcpRelays:             data.dhcpRelays             ?? [],
      dhcpServers:            data.dhcpServers            ?? [],
      interfaceMgmtProfiles:  data.interfaceMgmtProfiles  ?? [],
      sdwanInterfaces:        data.sdwanInterfaces        ?? [],
      cellularInterfaces:     data.cellularInterfaces     ?? [],
      failOpen:               data.failOpen               ?? [],
      vlans:                  data.vlans                  ?? [],
    }
  }, [activeConfig, selectedScope])

  const ifaceToVirtualRouter = React.useMemo(
    () => buildIfaceToRouter(virtualRouters),
    [virtualRouters]
  )
  const ifaceToLogicalRouter = React.useMemo(
    () => buildIfaceToRouter(logicalRouters),
    [logicalRouters]
  )

  const hasVirtualRouters = virtualRouters.length > 0
  const hasLogicalRouters = logicalRouters.length > 0

  const ifaceToZone = React.useMemo(
    () => buildIfaceToZone(zones),
    [zones]
  )

  const zoneColorMap = React.useMemo(() => {
    const map = new Map<string, string>()
    for (const zone of zones) {
      if (zone.color !== "var(--muted-foreground)") {
        map.set(zone.name, zone.color)
      }
    }
    return map
  }, [zones])

  const dhcpRelaySet = React.useMemo(
    () => new Set(dhcpRelays.map(r => r.interface)),
    [dhcpRelays]
  )

  const dhcpServerSet = React.useMemo(
    () => new Set(dhcpServers.map(s => s.interface)),
    [dhcpServers]
  )

  const variableMap = React.useMemo<VariableMap>(() => {
    const map: VariableMap = new Map()
    if (activeConfig?.parsedConfig.deviceType === "panorama") {
      const panorama = activeConfig.parsedConfig as ParsedPanoramaConfig
      for (const tmpl of panorama.templates) {
        for (const v of tmpl.variables ?? []) {
          map.set(v.name, { value: v.value, description: v.description })
        }
      }
    }
    return map
  }, [activeConfig])

  const mgmtProfileMap = React.useMemo(() => {
    const map = new Map<string, PanwInterfaceMgmtProfile>()
    for (const p of interfaceMgmtProfiles) map.set(p.name, p)
    return map
  }, [interfaceMgmtProfiles])

  const [selectedMgmtProfile, setSelectedMgmtProfile] = React.useState<PanwInterfaceMgmtProfile | null>(null)
  const handleMgmtProfileClick = React.useCallback(
    (name: string) => setSelectedMgmtProfile(mgmtProfileMap.get(name) ?? null),
    [mgmtProfileMap]
  )

  const routerMap = React.useMemo(() => {
    const map = new Map<string, PanwVirtualRouter>()
    for (const r of virtualRouters) map.set(r.name, r)
    for (const r of logicalRouters) map.set(r.name, r)
    return map
  }, [virtualRouters, logicalRouters])

  const [selectedRouter, setSelectedRouter] = React.useState<PanwVirtualRouter | null>(null)
  const handleRouterClick = React.useCallback(
    (name: string) => setSelectedRouter(routerMap.get(name) ?? null),
    [routerMap]
  )

  const zoneMap = React.useMemo(() => {
    const map = new Map<string, PanwZone>()
    for (const z of zones) map.set(z.name, z)
    return map
  }, [zones])

  const zoneProtectionProfileNames = React.useMemo(
    () => zoneProtectionProfiles.map((p) => p.name),
    [zoneProtectionProfiles]
  )

  const [selectedZone, setSelectedZone] = React.useState<PanwZone | null>(null)
  const handleZoneClick = React.useCallback(
    (name: string) => setSelectedZone(zoneMap.get(name) ?? null),
    [zoneMap]
  )

  const ifaceToVlan = React.useMemo(() => {
  const map = new Map<string, string>()
  for (const vlan of vlans) {
    if (vlan.virtualInterface) map.set(vlan.virtualInterface, vlan.name)
  }
  return map
}, [vlans])

  const sharedProps = { interfaces, isPanorama, ifaceToVirtualRouter, ifaceToLogicalRouter, hasVirtualRouters, hasLogicalRouters, ifaceToZone, zoneColorMap, dhcpRelaySet, dhcpServerSet, variableMap, onMgmtProfileClick: handleMgmtProfileClick, onRouterClick: handleRouterClick, onZoneClick: handleZoneClick, ifaceToVlan }

  return (
    <Tabs defaultValue="ethernet" className="flex h-full flex-col min-h-0">
      <div className="shrink-0 border-b px-4">
        <TabsList variant="line">
          {INTERFACE_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="ethernet" className="flex-1 min-h-0">
        <EthernetTab {...sharedProps} />
      </TabsContent>

      <TabsContent value="aggregate-ethernet" className="flex-1 min-h-0">
        <AggregateEthernetTab {...sharedProps} />
      </TabsContent>

      <TabsContent value="vlan" className="flex-1 min-h-0">
        <InterfaceTable type="vlan" title="VLAN Interfaces" {...sharedProps} />
      </TabsContent>

      <TabsContent value="loopback" className="flex-1 min-h-0">
        <InterfaceTable type="loopback" title="Loopback Interfaces" {...sharedProps} />
      </TabsContent>

      <TabsContent value="tunnel" className="flex-1 min-h-0">
        <InterfaceTable type="tunnel" title="Tunnel Interfaces" {...sharedProps} />
      </TabsContent>

      <TabsContent value="sd-wan" className="flex-1 min-h-0">
        <SdwanTab
          data={sdwanInterfaces}
          isPanorama={isPanorama}
          ifaceToVirtualRouter={ifaceToVirtualRouter}
          ifaceToLogicalRouter={ifaceToLogicalRouter}
          hasVirtualRouters={hasVirtualRouters}
          hasLogicalRouters={hasLogicalRouters}
          ifaceToZone={ifaceToZone}
          zoneColorMap={zoneColorMap}
          onRouterClick={handleRouterClick}
          onZoneClick={handleZoneClick}
        />
      </TabsContent>

      <TabsContent value="poe" className="flex-1 min-h-0">
        <PoeTable interfaces={interfaces} isPanorama={isPanorama} />
      </TabsContent>

      <TabsContent value="cellular" className="flex-1 min-h-0">
        <CellularTab
          data={cellularInterfaces}
          isPanorama={isPanorama}
          ifaceToVirtualRouter={ifaceToVirtualRouter}
          ifaceToLogicalRouter={ifaceToLogicalRouter}
          hasVirtualRouters={hasVirtualRouters}
          hasLogicalRouters={hasLogicalRouters}
          ifaceToZone={ifaceToZone}
          zoneColorMap={zoneColorMap}
          onMgmtProfileClick={handleMgmtProfileClick}
          onRouterClick={handleRouterClick}
          onZoneClick={handleZoneClick}
        />
      </TabsContent>

      <TabsContent value="fail-open" className="flex-1 min-h-0">
        <FailOpenTab data={failOpen} />
      </TabsContent>

      <InterfaceMgmtDialog
        profile={selectedMgmtProfile}
        open={selectedMgmtProfile !== null}
        onOpenChange={(open) => { if (!open) setSelectedMgmtProfile(null) }}
        variableMap={variableMap}
      />
      <RouterDialog
        router={selectedRouter}
        open={selectedRouter !== null}
        onOpenChange={(open) => { if (!open) setSelectedRouter(null) }}
        routerLabel={selectedRouter && logicalRouters.some(r => r.name === selectedRouter.name) ? "Logical Router" : "Virtual Router"}
      />
      <ZonesDialog
        zone={selectedZone}
        open={selectedZone !== null}
        onOpenChange={(open) => { if (!open) setSelectedZone(null) }}
        zoneProtectionProfileNames={zoneProtectionProfileNames}
      />
    </Tabs>
  )
}
