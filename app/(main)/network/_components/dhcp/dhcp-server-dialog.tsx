// @/app/(main)/network/_components/dhcp/dhcp-server-dialog.tsx

"use client"

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { PanwDhcpServer } from "@/lib/panw-parser/dhcp"

const LW = "w-36"

// ─── Lease Tab ────────────────────────────────────────────────────────────────

function LeaseTab({ server }: { server: PanwDhcpServer }) {
  const o = server.options

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2 py-1">
        <Checkbox checked={server.probeIp} disabled />
        <span className="text-xs">Ping IP when allocating new IP</span>
      </Label>

      <div className="flex items-center gap-4">
        <span className={`text-sm font-medium text-foreground shrink-0 ${LW}`}>Lease</span>
        <RadioGroup value={o.leaseType} disabled className="flex flex-row gap-4">
          <Label className="flex items-center gap-1.5 text-xs"><RadioGroupItem value="unlimited" />Unlimited</Label>
          <Label className="flex items-center gap-1.5 text-xs"><RadioGroupItem value="timeout" />Timeout</Label>
        </RadioGroup>
        {o.leaseType === "timeout" && o.leaseTimeout != null && (
          <span className="text-xs tabular-nums">{o.leaseTimeout} min</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* IP Pools */}
        <div className="space-y-2">
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow><TableHead className="text-[11px]">IP Pools</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {server.ipPools.length === 0 ? (
                  <TableRow><TableCell className="text-xs text-muted-foreground">None</TableCell></TableRow>
                ) : server.ipPools.map((pool) => (
                  <TableRow key={pool}><TableCell className="text-xs font-mono">{pool}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Reservations */}
        <div className="space-y-2">
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px]">Reserved Address</TableHead>
                  <TableHead className="text-[11px]">MAC Address</TableHead>
                  <TableHead className="text-[11px]">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {server.reservations.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-xs text-muted-foreground">None</TableCell></TableRow>
                ) : server.reservations.map((r) => (
                  <TableRow key={r.ip}>
                    <TableCell className="text-xs font-mono">{r.ip}</TableCell>
                    <TableCell className="text-xs font-mono">{r.mac}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.description ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Options Tab ──────────────────────────────────────────────────────────────

function OptionsTab({ server }: { server: PanwDhcpServer }) {
  const o = server.options

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-6">
        {/* Left column: standard options */}
        <div className="space-y-3">
          <DisplayField label="Inheritance Source" value={o.inheritanceSource ?? "None"} labelWidth={LW} />
          <DisplayField label="Gateway" value={o.gateway ?? "None"} labelWidth={LW} />
          <DisplayField label="Subnet Mask" value={o.subnetMask ?? "None"} labelWidth={LW} />
          <DisplayField label="Primary DNS" value={o.dnsPrimary ?? "None"} labelWidth={LW} />
          <DisplayField label="Secondary DNS" value={o.dnsSecondary ?? "None"} labelWidth={LW} />
          <DisplayField label="Primary WINS" value={o.winsPrimary ?? "None"} labelWidth={LW} />
          <DisplayField label="Secondary WINS" value={o.winsSecondary ?? "None"} labelWidth={LW} />
          <DisplayField label="Primary NIS" value={o.nisPrimary ?? "None"} labelWidth={LW} />
          <DisplayField label="Secondary NIS" value={o.nisSecondary ?? "None"} labelWidth={LW} />
          <DisplayField label="Primary NTP" value={o.ntpPrimary ?? "None"} labelWidth={LW} />
          <DisplayField label="Secondary NTP" value={o.ntpSecondary ?? "None"} labelWidth={LW} />
          <DisplayField label="POP3 Server" value={o.pop3Server ?? "None"} labelWidth={LW} />
          <DisplayField label="SMTP Server" value={o.smtpServer ?? "None"} labelWidth={LW} />
          <DisplayField label="DNS Suffix" value={o.dnsSuffix ?? "None"} labelWidth={LW} />
        </div>

        {/* Right column: custom DHCP options */}
        <Fieldset>
          <FieldsetLegend>Custom DHCP options</FieldsetLegend>
          <FieldsetContent>
            {o.customOptions.length === 0 ? (
              <span className="text-xs text-muted-foreground">None</span>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px]">Name</TableHead>
                      <TableHead className="text-[11px]">Code</TableHead>
                      <TableHead className="text-[11px]">Type</TableHead>
                      <TableHead className="text-[11px]">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {o.customOptions.map((opt) => (
                      <TableRow key={opt.name}>
                        <TableCell className="text-xs">{opt.name}</TableCell>
                        <TableCell className="text-xs tabular-nums">{opt.code}</TableCell>
                        <TableCell className="text-xs capitalize">{opt.type === "ip" ? "IP" : opt.type === "ascii" ? "ASCII" : opt.type === "hex" ? "Hex" : "inherited"}</TableCell>
                        <TableCell className="text-xs font-mono">{opt.type === "inherited" ? "inherited" : opt.values.join(", ") || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </FieldsetContent>
        </Fieldset>
      </div>
    </div>
  )
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

export function DhcpServerDialog({
  server,
  open,
  onOpenChange,
}: {
  server: PanwDhcpServer | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!server) return null

  return (
    <DetailDialog title="DHCP Server" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-4xl" height="h-[min(90vh,900px)]" noPadding>
      <div className="space-y-0 flex flex-col flex-1 min-h-0">
        <div className="shrink-0 space-y-3 px-5 pt-5 pb-3">
          <DisplayField label="Interface" value={server.interface} labelWidth={LW} />
          <DisplayField label="Mode" value={server.mode ?? "auto"} labelWidth={LW} />
        </div>

        <Tabs defaultValue="lease" className="flex-1 flex flex-col min-h-0">
          <div className="shrink-0 border-b px-5">
            <TabsList variant="line">
              <TabsTrigger value="lease">Lease</TabsTrigger>
              <TabsTrigger value="options">Options</TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <TabsContent value="lease"><LeaseTab server={server} /></TabsContent>
            <TabsContent value="options"><OptionsTab server={server} /></TabsContent>
          </div>
        </Tabs>
      </div>
    </DetailDialog>
  )
}
