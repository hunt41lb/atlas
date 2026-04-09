// @/app/(main)/objects/[category]/page.tsx

"use client"

import * as React from "react"
import { notFound } from "next/navigation"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveObjectsData } from "@/app/(main)/_lib/resolve-config-data"
import { EmptyState } from "@/app/(main)/_components/ui/empty-state"
import {
  CategoryShell, ComingSoonView, TagPill, ProtoBadge, TypeBadge, MembersList, MonoValue,
  DataTable, DataThead, DataTh, DataTbody, DataTr, DataTd, TableEmpty,
} from "@/app/(main)/_components/ui/category-shell"
import type { PanwAddress, PanwAddressGroup } from "@/lib/panw-parser/objects/addresses"
import type { PanwService, PanwServiceGroup } from "@/lib/panw-parser/objects/services"
import type { PanwApplicationGroup, PanwApplicationFilter } from "@/lib/panw-parser/objects/applications"
import type { PanwTag } from "@/lib/panw-parser/objects/tags"
import type { PanwProfileGroup } from "@/lib/panw-parser/objects/profile-groups"

// ─── Addresses ────────────────────────────────────────────────────────────────

const addrTypeLabels: Record<string, string> = {
  "ip-netmask": "IP/Mask",
  "ip-range":   "Range",
  "fqdn":       "FQDN",
  "ip-wildcard":"Wildcard",
}

function AddressesView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveObjectsData(activeConfig.parsedConfig, selectedScope).addresses
  }, [activeConfig, selectedScope])

  const filtered = React.useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter((a) =>
      a.name.toLowerCase().includes(q) ||
      a.value.toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [data, search])

  return (
    <CategoryShell title="Addresses" count={filtered.length} search={search} onSearch={setSearch}>
      <DataTable>
        <DataThead>
          <DataTh className="w-8">{/* color swatch */}</DataTh>
          <DataTh>Name</DataTh>
          <DataTh className="w-24">Type</DataTh>
          <DataTh>Value</DataTh>
          <DataTh>Tags</DataTh>
          <DataTh>Description</DataTh>
        </DataThead>
        <DataTbody>
          {filtered.length === 0
            ? <TableEmpty query={search} />
            : filtered.map((addr: PanwAddress) => (
              <DataTr key={addr.name}>
                <DataTd>
                  <span
                    className="block size-2 rounded-full mx-auto"
                    style={{ backgroundColor: addr.color !== "var(--muted-foreground)" ? addr.color : undefined }}
                  />
                </DataTd>
                <DataTd><span className="font-medium">{addr.name}</span></DataTd>
                <DataTd><TypeBadge label={addrTypeLabels[addr.type] ?? addr.type} /></DataTd>
                <DataTd><MonoValue>{addr.value}</MonoValue></DataTd>
                <DataTd>
                  <div className="flex flex-wrap gap-1">
                    {addr.tags.map((t) => <TagPill key={t} name={t} />)}
                  </div>
                </DataTd>
                <DataTd>
                  {addr.description && (
                    <span className="text-xs text-muted-foreground">{addr.description}</span>
                  )}
                </DataTd>
              </DataTr>
            ))}
        </DataTbody>
      </DataTable>
    </CategoryShell>
  )
}

// ─── Address Groups ───────────────────────────────────────────────────────────

