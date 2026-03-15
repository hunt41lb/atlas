// @/app/(main)/_components/ui/sidebar/sidebar-views.tsx

"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SidebarNavItem {
  title: string
  url: string
  items?: SidebarNavItem[]
}

export interface SidebarNavGroup {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  items?: SidebarNavItem[]
}

// ─── Recursive sub-item renderer ──────────────────────────────────────────────

function SubItemRenderer({
  item,
  pathname,
  depth = 0,
}: {
  item: SidebarNavItem
  pathname: string
  depth?: number
}) {
  const hasChildren = item.items && item.items.length > 0
  const isActive = pathname === item.url
  const isChildActive = hasChildren && item.items!.some(
    (child) => pathname === child.url || pathname.startsWith(child.url + "/")
  )

  if (!hasChildren) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton
          isActive={isActive}
          render={<Link href={item.url} />}
        >
          <span>{item.title}</span>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    )
  }

  return (
    <SidebarMenuSubItem>
      <Collapsible defaultOpen={isActive || isChildActive}>
        <div className="flex items-center">
          <SidebarMenuSubButton
            isActive={isActive}
            render={<Link href={item.url} />}
            className="flex-1"
          >
            <span>{item.title}</span>
          </SidebarMenuSubButton>
          <CollapsibleTrigger className="ml-auto flex size-5 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-transform aria-expanded:rotate-90">
            <ChevronRight className="size-3.5" />
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items!.map((child) => (
              <SubItemRenderer
                key={child.title}
                item={child}
                pathname={pathname}
                depth={depth + 1}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuSubItem>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SidebarViews({ items }: { items: SidebarNavGroup[] }) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Views</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isGroupActive = pathname.startsWith(item.url)
          return (
            <Collapsible key={item.title} defaultOpen={item.isActive || isGroupActive}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isGroupActive}
                  render={<Link href={item.url} />}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <>
                    <SidebarMenuAction
                      className="aria-expanded:rotate-90"
                      render={<CollapsibleTrigger />}
                    >
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SubItemRenderer
                            key={subItem.title}
                            item={subItem}
                            pathname={pathname}
                          />
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
