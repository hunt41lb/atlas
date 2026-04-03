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
import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { PanwQosProfile } from "@/lib/panw-parser/network-profiles"

// ─── Shared label width ───────────────────────────────────────────────────────

const LW = "w-35"

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
    <DetailDialog title="QoS Profile" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-[75vw]" height="h-[min(90vh,675px)]">
      <div className="space-y-4">
        <Fieldset>
          <FieldsetLegend>Profile</FieldsetLegend>
          <FieldsetContent>
            <DisplayField label="Profile Name" value={profile.name} labelWidth={LW} />
            <DisplayField label="Egress Max" value={String(profile.egressMax)} labelWidth={LW} />
            <DisplayField label="Egress Guaranteed" value={String(profile.egressGuaranteed)} labelWidth={LW} />
          </FieldsetContent>
        </Fieldset>

        <Fieldset>
          <FieldsetLegend>
            <div className="flex items-center gap-3 whitespace-nowrap">
              Classes
              <RadioGroup value={profile.bandwidthType ?? ""} disabled className="flex flex-row gap-4">
                <Label className="flex items-center gap-1.5 text-xs font-normal">
                  <RadioGroupItem value="mbps" />
                  Mbps
                </Label>
                <Label className="flex items-center gap-1.5 text-xs font-normal">
                  <RadioGroupItem value="percentage" />
                  Percentage
                </Label>
              </RadioGroup>
            </div>
          </FieldsetLegend>
          <FieldsetContent>
            <div className="rounded-lg border overflow-hidden">
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
            </div>
            <span className="text-xs text-muted-foreground">class 4 is the default class</span>
          </FieldsetContent>
        </Fieldset>
      </div>
    </DetailDialog>
  )
}
