// @/app/(main)/_components/ui/sidebar/sidebar-configurations.tsx

"use client"

import {
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useConfig } from "@/app/(main)/_context/config-context"

export function SidebarConfigurations({
  projects,
  loading,
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
    onClick?: () => void
    isActive?: boolean
  }[]
  loading?: boolean
}) {
  const { isMobile } = useSidebar()
  const { removeConfig } = useConfig()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Configurations</SidebarGroupLabel>
      <SidebarMenu>
        {loading ? (
          // Loading skeleton
          <>
            {[1, 2].map((i) => (
              <SidebarMenuItem key={i}>
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <Skeleton className="size-4 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
              </SidebarMenuItem>
            ))}
          </>
        ) : projects.length === 0 ? (
          <SidebarMenuItem>
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              No configurations — upload one to get started.
            </div>
          </SidebarMenuItem>
        ) : (
          projects.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                onClick={item.onClick}
                isActive={item.isActive}
                className="cursor-pointer"
              >
                <item.icon />
                <span>{item.name}</span>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger render={<SidebarMenuAction showOnHover />}>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem
                    onClick={() => removeConfig(item.name)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="text-destructive" />
                    <span>Remove</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
