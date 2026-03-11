// @/app/(main)/_context/config-context.tsx

"use client"

import * as React from "react"
import type { ParsedConfig } from "@/lib/panw-parser/types"

export type DeviceType = "firewall" | "panorama"

export interface Configuration {
  id: string
  name: string
  deviceType: DeviceType
  hostname?: string
  platformModel?: string
  softwareVersion?: string
  serialNumber?: string
  importedAt: Date
  fileName: string
  fileSizeBytes?: number
  /** Full typed parse result — available to all views */
  parsedConfig: ParsedConfig
}

interface ConfigContextProps {
  activeConfig: Configuration | null
  configs: Configuration[]
  setActiveConfig: (config: Configuration | null) => void
  addConfig: (config: Configuration) => void
  removeConfig: (id: string) => void
}

const ConfigContext = React.createContext<ConfigContextProps | null>(null)

export function useConfig() {
  const context = React.useContext(ConfigContext)
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider.")
  }
  return context
}

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [configs, setConfigs] = React.useState<Configuration[]>([])
  const [activeConfig, setActiveConfig] = React.useState<Configuration | null>(null)

  const addConfig = React.useCallback((config: Configuration) => {
    setConfigs((prev) => {
      const exists = prev.find((c) => c.id === config.id)
      if (exists) return prev
      return [...prev, config]
    })
    setActiveConfig(config)
  }, [])

  const removeConfig = React.useCallback((id: string) => {
    setConfigs((prev) => prev.filter((c) => c.id !== id))
    setActiveConfig((prev) => (prev?.id === id ? null : prev))
  }, [])

  const contextValue = React.useMemo<ConfigContextProps>(
    () => ({ activeConfig, configs, setActiveConfig, addConfig, removeConfig }),
    [activeConfig, configs, setActiveConfig, addConfig, removeConfig]
  )

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  )
}
