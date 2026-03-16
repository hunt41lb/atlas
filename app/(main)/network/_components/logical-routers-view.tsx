// @/app/(main)/network/_components/logical-routers-view.tsx
//
// Overview table for Logical Routers. Unlike Virtual Routers (which use
// tabs for protocol details), Logical Routers show a single overview
// table — protocol-specific configurations are on separate Routing
// Profiles pages in the sidebar.

"use client"

import * as React from "react"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { RouterSettingsTab } from "./router-shared/router-settings-tab"

export function LogicalRoutersView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const routers = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).logicalRouters
  }, [activeConfig, selectedScope])

  return (
    <RouterSettingsTab
      routers={routers}
      isPanorama={isPanorama}
      title="Logical Routers"
    />
  )
}
