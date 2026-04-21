// @/app/(main)/device/_components/setup/management/general-settings-dialog.tsx

"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { Label } from "@/components/ui/label"
import type { GeneralSettings } from "@/lib/panw-parser/device/setup/management"

const LW = "w-72"

interface GeneralSettingsDialogProps {
  generalSettings: GeneralSettings
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GeneralSettingsDialog({
  generalSettings: gs,
  open,
  onOpenChange,
}: GeneralSettingsDialogProps) {
  return (
    <DetailDialog
      open={open}
      onOpenChange={onOpenChange}
      title="General Settings"
    >
      <div className="space-y-2">
        <DisplayField label="Hostname" value={gs.hostname ?? "None"} labelWidth={LW} />
        <DisplayField label="Domain" value={gs.domain ?? "None"} labelWidth={LW} />
        <Label className="flex items-center gap-2 py-1 pl-1">
          <Checkbox checked={gs.acceptDhcpHostname} disabled />
          <span className="text-xs">Accept DHCP server provided Hostname</span>
        </Label>
        <Label className="flex items-center gap-2 py-1 pl-1">
          <Checkbox checked={gs.acceptDhcpDomain} disabled />
          <span className="text-xs">Accept DHCP server provided Domain</span>
        </Label>
        <DisplayField label="Login Banner" value={gs.loginBanner ?? "None"} labelWidth={LW} />
        <Label className="flex items-center gap-2 py-1 pl-1">
          <Checkbox checked={gs.forceAckLoginBanner} disabled />
          <span className="text-xs">Force Admins to Acknowledge Login Banner</span>
        </Label>
        <DisplayField label="SSL/TLS Service Profile" value={gs.sslTlsServiceProfile ?? "None"} labelWidth={LW} />
        <DisplayField label="Time Zone" value={gs.timezone ?? "None"} labelWidth={LW} />
        <DisplayField label="Locale" value={gs.locale ?? "None"} labelWidth={LW} />
        <DisplayField label="Latitude" value={String(gs.latitude ?? "—")} labelWidth={LW} />
        <DisplayField label="Longitude" value={String(gs.longitude ?? "—")} labelWidth={LW} />
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
          <Checkbox checked={gs.duplicateIpAddressSupport} disabled />
          <span className="text-xs">Duplicate IP Address Support</span>
        </Label>
        <Label className="flex items-center gap-2 py-1 pl-1">
          <Checkbox checked={gs.tunnelAcceleration} disabled />
          <span className="text-xs">Tunnel Acceleration</span>
        </Label>
      </div>
    </DetailDialog>
  )
}
