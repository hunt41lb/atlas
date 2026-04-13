// @/app/(main)/network/_components/interfaces/cellular-tab.tsx

"use client"

import * as React from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  createColumnHelper,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DataTable } from "@/components/ui/data-table"
import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table"
import { templateColumn } from "@/app/(main)/_components/ui/table-columns"
import { RouterCell, ZoneCell, MgmtProfileCell, FeaturesList } from "./interface-helpers"
import type { PanwCellularInterface } from "@/lib/panw-parser/network/interfaces"
import { DDNS_CONFIG_LABELS, DDNS_VENDOR_LABELS } from "@/lib/panw-defaults"

// ─── Column builder ──────────────────────────────────────────────────────────

const col = createColumnHelper<PanwCellularInterface>()

function buildColumns(
  isPanorama: boolean,
  ifaceToVirtualRouter: Map<string, string>,
  ifaceToLogicalRouter: Map<string, string>,
  ifaceToZone: Map<string, string>,
  zoneColorMap: Map<string, string>,
  onNameClick: (item: PanwCellularInterface) => void,
  onMgmtProfileClick?: (name: string) => void,
  onRouterClick?: (name: string) => void,
): ColumnDef<PanwCellularInterface, unknown>[] {
  return [
    col.accessor("name", {
      header: "Interface",
      enableHiding: false,
      cell: (info) => (
        <button
          type="button"
          className="font-medium text-foreground hover:underline cursor-pointer"
          onClick={() => onNameClick(info.row.original)}
        >
          {info.getValue()}
        </button>
      ),
    }) as ColumnDef<PanwCellularInterface, unknown>,

    {
      id: "interfaceType",
      header: "Interface Type",
      enableSorting: false,
      cell: () => <Badge variant="blue" size="sm">Layer3</Badge>,
    },

    col.accessor("managementProfile", {
      header: "Management Profile",
      cell: (info) => <MgmtProfileCell name={info.getValue()} onClick={onMgmtProfileClick} />,
    }) as ColumnDef<PanwCellularInterface, unknown>,

    {
      id: "virtualRouter",
      header: "Virtual Router",
      enableSorting: true,
      accessorFn: (row) => ifaceToVirtualRouter.get(row.name) ?? "",
      cell: ({ row }) => <RouterCell name={ifaceToVirtualRouter.get(row.original.name)} onClick={onRouterClick} />,
    },

    {
      id: "logicalRouter",
      header: "Logical Router",
      enableSorting: true,
      accessorFn: (row) => ifaceToLogicalRouter.get(row.name) ?? "",
      cell: ({ row }) => <RouterCell name={ifaceToLogicalRouter.get(row.original.name)} onClick={onRouterClick} />,
    },

    {
      id: "primarySim",
      header: "Primary SIM",
      enableSorting: true,
      accessorFn: (row) => row.simSlots[0]?.slot ?? 0,
      cell: ({ row }) => {
        const slot = row.original.simSlots[0]
        return slot ? <span className="tabular-nums">{slot.slot}</span> : <span className="text-muted-foreground">—</span>
      },
    },

    {
      id: "securityZone",
      header: "Security Zone",
      enableSorting: true,
      accessorFn: (row) => ifaceToZone.get(row.name) ?? "",
      cell: ({ row }) => {
        const zoneName = ifaceToZone.get(row.original.name)
        return <ZoneCell name={zoneName} color={zoneColorMap.get(zoneName ?? "")} />
      },
    },

    {
      id: "features",
      header: "Features",
      enableSorting: false,
      cell: ({ row }) => {
        const c = row.original
        const features: string[] = []
        if (c.sdwanEnabled) features.push("SD-WAN")
        if (c.adjustTcpMss) features.push("TCP MSS")
        if (c.netflowProfile) features.push("Netflow")
        if (c.ddnsEnabled) features.push("DDNS")
        return <FeaturesList features={features} />
      },
    },

    col.accessor("comment", {
      header: "Comment",
      cell: (info) => info.getValue()
        ? <span className="text-muted-foreground">{info.getValue()}</span>
        : <span className="text-muted-foreground">—</span>,
    }) as ColumnDef<PanwCellularInterface, unknown>,

    ...templateColumn<PanwCellularInterface>(isPanorama),
  ]
}

// ─── Dialog ──────────────────────────────────────────────────────────────────

const LW = "w-44"

