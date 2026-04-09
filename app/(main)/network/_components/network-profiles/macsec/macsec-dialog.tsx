// @/app/(main)/network/_components/network-profiles/macsec/macsec-dialog.tsx

"use client"

import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { PanwMacsecProfile } from "@/lib/panw-parser/network/network-profiles"

export function MacsecDialog({
  profile,
  open,
  onOpenChange,
}: {
  profile: PanwMacsecProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!profile) return null

  return (
    <DetailDialog title="MACsec Crypto Profile" open={open} onOpenChange={onOpenChange}>
      <div className="space-y-4">
        <DisplayField label="Name" value={profile.name} />

        <Fieldset>
          <FieldsetLegend>
            <div className="flex items-center gap-3 whitespace-nowrap">
              Encryption
              <RadioGroup value={profile.encryption ?? ""} disabled className="flex flex-row gap-4">
                <Label className="flex items-center gap-1.5 text-xs font-normal">
                  <RadioGroupItem value="aes-128-gcm" />
                  AES-128-GCM
                </Label>
                <Label className="flex items-center gap-1.5 text-xs font-normal">
                  <RadioGroupItem value="aes-256-gcm" />
                  AES-256-GCM
                </Label>
              </RadioGroup>
            </div>
          </FieldsetLegend>
          <FieldsetContent>
            <DisplayField label="Confidentiality Offset" value={String(profile.confidentialityOffset)} />
          </FieldsetContent>
        </Fieldset>

        <Fieldset disabled={!profile.antiReplay}>
          <FieldsetLegend>
            <Label className="flex items-center gap-2">
              <Checkbox checked={profile.antiReplay} disabled />
              Enable Anti Replay
            </Label>
          </FieldsetLegend>
          {profile.antiReplay && (
            <FieldsetContent>
              <DisplayField label="Anti Replay Window" value={String(profile.antiReplayWindow)} />
            </FieldsetContent>
          )}
        </Fieldset>

        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.sciInclude} disabled />
          <span className="text-xs">Enable SCI Include</span>
        </Label>

        <DisplayField label="SAK Rekey Interval (sec)" value={String(profile.rekeyInterval)} />
      </div>
    </DetailDialog>
  )
}

