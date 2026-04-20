// @/app/(main)/_context/header-toolbar-context.tsx

"use client"

import * as React from "react"
import type { Table } from "@tanstack/react-table"

// ─── Types ───────────────────────────────────────────────────────────────────

interface SearchApi {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

interface ColumnItem {
  id: string
  label: string
  isVisible: boolean
  isFrozen: boolean
}

interface ColumnsApi {
  items: ColumnItem[]
  setVisible: (id: string, visible: boolean) => void
}

interface HeaderToolbarValue {
  search: SearchApi | null
  columns: ColumnsApi | null
  count: number | null
  setSearch: React.Dispatch<React.SetStateAction<SearchApi | null>>
  setColumns: React.Dispatch<React.SetStateAction<ColumnsApi | null>>
  setCount: React.Dispatch<React.SetStateAction<number | null>>
}

// IDs of columns that should never appear in the toggle (always visible).
// Matches the existing ColumnVisibilityToggle behavior.
const ALWAYS_VISIBLE = new Set(["expand", "name"])

// ─── Context ─────────────────────────────────────────────────────────────────

const HeaderToolbarContext = React.createContext<HeaderToolbarValue | null>(null)

export function useHeaderToolbar() {
  const ctx = React.useContext(HeaderToolbarContext)
  if (!ctx) throw new Error("useHeaderToolbar must be used within HeaderToolbarProvider.")
  return ctx
}

export function HeaderToolbarProvider({ children }: { children: React.ReactNode }) {
  const [search,  setSearch]  = React.useState<SearchApi  | null>(null)
  const [columns, setColumns] = React.useState<ColumnsApi | null>(null)
  const [count,   setCount]   = React.useState<number     | null>(null)

  const value = React.useMemo<HeaderToolbarValue>(
    () => ({ search, columns, count, setSearch, setColumns, setCount }),
    [search, columns, count],
  )

  return (
    <HeaderToolbarContext.Provider value={value}>
      {children}
    </HeaderToolbarContext.Provider>
  )
}

// ─── Registration hooks ──────────────────────────────────────────────────────

/**
 * Registers the current page's search state with the header's search input.
 * Call from CategoryShell (or any toolbar wrapper that owns search state).
 */
export function useRegisterHeaderSearch(api: SearchApi) {
  const { setSearch } = useHeaderToolbar()
  const { value, onChange, placeholder } = api

  React.useEffect(() => {
    const current: SearchApi = { value, onChange, placeholder }
    setSearch(current)
    return () => {
      // Only clear if nobody else has replaced us
      setSearch((prev) => (prev === current ? null : prev))
    }
  }, [setSearch, value, onChange, placeholder])
}

/**
 * Registers the current page's TanStack Table columns with the header's
 * columns toggle. Call from DataTable (the TanStack wrapper).
 */
export function useRegisterHeaderColumns<TData>(
  table: Table<TData>,
  columnLabels?: Record<string, string>,
) {
  const { setColumns } = useHeaderToolbar()
  const columnVisibility = table.getState().columnVisibility

  React.useEffect(() => {
    const items = table
      .getAllColumns()
      .filter((col) => col.getCanHide() && !ALWAYS_VISIBLE.has(col.id))
      .map<ColumnItem>((col) => ({
        id: col.id,
        label:
          columnLabels?.[col.id] ??
          (typeof col.columnDef.header === "string" ? col.columnDef.header : col.id),
        isVisible: col.getIsVisible(),
        isFrozen:
          !!(col.columnDef.meta as { freezeColumn?: boolean } | undefined)?.freezeColumn,
      }))

    const current: ColumnsApi = {
      items,
      setVisible: (id, visible) => table.getColumn(id)?.toggleVisibility(visible),
    }
    setColumns(current)

    return () => {
      setColumns((prev) => (prev === current ? null : prev))
    }
  }, [setColumns, table, columnLabels, columnVisibility])
}

/**
 * Registers the current page's entry count with the header.
 * Call from CategoryShell (or any toolbar wrapper that already receives count).
 */
export function useRegisterHeaderCount(count: number) {
  const { setCount } = useHeaderToolbar()

  React.useEffect(() => {
    setCount(count)
    return () => {
      // Only clear if still showing our count
      setCount((prev) => (prev === count ? null : prev))
    }
  }, [setCount, count])
}
