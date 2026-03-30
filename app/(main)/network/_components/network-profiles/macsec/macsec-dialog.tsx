// @/app/(main)/network/_components/network-profiles/macsec/macsec-dialog.tsx

"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  HeaderField,
  ReadOnlyCheckbox,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="shrink-0 border-b px-5 pt-4 pb-3">
          <DialogTitle>MACsec Crypto Profile</DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-3">
          <HeaderField label="Name" value={profile.name} />

          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground w-36 shrink-0 text-right">Encryption</span>
            <label className="flex items-center gap-1.5 text-xs">
              <input type="radio" checked={profile.encryption === "aes-128-gcm"} readOnly className="accent-primary" />
              AES-128-GCM
            </label>
            <label className="flex items-center gap-1.5 text-xs">
              <input type="radio" checked={profile.encryption === "aes-256-gcm"} readOnly className="accent-primary" />
              AES-256-GCM
            </label>
          </div>

          <HeaderField label="Confidentiality Offset" value={String(profile.confidentialityOffset)} />
          <ReadOnlyCheckbox checked={profile.sciInclude} label="Enable SCI Include" />
          <ReadOnlyCheckbox checked={profile.antiReplay} label="Enable Anti Replay" />
          <HeaderField label="Anti Replay Window" value={String(profile.antiReplayWindow)} />
          <HeaderField label="SAK Rekey Interval (sec)" value={String(profile.rekeyInterval)} />
        </div>

        <div className="shrink-0 border-t bg-muted/50 rounded-b-xl px-5 py-3 flex justify-end">
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
