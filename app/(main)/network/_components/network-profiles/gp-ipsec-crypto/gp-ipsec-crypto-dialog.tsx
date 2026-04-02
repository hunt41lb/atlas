// @/app/(main)/network/_components/network-profiles/gp-ipsec-crypto/gp-ipsec-crypto-dialog.tsx

"use client"

import { DetailDialog } from "@/components/ui/detail-dialog"
import { DisplayField } from "@/components/ui/display-field"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import type { PanwGpIpsecCryptoProfile } from "@/lib/panw-parser/network-profiles"

export function GpIpsecCryptoDialog({
  profile,
  open,
  onOpenChange,
}: {
  profile: PanwGpIpsecCryptoProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!profile) return null

  return (
    <DetailDialog title="GlobalProtect IPSec Crypto Profile" open={open} onOpenChange={onOpenChange}>
      <div className="space-y-4">
        <DisplayField label="Name" value={profile.name} />

        <Fieldset>
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

        <DisplayField label="Authentication" value={profile.authentication.join(", ") || "None"} />
      </div>
    </DetailDialog>
  )
}
