// @/app/(main)/network/_components/network-profiles/qos/qos-dialog.tsx

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
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  FieldGroup,
  HeaderField,
} from "../../router-shared/router-dialog/field-display"
import type { PanwQosProfile } from "@/lib/panw-parser/network-profiles"

export function QosDialog({
  profile,
  open,
  onOpenChange,
}: {
  profile: PanwQosProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!profile) return null

  const unit = profile.bandwidthType === "mbps" ? "Mbps" : "%"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-[75vw] h-[min(85vh,650px)] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="shrink-0 border-b px-5 pt-4 pb-3">
          <DialogTitle>QoS Profile</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <FieldGroup title="Profile">
            <HeaderField label="Profile Name" value={profile.name} />
            <HeaderField label="Egress Max" value={String(profile.egressMax)} />
            <HeaderField label="Egress Guaranteed" value={String(profile.egressGuaranteed)} />
          </FieldGroup>

          <FieldGroup title="Classes">
            <div className="flex items-center gap-4 pb-2">
              <span className="text-xs text-muted-foreground">Class Bandwidth Type</span>
              <label className="flex items-center gap-1.5 text-xs">
                <input type="radio" checked={profile.bandwidthType === "mbps"} readOnly className="accent-primary" />
                Mbps
              </label>
              <label className="flex items-center gap-1.5 text-xs">
                <input type="radio" checked={profile.bandwidthType === "percentage"} readOnly className="accent-primary" />
                Percentage
              </label>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px]">Class</TableHead>
                  <TableHead className="text-[11px]">Priority</TableHead>
                  <TableHead className="text-[11px]">Egress Max ({unit})</TableHead>
                  <TableHead className="text-[11px]">Egress Guaranteed ({unit})</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profile.classes.map((cls) => (
                  <TableRow key={cls.name}>
                    <TableCell className="text-xs">{cls.name}</TableCell>
                    <TableCell className="text-xs">{cls.priority}</TableCell>
                    <TableCell className="text-xs tabular-nums">{cls.egressMax}</TableCell>
                    <TableCell className="text-xs tabular-nums">{cls.egressGuaranteed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <span className="text-xs text-muted-foreground">class 4 is the default class</span>
          </FieldGroup>
        </div>

        <div className="shrink-0 border-t bg-muted/50 rounded-b-xl px-5 py-3 flex justify-end">
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
