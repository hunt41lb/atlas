// @/app/(main)/network/_components/network-profiles/lldp/lldp-dialog.tsx

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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

import type { PanwLldpProfile } from "@/lib/panw-parser/network-profiles"

export function LldpDialog({
  profile,
  open,
  onOpenChange,
}: {
  profile: PanwLldpProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!profile) return null

  return (
    <ProfileDialog title="LLDP Profile" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-xl max-h-[85vh]">
      <div className="space-y-4">
        <HeaderField label="Name" value={profile.name} />
        <HeaderField label="Mode" value="transmit-receive" />
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={profile.snmpSyslogNotification} disabled />
          <span className="text-xs">SNMP Syslog Notification</span>
        </Label>

        <FieldGroup title="Optional TLVs">
          <div className="grid grid-cols-2 gap-x-4">
            <Label className="flex items-center gap-2 py-1">
              <Checkbox checked={profile.portDescription} disabled />
              <span className="text-xs">Port Description</span>
            </Label>

            <Label className="flex items-center gap-2 py-1">
              <Checkbox checked={profile.systemName} disabled />
              <span className="text-xs">System Name</span>
            </Label>

            <Label className="flex items-center gap-2 py-1">
              <Checkbox checked={profile.systemDescription} disabled />
              <span className="text-xs">System Description</span>
            </Label>

            <Label className="flex items-center gap-2 py-1">
              <Checkbox checked={profile.systemCapabilities} disabled />
              <span className="text-xs">System Capabilities</span>
            </Label>
          </div>

          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={profile.managementAddressEnabled} disabled />
            <span className="text-xs">Management Address</span>
          </Label>

          {profile.managementAddressEnabled && profile.managementAddresses.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px]">Name</TableHead>
                  <TableHead className="text-[11px]">Interface</TableHead>
                  <TableHead className="text-[11px]">IP Choice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profile.managementAddresses.map((addr) => (
                  <TableRow key={addr.name}>
                    <TableCell className="text-xs font-mono">{addr.name}</TableCell>
                    <TableCell className="text-xs">{addr.interface ?? "—"}</TableCell>
                    <TableCell className="text-xs">{addr.ipv4 ? "ipv4" : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </FieldGroup>
      </div>
    </ProfileDialog>
  )
}
