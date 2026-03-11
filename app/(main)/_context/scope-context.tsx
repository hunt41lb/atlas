// @/app/(main)/_context/scope-context.tsx

"use client"

import * as React from "react"
import { useConfig } from "./config-context"

export type ScopeType = "template" | "device-group" | null

interface ScopeContextProps {
  /** null means "All" */
  selectedScope: string | null
  setSelectedScope: (scope: string | null) => void
}

const ScopeContext = React.createContext<ScopeContextProps | null>(null)

export function useScope() {
  const context = React.useContext(ScopeContext)
  if (!context) throw new Error("useScope must be used within a ScopeProvider.")
  return context
}

export function ScopeProvider({ children }: { children: React.ReactNode }) {
  const { activeConfig } = useConfig()
  const [selectedScope, setSelectedScope] = React.useState<string | null>(null)

  // Reset to "All" whenever the active config changes
  React.useEffect(() => {
    setSelectedScope(null)
  }, [activeConfig?.id])

  const contextValue = React.useMemo(
    () => ({ selectedScope, setSelectedScope }),
    [selectedScope]
  )

  return (
    <ScopeContext.Provider value={contextValue}>
      {children}
    </ScopeContext.Provider>
  )
}
