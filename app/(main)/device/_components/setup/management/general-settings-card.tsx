// @/app/(main)/device/_components/setup/management/general-settings-card.tsx

"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DisplayField } from "@/components/ui/display-field"
import { Label } from "@/components/ui/label"
import type { GeneralSettings } from "@/lib/panw-parser/device/setup/management"
import { GeneralSettingsDialog } from "./general-settings-dialog"

const LW = "w-72"

interface GeneralSettingsCardProps {
  generalSettings: GeneralSettings
}

export function GeneralSettingsCard({ generalSettings: gs }: GeneralSettingsCardProps) {
  const [open, setOpen] = useState(false)

  const geoLocation = gs.latitude !== null && gs.longitude !== null
    ? `Latitude: ${gs.latitude}, Longitude: ${gs.longitude}`
    : "None"

  return (
    <>
      <Card>
        <CardHeader
          role="button"
          tabIndex={0}
          onClick={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setOpen(true)
            }
          }}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        >
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <DisplayField label="Hostname" value={gs.hostname ?? "None"} labelWidth={LW} />
          <DisplayField label="Domain" value={gs.domain ?? "None"} labelWidth={LW} />
          <DisplayField label="Login Banner" value={gs.loginBanner ?? "None"} labelWidth={LW} />
          <Label className="flex items-center gap-2 py-1 pl-1">
            <Checkbox checked={gs.forceAckLoginBanner} disabled />
            <span className="text-xs">Force Admins to Acknowledge Login Banner</span>
          </Label>
          <DisplayField label="SSL/TLS Service Profile" value={gs.sslTlsServiceProfile ?? "None"} labelWidth={LW} />
          <DisplayField label="Time Zone" value={gs.timezone ?? "None"} labelWidth={LW} />
          <DisplayField label="Locale" value={gs.locale ?? "None"} labelWidth={LW} />
          <DisplayField label="Geo Location" value={geoLocation} labelWidth={LW} />
          <Label className="flex items-center gap-2 py-1 pl-1">
            <Checkbox checked={gs.automaticallyAcquireCommitLock} disabled />
            <span className="text-xs">Automatically Acquire Commit Lock</span>
          </Label>
          <Label className="flex items-center gap-2 py-1 pl-1">
            <Checkbox checked={gs.certificateExpirationCheck} disabled />
            <span className="text-xs">Certificate Expiration Check</span>
          </Label>
          <Label className="flex items-center gap-2 py-1 pl-1">
            <Checkbox checked={gs.useHypervisorAssignedMacAddresses} disabled />
            <span className="text-xs">Use Hypervisor Assigned MAC Addresses</span>
          </Label>
          <Label className="flex items-center gap-2 py-1 pl-1">
            <Checkbox checked={gs.tunnelAcceleration} disabled />
            <span className="text-xs">Tunnel Acceleration</span>
          </Label>
        </CardContent>
      </Card>

      <GeneralSettingsDialog
        generalSettings={gs}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
