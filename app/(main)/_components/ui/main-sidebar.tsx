// @/app/(main)/_components/ui/main-sidebar.tsx

"use client"

import * as React from "react"
import {
  Rows3,
  LifeBuoy,
  Send,
  NotebookTabs,
  Network,
} from "lucide-react"

import { BrandPanw } from "@/components/icons/brand-panw"
import { AtlasLogo } from "@/components/icons/atlas-logo"
import { SidebarViews } from "./sidebar/sidebar-views"
import { SidebarConfigurations } from "./sidebar/sidebar-configurations"
import { SidebarSecondary } from "./sidebar/sidebar-secondary"
import { SidebarUser } from "./sidebar/sidebar-user"
import { useConfig } from "@/app/(main)/_context/config-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const staticData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  sidebarViews: [
    {
      title: "Network",
      url: "/network",
      icon: Network,
      isActive: true,
      items: [
        { title: "Interfaces",       url: "/network/interfaces" },
        { title: "Zones",            url: "/network/zones" },
        { title: "VLANs",            url: "/network/vlans" },
        { title: "Virtual Wires",    url: "/network/virtual-wires" },
        { title: "Virtual Routers",  url: "/network/virtual-routers" },
        {
          title: "Routing",
          url: "/network/routing",
          items: [
            { title: "Logical Routers",  url: "/network/logical-routers" },
            {
              title: "Routing Profiles",
              url: "/network/routing-profiles",
              items: [
                { title: "BGP",        url: "/network/routing-profiles-bgp" },
                { title: "BFD",        url: "/network/routing-profiles-bfd" },
                { title: "OSPF",       url: "/network/routing-profiles-ospf" },
                { title: "OSPFv3",     url: "/network/routing-profiles-ospfv3" },
                { title: "RIPv2",      url: "/network/routing-profiles-ripv2" },
                { title: "Filters",    url: "/network/routing-profiles-filters" },
                { title: "Multicast",  url: "/network/routing-profiles-multicast" },
              ],
            },
          ],
        },
        { title: "IPSec Tunnels",    url: "/network/ipsec-tunnels" },
        { title: "GRE Tunnels",      url: "/network/gre-tunnels" },
        { title: "DHCP",             url: "/network/dhcp" },
        { title: "DNS Proxy",        url: "/network/dns-proxy" },
        { title: "Proxy",            url: "/network/proxy" },
        {
          title: "GlobalProtect",
          url: "/network/global-protect",
          items: [
            { title: "Portals",               url: "/network/global-protect-portals" },
            { title: "Gateways",              url: "/network/global-protect-gateways" },
            { title: "MDM",                   url: "/network/global-protect-mdm" },
            { title: "Clientless Apps",       url: "/network/global-protect-clientless-apps" },
            { title: "Clientless App Groups", url: "/network/global-protect-clientless-app-groups" },
            { title: "DHCP Profile",          url: "/network/global-protect-dhcp-profile" },
          ],
        },
        { title: "QoS",              url: "/network/qos" },
        { title: "LLDP",             url: "/network/lldp" },
        {
          title: "Network Profiles",
          url: "/network/network-profiles",
          items: [
            { title: "GlobalProtect IPSec Crypto", url: "/network/network-profiles-gp-ipsec-crypto" },
            { title: "IKE Gateways",               url: "/network/network-profiles-ike-gateways" },
            { title: "IPSec Crypto",                url: "/network/network-profiles-ipsec-crypto" },
            { title: "IKE Crypto",                  url: "/network/network-profiles-ike-crypto" },
            { title: "Monitor",                     url: "/network/network-profiles-monitor" },
            { title: "Interface Management",        url: "/network/network-profiles-interface-mgmt" },
            { title: "Zone Protection",             url: "/network/network-profiles-zone-protection" },
            { title: "QoS Profile",                 url: "/network/network-profiles-qos" },
            { title: "LLDP Profile",                url: "/network/network-profiles-lldp" },
            { title: "BFD Profile",                 url: "/network/network-profiles-bfd" },
            { title: "MACsec Profile",              url: "/network/network-profiles-macsec" },
          ],
        },
        { title: "SD-WAN Interface", url: "/network/sd-wan-interface" },
      ],
    },
    {
      title: "Objects",
      url: "/objects",
      icon: NotebookTabs,
      items: [
        { title: "Addresses",              url: "/objects/addresses" },
        { title: "Address Groups",         url: "/objects/address-groups" },
        { title: "Regions",                url: "/objects/regions" },
        { title: "Dynamic User Groups",    url: "/objects/dynamic-user-groups" },
        { title: "Applications",           url: "/objects/applications" },
        { title: "Application Groups",     url: "/objects/application-groups" },
        { title: "Application Filters",    url: "/objects/application-filters" },
        { title: "Services",               url: "/objects/services" },
        { title: "Service Groups",         url: "/objects/service-groups" },
        { title: "Tags",                   url: "/objects/tags" },
        { title: "Devices",                url: "/objects/devices" },
        { title: "GlobalProtect",          url: "/objects/global-protect" },
        { title: "Host Compliance",        url: "/objects/host-compliance" },
        { title: "External Dynamic Lists", url: "/objects/external-dynamic-lists" },
        { title: "Custom Objects",         url: "/objects/custom-objects" },
        { title: "Security Profiles",      url: "/objects/security-profiles" },
        { title: "Security Profile Groups",url: "/objects/security-profile-groups" },
        { title: "Log Forwarding",         url: "/objects/log-forwarding" },
        { title: "Authentication",         url: "/objects/authentication" },
        { title: "Decryption",             url: "/objects/decryption" },
        { title: "SD-WAN Link Management", url: "/objects/sd-wan-link-management" },
        { title: "Schedules",              url: "/objects/schedules" },
      ],
    },
    {
      title: "Policies",
      url: "/policies",
      icon: Rows3,
      items: [
        { title: "Security",              url: "/policies/security" },
        { title: "NAT",                   url: "/policies/nat" },
        { title: "QoS",                   url: "/policies/qos" },
        { title: "Policy Based Forwarding",url: "/policies/policy-based-forwarding" },
        { title: "Decryption",            url: "/policies/decryption" },
        { title: "Tunnel Inspection",     url: "/policies/tunnel-inspection" },
        { title: "Application Override",  url: "/policies/application-override" },
        { title: "Authentication",        url: "/policies/authentication" },
        { title: "DoS Protection",        url: "/policies/dos-protection" },
        { title: "SD-WAN",                url: "/policies/sd-wan" },
      ],
    },
  ],
  sidebarSecondary: [
    { title: "Support",  url: "#", icon: LifeBuoy },
    { title: "Feedback", url: "#", icon: Send },
  ],
}

export function MainSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { configs, activeConfig, setActiveConfig, loading } = useConfig()

  // Map stored configs to the shape SidebarConfigurations expects
  const sidebarConfigurations = configs.map((c) => ({
    id:       c.id,
    name:     c.name,
    url:      "#",
    icon:     BrandPanw,
    onClick:  () => setActiveConfig(c),
    isActive: activeConfig?.id === c.id,
  }))

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="#" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <AtlasLogo size={32} className="shrink-0 rounded-lg" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Atlas</span>
                <span className="truncate text-xs">Visualizer</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarViews items={staticData.sidebarViews} />
        <SidebarConfigurations
          projects={sidebarConfigurations}
          loading={loading}
        />
        <SidebarSecondary items={staticData.sidebarSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser user={staticData.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
