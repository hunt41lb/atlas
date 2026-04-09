// @/app/(main)/network/_components/routers/_shared/router-filter-dropdown.tsx

"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import type { PanwVirtualRouter } from "@/lib/panw-parser/network/routers"

export function RouterFilterDropdown({
  routers,
  selected,
  onSelect,
  label = "All Routers",
}: {
  routers: PanwVirtualRouter[]
  selected: string | null
  onSelect: (name: string | null) => void
  label?: string
}) {
  // Calculate min-width based on longest option text
  const minWidth = React.useMemo(() => {
    const allLabels = [label, ...routers.map((vr) => vr.name)]
    const longest = allLabels.reduce((a, b) => (a.length > b.length ? a : b), "")
    // Approximate: ~7px per character + 48px padding (icon + insets)
    return Math.max(longest.length * 7 + 48, 140)
  }, [routers, label])

  const displayText = selected ?? label

  return (
    <Select
      value={selected ?? "__all__"}
      onValueChange={(val) => onSelect(val === "__all__" ? null : val)}
    >
      <SelectTrigger size="sm" style={{ minWidth }}>
        <span className="flex flex-1 text-left truncate text-xs">{displayText}</span>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} align="end">
        <SelectItem value="__all__">{label}</SelectItem>
        {routers.map((vr) => (
          <SelectItem key={vr.name} value={vr.name}>{vr.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