function AddressGroupsView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveObjectsData(activeConfig.parsedConfig, selectedScope).addressGroups
  }, [activeConfig, selectedScope])

  const filtered = React.useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter((g) =>
      g.name.toLowerCase().includes(q) ||
      g.members.some((m) => m.toLowerCase().includes(q)) ||
      g.dynamicFilter?.toLowerCase().includes(q) ||
      g.description?.toLowerCase().includes(q) ||
      g.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [data, search])

  return (
    <CategoryShell title="Address Groups" count={filtered.length} search={search} onSearch={setSearch}>
      <DataTable>
        <DataThead>
          <DataTh className="w-8" />
          <DataTh>Name</DataTh>
          <DataTh className="w-20">Type</DataTh>
          <DataTh>Members / Filter</DataTh>
          <DataTh>Tags</DataTh>
          <DataTh>Description</DataTh>
        </DataThead>
        <DataTbody>
          {filtered.length === 0
            ? <TableEmpty query={search} />
            : filtered.map((grp: PanwAddressGroup) => (
              <DataTr key={grp.name}>
                <DataTd>
                  <span
                    className="block size-2 rounded-full mx-auto"
                    style={{ backgroundColor: grp.color !== "var(--muted-foreground)" ? grp.color : undefined }}
                  />
                </DataTd>
                <DataTd><span className="font-medium">{grp.name}</span></DataTd>
                <DataTd>
                  <TypeBadge
                    label={grp.type}
                    className={grp.type === "dynamic" ? "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400" : undefined}
                  />
                </DataTd>
                <DataTd>
                  {grp.type === "static"
                    ? <MembersList members={grp.members} max={4} />
                    : <MonoValue className="text-amber-600 dark:text-amber-400">{grp.dynamicFilter}</MonoValue>
                  }
                </DataTd>
                <DataTd>
                  <div className="flex flex-wrap gap-1">
                    {grp.tags.map((t) => <TagPill key={t} name={t} />)}
                  </div>
                </DataTd>
                <DataTd>
                  {grp.description && (
                    <span className="text-xs text-muted-foreground">{grp.description}</span>
                  )}
                </DataTd>
              </DataTr>
            ))}
        </DataTbody>
      </DataTable>
    </CategoryShell>
  )
}

// ─── Services ─────────────────────────────────────────────────────────────────

function ServicesView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveObjectsData(activeConfig.parsedConfig, selectedScope).services
  }, [activeConfig, selectedScope])

  const filtered = React.useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.protocol.toLowerCase().includes(q) ||
      s.port.includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [data, search])

  return (
    <CategoryShell title="Services" count={filtered.length} search={search} onSearch={setSearch}>
      <DataTable>
        <DataThead>
          <DataTh className="w-8" />
          <DataTh>Name</DataTh>
          <DataTh className="w-20">Protocol</DataTh>
          <DataTh className="w-36">Port(s)</DataTh>
          <DataTh>Tags</DataTh>
          <DataTh>Description</DataTh>
        </DataThead>
        <DataTbody>
          {filtered.length === 0
            ? <TableEmpty query={search} />
            : filtered.map((svc: PanwService) => (
              <DataTr key={svc.name}>
                <DataTd>
                  <span
                    className="block size-2 rounded-full mx-auto"
                    style={{ backgroundColor: svc.color !== "var(--muted-foreground)" ? svc.color : undefined }}
                  />
                </DataTd>
                <DataTd><span className="font-medium">{svc.name}</span></DataTd>
                <DataTd><ProtoBadge proto={svc.protocol} /></DataTd>
                <DataTd><MonoValue>{svc.port}</MonoValue></DataTd>
                <DataTd>
                  <div className="flex flex-wrap gap-1">
                    {svc.tags.map((t) => <TagPill key={t} name={t} />)}
                  </div>
                </DataTd>
                <DataTd>
                  {svc.description && (
                    <span className="text-xs text-muted-foreground">{svc.description}</span>
                  )}
                </DataTd>
              </DataTr>
            ))}
        </DataTbody>
      </DataTable>
    </CategoryShell>
  )
}

// ─── Service Groups ───────────────────────────────────────────────────────────

function ServiceGroupsView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveObjectsData(activeConfig.parsedConfig, selectedScope).serviceGroups
  }, [activeConfig, selectedScope])

  const filtered = React.useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter((g) =>
      g.name.toLowerCase().includes(q) ||
      g.members.some((m) => m.toLowerCase().includes(q)) ||
      g.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [data, search])

  return (
    <CategoryShell title="Service Groups" count={filtered.length} search={search} onSearch={setSearch}>
      <DataTable>
        <DataThead>
          <DataTh className="w-8" />
          <DataTh>Name</DataTh>
          <DataTh>Members</DataTh>
          <DataTh>Tags</DataTh>
        </DataThead>
        <DataTbody>
          {filtered.length === 0
            ? <TableEmpty query={search} />
            : filtered.map((grp: PanwServiceGroup) => (
              <DataTr key={grp.name}>
                <DataTd>
                  <span
                    className="block size-2 rounded-full mx-auto"
                    style={{ backgroundColor: grp.color !== "var(--muted-foreground)" ? grp.color : undefined }}
                  />
                </DataTd>
                <DataTd><span className="font-medium">{grp.name}</span></DataTd>
                <DataTd><MembersList members={grp.members} max={5} /></DataTd>
                <DataTd>
                  <div className="flex flex-wrap gap-1">
                    {grp.tags.map((t) => <TagPill key={t} name={t} />)}
                  </div>
                </DataTd>
              </DataTr>
            ))}
        </DataTbody>
      </DataTable>
    </CategoryShell>
  )
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

