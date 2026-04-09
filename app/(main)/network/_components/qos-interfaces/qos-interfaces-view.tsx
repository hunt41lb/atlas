// @/app/(main)/network/_components/qos-interfaces/qos-interfaces-view.tsx

"use client"

import * as React from "react"
import {
  Table as TableRoot,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import { CategoryShell } from "@/app/(main)/_components/ui/category-shell"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { NotConfiguredState } from "@/app/(main)/_components/ui/empty-state"
import type { PanwQosInterface, PanwQosTrafficGroup } from "@/lib/panw-parser/network/qos-interfaces"

// ─── Traffic group table (reused for Clear Text and Tunneled tabs) ────────────

function TrafficGroupTab({ group, type }: { group: PanwQosTrafficGroup; type: "clear" | "tunnel" }) {
  return (
    <div className="space-y-4">
      <DisplayField label="Egress Guaranteed (Mbps)" value={String(group.egressGuaranteed ?? "—")} labelWidth="w-44" />
      <DisplayField label="Egress Max (Mbps)" value={String(group.egressMax ?? "—")} labelWidth="w-44" />

      <div className="rounded-lg border overflow-hidden">
        <TableRoot>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px]">{type === "tunnel" ? "Tunnel Interface" : "Name"}</TableHead>
              <TableHead className="text-[11px]">QoS Profile</TableHead>
              {type === "clear" && <TableHead className="text-[11px]">Source Interface</TableHead>}
              {type === "clear" && <TableHead className="text-[11px]">Destination I...</TableHead>}
              {type === "clear" && <TableHead className="text-[11px]">Source Subnet</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {group.members.length === 0 ? (
              <TableRow><TableCell colSpan={type === "clear" ? 5 : 2} className="text-xs text-muted-foreground">No entries configured</TableCell></TableRow>
            ) : group.members.map((m) => (
              <TableRow key={m.name}>
                <TableCell className="text-xs">{m.name}</TableCell>
                <TableCell className="text-xs">{m.qosProfile ?? "—"}</TableCell>
                {type === "clear" && <TableCell className="text-xs">{m.sourceInterface ?? "—"}</TableCell>}
                {type === "clear" && <TableCell className="text-xs">{m.destinationInterface ?? "—"}</TableCell>}
                {type === "clear" && <TableCell className="text-xs">{m.sourceSubnet.join(", ") || "—"}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </TableRoot>
      </div>
    </div>
  )
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

function QosInterfaceDialog({
  qosIface,
  open,
  onOpenChange,
}: {
  qosIface: PanwQosInterface | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!qosIface) return null

  const LW = "w-36"

  return (
    <DetailDialog title="QoS Interface" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-3xl" height="h-[min(90vh,650px)]" noPadding>
      <Tabs defaultValue="physical" className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 border-b px-5">
          <TabsList variant="line">
            <TabsTrigger value="physical">Physical Interface</TabsTrigger>
            <TabsTrigger value="clear">Clear Text Traffic</TabsTrigger>
            <TabsTrigger value="tunnel">Tunneled Traffic</TabsTrigger>
          </TabsList>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <TabsContent value="physical">
            <div className="space-y-4">
              <DisplayField label="Interface Name" value={qosIface.interface} labelWidth={LW} />
              <DisplayField label="Egress Max (Mbps)" value={String(qosIface.egressMax ?? 0)} labelWidth={LW} />
              <Label className="flex items-center gap-2 py-1 pl-1">
                <Checkbox checked={qosIface.enabled} disabled />
                <span className="text-xs">Turn on QoS feature on this interface</span>
              </Label>
              <Fieldset>
                <FieldsetLegend>Default Profile</FieldsetLegend>
                <FieldsetContent>
                  <DisplayField label="Clear Text" value={qosIface.defaultClearTextProfile ?? "None"} labelWidth="w-32" />
                  <DisplayField label="Tunnel Interface" value={qosIface.defaultTunnelProfile ?? "None"} labelWidth="w-32" />
                </FieldsetContent>
              </Fieldset>
            </div>
          </TabsContent>
          <TabsContent value="clear">
            <TrafficGroupTab group={qosIface.clearTextTraffic} type="clear" />
          </TabsContent>
          <TabsContent value="tunnel">
            <TrafficGroupTab group={qosIface.tunneledTraffic} type="tunnel" />
          </TabsContent>
        </div>
      </Tabs>
    </DetailDialog>
  )
}

// Need Label import for the dialog
import { Label } from "@/components/ui/label"

// ─── Expandable table row ─────────────────────────────────────────────────────

function QosInterfaceRow({ qosIface, onNameClick }: { qosIface: PanwQosInterface; onNameClick: (q: PanwQosInterface) => void }) {
  const ct = qosIface.clearTextTraffic
  const tt = qosIface.tunneledTraffic

  return (
    <>
      {/* Interface header row */}
      <TableRow className="bg-muted/30">
        <TableCell>
          <button
            type="button"
            className="text-xs font-medium text-foreground hover:underline cursor-pointer"
            onClick={() => onNameClick(qosIface)}
          >
            {qosIface.interface}
          </button>
        </TableCell>
        <TableCell />
        <TableCell />
        <TableCell />
        <TableCell><Checkbox checked={qosIface.enabled} disabled /></TableCell>
      </TableRow>

      {/* Tunneled Traffic sub-section */}
      {(tt.members.length > 0 || tt.defaultProfile) && (
        <>
          <TableRow>
            <TableCell className="pl-8 text-xs font-medium">Tunneled Traffic</TableCell>
            <TableCell className="text-xs tabular-nums">{tt.egressGuaranteed != null ? tt.egressGuaranteed.toFixed(3) : ""}</TableCell>
            <TableCell className="text-xs tabular-nums">{tt.egressMax != null ? tt.egressMax.toFixed(3) : ""}</TableCell>
            <TableCell className="text-xs">{tt.defaultProfile ?? ""}</TableCell>
            <TableCell />
          </TableRow>
          {tt.members.map((m) => (
            <TableRow key={m.name}>
              <TableCell className="pl-14 text-xs text-muted-foreground">{m.name}</TableCell>
              <TableCell />
              <TableCell />
              <TableCell className="text-xs">{m.qosProfile ?? "—"}</TableCell>
              <TableCell />
            </TableRow>
          ))}
        </>
      )}

      {/* Clear Text Traffic sub-section */}
      {(ct.members.length > 0 || ct.defaultProfile) && (
        <>
          <TableRow>
            <TableCell className="pl-8 text-xs font-medium">Clear Text Traffic</TableCell>
            <TableCell className="text-xs tabular-nums">{ct.egressGuaranteed != null ? ct.egressGuaranteed.toFixed(3) : ""}</TableCell>
            <TableCell className="text-xs tabular-nums">{ct.egressMax != null ? ct.egressMax.toFixed(3) : ""}</TableCell>
            <TableCell className="text-xs">{ct.defaultProfile ?? ""}</TableCell>
            <TableCell />
          </TableRow>
          {ct.members.map((m) => (
            <TableRow key={m.name}>
              <TableCell className="pl-14 text-xs text-muted-foreground">
                {m.name}{m.sourceInterface ? ` (${m.sourceInterface}` : ""}{m.sourceSubnet.length > 0 ? ` - ${m.sourceSubnet.join(", ")})` : m.sourceInterface ? ")" : ""}
              </TableCell>
              <TableCell />
              <TableCell />
              <TableCell className="text-xs">{m.qosProfile ?? "—"}</TableCell>
              <TableCell />
            </TableRow>
          ))}
        </>
      )}
    </>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function QosInterfacesView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [selected, setSelected] = React.useState<PanwQosInterface | null>(null)

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    const resolved = resolveNetworkData(activeConfig.parsedConfig, selectedScope)
    const qos = resolved.qosInterfaces
    return Array.isArray(qos) ? qos : []
  }, [activeConfig, selectedScope])

  const filtered = React.useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter((d) => d.interface.toLowerCase().includes(q))
  }, [data, search])

  if (data.length === 0) {
    return <NotConfiguredState title="QoS Interfaces" />
  }

  return (
    <>
      <CategoryShell title="QoS" count={filtered.length} search={search} onSearch={setSearch}>
        <TableRoot>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground px-3 h-9">Name</TableHead>
              <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground px-3 h-9">Guaranteed Egress (Mbps)</TableHead>
              <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground px-3 h-9">Maximum Egress (Mbps)</TableHead>
              <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground px-3 h-9">Profile</TableHead>
              <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground px-3 h-9">Enabled</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center text-sm text-muted-foreground">
                  {search ? `No results matching "${search}"` : "No QoS interfaces configured."}
                </TableCell>
              </TableRow>
            ) : filtered.map((q) => (
              <QosInterfaceRow key={q.interface} qosIface={q} onNameClick={setSelected} />
            ))}
          </TableBody>
        </TableRoot>
      </CategoryShell>

      <QosInterfaceDialog
        qosIface={selected}
        open={selected !== null}
        onOpenChange={(open) => { if (!open) setSelected(null) }}
      />
    </>
  )
}

