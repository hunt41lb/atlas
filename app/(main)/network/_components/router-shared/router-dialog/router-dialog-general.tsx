// @/app/(main)/network/_components/router-shared/router-dialog/router-dialog-general.tsx

"use client"

import { cn } from "@/lib/utils"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs"
import { Field, FieldLabel, FieldContent, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { MonoValue } from "@/app/(main)/_components/ui/category-shell"
import {
  LabeledValue,
  FieldGroup
} from "./field-display"
import {
  DEFAULT_ADMIN_DISTANCES,
  DEFAULT_ECMP,
  ECMP_ALGORITHM_LABELS,
} from "@/lib/panw-defaults"
import type { PanwVirtualRouter } from "@/lib/panw-parser/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

// ─── Interface Tab ────────────────────────────────────────────────────────────

function InterfaceTab({ router }: { router: PanwVirtualRouter }) {
  return (
    <div className="space-y-2">
      <div className="rounded-md border">
        <div className="bg-muted/50 border-b px-3 py-1.5">
          <span className="text-xs font-medium uppercase tracking-wide">Interface</span>
        </div>
        <div className="divide-y">
          {router.interfaces.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground">No interfaces assigned</div>
          ) : (
            router.interfaces.map((iface) => (
              <div key={iface} className="px-3 py-1.5">
                <MonoValue className="text-xs">{iface}</MonoValue>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Administrative Distances Tab ─────────────────────────────────────────────

function AdminDistanceRow({
  label,
  value,
  defaultValue,
  showDefaults,
}: {
  label: string
  value: number | null
  defaultValue: number
  showDefaults: boolean
}) {
  const displayValue = showDefaults ? defaultValue : (value ?? defaultValue)
  const isCustom = !showDefaults && value !== null && value !== defaultValue

  return (
    <Field orientation="horizontal">
      <FieldLabel className="w-44 text-xs">{label}</FieldLabel>
      <FieldContent>
        <Input
          readOnly
          disabled
          value={displayValue}
          className={cn("h-7 w-20 text-xs tabular-nums text-right", isCustom && "text-primary-foreground")}
        />
        {isCustom && (
          <FieldDescription className="text-[10px]">
            default: {defaultValue}
          </FieldDescription>
        )}
      </FieldContent>
    </Field>
  )
}

function AdminDistancesTab({
  router,
  showDefaults,
}: {
  router: PanwVirtualRouter
  showDefaults: boolean
}) {
  const ad = router.adminDistances
  const d = DEFAULT_ADMIN_DISTANCES

  return (
    <div className="max-w-md space-y-1 px-1">
      <AdminDistanceRow label="Static"             value={ad?.static ?? null}       defaultValue={d.static}       showDefaults={showDefaults} />
      <AdminDistanceRow label="Static IPv6"        value={ad?.staticIpv6 ?? null}   defaultValue={d.staticIpv6}   showDefaults={showDefaults} />
      <AdminDistanceRow label="OSPF Intra Area"    value={ad?.ospfIntra ?? null}    defaultValue={d.ospfIntra}    showDefaults={showDefaults} />
      <AdminDistanceRow label="OSPF Inter Area"    value={ad?.ospfInter ?? null}    defaultValue={d.ospfInter}    showDefaults={showDefaults} />
      <AdminDistanceRow label="OSPF External"      value={ad?.ospfExt ?? null}      defaultValue={d.ospfExt}      showDefaults={showDefaults} />
      <AdminDistanceRow label="OSPFv3 Intra Area"  value={ad?.ospfv3Intra ?? null}  defaultValue={d.ospfv3Intra}  showDefaults={showDefaults} />
      <AdminDistanceRow label="OSPFv3 Inter Area"  value={ad?.ospfv3Inter ?? null}  defaultValue={d.ospfv3Inter}  showDefaults={showDefaults} />
      <AdminDistanceRow label="OSPFv3 External"    value={ad?.ospfv3Ext ?? null}    defaultValue={d.ospfv3Ext}    showDefaults={showDefaults} />
      <AdminDistanceRow label="BGP AS Internal"    value={ad?.bgpInternal ?? null}  defaultValue={d.bgpInternal}  showDefaults={showDefaults} />
      <AdminDistanceRow label="BGP AS External"    value={ad?.bgpExternal ?? null}  defaultValue={d.bgpExternal}  showDefaults={showDefaults} />
      <AdminDistanceRow label="BGP Local Route"    value={ad?.bgpLocal ?? null}     defaultValue={d.bgpLocal}     showDefaults={showDefaults} />
      <AdminDistanceRow label="RIP"                value={ad?.rip ?? null}          defaultValue={d.rip}          showDefaults={showDefaults} />
    </div>
  )
}

// ─── ECMP Tab ─────────────────────────────────────────────────────────────────

function EcmpTab({
  router,
  showDefaults,
}: {
  router: PanwVirtualRouter
  showDefaults: boolean
}) {
  const ecmp = router.ecmp
  const d = DEFAULT_ECMP

  const lbMethod = showDefaults
    ? d.algorithm
    : ecmp.algorithm
      ? (ECMP_ALGORITHM_LABELS[ecmp.algorithm] ?? ecmp.algorithm)
      : "None"

  return (
    <div className="space-y-3 px-1">
      <div className="space-y-0.5">
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={showDefaults ? d.enabled : ecmp.enabled} disabled />
          <span className="text-xs">Enable</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={showDefaults ? d.symmetricReturn : ecmp.symmetricReturn} disabled />
          <span className="text-xs">Symmetric Return</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={showDefaults ? d.strictSourcePath : ecmp.strictSourcePath} disabled />
          <span className="text-xs">Strict Source Path</span>
        </Label>
      </div>
      <div className="border-t pt-2 space-y-0">
        <LabeledValue label="Max Path" labelWidth="w-44" value={showDefaults ? d.maxPath : (ecmp.maxPath ?? 2)} />
        <LabeledValue label="Load-Balancing Method" labelWidth="w-44" value={lbMethod} />
      </div>

      {/* IP Hash sub-options */}
      {!showDefaults && ecmp.ipHash && (
        <FieldGroup title="IP Hash Options">
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={ecmp.ipHash.srcOnly} disabled />
            <span className="text-xs">Source Only</span>
          </Label>
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={ecmp.ipHash.usePort} disabled />
            <span className="text-xs">Use Port</span>
          </Label>
          <LabeledValue label="Hash Seed" value={ecmp.ipHash.hashSeed ?? "—"} />
        </FieldGroup>
      )}

      {/* Weighted Round Robin interfaces */}
      {!showDefaults && ecmp.weightedInterfaces.length > 0 && (
        <FieldGroup title="Weighted Round Robin">
          <div className="rounded-md border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="px-3 py-1.5 text-left text-[11px] font-semibold text-muted-foreground">INTERFACE</th>
                  <th className="px-3 py-1.5 text-left text-[11px] font-semibold text-muted-foreground">WEIGHT</th>
                </tr>
              </thead>
              <tbody>
                {ecmp.weightedInterfaces.map((wi) => (
                  <tr key={wi.name} className="border-b last:border-0">
                    <td className="px-3 py-1.5 font-mono">{wi.name}</td>
                    <td className="px-3 py-1.5 tabular-nums font-medium">{wi.weight ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FieldGroup>
      )}
    </div>
  )
}

// ─── RIB Filter Tab ───────────────────────────────────────────────────────────

function RibFilterTab({ router }: { router: PanwVirtualRouter }) {
  const rf = router.ribFilter

  return (
    <div className="grid grid-cols-2 gap-4 px-1">
      <FieldGroup title="IPv4">
      <LabeledValue label="BGP Route-Map"    value={rf?.ipv4.bgp ?? "None"} />
      <LabeledValue label="OSPF Route-Map"   value={rf?.ipv4.ospf ?? "None"} />
      <LabeledValue label="Static Route-Map" value={rf?.ipv4.static ?? "None"} />
      <LabeledValue label="RIP Route-Map"    value={rf?.ipv4.rip ?? "None"} />
    </FieldGroup>
    <FieldGroup title="IPv6">
      <LabeledValue label="BGP Route-Map"    value={rf?.ipv6.bgp ?? "None"} />
      <LabeledValue label="OSPFv3 Route-Map" value={rf?.ipv6.ospfv3 ?? "None"} />
      <LabeledValue label="Static Route-Map" value={rf?.ipv6.static ?? "None"} />
    </FieldGroup>
    </div>
  )
}

// ─── General Page (exported) ──────────────────────────────────────────────────

export interface RouterDialogPageProps {
  router: PanwVirtualRouter
  showDefaults: boolean
}

export function GeneralPage({ router, showDefaults }: RouterDialogPageProps) {
  return (
    <div className="flex h-full flex-col min-h-0">
      {/* Name field */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b">
        <span className="text-xs text-muted-foreground shrink-0">Name</span>
        <span className="text-sm font-medium">{router.name}</span>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="interface" className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 border-b px-4">
          <TabsList variant="line">
            <TabsTrigger value="interface">Interface</TabsTrigger>
            <TabsTrigger value="admin-distances">Administrative Distances</TabsTrigger>
            <TabsTrigger value="ecmp">ECMP</TabsTrigger>
            <TabsTrigger value="rib-filter">RIB Filter</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="interface">
            <InterfaceTab router={router} />
          </TabsContent>
          <TabsContent value="admin-distances">
            <AdminDistancesTab router={router} showDefaults={showDefaults} />
          </TabsContent>
          <TabsContent value="ecmp">
            <EcmpTab router={router} showDefaults={showDefaults} />
          </TabsContent>
          <TabsContent value="rib-filter">
            <RibFilterTab router={router} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
