// @/app/(main)/network/_components/network-profiles/macsec/macsec-dialog.tsx

"use client"

import {
  HeaderField,
  ReadOnlyCheckbox,
  ReadOnlyRadio,
  ProfileDialog,
} from "../../router-shared/router-dialog/field-display"
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

        <ReadOnlyRadio label="Encryption" value={profile.encryption} options={[
          { value: "aes-128-gcm", label: "AES-128-GCM" },
          { value: "aes-256-gcm", label: "AES-256-GCM" },
        ]} />

        <HeaderField label="Confidentiality Offset" value={String(profile.confidentialityOffset)} />
        <ReadOnlyCheckbox checked={profile.sciInclude} label="Enable SCI Include" />
        <ReadOnlyCheckbox checked={profile.antiReplay} label="Enable Anti Replay" />
        <HeaderField label="Anti Replay Window" value={String(profile.antiReplayWindow)} />
        <HeaderField label="SAK Rekey Interval (sec)" value={String(profile.rekeyInterval)} />
      </div>
    </ProfileDialog>
  )
}
