// @/app/(main)/network/[category]/page.tsx

"use client"

import * as React from "react"
import { notFound } from "next/navigation"
import { useConfig } from "@/app/(main)/_context/config-context"
import { EmptyState } from "@/app/(main)/_components/ui/empty-state"
import { ComingSoonView } from "@/app/(main)/_components/ui/category-shell"

// Pages
import { InterfacesView } from "@/app/(main)/network/_components/interfaces"
import { ZonesView } from "@/app/(main)/network/_components/zones"
import { VlansView } from "@/app/(main)/network/_components/vlans"
import { VirtualWiresView } from "@/app/(main)/network/_components/virtual-wires"
import { RoutingView } from "@/app/(main)/network/_components/routers/routing"
import { VirtualRoutersView } from "@/app/(main)/network/_components/routers/virtual-routers"
import { LogicalRoutersView } from "@/app/(main)/network/_components/routers/logical-routers"
import {
  BfdProfilesView,
  BgpProfilesView,
  FiltersView,
  OspfProfilesView,
  Ospfv3ProfilesView,
  RipProfilesView,
  MulticastProfilesView,
} from "@/app/(main)/network/_components/routing-profiles"
import { IpsecTunnelsView } from "../_components/ipsec-tunnels"
import { GreTunnelsView } from "../_components/gre-tunnels"
import { DhcpView } from "../_components/dhcp"
import { DnsProxyView } from "../_components/dns-proxy"
import { ProxyView } from "../_components/proxy"
import { QosInterfacesView } from "../_components/qos-interfaces"
import { LldpGeneralView } from "../_components/lldp-general"
import {
  InterfaceMgmtView,
  MonitorView,
  ZoneProtectionView,
  IkeCryptoView,
  IpsecCryptoView,
  IkeGatewaysView,
  GpIpsecCryptoView,
  NetworkBfdView,
  LldpProfileView,
  MacsecView,
  QosView,
} from "@/app/(main)/network/_components/network-profiles"
import { SdwanInterfaceProfileView } from "../_components/sd-wan-interface-profile"

// ─── Route map ────────────────────────────────────────────────────────────────

const NETWORK_VIEWS: Record<string, { title: string; component?: React.ComponentType; countKey?: string }> = {
  "interfaces":                          { title: "Interfaces",                 component: InterfacesView },
  "zones":                               { title: "Zones",                      component: ZonesView },
  "vlans":                               { title: "VLANs",                      component: VlansView },
  "virtual-wires":                       { title: "Virtual Wires",              component: VirtualWiresView },
  "routing":                             { title: "Routing",                    component: RoutingView },
  "virtual-routers":                     { title: "Virtual Routers",            component: VirtualRoutersView },
  "logical-routers":                     { title: "Logical Routers",            component: LogicalRoutersView },
  "routing-profiles":                    { title: "Routing Profiles" },
  "routing-profiles-bgp":                { title: "BGP",                        component: BgpProfilesView },
  "routing-profiles-bfd":                { title: "BFD",                        component: BfdProfilesView },
  "routing-profiles-ospf":               { title: "OSPF",                       component: OspfProfilesView },
  "routing-profiles-ospfv3":             { title: "OSPFv3",                     component: Ospfv3ProfilesView },
  "routing-profiles-ripv2":              { title: "RIPv2",                      component: RipProfilesView },
  "routing-profiles-filters":            { title: "Filters",                    component: FiltersView },
  "routing-profiles-multicast":          { title: "Multicast",                  component: MulticastProfilesView },
  "ipsec-tunnels":                       { title: "IPSec Tunnels",              component: IpsecTunnelsView },
  "gre-tunnels":                         { title: "GRE Tunnels",                component: GreTunnelsView },
  "dhcp":                                { title: "DHCP",                       component: DhcpView },
  "dns-proxy":                           { title: "DNS Proxy",                  component: DnsProxyView },
  "proxy":                               { title: "Proxy",                      component: ProxyView },
  "global-protect":                      { title: "GlobalProtect" },
  "global-protect-portals":              { title: "Portals" },
  "global-protect-gateways":             { title: "Gateways" },
  "global-protect-mdm":                  { title: "MDM" },
  "global-protect-clientless-apps":      { title: "Clientless Apps" },
  "global-protect-clientless-app-groups":{ title: "Clientless App Groups" },
  "global-protect-dhcp-profile":         { title: "DHCP Profile" },
  "qos":                                 { title: "QoS",                        component: QosInterfacesView },
  "lldp":                                { title: "LLDP",                       component: LldpGeneralView },
  "network-profiles":                    { title: "Network Profiles" },
  "network-profiles-gp-ipsec-crypto":    { title: "GlobalProtect IPSec Crypto", component: GpIpsecCryptoView },
  "network-profiles-ike-gateways":       { title: "IKE Gateways",               component: IkeGatewaysView },
  "network-profiles-ipsec-crypto":       { title: "IPSec Crypto",               component: IpsecCryptoView },
  "network-profiles-ike-crypto":         { title: "IKE Crypto",                 component: IkeCryptoView },
  "network-profiles-monitor":            { title: "Monitor",                    component: MonitorView },
  "network-profiles-interface-mgmt":     { title: "Interface Management",       component: InterfaceMgmtView },
  "network-profiles-zone-protection":    { title: "Zone Protection",            component: ZoneProtectionView },
  "network-profiles-qos":                { title: "QoS Profile",                component: QosView },
  "network-profiles-lldp":               { title: "LLDP Profile",               component: LldpProfileView },
  "network-profiles-bfd":                { title: "BFD Profile",                component: NetworkBfdView },
  "network-profiles-macsec":             { title: "MACsec Profile",             component: MacsecView },
  "sd-wan-interface":                    { title: "SD-WAN Interface Profile",   component: SdwanInterfaceProfileView },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NetworkCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = React.use(params)
  const { activeConfig } = useConfig()

  const view = NETWORK_VIEWS[category]
  if (!view) notFound()

  if (!activeConfig) return <EmptyState />

  if (view.component) {
    const View = view.component
    return <View />
  }

  return <ComingSoonView title={view.title} />
}