function CellularDialog({
  item,
  open,
  onOpenChange,
  ifaceToVirtualRouter,
  ifaceToLogicalRouter,
  ifaceToZone,
  onRouterClick,
}: {
  item: PanwCellularInterface | null
  open: boolean
  onOpenChange: (o: boolean) => void
  ifaceToVirtualRouter: Map<string, string>
  ifaceToLogicalRouter: Map<string, string>
  ifaceToZone: Map<string, string>
  onRouterClick?: (name: string) => void
}) {
  if (!item) return null

  return (
    <DetailDialog title="Cellular Interface" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-3xl">
      <DisplayField labelWidth={LW} label="Interface Name" value={item.name} />
      <DisplayField labelWidth={LW} label="Comment" value={item.comment ?? "None"} />
      <DisplayField labelWidth={LW} label="Netflow Profile" value={item.netflowProfile ?? "None"} />

      <Tabs defaultValue="config" className="mt-3 flex flex-col">
        <div className="shrink-0 border-b">
          <TabsList variant="line">
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="ipv4">IPv4</TabsTrigger>
            <TabsTrigger value="ipv6">IPv6</TabsTrigger>
            <TabsTrigger value="sdwan">SD-WAN</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
        </div>

        {/* Config tab */}
        <TabsContent value="config" className="pt-3 space-y-4">
          <Fieldset>
            <FieldsetLegend>Assign Interface To</FieldsetLegend>
            <FieldsetContent>
              <div className="flex items-center gap-2">
                <span className="w-32 shrink-0 font-medium text-foreground">Virtual Router</span>
                <RouterCell name={ifaceToVirtualRouter.get(item.name)} onClick={onRouterClick} />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-32 shrink-0 font-medium text-foreground">Logical Router</span>
                <RouterCell name={ifaceToLogicalRouter.get(item.name)} onClick={onRouterClick} />
              </div>
              <DisplayField label="Security Zone" value={ifaceToZone.get(item.name) ?? "None"} />
            </FieldsetContent>
          </Fieldset>
          <Fieldset>
            <FieldsetLegend>Radio Settings</FieldsetLegend>
            <FieldsetContent>
              <div className="flex items-center gap-4">
                <span className="w-32 shrink-0 font-medium text-foreground">Radio</span>
                <RadioGroup value={item.radio ?? "off"} disabled className="flex flex-row gap-4">
                  <Label className="flex items-center gap-1.5 font-normal"><RadioGroupItem value="off" />Off</Label>
                  <Label className="flex items-center gap-1.5 font-normal"><RadioGroupItem value="on" />On</Label>
                </RadioGroup>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-32 shrink-0 font-medium text-foreground">GPS</span>
                <RadioGroup value={item.gps ?? "off"} disabled className="flex flex-row gap-4">
                  <Label className="flex items-center gap-1.5 font-normal"><RadioGroupItem value="off" />Off</Label>
                  <Label className="flex items-center gap-1.5 font-normal"><RadioGroupItem value="on" />On</Label>
                </RadioGroup>
              </div>
              <DisplayField label="Primary SIM Slot" value={item.simSlots[0] ? String(item.simSlots[0].slot) : "None"} />
            </FieldsetContent>
          </Fieldset>
        </TabsContent>

        {/* IPv4 tab */}
        <TabsContent value="ipv4" className="pt-3 space-y-2">
          <Label className="flex items-center gap-2 pl-1">
            <Checkbox checked={item.sdwanEnabled} disabled />
            <span>Enable SD-WAN</span>
          </Label>
          <Label className="flex items-center gap-2 pl-1">
            <Checkbox checked={item.sdwanAutoDefaultRoute} disabled />
            <span>Automatically create default route pointing to network provided default gateway</span>
          </Label>
          <DisplayField labelWidth={LW} label="Default Route Metric" value={String(item.sdwanDefaultRouteMetric ?? 10)} />
        </TabsContent>

        {/* IPv6 tab */}
        <TabsContent value="ipv6" className="pt-3 space-y-2">
          <Label className="flex items-center gap-2 pl-1">
            <Checkbox checked={item.ipv6Enabled} disabled />
            <span>Enable IPv6 on the interface</span>
          </Label>
          <Label className="flex items-center gap-2 pl-1">
            <Checkbox checked={item.ipv6AutoDefaultRoute} disabled />
            <span>Automatically create default route pointing to network provided default gateway</span>
          </Label>
          <DisplayField labelWidth={LW} label="Default Route Metric" value={String(item.ipv6DefaultRouteMetric ?? 10)} />
        </TabsContent>

        {/* SD-WAN tab */}
        <TabsContent value="sdwan" className="pt-3 space-y-3">
          <DisplayField labelWidth={LW} label="SD-WAN Interface Status" value={item.sdwanEnabled ? "Enabled" : "Disabled"} />
          <DisplayField labelWidth={LW} label="SD-WAN Interface Profile" value={item.sdwanInterfaceProfile ?? "None"} />
          <Fieldset>
            <FieldsetLegend>Upstream NAT</FieldsetLegend>
            <FieldsetContent>
              <Label className="flex items-center gap-2 pl-1">
                <Checkbox checked={item.upstreamNatEnabled} disabled />
                <span>Enable</span>
              </Label>
              {item.upstreamNatEnabled && (
                <>
                  <DisplayField label="Type" value={item.upstreamNatType === "static-ip" ? "IP Address" : item.upstreamNatType ?? "None"} />
                  <DisplayField label="Address" value={item.upstreamNatAddress ?? "None"} />
                </>
              )}
            </FieldsetContent>
          </Fieldset>
        </TabsContent>

        {/* Advanced tab */}
        <TabsContent value="advanced" className="pt-3 space-y-4">
          <Fieldset>
            <FieldsetLegend>Link Settings</FieldsetLegend>
            <FieldsetContent>
              <DisplayField label="Link State" value={item.linkState ?? "auto"} />
            </FieldsetContent>
          </Fieldset>

          <Fieldset>
            <FieldsetLegend>SIM Settings</FieldsetLegend>
            <FieldsetContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px]">SLOT</TableHead>
                      <TableHead className="text-[11px]">PIN</TableHead>
                      <TableHead className="text-[11px]">APN PROFILE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {item.simSlots.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">No SIM slots configured.</TableCell>
                      </TableRow>
                    ) : item.simSlots.map((s) => (
                      <TableRow key={s.slot}>
                        <TableCell className="tabular-nums font-medium">{s.slot}</TableCell>
                        <TableCell>{s.hasPin ? <Badge variant="outline" size="sm">Configured</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell>{s.apnProfile ?? <span className="text-muted-foreground">—</span>}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </FieldsetContent>
          </Fieldset>

          {/* Sub-tabs for APN Profile / Other Info / DDNS */}
          <Tabs defaultValue="apn-profile" className="flex flex-col">
            <div className="shrink-0 border-b">
              <TabsList variant="line">
                <TabsTrigger value="apn-profile">APN Profile</TabsTrigger>
                <TabsTrigger value="other-info">Other Info</TabsTrigger>
                <TabsTrigger value="ddns">DDNS</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="apn-profile" className="pt-3">
              {item.apnProfiles.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">No APN profiles configured.</p>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[11px]">APN PROFILE</TableHead>
                        <TableHead className="text-[11px]">AUTHENTICATION TYPE</TableHead>
                        <TableHead className="text-[11px]">APN</TableHead>
                        <TableHead className="text-[11px]">PDP TYPE</TableHead>
                        <TableHead className="text-[11px]">USERNAME</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {item.apnProfiles.map((apn) => (
                        <TableRow key={apn.name}>
                          <TableCell className="font-medium">{apn.name}</TableCell>
                          <TableCell>{apn.authType ?? "—"}</TableCell>
                          <TableCell className="font-mono">{apn.apn ?? "—"}</TableCell>
                          <TableCell>{apn.pdpType ?? "—"}</TableCell>
                          <TableCell>{apn.username ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="other-info" className="pt-3 space-y-2">
              <DisplayField label="Management Profile" value={item.managementProfile ?? "None"} />
              <DisplayField label="MTU" value={item.mtu !== null ? String(item.mtu) : "None"} />
              <Label className="flex items-center gap-2 pl-1">
                <Checkbox checked={item.adjustTcpMss} disabled />
                <span>Adjust TCP MSS</span>
              </Label>
              {item.adjustTcpMss && (
                <div className="pl-6 space-y-1">
                  <DisplayField label="IPv4 MSS Adjustment" value={item.ipv4MssAdjustment !== null ? String(item.ipv4MssAdjustment) : "None"} />
                  <DisplayField label="IPv6 MSS Adjustment" value={item.ipv6MssAdjustment !== null ? String(item.ipv6MssAdjustment) : "None"} />
                </div>
              )}
            </TabsContent>

            <TabsContent value="ddns" className="pt-3">
              <Fieldset disabled={!item.ddnsEnabled}>
                <FieldsetLegend>
                  <Label className="flex items-center gap-2">
                    <Checkbox checked={item.ddnsEnabled} disabled />
                    Settings
                  </Label>
                </FieldsetLegend>
                {item.ddnsEnabled && (
                  <FieldsetContent>
                    <div className="space-y-3">
                      {/* Row 1: Enable + Update Interval */}
                      <div className="grid grid-cols-2 gap-4">
                        <Label className="flex items-center gap-2 pl-1">
                          <Checkbox checked={item.ddnsEnabled} disabled />
                          <span>Enable</span>
                        </Label>
                        <DisplayField label="Update Interval (days)" value={String(item.ddnsUpdateInterval ?? 1)} />
                      </div>

                      {/* Row 2: Certificate Profile + Hostname */}
                      <div className="grid grid-cols-2 gap-4">
                        <DisplayField label="Certificate Profile" value={item.ddnsCertProfile ?? "None"} />
                        <DisplayField label="Hostname" value={item.ddnsHostname ?? "None"} />
                      </div>

                      {/* Row 3: empty left + Vendor right */}
                      <div className="grid grid-cols-2 gap-4">
                        <div />
                        <DisplayField label="Vendor" value={item.ddnsVendor ? (DDNS_VENDOR_LABELS[item.ddnsVendor] ?? item.ddnsVendor) : "None"} />
                      </div>

                      {/* IPv4 / IPv6 sub-tabs */}
                      <Tabs defaultValue="ddns-ipv4" className="flex flex-col">
                        <div className="shrink-0 border-b">
                          <TabsList variant="line">
                            <TabsTrigger value="ddns-ipv4">IPv4</TabsTrigger>
                            <TabsTrigger value="ddns-ipv6">IPv6</TabsTrigger>
                          </TabsList>
                        </div>

                        <TabsContent value="ddns-ipv4" className="pt-3">
                          <div className="grid grid-cols-2 gap-4">
                            {/* Left: IP table */}
                            <div className="rounded-lg border overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow><TableHead className="text-[11px]">IP</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                  {item.ddnsIps.length === 0 ? (
                                    <TableRow>
                                      <TableCell className="py-4 text-center text-muted-foreground">No IPs configured.</TableCell>
                                    </TableRow>
                                  ) : item.ddnsIps.map((ip) => (
                                    <TableRow key={ip}>
                                      <TableCell>{ip}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>

                            {/* Right: Vendor config NAME/VALUE */}
                            <div className="rounded-lg border overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="text-[11px]">NAME</TableHead>
                                    <TableHead className="text-[11px]">VALUE</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {item.ddnsVendorConfig.length === 0 ? (
                                    <TableRow>
                                      <TableCell colSpan={2} className="py-4 text-center text-muted-foreground">No vendor config.</TableCell>
                                    </TableRow>
                                  ) : item.ddnsVendorConfig.map((vc) => (
                                    <TableRow key={vc.name}>
                                      <TableCell className="font-medium">{DDNS_CONFIG_LABELS[vc.name] ?? vc.name}</TableCell>
                                      <TableCell className="tabular-nums">{vc.value}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="ddns-ipv6" className="pt-3">
                          <p className="py-4 text-center text-muted-foreground">No IPv6 DDNS addresses configured.</p>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </FieldsetContent>
                )}
              </Fieldset>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </DetailDialog>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CellularTab({
  data,
  isPanorama,
  ifaceToVirtualRouter,
  ifaceToLogicalRouter,
  hasVirtualRouters,
  hasLogicalRouters,
  ifaceToZone,
  zoneColorMap,
  onMgmtProfileClick,
  onRouterClick,
}: {
  data: PanwCellularInterface[]
  isPanorama: boolean
  ifaceToVirtualRouter: Map<string, string>
  ifaceToLogicalRouter: Map<string, string>
  hasVirtualRouters: boolean
  hasLogicalRouters: boolean
  ifaceToZone: Map<string, string>
  zoneColorMap: Map<string, string>
  onMgmtProfileClick?: (name: string) => void
  onRouterClick?: (name: string) => void
}) {
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwCellularInterface | null>(null)
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    virtualRouter: hasVirtualRouters,
    logicalRouter: hasLogicalRouters,
  })

  const columns = React.useMemo(
    () => buildColumns(isPanorama, ifaceToVirtualRouter, ifaceToLogicalRouter, ifaceToZone, zoneColorMap, setSelected, onMgmtProfileClick, onRouterClick),
    [isPanorama, ifaceToVirtualRouter, ifaceToLogicalRouter, ifaceToZone, zoneColorMap, onMgmtProfileClick, onRouterClick],
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: search, columnVisibility },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
  })

  return (
    <>
      <DataTable table={table} title="Cellular Interfaces" search={search} onSearch={setSearch} />
      <CellularDialog
        item={selected}
        open={selected !== null}
        onOpenChange={(open) => { if (!open) setSelected(null) }}
        ifaceToVirtualRouter={ifaceToVirtualRouter}
        ifaceToLogicalRouter={ifaceToLogicalRouter}
        ifaceToZone={ifaceToZone}
        onRouterClick={onRouterClick}
      />
    </>
  )
}
