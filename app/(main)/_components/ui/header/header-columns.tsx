// @/app/(main)/_components/ui/header/header-columns.tsx

"use client"

import { Settings2, SquareAsterisk } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useHeaderToolbar } from "@/app/(main)/_context/header-toolbar-context"

export function HeaderColumns() {
  const { columns } = useHeaderToolbar()

  // Hide entirely if the active page has no hideable columns. This keeps the
  // header lean on pages that use simple CategoryShell-only tables.
  if (!columns || columns.items.length === 0) return null

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="xs"
            aria-label="Toggle columns"
            className="gap-1.5 text-muted-foreground"
          >
            <Settings2 className="size-3.5" />
            <span className="hidden md:inline">Columns</span>
          </Button>
        }
      />
      <PopoverContent align="end" className="w-48 p-1.5">
        <p className="px-1.5 py-1 text-xs font-medium text-muted-foreground">
          Toggle columns
        </p>
        <div className="flex flex-col">
          {columns.items.map((col) => (
            <label
              key={col.id}
              className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer select-none"
            >
              <Checkbox
                checked={col.isVisible}
                onCheckedChange={(checked) => columns.setVisible(col.id, !!checked)}
              />
              <span className="flex-1">{col.label}</span>
              {col.isFrozen && (
                <SquareAsterisk className="size-3 shrink-0 text-muted-foreground" />
              )}
            </label>
          ))}
        </div>
        {columns.items.some((c) => c.isFrozen) && (
          <p className="mt-1 border-t pt-1.5 px-1.5 text-[11px] italic text-muted-foreground">
            <SquareAsterisk className="mr-1 inline size-3 -mt-0.5" />
            Stays visible when space is limited
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}
