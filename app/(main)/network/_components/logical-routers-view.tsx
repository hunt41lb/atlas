// @/app/(main)/network/_components/logical-routers-view.tsx
//
// Overview table for Logical Routers with clickable names that open
// a detail dialog mimicking the PAN-OS GUI layout.

"use client"

import * as React from "react"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { RouterSettingsTab } from "./router-shared/router-settings-tab"
import { RouterDialog } from "./router-shared/router-dialog"
import type { PanwVirtualRouter } from "@/lib/panw-parser/types"

export function LogicalRoutersView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [selectedRouter, setSelectedRouter] = React.useState<PanwVirtualRouter | null>(null)

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const routers = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).logicalRouters
  }, [activeConfig, selectedScope])

  return (
    <>
      <RouterSettingsTab
        routers={routers}
        isPanorama={isPanorama}
        title="Logical Routers"
        onRouterClick={setSelectedRouter}
      />
      <RouterDialog
        router={selectedRouter}
        open={selectedRouter !== null}
        onOpenChange={(open) => { if (!open) setSelectedRouter(null) }}
        routerLabel="Logical Router"
      />
    </>
  )
}
