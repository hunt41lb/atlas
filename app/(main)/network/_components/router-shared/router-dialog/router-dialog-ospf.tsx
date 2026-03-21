// @/app/(main)/network/_components/router-shared/router-dialog/router-dialog-ospf.tsx
//
// OSPF page for the RouterDialog.
// Layout matches PAN-OS GUI: header with profile refs + Area/Advanced tabs.
// Uses both router.ospf (operational) and router.ospfRefs (profile names).

"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MonoValue } from "@/app/(main)/_components/ui/category-shell"
import { ReadOnlyCheckbox, FieldGroup, LabeledValue } from "./field-display"
import type { RouterDialogPageProps } from "./router-dialog-general"
import type { PanwOspfArea } from "@/lib/panw-parser/types"

// ─── Shared field display ─────────────────────────────────────────────────────

function HeaderField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground shrink-0 text-right w-36">{label}</span>
      <Input readOnly value={value} className="h-7 flex-1 text-xs" />
    </div>
  )
}

// ─── Area Detail Dialog ───────────────────────────────────────────────────────

function AreaDetailDialog({
  area,
  areaRef,
  protocol,
  open,
  onOpenChange,
}: {
  area: PanwOspfArea | null
  areaRef: { abrImportList: string | null; abrExportList: string | null; abrInboundFilterList: string | null; abrOutboundFilterList: string | null; authProfile: string | null } | null
  protocol: "OSPF" | "OSPFv3"
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!area) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="shrink-0 border-b px-5 pt-4 pb-3">
          <DialogTitle>{protocol} - Area</DialogTitle>
        </DialogHeader>

        <div className="shrink-0 px-5 pt-3 pb-1">
          <HeaderField label="Area ID" value={area.id} />
        </div>

        <Tabs defaultValue="type" className="flex-1 flex flex-col min-h-0">
          <div className="shrink-0 border-b px-5">
            <TabsList variant="line">
              <TabsTrigger value="type">Type</TabsTrigger>
              <TabsTrigger value="range">Range</TabsTrigger>
              <TabsTrigger value="interface">Interface</TabsTrigger>
              <TabsTrigger value="virtual-link">Virtual Link</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {/* Type tab */}
            <TabsContent value="type">
              <div className="space-y-3">
                <LabeledValue label="Authentication" value={areaRef?.authProfile ?? "None"} />
                <LabeledValue label="Type" value={area.type ?? "Normal"} />

                <FieldGroup title="ABR">
                  <LabeledValue label="Import-list" value={areaRef?.abrImportList ?? "None"} />
                  <LabeledValue label="Export-list" value={areaRef?.abrExportList ?? "None"} />
                  <LabeledValue label="Inbound Filter List" value={areaRef?.abrInboundFilterList ?? "None"} />
                  <LabeledValue label="Outbound Filter List" value={areaRef?.abrOutboundFilterList ?? "None"} />
                </FieldGroup>
              </div>
            </TabsContent>

            {/* Range tab - placeholder */}
            <TabsContent value="range">
              <p className="py-4 text-xs text-muted-foreground text-center">
                No range entries configured.
              </p>
            </TabsContent>

            {/* Interface tab */}
            <TabsContent value="interface">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px]">INTERFACE</TableHead>
                      <TableHead className="text-[11px]">ENABLE</TableHead>
                      <TableHead className="text-[11px]">PASSIVE</TableHead>
                      <TableHead className="text-[11px]">LINK TYPE</TableHead>
                      <TableHead className="text-[11px]">COST</TableHead>
                      <TableHead className="text-[11px]">PRIORITY</TableHead>
                      <TableHead className="text-[11px]">AUTH PROFILE</TableHead>
                      <TableHead className="text-[11px]">TIMER PROFILE</TableHead>
                      <TableHead className="text-[11px]">BFD PROFILE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(area.interfaces ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="py-6 text-center text-xs text-muted-foreground">No interfaces configured.</TableCell>
                      </TableRow>
                    ) : area.interfaces.map((iface) => (
                      <TableRow key={iface.name}>
                        <TableCell><MonoValue className="text-xs">{iface.name}</MonoValue></TableCell>
                        <TableCell>{iface.enabled ? <Checkbox checked disabled /> : <Checkbox disabled />}</TableCell>
                        <TableCell>{iface.passive ? <Checkbox checked disabled /> : <Checkbox disabled />}</TableCell>
                        <TableCell><span className="text-xs">{iface.linkType ?? "—"}</span></TableCell>
                        <TableCell><span className="tabular-nums text-xs">{iface.metric ?? "—"}</span></TableCell>
                        <TableCell><span className="tabular-nums text-xs">{iface.priority ?? "—"}</span></TableCell>
                        <TableCell><span className="text-xs">{(iface as unknown as Record<string, unknown>)["authProfile"] as string ?? "—"}</span></TableCell>
                        <TableCell><span className="text-xs">{(iface as unknown as Record<string, unknown>)["timingProfile"] as string ?? "—"}</span></TableCell>
                        <TableCell><span className="text-xs">{iface.bfdProfile ?? "—"}</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Virtual Link tab - placeholder */}
            <TabsContent value="virtual-link">
              <p className="py-4 text-xs text-muted-foreground text-center">
                No virtual links configured.
              </p>
            </TabsContent>
          </div>
        </Tabs>

        <div className="shrink-0 border-t bg-muted/50 rounded-b-xl px-5 py-3 flex justify-end">
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Area Tab ─────────────────────────────────────────────────────────────────

function AreaTab({
  areas,
  areaRefs,
  protocol,
}: {
  areas: PanwOspfArea[]
  areaRefs: { id: string; abrImportList: string | null; abrExportList: string | null; abrInboundFilterList: string | null; abrOutboundFilterList: string | null; authProfile: string | null }[]
  protocol: "OSPF" | "OSPFv3"
}) {
  const [selectedArea, setSelectedArea] = React.useState<PanwOspfArea | null>(null)

  // Match area refs by ID
  const getRef = (areaId: string) => areaRefs.find(r => r.id === areaId) ?? null

  // Get first interface name for display
  const firstInterface = (area: PanwOspfArea) =>
    area.interfaces?.[0]?.name ?? "—"

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px]">AREA ID</TableHead>
              <TableHead className="text-[11px]">TYPE</TableHead>
              <TableHead className="text-[11px]">AUTHENTICATION</TableHead>
              <TableHead className="text-[11px]">RANGE</TableHead>
              <TableHead className="text-[11px]">INTERFACE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {areas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center text-xs text-muted-foreground">No areas configured.</TableCell>
              </TableRow>
            ) : areas.map((area) => {
              const ref = getRef(area.id)
              return (
                <TableRow
                  key={area.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedArea(area)}
                >
                  <TableCell><MonoValue className="text-xs">{area.id}</MonoValue></TableCell>
                  <TableCell><span className="text-xs">{area.type}</span></TableCell>
                  <TableCell><span className="text-xs">{ref?.authProfile ?? "—"}</span></TableCell>
                  <TableCell><span className="text-xs text-muted-foreground">—</span></TableCell>
                  <TableCell><MonoValue className="text-xs">{firstInterface(area)}</MonoValue></TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AreaDetailDialog
        area={selectedArea}
        areaRef={selectedArea ? getRef(selectedArea.id) : null}
        protocol={protocol}
        open={selectedArea !== null}
        onOpenChange={(open) => { if (!open) setSelectedArea(null) }}
      />
    </>
  )
}

// ─── Advanced Tab ─────────────────────────────────────────────────────────────

function AdvancedTab({ router, protocol }: { router: RouterDialogPageProps["router"]; protocol: "ospf" | "ospfv3" }) {
  // Graceful restart and rfc1583 come from the existing ospf/ospfv3 config
  // These fields are parsed by the existing extractOspfConfig/extractOspfv3Config
  const cfg = router[protocol]
  const gr = (cfg as unknown as Record<string, unknown>)?.["gracefulRestart"] as Record<string, unknown> | undefined
  const rfc = protocol === "ospf" ? (cfg as unknown as Record<string, unknown>)?.["rfc1583"] : null
  const disableTransit = protocol === "ospfv3" ? (cfg as unknown as Record<string, unknown>)?.["disableTransitTraffic"] : null

  return (
    <div className="grid grid-cols-2 gap-6">
      <FieldGroup title="Graceful Restart">
        <ReadOnlyCheckbox checked={gr?.["enabled"] === true} label="Enable Graceful Restart" />
        <ReadOnlyCheckbox checked={gr?.["helperEnabled"] === true} label="Enable Helper Mode" />
        <ReadOnlyCheckbox checked={gr?.["strictLsaChecking"] === true} label="Enable Strict LSA Checking" />
        <LabeledValue label="Grace Period (sec)" value={String(gr?.["gracePeriod"] ?? "—")} />
        <LabeledValue label="Max Neighbor Restart Time (sec)" value={String(gr?.["maxNeighborRestartTime"] ?? "—")} />
      </FieldGroup>
      <div>
        {protocol === "ospf" && (
          <ReadOnlyCheckbox checked={rfc === true} label="rfc-1583 compatibility" />
        )}
        {protocol === "ospfv3" && (
          <ReadOnlyCheckbox checked={disableTransit === true} label="Disable R-Bit and v6-Bit" />
        )}
      </div>
    </div>
  )
}

// ─── OSPF Page (exported) ─────────────────────────────────────────────────────

export function OspfPage({ router }: RouterDialogPageProps) {
  return <OspfPageInner router={router} protocol="ospf" label="OSPF" />
}

export function Ospfv3Page({ router }: RouterDialogPageProps) {
  return <OspfPageInner router={router} protocol="ospfv3" label="OSPFv3" />
}

function OspfPageInner({
  router,
  protocol,
  label,
}: {
  router: RouterDialogPageProps["router"]
  protocol: "ospf" | "ospfv3"
  label: string
}) {
  const refs = protocol === "ospf" ? router.ospfRefs : router.ospfv3Refs
  const cfg = router[protocol]

  return (
    <div className="flex h-full flex-col min-h-0">
      {/* Header fields — matching PAN-OS layout */}
      <div className="shrink-0 border-b px-4 py-3">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 pl-38">
              <Checkbox checked={refs?.enabled ?? cfg?.enabled ?? false} disabled />
              <span className="text-xs">Enable</span>
            </div>
            <HeaderField label="Router ID" value={refs?.routerId ?? cfg?.routerId ?? "None"} />
            <HeaderField label="BFD Profile" value={refs?.globalBfdProfile ?? cfg?.globalBfdProfile ?? "None"} />
          </div>
          <div className="space-y-2">
            <HeaderField label="Global General Timer" value={refs?.spfTimerName ?? "None"} />
            <HeaderField label="Global Interface Timer" value={refs?.globalIfTimerName ?? "None"} />
            <HeaderField label="Redistribution Profile" value={refs?.redistProfileName ?? "None"} />
          </div>
        </div>
      </div>

      {/* Area / Advanced tabs */}
      <Tabs defaultValue="area" className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 border-b px-4">
          <TabsList variant="line">
            <TabsTrigger value="area">Area</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="area">
            <AreaTab
              areas={cfg?.areas ?? []}
              areaRefs={refs?.areas ?? []}
              protocol={label as "OSPF" | "OSPFv3"}
            />
          </TabsContent>
          <TabsContent value="advanced">
            <AdvancedTab router={router} protocol={protocol} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
