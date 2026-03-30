// @/app/(main)/network/_components/network-profiles/ipsec-crypto/ipsec-crypto-dialog.tsx

"use client"

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import {
  FieldGroup,
  HeaderField,
  LabeledValue,
  ReadOnlyCheckbox,
  ProfileDialog,
} from "../../router-shared/router-dialog/field-display"
import type { PanwIpsecCryptoProfile } from "@/lib/panw-parser/network-profiles"

// ─── General Tab ──────────────────────────────────────────────────────────────

function GeneralTab({ profile }: { profile: PanwIpsecCryptoProfile }) {
  return (
    <div className="space-y-4">
      <HeaderField label="Name" value={profile.name} />
      <HeaderField label="IPSec Protocol" value={profile.protocol.toUpperCase()} />

      <div className="grid grid-cols-2 gap-4">
        {/* Left column: Encryption + Authentication */}
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

        {/* Right column: DH Group, Lifetime, Lifesize */}
        <div className="space-y-4">
          <LabeledValue label="DH Group" value={profile.dhGroup ?? "None"} />
          <LabeledValue
            label="Lifetime"
            value={`${profile.lifetimeUnit.charAt(0).toUpperCase() + profile.lifetimeUnit.slice(1)} — ${profile.lifetimeValue}`}
          />
          <FieldGroup title="Lifesize">
            <ReadOnlyCheckbox checked={profile.lifesizeEnabled} label="Enable" />
            {profile.lifesizeEnabled && (
              <LabeledValue
                label="Lifesize"
                value={`${profile.lifesizeValue} ${profile.lifesizeUnit?.toUpperCase()}`}
              />
            )}
          </FieldGroup>
        </div>
      </div>
    </div>
  )
}

// ─── Advanced Options Tab ─────────────────────────────────────────────────────

function AdvancedOptionsTab({ profile }: { profile: PanwIpsecCryptoProfile }) {
  return (
    <FieldGroup title="Post-Quantum IPSec Additional Key Exchange">
      {profile.ake.length === 0 ? (
        <span className="text-xs text-muted-foreground">No AKE rounds configured</span>
      ) : (
        <div className="space-y-2">
          {profile.ake.map((a) => (
            <LabeledValue key={a.round} label={`Round ${a.round}`} value={a.group} />
          ))}
        </div>
      )}
    </FieldGroup>
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
    <ProfileDialog title="IPSec Crypto Profile" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-[70vw]" height="h-[min(85vh,600px)]" noPadding>
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
