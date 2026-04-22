// @/app/(main)/device/_components/setup/management/general-settings-card.tsx

"use client"

import { useState } from "react"
import type { GeneralSettings } from "@/lib/panw-parser/device/setup/management"
import { SettingsCard, Field, BoolField } from "./_shared"
import { GeneralSettingsDialog } from "./general-settings-dialog"

interface GeneralSettingsCardProps {
  generalSettings: GeneralSettings
}

export function GeneralSettingsCard({ generalSettings: gs }: GeneralSettingsCardProps) {
  const [open, setOpen] = useState(false)

  const geoLocation = gs.latitude !== null && gs.longitude !== null
    ? `Latitude: ${gs.latitude}, Longitude: ${gs.longitude}`
    : null

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setOpen(true)
          }
        }}
        className="cursor-pointer [&>div]:hover:bg-accent/50 [&>div]:transition-colors"
      >
        <SettingsCard title="General Settings">
          <Field label="Hostname" value={gs.hostname} />
          <Field label="Domain" value={gs.domain} />
          <Field label="Login Banner" value={gs.loginBanner} />
          <BoolField label="Force Admins to Acknowledge Login Banner" checked={gs.forceAckLoginBanner} />
          <Field label="SSL/TLS Service Profile" value={gs.sslTlsServiceProfile} />
          <Field label="Time Zone" value={gs.timezone} />
          <Field label="Locale" value={gs.locale} />
          <Field label="Geo Location" value={geoLocation} />
          <BoolField label="Automatically Acquire Commit Lock" checked={gs.automaticallyAcquireCommitLock} />
          <BoolField label="Certificate Expiration Check" checked={gs.certificateExpirationCheck} />
          <BoolField label="Use Hypervisor Assigned MAC Addresses" checked={gs.useHypervisorAssignedMacAddresses} />
          <BoolField label="Tunnel Acceleration" checked={gs.tunnelAcceleration} />
        </SettingsCard>
      </div>
      <GeneralSettingsDialog
        generalSettings={gs}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
