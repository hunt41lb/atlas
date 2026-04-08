// @/app/(main)/network/_components/lldp-general/lldp-general-view.tsx

"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { DisplayField } from "@/components/ui/display-field"
import { Label } from "@/components/ui/label"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { NotConfiguredState } from "@/app/(main)/_components/ui/empty-state"
import { LLDP_GENERAL_DEFAULTS } from "@/lib/panw-parser/lldp-general"
import type { PanwLldpGeneral } from "@/lib/panw-parser/lldp-general"

const LW = "w-44"

export function LldpGeneralView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()

  const settings = React.useMemo<PanwLldpGeneral | null>(() => {
    if (!activeConfig) return null
    const resolved = resolveNetworkData(activeConfig.parsedConfig, selectedScope)
    const all = resolved.lldpGeneral
    if (!Array.isArray(all) || all.length === 0) return null
    // Merge: last-wins for non-null values across templates
    return all.reduce<PanwLldpGeneral>((acc, s) => ({
      enabled: s.enabled || acc.enabled,
      transmitInterval: s.transmitInterval ?? acc.transmitInterval,
      transmitDelay: s.transmitDelay ?? acc.transmitDelay,
      holdTimeMultiple: s.holdTimeMultiple ?? acc.holdTimeMultiple,
      notificationInterval: s.notificationInterval ?? acc.notificationInterval,
      templateName: s.templateName ?? acc.templateName,
    }), { enabled: false, transmitInterval: null, transmitDelay: null, holdTimeMultiple: null, notificationInterval: null, templateName: null })
  }, [activeConfig, selectedScope])

  if (!settings) {
    return <NotConfiguredState title="LLDP" />
  }

  return (
    <div className="flex h-full flex-col min-h-0">
      {/* Header bar */}
      <div className="shrink-0 flex items-center border-b px-4 py-2">
        <span className="text-sm font-medium">LLDP General</span>
      </div>

      {/* Settings card */}
      <div className="flex-1 flex items-start justify-center p-8">
        <div className="w-full max-w-md space-y-4 rounded-xl border bg-card p-6">
          <Label className="flex items-center justify-center gap-2 py-1">
            <span className="text-sm font-medium">Enable</span>
            <Checkbox checked={settings.enabled} disabled />
          </Label>

          <DisplayField
            label="Transmit Interval (sec)"
            value={String(settings.transmitInterval ?? LLDP_GENERAL_DEFAULTS.transmitInterval)}
            labelWidth={LW}
          />
          <DisplayField
            label="Transmit Delay (sec)"
            value={String(settings.transmitDelay ?? LLDP_GENERAL_DEFAULTS.transmitDelay)}
            labelWidth={LW}
          />
          <DisplayField
            label="Hold Time Multiple"
            value={String(settings.holdTimeMultiple ?? LLDP_GENERAL_DEFAULTS.holdTimeMultiple)}
            labelWidth={LW}
          />
          <DisplayField
            label="Notification Interval"
            value={String(settings.notificationInterval ?? LLDP_GENERAL_DEFAULTS.notificationInterval)}
            labelWidth={LW}
          />
        </div>
      </div>
    </div>
  )
}
