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
  ReadOnlyCheckbox,
  ProfileDialog,
} from "../../router-shared/router-dialog/field-display"
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

        <ReadOnlyCheckbox checked={profile.snmpSyslogNotification} label="SNMP Syslog Notification" />

        <FieldGroup title="Optional TLVs">
          <div className="grid grid-cols-2 gap-x-4">
            <ReadOnlyCheckbox checked={profile.portDescription} label="Port Description" />
            <ReadOnlyCheckbox checked={profile.systemName} label="System Name" />
            <ReadOnlyCheckbox checked={profile.systemDescription} label="System Description" />
            <ReadOnlyCheckbox checked={profile.systemCapabilities} label="System Capabilities" />
          </div>

          <ReadOnlyCheckbox checked={profile.managementAddressEnabled} label="Management Address" />

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
