// @/app/(main)/network/_components/dhcp/dhcp-relay-dialog.tsx

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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { PanwDhcpRelay } from "@/lib/panw-parser/network/dhcp"

export function DhcpRelayDialog({
  relay,
  open,
  onOpenChange,
}: {
  relay: PanwDhcpRelay | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!relay) return null

  return (
    <DetailDialog title="DHCP Relay" open={open} onOpenChange={onOpenChange}>
      <div className="space-y-4">
        <DisplayField label="Interface" value={relay.interface} labelWidth="w-24" />

        <Fieldset>
          <FieldsetLegend>
            <Label className="flex items-center gap-2">
              <Checkbox checked={relay.ipv4Enabled} disabled />
              IPv4
            </Label>
          </FieldsetLegend>
          <FieldsetContent>
            {relay.ipv4Servers.length === 0 ? (
              <span className="text-xs text-muted-foreground">No IPv4 servers configured</span>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead className="text-[11px]">DHCP Server IP Address</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {relay.ipv4Servers.map((s) => (
                      <TableRow key={s}><TableCell className="text-xs font-mono">{s}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </FieldsetContent>
        </Fieldset>

        <Fieldset>
          <FieldsetLegend>
            <Label className="flex items-center gap-2">
              <Checkbox checked={relay.ipv6Enabled} disabled />
              IPv6
            </Label>
          </FieldsetLegend>
          <FieldsetContent>
            {relay.ipv6Servers.length === 0 ? (
              <span className="text-xs text-muted-foreground">No IPv6 servers configured</span>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px]">DHCP Server IPv6 Address</TableHead>
                      <TableHead className="text-[11px]">Interface</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relay.ipv6Servers.map((s) => (
                      <TableRow key={s.address}>
                        <TableCell className="text-xs font-mono">{s.address}</TableCell>
                        <TableCell className="text-xs">{s.interface ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </FieldsetContent>
        </Fieldset>
      </div>
    </DetailDialog>
  )
}

