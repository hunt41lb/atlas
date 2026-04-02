// @/app/(main)/network/_components/network-profiles/macsec/macsec-dialog.tsx

"use client"

import {
  HeaderField,
  ProfileDialog,
} from "../../router-shared/router-dialog/field-display"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import type { PanwMacsecProfile } from "@/lib/panw-parser/network-profiles"

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
    <ProfileDialog title="MACsec Crypto Profile" open={open} onOpenChange={onOpenChange}>
      <div className="space-y-4">
        <HeaderField label="Name" value={profile.name} />

        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground shrink-0 text-right w-36">Encryption</span>
          <RadioGroup value={profile.encryption ?? ""} disabled className="flex flex-row gap-4">
            <Label className="flex items-center gap-1.5 text-xs">
              <RadioGroupItem value="aes-128-gcm" />
              AES-128-GCM
            </Label>
            <Label className="flex items-center gap-1.5 text-xs">
              <RadioGroupItem value="aes-256-gcm" />
              AES-256-GCM
            </Label>
          </RadioGroup>
        </div>

        <HeaderField label="Confidentiality Offset" value={String(profile.confidentialityOffset)} />
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.sciInclude} disabled />
          <span className="text-xs">Enable SCI Include</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.antiReplay} disabled />
          <span className="text-xs">Enable Anti Replay</span>
        </Label>
        <HeaderField label="Anti Replay Window" value={String(profile.antiReplayWindow)} />
        <HeaderField label="SAK Rekey Interval (sec)" value={String(profile.rekeyInterval)} />
      </div>
    </ProfileDialog>
  )
}
