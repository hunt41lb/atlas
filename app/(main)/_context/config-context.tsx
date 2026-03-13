// @/app/(main)/_context/config-context.tsx

"use client"

import * as React from "react"
import type { ParsedConfig } from "@/lib/panw-parser/types"
import {
  fetchConfigurations,
  fetchConfiguration,
  type ApiConfiguration,
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
const STORAGE_KEY = "atlas:activeConfigId"

export function useConfig() {
  const context = React.useContext(ConfigContext)
  if (!context) throw new Error("useConfig must be used within a ConfigProvider.")
  return context
}

/**
 * If the filename matches our watcher format (mm-dd-yyyy DeviceName.xml),
 * return the stem as the display name e.g. "03-13-2026 Panorama02".
 * Returns null for any other filename so existing fallbacks still apply.
 */
function datedFileStem(fileName: string): string | null {
  const m = fileName.match(/^(\d{2}-\d{2}-\d{4} .+)\.xml$/i)
  return m ? m[1] : null
}

function apiToConfiguration(detail: ApiConfiguration): Configuration {
  return {
    id:              detail.id,
    name:            datedFileStem(detail.file_name)
                       ?? detail.device_hostname
                       ?? deriveConfigName(detail.parsed, detail.file_name),
    deviceType:      detail.device_type,
    hostname:        detail.device_hostname ?? undefined,
    platformModel:   undefined,
    softwareVersion: detail.pan_os_version ?? undefined,
    serialNumber:    detail.device_serial ?? undefined,
    importedAt:      new Date(detail.backed_up_at),
    fileName:        detail.file_name,
    fileSizeBytes:   Number(detail.file_size_bytes),
    parsedConfig:    detail.parsed,
  }
}

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [configs,      setConfigs]      = React.useState<Configuration[]>([])
  const [activeConfig, setActiveConfig] = React.useState<Configuration | null>(null)
  const [loading,      setLoading]      = React.useState(true)
  const [error,        setError]        = React.useState<string | null>(null)

  const handleSetActiveConfig = React.useCallback((config: Configuration | null) => {
    setActiveConfig(config)
    if (typeof window !== "undefined") {
      if (config) {
        localStorage.setItem(STORAGE_KEY, config.id)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const refreshConfigs = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const summaries = await fetchConfigurations()
      const full = await Promise.all(
        summaries.map(async (s) => {
          const detail = await fetchConfiguration(s.id)
          return apiToConfiguration(detail)
        })
      )
      setConfigs(full)
      setActiveConfig((prev) => {
        if (prev) {
          const still = full.find((c) => c.id === prev.id)
          if (still) return still
        }
        const savedId = typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null
        if (savedId) {
          const saved = full.find((c) => c.id === savedId)
          if (saved) return saved
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

  const addConfig = React.useCallback((config: Configuration) => {
    setConfigs((prev) => {
      const exists = prev.find((c) => c.id === config.id)
      if (exists) return prev
      return [...prev, config]
    })
    handleSetActiveConfig(config)
  }, [handleSetActiveConfig])

  const removeConfig = React.useCallback((id: string) => {
    setConfigs((prev) => prev.filter((c) => c.id !== id))
    setActiveConfig((prev) => (prev?.id === id ? null : prev))
    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem(STORAGE_KEY)
      if (savedId === id) localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const contextValue = React.useMemo<ConfigContextProps>(
    () => ({
      activeConfig,
      configs,
      loading,
      error,
      setActiveConfig: handleSetActiveConfig,
      addConfig,
      removeConfig,
      refreshConfigs,
    }),
    [activeConfig, configs, loading, error, handleSetActiveConfig, addConfig, removeConfig, refreshConfigs]
  )

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  )
}
