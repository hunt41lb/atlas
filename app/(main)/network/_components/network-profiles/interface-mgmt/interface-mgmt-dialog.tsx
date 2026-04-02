// @/app/(main)/network/_components/network-profiles/interface-mgmt/interface-mgmt-dialog.tsx

"use client"

import { Badge } from "@/components/ui/badge"
import { FieldGroup, ProfileDialog } from "../../router-shared/router-dialog/field-display"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

import type { PanwInterfaceMgmtProfile } from "@/lib/panw-parser/network-profiles"

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

// ─── Dialog ───────────────────────────────────────────────────────────────────

export function InterfaceMgmtDialog({
  profile,
  open,
  onOpenChange,
}: {
  profile: PanwInterfaceMgmtProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!profile) return null

  return (
    <ProfileDialog title="Interface Management Profile" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-lg max-h-[85vh]">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-20 shrink-0 text-right">Name</span>
          <span className="text-sm font-medium">{profile.name}</span>
        </div>

        <FieldGroup title="Network Services">
          <div className="grid grid-cols-2 gap-x-4">
            {NETWORK_SERVICES.map((s) => (
              <Label key={s.key} className="flex items-center gap-2 py-1">
                <Checkbox checked={profile[s.key] as boolean} disabled />
                <span className="text-xs">{s.label}</span>
              </Label>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup title="User-ID Services">
          {USERID_SERVICES.map((s) => (
            <Label key={s.key} className="flex items-center gap-2 py-1">
              <Checkbox checked={profile[s.key] as boolean} disabled />
              <span className="text-xs">{s.label}</span>
            </Label>
          ))}
        </FieldGroup>

        <FieldGroup title="Permitted IP Addresses">
          {profile.permittedIps.length === 0 ? (
            <span className="text-xs text-muted-foreground">None</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {profile.permittedIps.map((ip) => (
                <Badge key={ip} variant="secondary" className="font-mono text-xs">{ip}</Badge>
              ))}
            </div>
          )}
        </FieldGroup>
      </div>
    </ProfileDialog>
  )
}
