// @/app/(main)/network/_components/router-shared/router-dialog/router-dialog-multicast.tsx
//
// Multicast page for the RouterDialog — 4 tabs matching PAN-OS GUI.

"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table"
import { MonoValue } from "@/app/(main)/_components/ui/category-shell"
import { ReadOnlyCheckbox, LabeledValue, FieldGroup } from "./field-display"
import type { RouterDialogPageProps } from "./router-dialog-general"

// ─── Static Tab ───────────────────────────────────────────────────────────────

function StaticTab({ router }: { router: RouterDialogPageProps["router"] }) {
  const routes = (router.multicast as { staticRoutes?: { name: string; destination: string | null; nexthop: string | null; interface: string | null; preference: number | null }[] })?.staticRoutes ?? []

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[11px]">NAME</TableHead>
            <TableHead className="text-[11px]">DESTINATION</TableHead>
            <TableHead className="text-[11px]">NEXT HOP</TableHead>
            <TableHead className="text-[11px]">INTERFACE</TableHead>
            <TableHead className="text-[11px]">PREFERENCE</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-6 text-center text-xs text-muted-foreground">No static routes configured.</TableCell>
            </TableRow>
          ) : routes.map((r) => (
            <TableRow key={r.name}>
              <TableCell><span className="text-xs font-medium">{r.name}</span></TableCell>
              <TableCell><MonoValue className="text-xs">{r.destination ?? "—"}</MonoValue></TableCell>
              <TableCell><MonoValue className="text-xs">{r.nexthop ?? "—"}</MonoValue></TableCell>
              <TableCell><MonoValue className="text-xs">{r.interface ?? "—"}</MonoValue></TableCell>
              <TableCell><span className="tabular-nums text-xs">{r.preference ?? "—"}</span></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// ─── PIM Tab ──────────────────────────────────────────────────────────────────

function PimTab({ router }: { router: RouterDialogPageProps["router"] }) {
  const pim = (router.multicast as {
    pim?: {
      enabled: boolean
      rpfLookupMode: string | null
      routeAgeoutTime: number | null
      groupPermission: string | null
      ssmGroupList: string | null
      interfaces: { name: string; drPriority: number | null; ifTimer: string | null; neighborFilter: string | null; description: string | null; sendBsm: boolean }[]
      sptThresholds: { groupAddress: string; threshold: string | null }[]
      localRp: { address: string | null; groupList: string | null; interface: string | null; override: boolean } | null
    } | null
  })?.pim

  if (!pim) {
    return <p className="py-6 text-xs text-muted-foreground text-center">PIM not configured.</p>
  }

  return (
    <Tabs defaultValue="general">
      <TabsList variant="line">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="group-permissions">Group Permissions</TabsTrigger>
        <TabsTrigger value="interfaces">Interfaces</TabsTrigger>
        <TabsTrigger value="rendezvous-point">Rendezvous Point</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <div className="grid grid-cols-2 gap-6 pt-3">
          <div className="space-y-2">
            <ReadOnlyCheckbox checked={pim.enabled} label="Enable" />
            <LabeledValue label="RPF Lookup Mode" value={pim.rpfLookupMode ?? "None"} />
            <LabeledValue label="Interface General Timer" value="None" />
            <LabeledValue label="Route Age Out Time (sec)" value={pim.routeAgeoutTime ?? "—"} />
            <LabeledValue label="Multicast SSM Range" value={pim.ssmGroupList ?? "None"} />
          </div>
          <div>
            {/* SPT Threshold table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">GROUP ADDRESS</TableHead>
                    <TableHead className="text-[11px]">THRESHOLD (KBPS)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pim.sptThresholds.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="py-4 text-center text-xs text-muted-foreground">No thresholds.</TableCell>
                    </TableRow>
                  ) : pim.sptThresholds.map((t) => (
                    <TableRow key={t.groupAddress}>
                      <TableCell><MonoValue className="text-xs">{t.groupAddress}</MonoValue></TableCell>
                      <TableCell><span className="tabular-nums text-xs">{t.threshold ?? "—"}</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="group-permissions">
        <div className="pt-3">
          <LabeledValue label="Group Permission Access List" value={pim.groupPermission ?? "None"} />
        </div>
      </TabsContent>

      <TabsContent value="interfaces">
        <div className="rounded-md border mt-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px]">INTERFACE</TableHead>
                <TableHead className="text-[11px]">DR PRIORITY</TableHead>
                <TableHead className="text-[11px]">IF TIMER</TableHead>
                <TableHead className="text-[11px]">NEIGHBOR FILTER</TableHead>
                <TableHead className="text-[11px]">SEND BSM</TableHead>
                <TableHead className="text-[11px]">DESCRIPTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pim.interfaces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-4 text-center text-xs text-muted-foreground">No interfaces configured.</TableCell>
                </TableRow>
              ) : pim.interfaces.map((iface) => (
                <TableRow key={iface.name}>
                  <TableCell><MonoValue className="text-xs">{iface.name}</MonoValue></TableCell>
                  <TableCell><span className="tabular-nums text-xs">{iface.drPriority ?? "—"}</span></TableCell>
                  <TableCell><span className="text-xs">{iface.ifTimer ?? "—"}</span></TableCell>
                  <TableCell><span className="text-xs">{iface.neighborFilter ?? "—"}</span></TableCell>
                  <TableCell>{iface.sendBsm ? <Checkbox checked disabled /> : <Checkbox disabled />}</TableCell>
                  <TableCell><span className="text-xs text-muted-foreground">{iface.description ?? "—"}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="rendezvous-point">
        <div className="pt-3">
          {pim.localRp ? (
            <FieldGroup title="Static RP">
              <LabeledValue label="Address" value={pim.localRp.address ?? "None"} />
              <LabeledValue label="Group List" value={pim.localRp.groupList ?? "None"} />
              <LabeledValue label="Interface" value={pim.localRp.interface ?? "None"} />
              <ReadOnlyCheckbox checked={pim.localRp.override} label="Override" />
            </FieldGroup>
          ) : (
            <p className="py-4 text-xs text-muted-foreground text-center">No rendezvous point configured.</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}

// ─── IGMP Tab ─────────────────────────────────────────────────────────────────

function IgmpTab({ router }: { router: RouterDialogPageProps["router"] }) {
  const igmp = (router.multicast as {
    igmp?: {
      enabled: boolean
      dynamicInterfaces: { name: string; groupFilter: string | null; queryProfile: string | null; version: string | null; robustness: number | null; maxGroups: string | null; maxSources: string | null; routerAlertPolicing: boolean }[]
      staticEntries: { name: string; interface: string | null; groupAddress: string | null; sourceAddress: string | null }[]
    } | null
  })?.igmp

  if (!igmp) {
    return <p className="py-6 text-xs text-muted-foreground text-center">IGMP not configured.</p>
  }

  return (
    <div className="space-y-4">
      <ReadOnlyCheckbox checked={igmp.enabled} label="Enable" />

      <FieldGroup title="Dynamic Interfaces">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px]">INTERFACE</TableHead>
                <TableHead className="text-[11px]">VERSION</TableHead>
                <TableHead className="text-[11px]">ROBUSTNESS</TableHead>
                <TableHead className="text-[11px]">QUERY PROFILE</TableHead>
                <TableHead className="text-[11px]">GROUP FILTER</TableHead>
                <TableHead className="text-[11px]">MAX GROUPS</TableHead>
                <TableHead className="text-[11px]">MAX SOURCES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {igmp.dynamicInterfaces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-4 text-center text-xs text-muted-foreground">No dynamic interfaces.</TableCell>
                </TableRow>
              ) : igmp.dynamicInterfaces.map((iface) => (
                <TableRow key={iface.name}>
                  <TableCell><MonoValue className="text-xs">{iface.name}</MonoValue></TableCell>
                  <TableCell><span className="text-xs">{iface.version ?? "—"}</span></TableCell>
                  <TableCell><span className="tabular-nums text-xs">{iface.robustness ?? "—"}</span></TableCell>
                  <TableCell><span className="text-xs">{iface.queryProfile ?? "—"}</span></TableCell>
                  <TableCell><span className="text-xs">{iface.groupFilter ?? "—"}</span></TableCell>
                  <TableCell><span className="text-xs">{iface.maxGroups ?? "—"}</span></TableCell>
                  <TableCell><span className="text-xs">{iface.maxSources ?? "—"}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </FieldGroup>

      <FieldGroup title="Static Entries">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px]">NAME</TableHead>
                <TableHead className="text-[11px]">INTERFACE</TableHead>
                <TableHead className="text-[11px]">GROUP ADDRESS</TableHead>
                <TableHead className="text-[11px]">SOURCE ADDRESS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {igmp.staticEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-4 text-center text-xs text-muted-foreground">No static entries.</TableCell>
                </TableRow>
              ) : igmp.staticEntries.map((entry) => (
                <TableRow key={entry.name}>
                  <TableCell><span className="text-xs font-medium">{entry.name}</span></TableCell>
                  <TableCell><MonoValue className="text-xs">{entry.interface ?? "—"}</MonoValue></TableCell>
                  <TableCell><MonoValue className="text-xs">{entry.groupAddress ?? "—"}</MonoValue></TableCell>
                  <TableCell><MonoValue className="text-xs">{entry.sourceAddress ?? "—"}</MonoValue></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </FieldGroup>
    </div>
  )
}

// ─── MSDP Tab ─────────────────────────────────────────────────────────────────

function MsdpTab({ router }: { router: RouterDialogPageProps["router"] }) {
  const msdp = (router.multicast as {
    msdp?: {
      enabled: boolean
      globalTimer: string | null
      globalAuth: string | null
      originatorIp: string | null
      originatorInterface: string | null
      peers: { name: string; peerAddress: string | null; localInterface: string | null; localIp: string | null; authProfile: string | null; maxSa: number | null; inboundSaFilter: string | null; outboundSaFilter: string | null }[]
    } | null
  })?.msdp

  const msdpRefs = router.msdpRefs

  if (!msdp) {
    return <p className="py-6 text-xs text-muted-foreground text-center">MSDP not configured.</p>
  }

  return (
    <div className="space-y-4">
      <ReadOnlyCheckbox checked={msdp.enabled} label="Enable" />

      <div className="space-y-2">
        <LabeledValue label="Global Timer" value={msdpRefs?.globalTimerName ?? msdp.globalTimer ?? "None"} />
        <LabeledValue label="Global Authentication" value={msdpRefs?.globalAuthName ?? msdp.globalAuth ?? "None"} />
        <LabeledValue label="Originator IP" value={msdp.originatorIp ?? "None"} />
        <LabeledValue label="Originator Interface" value={msdp.originatorInterface ?? "None"} />
      </div>

      <FieldGroup title="Peers">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px]">NAME</TableHead>
                <TableHead className="text-[11px]">PEER ADDRESS</TableHead>
                <TableHead className="text-[11px]">LOCAL INTERFACE</TableHead>
                <TableHead className="text-[11px]">LOCAL IP</TableHead>
                <TableHead className="text-[11px]">AUTH PROFILE</TableHead>
                <TableHead className="text-[11px]">MAX SA</TableHead>
                <TableHead className="text-[11px]">INBOUND SA FILTER</TableHead>
                <TableHead className="text-[11px]">OUTBOUND SA FILTER</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {msdp.peers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-4 text-center text-xs text-muted-foreground">No peers configured.</TableCell>
                </TableRow>
              ) : msdp.peers.map((peer) => (
                <TableRow key={peer.name}>
                  <TableCell><span className="text-xs font-medium">{peer.name}</span></TableCell>
                  <TableCell><MonoValue className="text-xs">{peer.peerAddress ?? "—"}</MonoValue></TableCell>
                  <TableCell><MonoValue className="text-xs">{peer.localInterface ?? "—"}</MonoValue></TableCell>
                  <TableCell><MonoValue className="text-xs">{peer.localIp ?? "—"}</MonoValue></TableCell>
                  <TableCell><span className="text-xs">{peer.authProfile ?? "—"}</span></TableCell>
                  <TableCell><span className="tabular-nums text-xs">{peer.maxSa ?? "—"}</span></TableCell>
                  <TableCell><span className="text-xs">{peer.inboundSaFilter ?? "—"}</span></TableCell>
                  <TableCell><span className="text-xs">{peer.outboundSaFilter ?? "—"}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </FieldGroup>
    </div>
  )
}

// ─── Multicast Page (exported) ────────────────────────────────────────────────

export function MulticastPage({ router }: RouterDialogPageProps) {
  const enabled = router.multicast?.enabled ?? false

  return (
    <div className="flex h-full flex-col min-h-0">
      <div className="shrink-0 border-b px-4 py-2.5">
        <ReadOnlyCheckbox checked={enabled} label="enable multicast protocol" />
      </div>

      <Tabs defaultValue="static" className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 border-b px-4">
          <TabsList variant="line">
            <TabsTrigger value="static">Static</TabsTrigger>
            <TabsTrigger value="pim">PIM</TabsTrigger>
            <TabsTrigger value="igmp">IGMP</TabsTrigger>
            <TabsTrigger value="msdp">MSDP</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="static">
            <StaticTab router={router} />
          </TabsContent>
          <TabsContent value="pim">
            <PimTab router={router} />
          </TabsContent>
          <TabsContent value="igmp">
            <IgmpTab router={router} />
          </TabsContent>
          <TabsContent value="msdp">
            <MsdpTab router={router} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
