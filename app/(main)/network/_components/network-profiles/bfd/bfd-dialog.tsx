// @/app/(main)/network/_components/network-profiles/bfd/bfd-dialog.tsx

"use client"

import {
  FieldGroup,
  HeaderField,
  LabeledValue,
  ReadOnlyCheckbox,
  ReadOnlyRadio,
  ProfileDialog,
} from "../../router-shared/router-dialog/field-display"
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
    <ProfileDialog title="BFD Profile" open={open} onOpenChange={onOpenChange}>

        <div className="space-y-4">
          <HeaderField label="Name" value={profile.name} />

          <ReadOnlyRadio label="Mode" value={profile.mode} options={[
            { value: "active", label: "Active" },
            { value: "passive", label: "Passive" },
          ]} />

          <HeaderField label="Desired Minimum Tx Interval (ms)" value={String(profile.minTxInterval)} labelWidth="w-64" />
          <HeaderField label="Required Minimum Rx Interval (ms)" value={String(profile.minRxInterval)} labelWidth="w-64" />
          <HeaderField label="Detection Time Multiplier" value={String(profile.detectionMultiplier)} labelWidth="w-64" />
          <HeaderField label="Hold Time (ms)" value={String(profile.holdTime)} labelWidth="w-64" />

          <FieldGroup title="Multihop">
            <ReadOnlyCheckbox checked={profile.multihopEnabled} label="Enable Multihop" />
            {profile.multihopEnabled && (
              <LabeledValue label="Minimum Rx TTL" value={profile.multihopMinRxTtl ?? "—"} />
            )}
          </FieldGroup>
        </div>
    </ProfileDialog>
  )
}
