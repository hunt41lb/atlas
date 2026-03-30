// @/app/(main)/network/_components/network-profiles/lldp/lldp-dialog.tsx

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
  ReadOnlyCheckbox,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="shrink-0 border-b px-5 pt-4 pb-3">
          <DialogTitle>LLDP Profile</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
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

        <div className="shrink-0 border-t bg-muted/50 rounded-b-xl px-5 py-3 flex justify-end">
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
