// @/app/(main)/_components/ui/main-header.tsx

"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

import { HeaderColumns } from "./header/header-columns"
import { HeaderScope } from "./header/header-scope"
import { HeaderSearch } from "./header/header-search"
import { HeaderTabs } from "./header/header-tabs"
import { resolveHeader } from "./header/header-config"
import { useHeaderToolbar } from "@/app/(main)/_context/header-toolbar-context"

export function MainHeader({ className, ...props }: React.ComponentProps<"header">) {
  const pathname = usePathname()
  const { title, tabs } = resolveHeader(pathname)
  const { count } = useHeaderToolbar()
  const hasTabs = !!tabs && tabs.length > 0

  return (
    <header
      data-slot="main-header"
      className={cn("shrink-0 pl-3 pr-4 pt-1.5", className)}
      {...props}
    >
      {/* Title row */}
      <div className={cn(
        "flex items-center justify-between gap-3",
        hasTabs ? "pb-2" : "pb-3",
      )}>
        {/* Left: trigger + title */}
        <div className="flex items-center gap-2 min-w-0">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-7" />
          <div className="flex items-baseline gap-2 min-w-0">
            <h1 className="m-0 truncate text-xl font-bold leading-tight">{title}</h1>
            {count !== null && (
              <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                {count.toLocaleString()} {count === 1 ? "entry" : "entries"}
              </span>
            )}
          </div>
        </div>

        {/* Right: scope · columns · search */}
        <div className="flex items-center gap-2 shrink-0">
          <HeaderScope />
          <HeaderColumns />
          <HeaderSearch />
        </div>
      </div>

      {/* Tab row */}
      {hasTabs && (
        <div className="flex items-end">
          <HeaderTabs tabs={tabs!} />
        </div>
      )}
    </header>
  )
}
