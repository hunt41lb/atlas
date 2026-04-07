// @/app/(main)/network/_components/dns-proxy/dns-proxy-dialog.tsx

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
import type { PanwDnsProxy } from "@/lib/panw-parser/dns-proxy"

const LW = "w-32"

// ─── DNS Proxy Rules Tab ──────────────────────────────────────────────────────

function DnsProxyRulesTab({ proxy }: { proxy: PanwDnsProxy }) {
  if (proxy.domainServers.length === 0) {
    return <span className="text-xs text-muted-foreground">No DNS proxy rules configured</span>
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[11px]">Name</TableHead>
            <TableHead className="text-[11px]">Cacheable</TableHead>
            <TableHead className="text-[11px]">Domain Name</TableHead>
            <TableHead className="text-[11px]">DNS Server Profile</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proxy.domainServers.map((ds) => (
            <TableRow key={ds.name}>
              <TableCell className="text-xs font-medium">{ds.name}</TableCell>
              <TableCell><Checkbox checked={ds.cacheable} disabled /></TableCell>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  {ds.domainNames.map((d) => <span key={d} className="text-xs">{d}</span>)}
                </div>
              </TableCell>
              <TableCell className="text-xs">{ds.serverProfile ?? ds.primary ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// ─── Static Entries Tab ───────────────────────────────────────────────────────

function StaticEntriesTab({ proxy }: { proxy: PanwDnsProxy }) {
  if (proxy.staticEntries.length === 0) {
    return <span className="text-xs text-muted-foreground">No static entries configured</span>
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[11px]">Name</TableHead>
            <TableHead className="text-[11px]">FQDN</TableHead>
            <TableHead className="text-[11px]">Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proxy.staticEntries.map((se) => (
            <TableRow key={se.name}>
              <TableCell className="text-xs font-medium">{se.name}</TableCell>
              <TableCell className="text-xs">{se.domain ?? "—"}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  {se.addresses.map((a) => <span key={a} className="text-xs font-mono">{a}</span>)}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// ─── Encrypted DNS Tab ────────────────────────────────────────────────────────

function EncryptedDnsTab({ proxy }: { proxy: PanwDnsProxy }) {
  const ed = proxy.encryptedDns

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2 py-1">
        <Checkbox checked={ed.enabled} disabled />
        <span className="text-xs">Enable Encrypted DNS</span>
      </Label>

      <div className="grid grid-cols-2 gap-6">
        <Fieldset>
          <FieldsetLegend>Server Settings</FieldsetLegend>
          <FieldsetContent>
            <DisplayField label="Connection Type" value={ed.connectionType ?? "None"} labelWidth={LW} />
            <Label className="flex items-center gap-2 py-1 pl-1">
              <Checkbox checked={ed.enableFallback} disabled />
              <span className="text-xs">Fallback on Unencrypted DNS</span>
            </Label>
            <DisplayField label="TCP Timeout (sec)" value={ed.tcpTimeout != null ? String(ed.tcpTimeout) : "2"} labelWidth={LW} />
          </FieldsetContent>
        </Fieldset>

        <Fieldset>
          <FieldsetLegend>Client Settings</FieldsetLegend>
          <FieldsetContent>
            <Fieldset>
              <FieldsetLegend>Allowed DNS Types</FieldsetLegend>
              <FieldsetContent>
                <div className="flex gap-6">
                  <Label className="flex items-center gap-2">
                    <Checkbox checked={ed.doh} disabled />
                    <span className="text-xs">DoH</span>
                  </Label>
                  <Label className="flex items-center gap-2">
                    <Checkbox checked={ed.dot} disabled />
                    <span className="text-xs">DoT</span>
                  </Label>
                  <Label className="flex items-center gap-2">
                    <Checkbox checked={ed.cleartext} disabled />
                    <span className="text-xs">Cleartext</span>
                  </Label>
                </div>
              </FieldsetContent>
            </Fieldset>
            <DisplayField label="SSL/TLS Service Profile" value={ed.sslTlsServiceProfile ?? "None"} labelWidth="w-40" />
          </FieldsetContent>
        </Fieldset>
      </div>
    </div>
  )
}

// ─── Advanced Tab ─────────────────────────────────────────────────────────────

function AdvancedTab({ proxy }: { proxy: PanwDnsProxy }) {
  const adv = proxy.advanced

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        <Fieldset>
          <FieldsetLegend>
            <Label className="flex items-center gap-2">
              <Checkbox checked={adv.tcpQueriesEnabled} disabled />
              TCP Queries
            </Label>
          </FieldsetLegend>
          {adv.tcpQueriesEnabled && (
            <FieldsetContent>
              <DisplayField label="Max Pending Requests" value={String(adv.tcpMaxPendingRequests ?? "—")} labelWidth="w-40" />
            </FieldsetContent>
          )}
        </Fieldset>

        <Fieldset>
          <FieldsetLegend>UDP Queries Retries</FieldsetLegend>
          <FieldsetContent>
            <DisplayField label="Interval (sec)" value={String(adv.udpRetriesInterval ?? "—")} labelWidth={LW} />
            <DisplayField label="Attempts" value={String(adv.udpRetriesAttempts ?? "—")} labelWidth={LW} />
          </FieldsetContent>
        </Fieldset>
      </div>

      <Fieldset>
        <FieldsetLegend>
          <Label className="flex items-center gap-2">
            <Checkbox checked={adv.cacheEnabled} disabled />
            Cache
          </Label>
        </FieldsetLegend>
        {adv.cacheEnabled && (
          <FieldsetContent>
            <Label className="flex items-center gap-2 py-1 pl-1">
              <Checkbox checked={adv.maxTtlEnabled} disabled />
              <span className="text-xs">Enable TTL</span>
            </Label>
            {adv.maxTtlEnabled && (
              <DisplayField label="Time to Live (sec)" value={String(adv.maxTtlValue ?? "—")} labelWidth="w-32" />
            )}
            <Label className="flex items-center gap-2 py-1 pl-1">
              <Checkbox checked={adv.cacheEdns} disabled />
              <span className="text-xs">Cache EDNS Responses</span>
            </Label>
          </FieldsetContent>
        )}
      </Fieldset>
    </div>
  )
}

// ─── Header section (shared across tabs) ──────────────────────────────────────

function DialogHeader({ proxy }: { proxy: PanwDnsProxy }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-x-8 gap-y-3 px-5 pt-5 pb-3">
      <div className="space-y-3">
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked disabled />
          <span className="text-xs">Enable</span>
        </Label>
        <DisplayField label="Name" value={proxy.name} labelWidth="w-28" />
        <DisplayField label="Location" value="vsys1" labelWidth="w-28" />
        <DisplayField label="Server Profile" value={proxy.serverProfile ?? "None"} labelWidth="w-28" />
      </div>
      <div className="space-y-1">
        <div className="rounded-lg border overflow-hidden min-w-48">
          <Table>
            <TableHeader>
              <TableRow><TableHead className="text-[11px]">Interface</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {proxy.interfaces.length === 0 ? (
                <TableRow><TableCell className="text-xs text-muted-foreground">None</TableCell></TableRow>
              ) : proxy.interfaces.map((iface) => (
                <TableRow key={iface}><TableCell className="text-xs">{iface}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

export function DnsProxyDialog({
  proxy,
  open,
  onOpenChange,
}: {
  proxy: PanwDnsProxy | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!proxy) return null

  return (
    <DetailDialog title="DNS Proxy" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-[75vw]" height="h-[min(90vh,750px)]" noPadding>
      <div className="flex flex-col flex-1 min-h-0">
        <DialogHeader proxy={proxy} />

        <Tabs defaultValue="rules" className="flex-1 flex flex-col min-h-0">
          <div className="shrink-0 border-b px-5">
            <TabsList variant="line">
              <TabsTrigger value="rules">DNS Proxy Rules</TabsTrigger>
              <TabsTrigger value="static">Static Entries</TabsTrigger>
              <TabsTrigger value="encrypted">Encrypted DNS</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <TabsContent value="rules"><DnsProxyRulesTab proxy={proxy} /></TabsContent>
            <TabsContent value="static"><StaticEntriesTab proxy={proxy} /></TabsContent>
            <TabsContent value="encrypted"><EncryptedDnsTab proxy={proxy} /></TabsContent>
            <TabsContent value="advanced"><AdvancedTab proxy={proxy} /></TabsContent>
          </div>
        </Tabs>
      </div>
    </DetailDialog>
  )
}
