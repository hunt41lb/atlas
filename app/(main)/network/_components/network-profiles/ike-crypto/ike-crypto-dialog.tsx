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
import {
  FieldGroup,
  HeaderField,
  LabeledValue,
  ProfileDialog,
} from "../../router-shared/router-dialog/field-display"
import type { PanwIkeCryptoProfile } from "@/lib/panw-parser/network-profiles"

// ─── General Tab ──────────────────────────────────────────────────────────────

function GeneralTab({ profile }: { profile: PanwIkeCryptoProfile }) {
  return (
    <div className="space-y-4">
      <HeaderField label="Name" value={profile.name} />

      <div className="grid grid-cols-2 gap-4">
        {/* Left column: DH Group + Authentication */}
        <div className="space-y-4">
          <FieldGroup title="DH Group">
            {profile.dhGroup.length === 0 ? (
              <span className="text-xs text-muted-foreground">None</span>
            ) : (
              <div className="space-y-0.5">
                {profile.dhGroup.map((g) => (
                  <div key={g} className="text-xs">{g}</div>
                ))}
              </div>
            )}
          </FieldGroup>

          <FieldGroup title="Authentication">
            {profile.authentication.length === 0 ? (
              <span className="text-xs text-muted-foreground">None</span>
            ) : (
              <div className="space-y-0.5">
                {profile.authentication.map((a) => (
                  <div key={a} className="text-xs">{a}</div>
                ))}
              </div>
            )}
          </FieldGroup>
        </div>

        {/* Right column: Encryption + Timers */}
        <div className="space-y-4">
          <FieldGroup title="Encryption">
            {profile.encryption.length === 0 ? (
              <span className="text-xs text-muted-foreground">None</span>
            ) : (
              <div className="space-y-0.5">
                {profile.encryption.map((e) => (
                  <div key={e} className="text-xs">{e}</div>
                ))}
              </div>
            )}
          </FieldGroup>

          <FieldGroup title="Timers">
            <LabeledValue
              label="Key Lifetime"
              value={`${profile.lifetimeUnit.charAt(0).toUpperCase() + profile.lifetimeUnit.slice(1)} — ${profile.lifetimeValue}`}
            />
            <LabeledValue
              label="IKEv2 Authentication Multiple"
              value={profile.authenticationMultiple ?? "None"}
            />
          </FieldGroup>
        </div>
      </div>
    </div>
  )
}

// ─── Advanced Options Tab ─────────────────────────────────────────────────────

const ROUNDS = [1, 2, 3, 4, 5, 6, 7] as const

function AdvancedOptionsTab({ profile }: { profile: PanwIkeCryptoProfile }) {
  const akeMap = new Map(profile.ake.map((a) => [a.round, a.groups]))

  return (
    <FieldGroup title="Post-Quantum IKEv2 Additional Key Exchange">
      <Tabs defaultValue="1" className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 border-b">
          <TabsList variant="line">
            {ROUNDS.map((r) => (
              <TabsTrigger key={r} value={String(r)}>Round {r}</TabsTrigger>
            ))}
          </TabsList>
        </div>
        {ROUNDS.map((r) => {
          const groups = akeMap.get(r) ?? []
          return (
            <TabsContent key={r} value={String(r)} className="pt-3">
              {groups.length === 0 ? (
                <span className="text-xs text-muted-foreground">No AKE group configured</span>
              ) : (
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
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </FieldGroup>
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
     <ProfileDialog title="IKE Crypto Profile" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-[70vw]" height="h-[min(85vh,650px)]" noPadding>

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
    </ProfileDialog>
  )
}
