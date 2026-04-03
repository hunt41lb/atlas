// @/app/(main)/network/_components/network-profiles/interface-mgmt/interface-mgmt-dialog.tsx

"use client"

import { Badge } from "@/components/ui/badge"
import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import type { PanwInterfaceMgmtProfile } from "@/lib/panw-parser/network-profiles"
import type { VariableMap } from "@/app/(main)/_components/ui/ip-address-cell"

// ─── Service definitions ──────────────────────────────────────────────────────

const NETWORK_SERVICES: { key: keyof PanwInterfaceMgmtProfile; label: string }[] = [
  { key: "https",         label: "HTTPS" },
  { key: "http",          label: "HTTP" },
  { key: "httpOcsp",      label: "HTTP OCSP" },
  { key: "ssh",           label: "SSH" },
  { key: "telnet",        label: "Telnet" },
  { key: "ping",          label: "Ping" },
  { key: "snmp",          label: "SNMP" },
  { key: "responsePages", label: "Response Pages" },
]

const USERID_SERVICES: { key: keyof PanwInterfaceMgmtProfile; label: string }[] = [
  { key: "useridService",            label: "User-ID Service" },
  { key: "useridSyslogListenerSsl",  label: "User-ID Syslog Listener (SSL)" },
  { key: "useridSyslogListenerUdp",  label: "User-ID Syslog Listener (UDP)" },
]

// ─── Variable-aware IP badge ──────────────────────────────────────────────────

function IpBadge({ ip, variableMap }: { ip: string; variableMap?: VariableMap }) {
  const isVariable = ip.startsWith("$")
  const varInfo = isVariable && variableMap ? variableMap.get(ip) : undefined

  if (isVariable && varInfo) {
    return (
      <Tooltip>
        <TooltipTrigger render={<span className="cursor-help" />}>
          <Badge variant="secondary" className="font-mono text-xs border-b border-dashed border-muted-foreground/40">
            {ip}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" align="start">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono font-medium">{varInfo.value}</span>
            {varInfo.description && (
              <span className="text-[10px] opacity-80">{varInfo.description}</span>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }

  return <Badge variant="secondary" className="font-mono text-xs">{ip}</Badge>
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

export function InterfaceMgmtDialog({
  profile,
  open,
  onOpenChange,
  variableMap,
}: {
  profile: PanwInterfaceMgmtProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
  variableMap?: VariableMap
}) {
  if (!profile) return null

  return (
    <DetailDialog title="Interface Management Profile" open={open} onOpenChange={onOpenChange}>
      <div className="space-y-4">
        <DisplayField label="Name" value={profile.name} />

        <Fieldset>
          <FieldsetLegend>Network Services</FieldsetLegend>
          <FieldsetContent>
            <div className="grid grid-cols-2 gap-x-4">
              {NETWORK_SERVICES.map((s) => (
                <Label key={s.key} className="flex items-center gap-2 py-1">
                  <Checkbox checked={profile[s.key] as boolean} disabled />
                  <span className="text-xs">{s.label}</span>
                </Label>
              ))}
            </div>
          </FieldsetContent>
        </Fieldset>

        <Fieldset>
          <FieldsetLegend>User-ID Services</FieldsetLegend>
          <FieldsetContent>
            {USERID_SERVICES.map((s) => (
              <Label key={s.key} className="flex items-center gap-2 py-1">
                <Checkbox checked={profile[s.key] as boolean} disabled />
                <span className="text-xs">{s.label}</span>
              </Label>
            ))}
          </FieldsetContent>
        </Fieldset>

        <Fieldset disabled={profile.permittedIps.length === 0}>
          <FieldsetLegend>Permitted IP Addresses</FieldsetLegend>
          <FieldsetContent>
            {profile.permittedIps.length === 0 ? (
              <span className="text-xs text-muted-foreground">None</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {profile.permittedIps.map((ip) => (
                  <IpBadge key={ip} ip={ip} variableMap={variableMap} />
                ))}
              </div>
            )}
          </FieldsetContent>
        </Fieldset>
      </div>
    </DetailDialog>
  )
}
