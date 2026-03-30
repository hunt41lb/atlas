// @/app/(main)/network/_components/network-profiles/bfd/bfd-dialog.tsx

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
  FieldGroup,
  HeaderField,
  LabeledValue,
  ReadOnlyCheckbox,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="shrink-0 border-b px-5 pt-4 pb-3">
          <DialogTitle>BFD Profile</DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-3">
          <HeaderField label="Name" value={profile.name} />

          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground w-36 shrink-0 text-right">Mode</span>
            <label className="flex items-center gap-1.5 text-xs">
              <input type="radio" checked={profile.mode === "active"} readOnly className="accent-primary" />
              Active
            </label>
            <label className="flex items-center gap-1.5 text-xs">
              <input type="radio" checked={profile.mode === "passive"} readOnly className="accent-primary" />
              Passive
            </label>
          </div>

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

        <div className="shrink-0 border-t bg-muted/50 rounded-b-xl px-5 py-3 flex justify-end">
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
