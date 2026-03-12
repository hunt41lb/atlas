// @/app/(main)/_components/ui/main-sidebar.tsx

"use client"

import * as React from "react"
import {
  Rows3,
  Frame,
  LifeBuoy,
  Send,
  NotebookTabs,
  Network,
  Server,
} from "lucide-react"

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
        { title: "Routing",          url: "/network/routing" },
        { title: "IPSec Tunnels",    url: "/network/ipsec-tunnels" },
        { title: "GRE Tunnels",      url: "/network/gre-tunnels" },
        { title: "DHCP",             url: "/network/dhcp" },
        { title: "DNS Proxy",        url: "/network/dns-proxy" },
        { title: "GlobalProtect",    url: "/network/global-protect" },
        { title: "QOS",              url: "/network/qos" },
        { title: "LLDP",             url: "/network/lldp" },
        { title: "Network Profiles", url: "/network/network-profiles" },
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
    icon:     c.deviceType === "panorama" ? Server : Frame,
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
