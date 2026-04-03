// @/app/(main)/network/_components/network-profiles/ipsec-crypto/ipsec-crypto-dialog.tsx

"use client"

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { PanwIpsecCryptoProfile } from "@/lib/panw-parser/network-profiles"

// ─── Shared label width ───────────────────────────────────────────────────────

const GLW = "w-30"
const LW = "w-20"

// ─── General Tab ──────────────────────────────────────────────────────────────

function GeneralTab({ profile }: { profile: PanwIpsecCryptoProfile }) {
  return (
    <div className="space-y-4">
      <DisplayField label="Name" value={profile.name} labelWidth={GLW} />
      <DisplayField label="IPSec Protocol" value={profile.protocol.toUpperCase()} labelWidth={GLW} />

      <div className="grid grid-cols-2 gap-4">
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

        <Fieldset className="h-full">
          <FieldsetLegend>DH Group &amp; Lifetime</FieldsetLegend>
          <FieldsetContent>
            <DisplayField label="DH Group" value={profile.dhGroup ?? "None"} labelWidth={LW} />
            <DisplayField
              label="Lifetime"
              value={`${profile.lifetimeUnit.charAt(0).toUpperCase() + profile.lifetimeUnit.slice(1)} — ${profile.lifetimeValue}`}
              labelWidth={LW}
            />
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

        <Fieldset className="h-full" disabled={!profile.lifesizeEnabled}>
          <FieldsetLegend>
            <Label className="flex items-center gap-2">
              <Checkbox checked={profile.lifesizeEnabled} disabled />
              Lifesize
            </Label>
          </FieldsetLegend>
          {profile.lifesizeEnabled && (
            <FieldsetContent>
              <DisplayField
                label="Lifesize"
                value={`${profile.lifesizeValue} ${profile.lifesizeUnit?.toUpperCase()}`}
                labelWidth={LW}
              />
            </FieldsetContent>
          )}
        </Fieldset>
      </div>
    </div>
  )
}

// ─── Advanced Options Tab ─────────────────────────────────────────────────────

function AdvancedOptionsTab({ profile }: { profile: PanwIpsecCryptoProfile }) {
  const hasAke = profile.ake.length > 0

  return (
    <Fieldset disabled={!hasAke}>
      <FieldsetLegend>Post-Quantum IPSec Additional Key Exchange</FieldsetLegend>
      <FieldsetContent>
        {!hasAke ? (
          <span className="text-xs text-muted-foreground">No AKE rounds configured</span>
        ) : (
          profile.ake.map((a) => (
            <DisplayField key={a.round} label={`Round ${a.round}`} value={a.group} />
          ))
        )}
      </FieldsetContent>
    </Fieldset>
  )
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

export function IpsecCryptoDialog({
  profile,
  open,
  onOpenChange,
}: {
  profile: PanwIpsecCryptoProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!profile) return null

  return (
    <DetailDialog title="IPSec Crypto Profile" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-[70vw]" height="h-[min(85vh,600px)]" noPadding>
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
