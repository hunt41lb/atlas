// @/components/ui/dialog-sidebar.tsx

"use client"

import { cn } from "@/lib/utils"

export interface DialogSidebarItem {
  /** Display label */
  label: string
  /** Unique value used for selection tracking */
  value: string
}

interface DialogSidebarProps {
  /** Navigation items to display */
  items: DialogSidebarItem[]
  /** Currently active item value */
  activeItem: string
  /** Called when an item is selected */
  onSelect: (value: string) => void
  /** Width of the sidebar. @default "130px" */
  width?: string
  /** Additional className for the nav container */
  className?: string
}

export function DialogSidebar({
  items,
  activeItem,
  onSelect,
  width = "130px",
  className,
}: DialogSidebarProps) {
  return (
    <nav
      className={cn("flex shrink-0 flex-col border-r bg-muted/30", className)}
      style={{ width }}
    >
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onSelect(item.value)}
          className={cn(
            "px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
            activeItem === item.value
              ? "bg-primary text-primary-foreground font-medium"
              : "text-foreground"
          )}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
