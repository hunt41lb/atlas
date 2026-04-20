// @/app/(main)/_components/ui/header/header-config.ts

import type { HeaderTab } from "./header-tabs"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HeaderRoute {
  /** Small category label above the title (e.g. "Network") */
  kicker?: string
  /** Page title (e.g. "Interfaces") */
  title: string
  /** If set, render the corresponding TAB_GROUPS entry as sibling tabs */
  tabGroup?: keyof typeof TAB_GROUPS
}

// ─── Tab groups ──────────────────────────────────────────────────────────────
// Routes that share a tabGroup render together as sibling tabs in the header.

export const TAB_GROUPS = {
  "routing-profiles": [
    { label: "BGP",       href: "/network/routing-profiles-bgp" },
    { label: "BFD",       href: "/network/routing-profiles-bfd" },
    { label: "OSPF",      href: "/network/routing-profiles-ospf" },
    { label: "OSPFv3",    href: "/network/routing-profiles-ospfv3" },
    { label: "RIPv2",     href: "/network/routing-profiles-ripv2" },
    { label: "Filters",   href: "/network/routing-profiles-filters" },
    { label: "Multicast", href: "/network/routing-profiles-multicast" },
  ],
} satisfies Record<string, HeaderTab[]>

// ─── Route → header config ───────────────────────────────────────────────────

export const HEADER_ROUTES: Record<string, HeaderRoute> = {
  // Network
  "/network/interfaces":                           { kicker: "Network", title: "Interfaces" },
  "/network/zones":                                { kicker: "Network", title: "Zones" },
  "/network/vlans":                                { kicker: "Network", title: "VLANs" },
  "/network/virtual-wires":                        { kicker: "Network", title: "Virtual Wires" },
  "/network/routing":                              { kicker: "Network", title: "Routing" },
  "/network/virtual-routers":                      { kicker: "Network", title: "Virtual Routers" },
  "/network/logical-routers":                      { kicker: "Network", title: "Logical Routers" },
  "/network/routing-profiles-bgp":                 { kicker: "Network", title: "BGP",       tabGroup: "routing-profiles" },
  "/network/routing-profiles-bfd":                 { kicker: "Network", title: "BFD",       tabGroup: "routing-profiles" },
  "/network/routing-profiles-ospf":                { kicker: "Network", title: "OSPF",      tabGroup: "routing-profiles" },
  "/network/routing-profiles-ospfv3":              { kicker: "Network", title: "OSPFv3",    tabGroup: "routing-profiles" },
  "/network/routing-profiles-ripv2":               { kicker: "Network", title: "RIPv2",     tabGroup: "routing-profiles" },
  "/network/routing-profiles-filters":             { kicker: "Network", title: "Filters",   tabGroup: "routing-profiles" },
  "/network/routing-profiles-multicast":           { kicker: "Network", title: "Multicast", tabGroup: "routing-profiles" },
  "/network/ipsec-tunnels":                        { kicker: "Network", title: "IPsec Tunnels" },
  "/network/gre-tunnels":                          { kicker: "Network", title: "GRE Tunnels" },
  "/network/dhcp":                                 { kicker: "Network", title: "DHCP" },
  "/network/dns-proxy":                            { kicker: "Network", title: "DNS Proxy" },
  "/network/proxy":                                { kicker: "Network", title: "Proxy" },
  "/network/global-protect-portals":               { kicker: "Network", title: "GlobalProtect Portals" },
  "/network/global-protect-gateways":              { kicker: "Network", title: "GlobalProtect Gateways" },
  "/network/global-protect-mdm":                   { kicker: "Network", title: "Mobile Device Management" },
  "network/global-protect-clientless-apps":        { kicker: "Network", title: "Clientless Apps" },
  "/network/global-protect-clientless-app-groups": { kicker: "Network", title: "Clientless App Groups" },
  "/network/global-protect-dhcp-profiles":         { kicker: "Network", title: "GlobalProtect DHCP Profiles" },
  "/network/qos":                                  { kicker: "Network", title: "QoS" },
  "/network/lldp":                                 { kicker: "Network", title: "LLDP" },
  "/network/network-profiles-gp-ipsec-crypto":     { kicker: "Network", title: "GlobalProtect IPsec Crypto" },
  "/network/network-profiles-ike-gateways":        { kicker: "Network", title: "IKE Gateways" },
  "/network/network-profiles-ipsec-crypto":        { kicker: "Network", title: "IPsec Crypto" },
  "/network/network-profiles-ike-crypto":          { kicker: "Network", title: "IKE Crypto" },
  "/network/network-profiles-monitor":             { kicker: "Network", title: "Monitor" },
  "/network/network-profiles-interface-mgmt":      { kicker: "Network", title: "Interface Management" },
  "/network/network-profiles-zone-protection":     { kicker: "Network", title: "Zone Protection" },
  "/network/network-profiles-qos":                 { kicker: "Network", title: "QoS" },
  "/network/network-profiles-lldp":                { kicker: "Network", title: "LLDP" },
  "/network/network-profiles-bfd":                 { kicker: "Network", title: "BFD" },
  "/network/network-profiles-macsec":              { kicker: "Network", title: "MACsec" },
  "/network/sd-wan-interface":                     { kicker: "Network", title: "SD-WAN Interfaces" },

  // Objects — fill in as routes come online
  "/objects/addresses":                  { kicker: "Objects", title: "Addresses" },
  "/objects/address-groups":             { kicker: "Objects", title: "Address Groups" },

  // Policies — fill in as routes come online
  "/policies/security":                  { kicker: "Policies", title: "Security" },
  "/policies/nat":                       { kicker: "Policies", title: "NAT" },
}

// ─── Resolver ────────────────────────────────────────────────────────────────

/**
 * Resolves what the header should render for a given pathname.
 * Falls back to a pathname-derived title so unknown routes still render sensibly.
 */
export function resolveHeader(pathname: string): {
  kicker?: string
  title: string
  tabs?: HeaderTab[]
} {
  const exact = HEADER_ROUTES[pathname]
  if (exact) {
    return {
      title: exact.title,
      tabs: exact.tabGroup ? TAB_GROUPS[exact.tabGroup] : undefined,
    }
  }

  // Fallback: derive from the last pathname segment
  const segments = pathname.split("/").filter(Boolean)
  const last = segments[segments.length - 1] ?? ""
  const title = last
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

  return { title: title || "Atlas" }
}
