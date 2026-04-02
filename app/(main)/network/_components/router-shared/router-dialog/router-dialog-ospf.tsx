// @/app/(main)/network/_components/router-shared/router-dialog/router-dialog-ospf.tsx

"use client"

import * as React from "react"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

import { MonoValue } from "@/app/(main)/_components/ui/category-shell"
import {
  FieldGroup,
  LabeledValue,
  HeaderField,
  DetailDialog,
} from "./field-display"
import type { RouterDialogPageProps } from "./router-dialog-general"
import type { PanwOspfArea } from "@/lib/panw-parser/types"

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
    <DetailDialog title={`${protocol} - Area`} open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-4xl">
      <HeaderField label="Area ID" value={area.id} />

      <Tabs defaultValue="type" className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 border-b">
          <TabsList variant="line">
            <TabsTrigger value="type">Type</TabsTrigger>
            <TabsTrigger value="range">Range</TabsTrigger>
            <TabsTrigger value="interface">Interface</TabsTrigger>
            <TabsTrigger value="virtual-link">Virtual Link</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto pt-3">
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

          <TabsContent value="range">
            {(area.ranges ?? []).length === 0 ? (
              <p className="py-4 text-xs text-muted-foreground text-center">No range entries configured.</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px]">IP ADDRESS/NETMASK</TableHead>
                      <TableHead className="text-[11px]">SUBSTITUTE</TableHead>
                      <TableHead className="text-[11px]">ADVERTISE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {area.ranges.map((r) => (
                      <TableRow key={r.prefix}>
                        <TableCell><MonoValue className="text-xs">{r.prefix}</MonoValue></TableCell>
                        <TableCell><span className="text-xs">{r.substitute ?? "—"}</span></TableCell>
                        <TableCell>{r.advertise ? <Checkbox checked disabled /> : <Checkbox disabled />}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

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
                    <TableHead className="text-[11px]">MTU IGNORE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(area.interfaces ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="py-6 text-center text-xs text-muted-foreground">No interfaces configured.</TableCell>
                    </TableRow>
                  ) : area.interfaces.map((iface) => (
                    <TableRow key={iface.name}>
                      <TableCell><MonoValue className="text-xs">{iface.name}</MonoValue></TableCell>
                      <TableCell>{iface.enabled ? <Checkbox checked disabled /> : <Checkbox disabled />}</TableCell>
                      <TableCell>{iface.passive ? <Checkbox checked disabled /> : <Checkbox disabled />}</TableCell>
                      <TableCell><span className="text-xs">{iface.linkType ?? "—"}</span></TableCell>
                      <TableCell><span className="tabular-nums text-xs">{iface.metric ?? "—"}</span></TableCell>
                      <TableCell><span className="tabular-nums text-xs">{iface.priority ?? "—"}</span></TableCell>
                      <TableCell><span className="text-xs">{iface.authProfile ?? "—"}</span></TableCell>
                      <TableCell><span className="text-xs">{iface.timingProfile ?? "—"}</span></TableCell>
                      <TableCell><span className="text-xs">{iface.bfdProfile ?? "—"}</span></TableCell>
                      <TableCell>{iface.mtuIgnore ? <Checkbox checked disabled /> : <Checkbox disabled />}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="virtual-link">
            {(area.virtualLinks ?? []).length === 0 ? (
              <p className="py-4 text-xs text-muted-foreground text-center">No virtual links configured.</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px]">NAME</TableHead>
                      <TableHead className="text-[11px]">ENABLE</TableHead>
                      <TableHead className="text-[11px]">NEIGHBOR ID</TableHead>
                      <TableHead className="text-[11px]">TRANSIT AREA ID</TableHead>
                      <TableHead className="text-[11px]">AUTH PROFILE</TableHead>
                      <TableHead className="text-[11px]">TIMER PROFILE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {area.virtualLinks.map((vl) => (
                      <TableRow key={vl.name}>
                        <TableCell><span className="text-xs font-medium">{vl.name}</span></TableCell>
                        <TableCell>{vl.enabled ? <Checkbox checked disabled /> : <Checkbox disabled />}</TableCell>
                        <TableCell><MonoValue className="text-xs">{vl.neighborId ?? "—"}</MonoValue></TableCell>
                        <TableCell><MonoValue className="text-xs">{vl.transitAreaId ?? "—"}</MonoValue></TableCell>
                        <TableCell><span className="text-xs">{vl.authProfile ?? "—"}</span></TableCell>
                        <TableCell><span className="text-xs">{vl.timingProfile ?? "—"}</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </DetailDialog>
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
                  <TableCell>
                    {(area.ranges ?? []).length > 0
                      ? <MonoValue className="text-xs">{area.ranges[0].prefix}</MonoValue>
                      : <span className="text-xs text-muted-foreground">—</span>
                    }
                  </TableCell>
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
  const cfg = router[protocol]
  const gr = cfg?.gracefulRestart ?? null

  return (
    <div className="grid grid-cols-2 gap-6">
      <FieldGroup title="Graceful Restart">
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={gr?.enabled ?? false} disabled />
          <span className="text-xs">Enable Graceful Restart</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={gr?.helperEnabled ?? false} disabled />
          <span className="text-xs">Enable Helper Mode</span>
        </Label>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={gr?.strictLsaChecking ?? false} disabled />
          <span className="text-xs">Enable Strict LSA Checking</span>
        </Label>
        <LabeledValue label="Grace Period (sec)" value={gr?.gracePeriod ?? "—"} labelWidth="w-50" />
        <LabeledValue label="Max Neighbor Restart Time (sec)" value={gr?.maxNeighborRestartTime ?? "—"} labelWidth="w-50" />
      </FieldGroup>
      <div>
        {protocol === "ospf" && (
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={(cfg as { rfc1583?: boolean })?.rfc1583 ?? false} disabled />
            <span className="text-xs">rfc-1583 compatibility</span>
          </Label>
        )}
        {protocol === "ospfv3" && (
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={(cfg as { disableTransitTraffic?: boolean })?.disableTransitTraffic ?? false} disabled />
            <span className="text-xs">Disable R-Bit and v6-Bit</span>
          </Label>
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