function TagsView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveObjectsData(activeConfig.parsedConfig, selectedScope).tags
  }, [activeConfig, selectedScope])

  const filtered = React.useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter((t) =>
      t.name.toLowerCase().includes(q) ||
      t.comments?.toLowerCase().includes(q)
    )
  }, [data, search])

  return (
    <CategoryShell title="Tags" count={filtered.length} search={search} onSearch={setSearch}>
      <DataTable>
        <DataThead>
          <DataTh className="w-8" />
          <DataTh>Name</DataTh>
          <DataTh className="w-28">Color</DataTh>
          <DataTh>Comments</DataTh>
        </DataThead>
        <DataTbody>
          {filtered.length === 0
            ? <TableEmpty query={search} />
            : filtered.map((tag: PanwTag) => (
              <DataTr key={tag.name}>
                <DataTd>
                  <span
                    className="block size-2 rounded-full mx-auto"
                    style={{ backgroundColor: tag.color !== "var(--muted-foreground)" ? tag.color : undefined }}
                  />
                </DataTd>
                <DataTd>
                  <TagPill
                    name={tag.name}
                    color={tag.color !== "var(--muted-foreground)" ? tag.color : undefined}
                  />
                </DataTd>
                <DataTd>
                  <span className="text-xs text-muted-foreground">{tag.colorKey ?? "none"}</span>
                </DataTd>
                <DataTd>
                  {tag.comments && (
                    <span className="text-xs text-muted-foreground">{tag.comments}</span>
                  )}
                </DataTd>
              </DataTr>
            ))}
        </DataTbody>
      </DataTable>
    </CategoryShell>
  )
}

// ─── Application Groups ───────────────────────────────────────────────────────

function ApplicationGroupsView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveObjectsData(activeConfig.parsedConfig, selectedScope).applicationGroups
  }, [activeConfig, selectedScope])

  const filtered = React.useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter((g) =>
      g.name.toLowerCase().includes(q) ||
      g.members.some((m) => m.toLowerCase().includes(q))
    )
  }, [data, search])

  return (
    <CategoryShell title="Application Groups" count={filtered.length} search={search} onSearch={setSearch}>
      <DataTable>
        <DataThead>
          <DataTh className="w-8" />
          <DataTh>Name</DataTh>
          <DataTh>Members</DataTh>
        </DataThead>
        <DataTbody>
          {filtered.length === 0
            ? <TableEmpty query={search} />
            : filtered.map((grp: PanwApplicationGroup) => (
              <DataTr key={grp.name}>
                <DataTd>
                  <span
                    className="block size-2 rounded-full mx-auto"
                    style={{ backgroundColor: grp.color !== "var(--muted-foreground)" ? grp.color : undefined }}
                  />
                </DataTd>
                <DataTd><span className="font-medium">{grp.name}</span></DataTd>
                <DataTd><MembersList members={grp.members} max={6} /></DataTd>
              </DataTr>
            ))}
        </DataTbody>
      </DataTable>
    </CategoryShell>
  )
}

// ─── Application Filters ──────────────────────────────────────────────────────

function ApplicationFiltersView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveObjectsData(activeConfig.parsedConfig, selectedScope).applicationFilters
  }, [activeConfig, selectedScope])

  const filtered = React.useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter((f) =>
      f.name.toLowerCase().includes(q) ||
      f.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [data, search])

  return (
    <CategoryShell title="Application Filters" count={filtered.length} search={search} onSearch={setSearch}>
      <DataTable>
        <DataThead>
          <DataTh className="w-8" />
          <DataTh>Name</DataTh>
          <DataTh>Tags</DataTh>
        </DataThead>
        <DataTbody>
          {filtered.length === 0
            ? <TableEmpty query={search} />
            : filtered.map((f: PanwApplicationFilter) => (
              <DataTr key={f.name}>
                <DataTd>
                  <span
                    className="block size-2 rounded-full mx-auto"
                    style={{ backgroundColor: f.color !== "var(--muted-foreground)" ? f.color : undefined }}
                  />
                </DataTd>
                <DataTd><span className="font-medium">{f.name}</span></DataTd>
                <DataTd>
                  <div className="flex flex-wrap gap-1">
                    {f.tags.map((t) => <TagPill key={t} name={t} />)}
                  </div>
                </DataTd>
              </DataTr>
            ))}
        </DataTbody>
      </DataTable>
    </CategoryShell>
  )
}

