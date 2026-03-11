// @/app/(main)/policies/[category]/page.tsx

"use client"

import * as React from "react"
import { notFound } from "next/navigation"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolvePoliciesData } from "@/app/(main)/_lib/resolve-config-data"
import { EmptyState } from "@/app/(main)/_components/ui/empty-state"
import {
  CategoryShell, ComingSoonView, ActionBadge, TagPill, TypeBadge, MembersList, MonoValue,
  DataTable, DataThead, DataTh, DataTbody, DataTr, DataTd, TableEmpty,
} from "@/app/(main)/_components/ui/category-shell"
import type { PanwSecurityRule, PanwNatRule } from "@/lib/panw-parser/types"

// ─── Rulebase badge ───────────────────────────────────────────────────────────

function RulebaseBadge({ rulebase, scope }: { rulebase: string; scope: string }) {
  const isPre  = rulebase === "pre"
  const isPost = rulebase === "post"
  return (
    <div className="flex flex-col gap-0.5">
      {scope !== "local" && scope !== "firewall" && (
        <span className="text-[10px] text-muted-foreground">{scope}</span>
      )}
      {(isPre || isPost) && (
        <span className={`inline-flex w-fit items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
          isPre
            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
            : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
        }`}>
          {rulebase}
        </span>
      )}
    </div>
  )
}

// ─── Disabled indicator ───────────────────────────────────────────────────────

function DisabledRow({ disabled }: { disabled: boolean }) {
  if (!disabled) return null
  return (
    <span className="inline-flex items-center rounded border bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium border-border text-muted-foreground">
      disabled
    </span>
  )
}

// ─── Security Rules ───────────────────────────────────────────────────────────

function SecurityView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolvePoliciesData(activeConfig.parsedConfig, selectedScope).securityRules
  }, [activeConfig, selectedScope])

  const filtered = React.useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter((r) =>
      r.name.toLowerCase().includes(q) ||
      r.action.includes(q) ||
      r.from.some((z) => z.toLowerCase().includes(q)) ||
      r.to.some((z) => z.toLowerCase().includes(q)) ||
      r.source.some((s) => s.toLowerCase().includes(q)) ||
      r.destination.some((d) => d.toLowerCase().includes(q)) ||
      r.application.some((a) => a.toLowerCase().includes(q)) ||
      r.service.some((s) => s.toLowerCase().includes(q)) ||
      r.tags.some((t) => t.toLowerCase().includes(q)) ||
      r.description?.toLowerCase().includes(q) ||
      r.groupTag?.toLowerCase().includes(q)
    )
  }, [data, search])

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  return (
    <CategoryShell title="Security Rules" count={filtered.length} search={search} onSearch={setSearch}>
      <DataTable>
        <DataThead>
          <DataTh className="w-8">{/* color */}</DataTh>
          {isPanorama && <DataTh className="w-24">Scope</DataTh>}
          <DataTh>Name</DataTh>
          <DataTh className="w-20">Action</DataTh>
          <DataTh>From</DataTh>
          <DataTh>Source</DataTh>
          <DataTh>To</DataTh>
          <DataTh>Destination</DataTh>
          <DataTh>Application</DataTh>
          <DataTh>Service</DataTh>
          <DataTh>Tags / Notes</DataTh>
        </DataThead>
        <DataTbody>
          {filtered.length === 0
            ? <TableEmpty query={search} />
            : filtered.map((rule: PanwSecurityRule, idx) => (
              <DataTr
                key={rule.uuid ?? `${rule.name}-${idx}`}
                className={rule.disabled ? "opacity-50" : undefined}
              >
                <DataTd>
                  <span
                    className="block size-2 rounded-full mx-auto"
                    style={{ backgroundColor: rule.color !== "var(--muted-foreground)" ? rule.color : undefined }}
                  />
                </DataTd>
                {isPanorama && (
                  <DataTd>
                    <RulebaseBadge rulebase={rule.rulebase} scope={rule.scope} />
                  </DataTd>
                )}
                <DataTd>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{rule.name}</span>
                    <div className="flex flex-wrap gap-1">
                      <DisabledRow disabled={rule.disabled} />
                      {rule.ruleType !== "universal" && (
                        <TypeBadge label={rule.ruleType} />
                      )}
                    </div>
                  </div>
                </DataTd>
                <DataTd><ActionBadge action={rule.action} /></DataTd>
                <DataTd><MembersList members={rule.from} max={2} /></DataTd>
                <DataTd><MembersList members={rule.source} max={2} /></DataTd>
                <DataTd><MembersList members={rule.to} max={2} /></DataTd>
                <DataTd><MembersList members={rule.destination} max={2} /></DataTd>
                <DataTd><MembersList members={rule.application} max={2} /></DataTd>
                <DataTd><MembersList members={rule.service} max={2} /></DataTd>
                <DataTd>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap gap-1">
                      {rule.tags.map((t) => <TagPill key={t} name={t} />)}
                    </div>
                    {rule.description && (
                      <span className="text-[10px] text-muted-foreground line-clamp-2">{rule.description}</span>
                    )}
                  </div>
                </DataTd>
              </DataTr>
            ))}
        </DataTbody>
      </DataTable>
    </CategoryShell>
  )
}

