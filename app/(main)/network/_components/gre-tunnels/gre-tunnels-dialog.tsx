// @/app/(main)/network/_components/gre-tunnels/gre-tunnels-dialog.tsx

"use client"

import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { PanwGreTunnel } from "@/lib/panw-parser/network/gre-tunnels"

const LW = "w-36"

export function GreTunnelDialog({
  tunnel,
  open,
  onOpenChange,
}: {
  tunnel: PanwGreTunnel | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!tunnel) return null

  return (
    <DetailDialog title="GRE Tunnel" open={open} onOpenChange={onOpenChange}>
      <div className="space-y-4">
        <DisplayField label="Name" value={tunnel.name} labelWidth={LW} />
        <DisplayField label="Interface" value={tunnel.localAddress.interface ?? "None"} labelWidth={LW} />
        <DisplayField label="Local Address" value={tunnel.localAddress.ip ?? "None"} labelWidth={LW} />

        <div className="flex items-center gap-4">
          <span className={`text-sm font-medium text-foreground shrink-0 ${LW}`}>Peer Address Type</span>
          <RadioGroup value="ip" disabled className="flex flex-row gap-4">
            <Label className="flex items-center gap-1.5 text-xs"><RadioGroupItem value="ip" />IP</Label>
            <Label className="flex items-center gap-1.5 text-xs"><RadioGroupItem value="fqdn" />FQDN</Label>
          </RadioGroup>
        </div>

        <DisplayField label="Peer Address" value={tunnel.peerAddress ?? "None"} labelWidth={LW} />
        <DisplayField label="Tunnel Interface" value={tunnel.tunnelInterface ?? "None"} labelWidth={LW} />
        <DisplayField label="TTL" value={String(tunnel.ttl)} labelWidth={LW} />

        <div className="flex flex-col gap-1 pl-1">
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={tunnel.copyTos} disabled />
            <span className="text-xs">Copy ToS Header</span>
          </Label>
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={tunnel.erspan} disabled />
            <span className="text-xs">ERSPAN</span>
          </Label>
        </div>

        <Fieldset disabled={!tunnel.keepAliveEnabled}>
          <FieldsetLegend>
            <Label className="flex items-center gap-2">
              <Checkbox checked={tunnel.keepAliveEnabled} disabled />
              Keep Alive
            </Label>
          </FieldsetLegend>
          {tunnel.keepAliveEnabled && (
            <FieldsetContent>
              <DisplayField label="Interval (sec)" value={String(tunnel.keepAliveInterval)} labelWidth="w-28" />
              <DisplayField label="Retry" value={String(tunnel.keepAliveRetry)} labelWidth="w-28" />
              <DisplayField label="Hold Timer" value={String(tunnel.keepAliveHoldTimer)} labelWidth="w-28" />
            </FieldsetContent>
          )}
        </Fieldset>
      </div>
    </DetailDialog>
  )
}

