// @/app/(main)/network/_components/proxy/proxy-view.tsx

"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { DisplayField } from "@/components/ui/display-field"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { NotConfiguredState } from "@/app/(main)/_components/ui/empty-state"
import type { PanwProxy } from "@/lib/panw-parser/proxy"

// ─── Labels ───────────────────────────────────────────────────────────────────

const PROXY_TYPE_LABELS: Record<string, string> = {
  "explicit-proxy": "Explicit Proxy",
  "transparent-proxy": "Transparent Proxy",
}

const LW = "w-52"

// ─── Explicit Proxy Section ───────────────────────────────────────────────────

function ExplicitProxySection({ proxy }: { proxy: PanwProxy }) {
  const ep = proxy.explicitProxy
  if (!ep) return null

  const authMethod = ep.authenticationMethod ?? "no-auth"

  return (
    <Fieldset>
      <FieldsetLegend>Explicit Proxy Configuration</FieldsetLegend>
      <FieldsetContent>
        <div className="space-y-3">
          <DisplayField label="Connect Timeout" value={String(ep.connectTimeout ?? 5)} labelWidth={LW} />
          <DisplayField label="Listening Interface" value={ep.listeningInterface ?? "None"} labelWidth={LW} />
          <DisplayField label="Upstream Interface" value={ep.upstreamInterface ?? "None"} labelWidth={LW} />
          <DisplayField label="Proxy IP" value={ep.proxyIp ?? "None"} labelWidth={LW} />
          <DisplayField label="DNS Proxy" value={ep.dnsProxy ?? "None"} labelWidth={LW} />

          <Label className="flex items-center gap-2 py-1 pl-1 justify-center">
            <Checkbox checked={ep.checkDomainSni} disabled />
            <span className="text-xs">Check domain in CONNECT & SNI are the same</span>
          </Label>

          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium text-foreground shrink-0 ${LW}`}>Authentication service type</span>
            <RadioGroup value={authMethod} disabled className="flex flex-row gap-4">
              <Label className="flex items-center gap-1.5 text-xs"><RadioGroupItem value="saml-cas" />SAML/CAS</Label>
              <Label className="flex items-center gap-1.5 text-xs"><RadioGroupItem value="kerberos-sso" />Kerberos Single Sign On</Label>
              <Label className="flex items-center gap-1.5 text-xs"><RadioGroupItem value="no-auth" />No Authentication</Label>
            </RadioGroup>
          </div>

          {authMethod === "saml-cas" && (
            <Label className="flex items-center gap-2 py-1 pl-1 justify-center">
              <Checkbox checked={ep.stripAlpn} disabled />
              <span className="text-xs">Strip ALPN</span>
            </Label>
          )}

          {authMethod === "kerberos-sso" && (
            <>
              <DisplayField label="Authentication Profile" value={ep.authenticationProfile ?? "None"} labelWidth={LW} />
              <DisplayField label="Authentication Log Forwarding" value={ep.authenticationLogForwarding ?? "None"} labelWidth={LW} />
            </>
          )}
        </div>
      </FieldsetContent>
    </Fieldset>
  )
}

// ─── Transparent Proxy Section ────────────────────────────────────────────────

function TransparentProxySection({ proxy }: { proxy: PanwProxy }) {
  const tp = proxy.transparentProxy
  if (!tp) return null

  return (
    <Fieldset>
      <FieldsetLegend>Transparent Proxy Configuration</FieldsetLegend>
      <FieldsetContent>
        <div className="space-y-3">
          <DisplayField label="Connect Timeout" value={String(tp.connectTimeout ?? 5)} labelWidth={LW} />
          <DisplayField label="Upstream Interface" value={tp.upstreamInterface ?? "None"} labelWidth={LW} />
          <DisplayField label="Proxy IP" value={tp.proxyIp ?? "None"} labelWidth={LW} />
          <DisplayField label="DNS Proxy" value={tp.dnsProxy ?? "None"} labelWidth={LW} />
        </div>
      </FieldsetContent>
    </Fieldset>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProxyView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()

  const settings = React.useMemo<PanwProxy | null>(() => {
    if (!activeConfig) return null
    const resolved = resolveNetworkData(activeConfig.parsedConfig, selectedScope)
    const all = resolved.proxy ?? []
    if (!Array.isArray(all) || all.length === 0) return null
    // Use the first proxy with a configured type, or the last one
    return all.find(p => p.proxyType !== null) ?? all[all.length - 1]
  }, [activeConfig, selectedScope])

  if (!settings || !settings.proxyType) {
    return <NotConfiguredState title="Proxy" />
  }

  return (
    <div className="flex h-full flex-col min-h-0">
      <div className="shrink-0 flex items-center border-b px-4 py-2">
        <span className="text-sm font-medium">Proxy</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <Fieldset>
            <FieldsetLegend>Proxy Enablement</FieldsetLegend>
            <FieldsetContent>
              <DisplayField
                label="Proxy Type"
                value={PROXY_TYPE_LABELS[settings.proxyType] ?? settings.proxyType}
                labelWidth="w-24"
              />
            </FieldsetContent>
          </Fieldset>

          {settings.proxyType === "explicit-proxy" && <ExplicitProxySection proxy={settings} />}
          {settings.proxyType === "transparent-proxy" && <TransparentProxySection proxy={settings} />}
        </div>
      </div>
    </div>
  )
}