// ─── NAT Rules ────────────────────────────────────────────────────────────────

const natTypeLabels: Record<string, string> = {
  "dynamic-ip-and-port": "DIPP",
  "dynamic-ip":          "Dynamic IP",
  "static-ip":           "Static IP",
  "none":                "None",
}

function NatView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolvePoliciesData(activeConfig.parsedConfig, selectedScope).natRules
  }, [activeConfig, selectedScope])

  const filtered = React.useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter((r) =>
      r.name.toLowerCase().includes(q) ||
      r.from.some((z) => z.toLowerCase().includes(q)) ||
      r.to.some((z) => z.toLowerCase().includes(q)) ||
      r.source.some((s) => s.toLowerCase().includes(q)) ||
      r.destination.some((d) => d.toLowerCase().includes(q)) ||
      r.service.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q)) ||
      r.description?.toLowerCase().includes(q)
    )
  }, [data, search])

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  return (
    <CategoryShell title="NAT Rules" count={filtered.length} search={search} onSearch={setSearch}>
      <DataTable>
        <DataThead>
          <DataTh className="w-8" />
          {isPanorama && <DataTh className="w-24">Scope</DataTh>}
          <DataTh>Name</DataTh>
          <DataTh>From</DataTh>
          <DataTh>Source</DataTh>
          <DataTh>To</DataTh>
          <DataTh>Destination</DataTh>
          <DataTh>Service</DataTh>
          <DataTh>Source NAT</DataTh>
          <DataTh>Tags</DataTh>
        </DataThead>
        <DataTbody>
          {filtered.length === 0
            ? <TableEmpty query={search} />
            : filtered.map((rule: PanwNatRule, idx) => (
              <DataTr
                key={rule.uuid ?? `${rule.name}-${idx}`}
                className={rule.disabled ? "opacity-50" : undefined}
              >
                <DataTd>
                  <span
                    className="block size-2 rounded-full mx-auto"
                    style={{ backgroundColor: rule.color !== "var(--muted-foreground)" ? rule.color : undefined }}
                  />
                </DataTd>
                {isPanorama && (
                  <DataTd>
                    <RulebaseBadge rulebase={rule.rulebase} scope={rule.scope} />
                  </DataTd>
                )}
                <DataTd>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{rule.name}</span>
                    <DisabledRow disabled={rule.disabled} />
                  </div>
                </DataTd>
                <DataTd><MembersList members={rule.from} max={2} /></DataTd>
                <DataTd><MembersList members={rule.source} max={2} /></DataTd>
                <DataTd><MembersList members={rule.to} max={2} /></DataTd>
                <DataTd><MembersList members={rule.destination} max={2} /></DataTd>
                <DataTd><MonoValue>{rule.service}</MonoValue></DataTd>
                <DataTd>
                  <TypeBadge label={natTypeLabels[rule.sourceTranslationType] ?? rule.sourceTranslationType} />
                </DataTd>
                <DataTd>
                  <div className="flex flex-wrap gap-1">
                    {rule.tags.map((t) => <TagPill key={t} name={t} />)}
                  </div>
                </DataTd>
              </DataTr>
            ))}
        </DataTbody>
      </DataTable>
    </CategoryShell>
  )
}

// ─── Route map ────────────────────────────────────────────────────────────────

const POLICIES_VIEWS: Record<string, { title: string; component?: React.ComponentType }> = {
  "security":              { title: "Security Policy",           component: SecurityView },
  "nat":                   { title: "NAT Policy",                component: NatView },
  "qos":                   { title: "QoS Policy" },
  "policy-based-forwarding": { title: "Policy Based Forwarding" },
  "decryption":            { title: "Decryption Policy" },
  "tunnel-inspection":     { title: "Tunnel Inspection" },
  "application-override":  { title: "Application Override" },
  "authentication":        { title: "Authentication Policy" },
  "dos-protection":        { title: "DoS Protection" },
  "sd-wan":                { title: "SD-WAN Policy" },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PoliciesCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = React.use(params)
  const { activeConfig } = useConfig()

  const view = POLICIES_VIEWS[category]
  if (!view) notFound()

  if (!activeConfig) return <EmptyState />

  if (view.component) {
    const View = view.component
    return <View />
  }

  return <ComingSoonView title={view.title} />
}
