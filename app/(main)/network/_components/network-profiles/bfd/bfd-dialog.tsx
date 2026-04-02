// @/app/(main)/network/_components/network-profiles/bfd/bfd-dialog.tsx

"use client"

import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { PanwNetworkBfdProfile } from "@/lib/panw-parser/network-profiles"

export function BfdDialog({
  profile,
  open,
  onOpenChange,
}: {
  profile: PanwNetworkBfdProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!profile) return null

  return (
    <DetailDialog title="BFD Profile" open={open} onOpenChange={onOpenChange}>
      <div className="space-y-4">
        <DisplayField label="Name" value={profile.name} />

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground shrink-0">Mode</span>
          <RadioGroup value={profile.mode ?? ""} disabled className="flex flex-row gap-4">
            <Label className="flex items-center gap-1.5 text-xs">
              <RadioGroupItem value="active" />
              Active
            </Label>
            <Label className="flex items-center gap-1.5 text-xs">
              <RadioGroupItem value="passive" />
              Passive
            </Label>
          </RadioGroup>
        </div>

        <DisplayField label="Desired Minimum Tx Interval (ms)" value={String(profile.minTxInterval)} labelWidth="w-64" />
        <DisplayField label="Required Minimum Rx Interval (ms)" value={String(profile.minRxInterval)} labelWidth="w-64" />
        <DisplayField label="Detection Time Multiplier" value={String(profile.detectionMultiplier)} labelWidth="w-64" />
        <DisplayField label="Hold Time (ms)" value={String(profile.holdTime)} labelWidth="w-64" />

        <Fieldset disabled={!profile.multihopEnabled}>
          <FieldsetLegend>
            <Label className="flex items-center gap-2">
              <Checkbox checked={profile.multihopEnabled} disabled />
              Enable Multihop
            </Label>
          </FieldsetLegend>
          {profile.multihopEnabled && (
            <FieldsetContent>
              <DisplayField label="Minimum Rx TTL" value={String(profile.multihopMinRxTtl ?? "—")} />
            </FieldsetContent>
          )}
        </Fieldset>
      </div>
    </DetailDialog>
  )
}
