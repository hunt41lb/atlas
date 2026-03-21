// @/app/(main)/network/_components/router-shared/router-dialog/router-dialog-general.tsx
//
// General page for the RouterDialog — shows Interface, Administrative
// Distances, ECMP, and RIB Filter tabs.

"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MonoValue } from "@/app/(main)/_components/ui/category-shell"
import { FieldRow, LabeledValue, ReadOnlyCheckbox, FieldGroup } from "./field-display"
import {
  DEFAULT_ADMIN_DISTANCES,
  DEFAULT_ECMP,
  ECMP_ALGORITHM_LABELS,
} from "@/lib/panw-defaults"
import type { PanwVirtualRouter } from "@/lib/panw-parser/types"

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
    <FieldRow
      label={label}
      value={displayValue}
      annotation={isCustom ? `(default: ${defaultValue})` : undefined}
      highlight={isCustom}
    />
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
  const lbMethod = showDefaults
    ? DEFAULT_ECMP.algorithm
    : router.ecmpAlgorithm
      ? (ECMP_ALGORITHM_LABELS[router.ecmpAlgorithm] ?? router.ecmpAlgorithm)
      : "None"

  return (
    <div className="space-y-3 px-1">
      <div className="space-y-0.5">
        <ReadOnlyCheckbox
          checked={showDefaults ? DEFAULT_ECMP.enabled : router.ecmpEnabled}
          label="Enable"
        />
        <ReadOnlyCheckbox
          checked={showDefaults ? DEFAULT_ECMP.symmetricReturn : router.ecmpSymmetricReturn}
          label="Symmetric Return"
        />
        <ReadOnlyCheckbox
          checked={showDefaults ? DEFAULT_ECMP.strictSourcePath : router.ecmpStrictSourcePath}
          label="Strict Source Path"
        />
      </div>
      <div className="border-t pt-2 space-y-0">
        <LabeledValue label="Max Path" value={showDefaults ? DEFAULT_ECMP.maxPath : 2} />
        <LabeledValue label="Load-Balancing Method" value={lbMethod} />
      </div>
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

