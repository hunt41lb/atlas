// @/app/(main)/_components/ui/header/header-tabs.tsx

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HeaderTab {
  /** Display label (e.g. "Ethernet") */
  label: string
  /** Navigation target; also used for active-state matching */
  href: string
  /** Optional count rendered after the label */
  count?: number
}

interface HeaderTabsProps {
  tabs: HeaderTab[]
  className?: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export function HeaderTabs({ tabs, className }: HeaderTabsProps) {
  const pathname = usePathname()

  return (
    <div className={cn("flex gap-5", className)}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/")
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative whitespace-nowrap py-2.5 text-xs font-medium transition-colors",
              isActive
                ? "text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {typeof tab.count === "number" && (
              <span className="ml-1 font-normal text-muted-foreground tabular-nums">
                {tab.count}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}
