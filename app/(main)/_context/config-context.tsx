// @/app/(main)/_context/config-context.tsx

"use client"

import * as React from "react"
import type { ParsedConfig } from "@/lib/panw-parser/types"
import {
  fetchConfigurations,
  fetchConfiguration,
  type ApiConfigSummary,
} from "@/lib/api-client"
import { deriveConfigName } from "@/lib/panw-parser"

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
  loading: boolean
  error: string | null
  setActiveConfig: (config: Configuration | null) => void
  addConfig: (config: Configuration) => void
  removeConfig: (id: string) => void
  refreshConfigs: () => Promise<void>
}

const ConfigContext = React.createContext<ConfigContextProps | null>(null)

export function useConfig() {
  const context = React.useContext(ConfigContext)
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider.")
  }
  return context
}

// Convert an API summary + full config into our frontend Configuration shape
function apiToConfiguration(
  summary: ApiConfigSummary,
  parsed: ParsedConfig
): Configuration {
  const d = summary.device
  return {
    id:              summary.id,
    name:            d.hostname ?? deriveConfigName(parsed, summary.file_name),
    deviceType:      d.device_type,
    hostname:        d.hostname ?? undefined,
    platformModel:   d.platform_model ?? undefined,
    softwareVersion: d.pan_os_version ?? undefined,
    serialNumber:    d.serial_number ?? undefined,
    importedAt:      new Date(summary.backed_up_at),
    fileName:        summary.file_name,
    fileSizeBytes:   summary.file_size_bytes,
    parsedConfig:    parsed,
  }
}

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [configs,       setConfigs]       = React.useState<Configuration[]>([])
  const [activeConfig,  setActiveConfig]  = React.useState<Configuration | null>(null)
  const [loading,       setLoading]       = React.useState(true)
  const [error,         setError]         = React.useState<string | null>(null)

  // ── Load all configs from the API on mount ──────────────────────────────────
  const refreshConfigs = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const summaries = await fetchConfigurations()

      // Fetch full parsed data for each config in parallel
      const full = await Promise.all(
        summaries.map(async (s) => {
          const detail = await fetchConfiguration(s.id)
          return apiToConfiguration(s, detail.parsed)
        })
      )

      setConfigs(full)

      // Restore active config if it still exists, otherwise pick the first
      setActiveConfig((prev) => {
        if (prev) {
          const still = full.find((c) => c.id === prev.id)
          if (still) return still
        }
        return full[0] ?? null
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load configurations"
      setError(msg)
      console.error("[ConfigProvider]", msg)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    refreshConfigs()
  }, [refreshConfigs])

  // ── In-memory helpers (used after upload) ───────────────────────────────────
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
    () => ({
      activeConfig,
      configs,
      loading,
      error,
      setActiveConfig,
      addConfig,
      removeConfig,
      refreshConfigs,
    }),
    [activeConfig, configs, loading, error, setActiveConfig, addConfig, removeConfig, refreshConfigs]
  )

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  )
}
