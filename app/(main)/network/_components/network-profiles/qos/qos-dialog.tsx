// @/app/(main)/network/_components/network-profiles/qos/qos-dialog.tsx

"use client"

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
  ProfileDialog,
} from "../../router-shared/router-dialog/field-display"
import type { PanwQosProfile } from "@/lib/panw-parser/network-profiles"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

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
    <ProfileDialog title="QoS Profile" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-[75vw]" height="h-[min(85vh,650px)]">

      <div className="space-y-4">
        <FieldGroup title="Profile">
          <HeaderField label="Profile Name" value={profile.name} />
          <HeaderField label="Egress Max" value={String(profile.egressMax)} />
          <HeaderField label="Egress Guaranteed" value={String(profile.egressGuaranteed)} />
        </FieldGroup>

        <FieldGroup title="Classes">
          <div className="pb-2">
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground shrink-0 text-right w-36">Class Bandwidth Type</span>
              <RadioGroup value={profile.bandwidthType ?? ""} disabled className="flex flex-row gap-4">
                <Label className="flex items-center gap-1.5 text-xs">
                  <RadioGroupItem value="mbps" />
                  Mbps
                </Label>
                <Label className="flex items-center gap-1.5 text-xs">
                  <RadioGroupItem value="percentage" />
                  Percentage
                </Label>
              </RadioGroup>
            </div>
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
    </ProfileDialog>
  )
}
