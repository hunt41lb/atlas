// @/app/(main)/network/_components/routing-profiles/bgp/bgp-dampening-dialog.tsx

"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

import type { PanwBgpDampeningProfile } from "@/lib/panw-parser/network/routing-profiles"

// ─── Dialog ───────────────────────────────────────────────────────────────────

export function DampeningProfileDialog({
  profile,
  open,
  onOpenChange,
}: {
  profile: PanwBgpDampeningProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!profile) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>BGP Dampening Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3">
            <Label className="text-right text-sm">Name</Label>
            <Input readOnly value={profile.name} className="h-8 text-sm" />
            <Label className="text-right text-sm">Description</Label>
            <Input readOnly value={profile.description ?? ""} className="h-8 text-sm" />
            <Label className="text-right text-sm">Suppress Limit</Label>
            <Input readOnly value={profile.suppressLimit} className="h-8 text-sm tabular-nums" />
            <Label className="text-right text-sm">Reuse Limit</Label>
            <Input readOnly value={profile.reuseLimit} className="h-8 text-sm tabular-nums" />
            <Label className="text-right text-sm">Half Life (min)</Label>
            <Input readOnly value={profile.halfLife} className="h-8 text-sm tabular-nums" />
            <Label className="text-right text-sm">Maximum Suppress Time (min)</Label>
            <Input readOnly value={profile.maxSuppressLimit} className="h-8 text-sm tabular-nums" />
          </div>
        </div>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
