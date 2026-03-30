// @/app/(main)/network/_components/network-profiles/ike-gateways/ike-gateways-dialog.tsx

"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
} from "../../router-shared/router-dialog/field-display"
import type { PanwIkeGateway } from "@/lib/panw-parser/network-profiles"
import { ID_TYPE_LABELS } from "@/lib/panw-parser/network-profiles"

// ─── Version labels ───────────────────────────────────────────────────────────

const VERSION_LABELS: Record<string, string> = {
  ikev2: "IKEv2 only mode",
  ikev1: "IKEv1 only mode",
  "ikev2-preferred": "IKEv2 preferred mode",
}

// ─── General Tab ──────────────────────────────────────────────────────────────

function GeneralTab({ gw }: { gw: PanwIkeGateway }) {
  return (
    <div className="space-y-3">
      <HeaderField label="Name" value={gw.name} />
      <HeaderField label="Version" value={VERSION_LABELS[gw.version] ?? gw.version} />
      <HeaderField label="Interface" value={gw.localInterface ?? "None"} />
      <HeaderField label="Local IP Address" value={gw.localIp ?? "None"} />
      <HeaderField label="Peer Address" value={gw.peerAddress ?? "None"} />

      <LabeledValue
        label="Authentication"
        value={gw.authenticationType === "pre-shared-key" ? "Pre-Shared Key" : "Certificate"}
      />

      <div className="grid grid-cols-2 gap-4">
        <HeaderField
          label="Local Identification"
          value={`${ID_TYPE_LABELS[gw.localIdType ?? ""] ?? gw.localIdType ?? "None"}${gw.localIdValue ? ` — ${gw.localIdValue}` : ""}`}
        />
        <HeaderField
          label="Peer Identification"
          value={`${ID_TYPE_LABELS[gw.peerIdType ?? ""] ?? gw.peerIdType ?? "None"}${gw.peerIdValue ? ` — ${gw.peerIdValue}` : ""}`}
        />
      </div>

      <HeaderField label="Comment" value={gw.comment ?? ""} />
    </div>
  )
}

// ─── Advanced Options — IKEv2 sub-tabs ────────────────────────────────────────

function Ikev2GeneralSubTab({ gw }: { gw: PanwIkeGateway }) {
  return (
    <div className="space-y-3">
      <HeaderField label="IKE Crypto Profile" value={gw.ikev2CryptoProfile ?? "None"} />
      <ReadOnlyCheckbox checked={gw.ikev2RequireCookie} label="Strict Cookie Validation" />

      <FieldGroup title="IKEv2 Fragmentation">
        <ReadOnlyCheckbox checked={gw.ikev2Fragmentation} label="IKEv2 Fragmentation" />
        {gw.ikev2Fragmentation && (
          <LabeledValue label="MTU" value={gw.ikev2FragmentationSize ?? "—"} />
        )}
      </FieldGroup>

      <FieldGroup title="Liveness Check">
        <ReadOnlyCheckbox checked={gw.ikev2DpdEnabled} label="Liveness Check" />
      </FieldGroup>
    </div>
  )
}

function PqPpkSubTab({ gw }: { gw: PanwIkeGateway }) {
  return (
    <div className="space-y-3">
      <ReadOnlyCheckbox checked={gw.pqPpkEnabled} label="Enable Post-Quantum Pre-Shared Key(PPK)" />
      {gw.pqPpkEnabled && (
        <div className="flex items-center gap-4 pl-6">
          <span className="text-xs text-muted-foreground">Negotiation Mode</span>
          <label className="flex items-center gap-1.5 text-xs">
            <input type="radio" checked={gw.pqPpkNegotiationMode === "preferred"} readOnly className="accent-primary" />
            Preferred
          </label>
          <label className="flex items-center gap-1.5 text-xs">
            <input type="radio" checked={gw.pqPpkNegotiationMode === "mandatory"} readOnly className="accent-primary" />
            Mandatory
          </label>
        </div>
      )}
    </div>
  )
}

function PqKemSubTab({ gw }: { gw: PanwIkeGateway }) {
  return (
    <div className="space-y-3">
      <ReadOnlyCheckbox checked={gw.pqKemEnabled} label="Enable Post-Quantum Key Exchange" />
      <div className="pl-6">
        <ReadOnlyCheckbox checked={gw.pqKemBlockVulnerableCipher} label="Block IKEv2 if vulnerable cipher is used" />
      </div>
    </div>
  )
}

function PqQkdSubTab({ gw }: { gw: PanwIkeGateway }) {
  return (
    <div className="space-y-3">
      <ReadOnlyCheckbox checked={gw.pqQkdEnabled} label="Enable Quantum Key Distribution" />
      <LabeledValue label="Key Size (bits)" value={gw.pqQkdKeySize ?? "—"} />
      <LabeledValue label="QKD Timeout (secs)" value={gw.pqQkdTimeout ?? "—"} />
    </div>
  )
}

// ─── Advanced Options Tab ─────────────────────────────────────────────────────

function AdvancedOptionsTab({ gw }: { gw: PanwIkeGateway }) {
  return (
    <div className="space-y-4">
      <FieldGroup title="Common Options">
        <ReadOnlyCheckbox checked={gw.passiveMode} label="Enable Passive Mode" />
        <ReadOnlyCheckbox checked={gw.natTraversal} label="Enable NAT Traversal" />
      </FieldGroup>

      <div className="space-y-3">
        <span className="text-sm font-medium text-primary">IKEv2</span>

        <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0">
          <div className="shrink-0 border-b">
            <TabsList variant="line">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="pq-ppk">PQ PPK</TabsTrigger>
              <TabsTrigger value="pq-kem">PQ KEM</TabsTrigger>
              <TabsTrigger value="pq-qkd">PQ QKD</TabsTrigger>
            </TabsList>
          </div>
          <div className="pt-4">
            <TabsContent value="general"><Ikev2GeneralSubTab gw={gw} /></TabsContent>
            <TabsContent value="pq-ppk"><PqPpkSubTab gw={gw} /></TabsContent>
            <TabsContent value="pq-kem"><PqKemSubTab gw={gw} /></TabsContent>
            <TabsContent value="pq-qkd"><PqQkdSubTab gw={gw} /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

export function IkeGatewayDialog({
  gateway,
  open,
  onOpenChange,
}: {
  gateway: PanwIkeGateway | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!gateway) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[75vw] h-[min(85vh,650px)] flex flex-col gap-0 p-0 overflow-hidden"
      >
        <DialogHeader className="shrink-0 border-b px-5 pt-4 pb-3">
          <DialogTitle>IKE Gateway</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0">
          <div className="shrink-0 border-b px-5">
            <TabsList variant="line">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <TabsContent value="general">
              <GeneralTab gw={gateway} />
            </TabsContent>
            <TabsContent value="advanced">
              <AdvancedOptionsTab gw={gateway} />
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