// ─── Security Profile Groups ──────────────────────────────────────────────────

function SecurityProfileGroupsView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveObjectsData(activeConfig.parsedConfig, selectedScope).profileGroups
  }, [activeConfig, selectedScope])

  const filtered = React.useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter((g) =>
      g.name.toLowerCase().includes(q) ||
      Object.values(g).some((v) => typeof v === "string" && v.toLowerCase().includes(q))
    )
  }, [data, search])

  const profiles: { key: keyof PanwProfileGroup; label: string }[] = [
    { key: "virus",            label: "Antivirus" },
    { key: "spyware",          label: "Anti-Spyware" },
    { key: "vulnerability",    label: "Vulnerability" },
    { key: "urlFiltering",     label: "URL Filtering" },
    { key: "fileBlocking",     label: "File Blocking" },
    { key: "wildfireAnalysis", label: "WildFire" },
    { key: "dataFiltering",    label: "Data Filtering" },
  ]

  return (
    <CategoryShell title="Security Profile Groups" count={filtered.length} search={search} onSearch={setSearch}>
      <DataTable>
        <DataThead>
          <DataTh>Name</DataTh>
          {profiles.map((p) => <DataTh key={p.key}>{p.label}</DataTh>)}
        </DataThead>
        <DataTbody>
          {filtered.length === 0
            ? <TableEmpty query={search} />
            : filtered.map((grp: PanwProfileGroup) => (
              <DataTr key={grp.name}>
                <DataTd><span className="font-medium">{grp.name}</span></DataTd>
                {profiles.map((p) => (
                  <DataTd key={p.key}>
                    {grp[p.key] && (
                      <span className="text-xs text-muted-foreground font-mono">{grp[p.key]}</span>
                    )}
                  </DataTd>
                ))}
              </DataTr>
            ))}
        </DataTbody>
      </DataTable>
    </CategoryShell>
  )
}

// ─── Route map ────────────────────────────────────────────────────────────────

const OBJECTS_VIEWS: Record<string, { title: string; component?: React.ComponentType }> = {
  "addresses":               { title: "Addresses",               component: AddressesView },
  "address-groups":          { title: "Address Groups",          component: AddressGroupsView },
  "services":                { title: "Services",                component: ServicesView },
  "service-groups":          { title: "Service Groups",          component: ServiceGroupsView },
  "tags":                    { title: "Tags",                    component: TagsView },
  "application-groups":      { title: "Application Groups",      component: ApplicationGroupsView },
  "application-filters":     { title: "Application Filters",     component: ApplicationFiltersView },
  "security-profile-groups": { title: "Security Profile Groups", component: SecurityProfileGroupsView },
  "regions":                 { title: "Regions" },
  "dynamic-user-groups":     { title: "Dynamic User Groups" },
  "applications":            { title: "Applications" },
  "devices":                 { title: "Devices" },
  "global-protect":          { title: "GlobalProtect" },
  "host-compliance":         { title: "Host Compliance" },
  "external-dynamic-lists":  { title: "External Dynamic Lists" },
  "custom-objects":          { title: "Custom Objects" },
  "security-profiles":       { title: "Security Profiles" },
  "log-forwarding":          { title: "Log Forwarding" },
  "authentication":          { title: "Authentication" },
  "decryption":              { title: "Decryption" },
  "sd-wan-link-management":  { title: "SD-WAN Link Management" },
  "schedules":               { title: "Schedules" },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ObjectsCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = React.use(params)
  const { activeConfig } = useConfig()

  const view = OBJECTS_VIEWS[category]
  if (!view) notFound()

  if (!activeConfig) return <EmptyState />

  if (view.component) {
    const View = view.component
    return <View />
  }

  return <ComingSoonView title={view.title} />
}

