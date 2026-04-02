// @/app/(main)/network/_components/network-profiles/ike-crypto/ike-crypto-dialog.tsx

"use client"

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import type { PanwIkeCryptoProfile } from "@/lib/panw-parser/network-profiles"

// ─── General Tab ──────────────────────────────────────────────────────────────

function GeneralTab({ profile }: { profile: PanwIkeCryptoProfile }) {
  return (
    <div className="space-y-4">
      <DisplayField label="Name" value={profile.name} />

      <div className="grid grid-cols-2 gap-4">
        <Fieldset className="h-full" disabled={profile.dhGroup.length === 0}>
          <FieldsetLegend>DH Group</FieldsetLegend>
          <FieldsetContent>
            {profile.dhGroup.length === 0 ? (
              <span className="text-xs text-muted-foreground">None</span>
            ) : (
              profile.dhGroup.map((g) => (
                <div key={g} className="text-xs">{g}</div>
              ))
            )}
          </FieldsetContent>
        </Fieldset>

        <Fieldset className="h-full" disabled={profile.encryption.length === 0}>
          <FieldsetLegend>Encryption</FieldsetLegend>
          <FieldsetContent>
            {profile.encryption.length === 0 ? (
              <span className="text-xs text-muted-foreground">None</span>
            ) : (
              profile.encryption.map((e) => (
                <div key={e} className="text-xs">{e}</div>
              ))
            )}
          </FieldsetContent>
        </Fieldset>

        <Fieldset className="h-full" disabled={profile.authentication.length === 0}>
          <FieldsetLegend>Authentication</FieldsetLegend>
          <FieldsetContent>
            {profile.authentication.length === 0 ? (
              <span className="text-xs text-muted-foreground">None</span>
            ) : (
              profile.authentication.map((a) => (
                <div key={a} className="text-xs">{a}</div>
              ))
            )}
          </FieldsetContent>
        </Fieldset>

        <Fieldset className="h-full">
          <FieldsetLegend>Timers</FieldsetLegend>
          <FieldsetContent>
            <DisplayField
              label="Key Lifetime"
              value={`${profile.lifetimeUnit.charAt(0).toUpperCase() + profile.lifetimeUnit.slice(1)} — ${profile.lifetimeValue}`}
            />
            <DisplayField
              label="IKEv2 Auth Multiple"
              value={String(profile.authenticationMultiple ?? "None")}
            />
          </FieldsetContent>
        </Fieldset>
      </div>
    </div>
  )
}

// ─── Advanced Options Tab ─────────────────────────────────────────────────────

const ROUNDS = [1, 2, 3, 4, 5, 6, 7] as const

function AdvancedOptionsTab({ profile }: { profile: PanwIkeCryptoProfile }) {
  const akeMap = new Map(profile.ake.map((a) => [a.round, a.groups]))
  const hasAnyAke = profile.ake.length > 0

  return (
    <Fieldset disabled={!hasAnyAke}>
      <FieldsetLegend>Post-Quantum IKEv2 Additional Key Exchange</FieldsetLegend>
      <FieldsetContent>
        {!hasAnyAke ? (
          <span className="text-xs text-muted-foreground">No AKE groups configured</span>
        ) : (
          <Tabs defaultValue={String(profile.ake[0]?.round ?? 1)} className="flex-1 flex flex-col min-h-0">
            <div className="shrink-0 border-b">
              <TabsList variant="line">
                {ROUNDS.map((r) => {
                  const count = (akeMap.get(r) ?? []).length
                  return (
                    <TabsTrigger
                      key={r}
                      value={String(r)}
                      className={cn(count === 0 && "text-muted-foreground")}
                    >
                      <span className="flex items-center gap-1.5">
                        Round {r}
                        {count > 0 && (
                          <Badge variant="secondary" size="sm" className="tabular-nums">
                            {count}
                          </Badge>
                        )}
                      </span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </div>
            {ROUNDS.map((r) => {
              const groups = akeMap.get(r) ?? []
              return (
                <TabsContent key={r} value={String(r)} className="pt-3">
                  {groups.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No AKE group configured for round {r}</span>
                  ) : (
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-[11px]">AKE {r}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groups.map((g) => (
                            <TableRow key={g}>
                              <TableCell className="text-xs">{g}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              )
            })}
          </Tabs>
        )}
      </FieldsetContent>
    </Fieldset>
  )
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

export function IkeCryptoDialog({
  profile,
  open,
  onOpenChange,
}: {
  profile: PanwIkeCryptoProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!profile) return null

  return (
    <DetailDialog title="IKE Crypto Profile" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-[70vw]" height="h-[min(85vh,650px)]" noPadding>
      <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 border-b px-5">
          <TabsList variant="line">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <TabsContent value="general">
            <GeneralTab profile={profile} />
          </TabsContent>
          <TabsContent value="advanced">
            <AdvancedOptionsTab profile={profile} />
          </TabsContent>
        </div>
      </Tabs>
    </DetailDialog>
  )
}
