// @/app/(main)/_components/ui/header/header-search.tsx

"use client"

import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useHeaderToolbar } from "@/app/(main)/_context/header-toolbar-context"

export function HeaderSearch() {
  const { search } = useHeaderToolbar()

  const value       = search?.value ?? ""
  const onChange    = search?.onChange ?? (() => {})
  const placeholder = search?.placeholder ?? "Search Atlas…"
  const disabled    = !search

  const inputEl = (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        size="sm"
        disabled={disabled}
        aria-label="Search"
        className="pl-7"
      />
    </div>
  )

  return (
    <>
      {/* md+: inline input */}
      <div className="hidden w-64 md:block">{inputEl}</div>

      {/* below md: icon button opens popover with input */}
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              size="xs"
              aria-label="Search"
              disabled={disabled}
              className="gap-1.5 text-muted-foreground md:hidden"
            >
              <Search className="size-3.5" />
            </Button>
          }
        />
        <PopoverContent align="end" className="w-64 p-2">
          {inputEl}
        </PopoverContent>
      </Popover>
    </>
  )
}
