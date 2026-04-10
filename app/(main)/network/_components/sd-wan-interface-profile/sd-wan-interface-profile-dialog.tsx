// @/app/(main)/network/_components/sd-wan-interface-profile/sd-wan-interface-profile-dialog.tsx

"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { PanwSdwanInterfaceProfile } from "@/lib/panw-parser/network/sd-wan-interface-profile"

// ─── Link type display mapping ────────────────────────────────────────────────

const LINK_TYPE_LABELS: Record<string, string> = {
  Ethernet: "Ethernet Link",
  MPLS: "MPLS",
  "3G": "3G",
  "4G-LTE": "4G LTE",
  "5G": "5G",
  Cable: "Cable",
  DSL: "DSL",
  Satellite: "Satellite",
  Wireless: "Wireless",
}

export function SdwanInterfaceProfileDialog({
  profile,
  open,
  onOpenChange,
}: {
  profile: PanwSdwanInterfaceProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!profile) return null

  return (
    <DetailDialog title="SD-WAN Interface Profile" open={open} onOpenChange={onOpenChange}>
      <div className="space-y-3">
        <DisplayField label="Name" value={profile.name} />
        <DisplayField label="Link Tag" value={profile.linkTag ?? "None"} />
        <DisplayField label="Description" value={profile.comment ?? ""} />
        <DisplayField label="Link Type" value={LINK_TYPE_LABELS[profile.linkType ?? ""] ?? profile.linkType ?? "None"} />
        <DisplayField label="Maximum Download (Mbps)" value={String(profile.maximumDownload ?? "—")} />
        <DisplayField label="Maximum Upload (Mbps)" value={String(profile.maximumUpload ?? "—")} />

        <Label className="flex items-center gap-2 py-1 pl-1">
          <Checkbox checked={profile.errorCorrection} disabled />
          <span className="text-xs">Eligible for Error Correction Profile Interface Selection</span>
        </Label>

        <Label className="flex items-center gap-2 py-1 pl-1">
          <Checkbox checked={profile.vpnDataTunnelSupport ?? true} disabled />
          <span className="text-xs">VPN Data Tunnel Support</span>
        </Label>

        <DisplayField label="VPN Failover Metric" value={String(profile.vpnFailoverMetric ?? 10)} />

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground shrink-0 w-36">Path Monitoring</span>
          <RadioGroup value={profile.pathMonitoring ?? "Aggressive"} disabled className="flex flex-row gap-4">
            <Label className="flex items-center gap-1.5 text-xs font-normal">
              <RadioGroupItem value="Aggressive" />
              Aggressive
            </Label>
            <Label className="flex items-center gap-1.5 text-xs font-normal">
              <RadioGroupItem value="Relaxed" />
              Relaxed
            </Label>
          </RadioGroup>
        </div>

        <DisplayField label="Probe Frequency (per second)" value={String(profile.probeFrequency ?? "—")} />
        <DisplayField label="Probe Idle Time (seconds)" value={String(profile.probeIdleTime ?? "—")} />
        <DisplayField label="Failback Hold Time (seconds)" value={String(profile.failbackHoldTime ?? "—")} />
      </div>
    </DetailDialog>
  )
}
