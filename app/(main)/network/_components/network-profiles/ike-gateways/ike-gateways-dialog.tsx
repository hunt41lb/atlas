// @/app/(main)/network/_components/network-profiles/ike-gateways/ike-gateways-dialog.tsx

"use client"

import { ChevronDownIcon } from "lucide-react"

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
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { PanwIkeGateway } from "@/lib/panw-parser/network-profiles"
import { ID_TYPE_LABELS } from "@/lib/panw-parser/network-profiles"

// ─── Labels ───────────────────────────────────────────────────────────────────

const VERSION_LABELS: Record<string, string> = {
  ikev2: "IKEv2 only mode",
  ikev1: "IKEv1 only mode",
  "ikev2-preferred": "IKEv2 preferred mode",
}

const EXCHANGE_MODE_LABELS: Record<string, string> = {
  main: "Main",
  aggressive: "Aggressive",
  auto: "Auto",
}

// ─── Shared label width ───────────────────────────────────────────────────────

const LW = "w-40"

// ─── General Tab ──────────────────────────────────────────────────────────────

function GeneralTab({ gw }: { gw: PanwIkeGateway }) {
  const isCert = gw.authenticationType === "certificate"

  return (
    <div className="space-y-3">
      {/* Name & Version */}
      <DisplayField label="Name" value={gw.name} labelWidth={LW} />
      <DisplayField label="Version" value={VERSION_LABELS[gw.version] ?? gw.version} labelWidth={LW} />

      {/* Address Type */}
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium text-foreground shrink-0 ${LW}`}>Address Type</span>
        <RadioGroup value={gw.addressType ?? "ipv4"} disabled className="flex flex-row gap-4">
          <Label className="flex items-center gap-1.5 text-xs">
            <RadioGroupItem value="ipv4" />
            IPv4
          </Label>
          <Label className="flex items-center gap-1.5 text-xs">
            <RadioGroupItem value="ipv6" />
            IPv6
          </Label>
        </RadioGroup>
      </div>

      {/* Interface & Local IP */}
      <DisplayField label="Interface" value={gw.localInterface ?? "None"} labelWidth={LW} />
      <DisplayField label="Local IP Address" value={gw.localIp ?? "None"} labelWidth={LW} />

      {/* Peer IP Address Type */}
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium text-foreground shrink-0 ${LW}`}>Peer IP Address Type</span>
        <RadioGroup value={gw.peerAddressType ?? "ip"} disabled className="flex flex-row gap-4">
          <Label className="flex items-center gap-1.5 text-xs">
            <RadioGroupItem value="ip" />
            IP
          </Label>
          <Label className="flex items-center gap-1.5 text-xs">
            <RadioGroupItem value="fqdn" />
            FQDN
          </Label>
          <Label className="flex items-center gap-1.5 text-xs">
            <RadioGroupItem value="dynamic" />
            Dynamic
          </Label>
        </RadioGroup>
      </div>

      {/* Peer Address */}
      <DisplayField label="Peer Address" value={gw.peerAddress ?? "None"} labelWidth={LW} />

      {/* Authentication */}
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium text-foreground shrink-0 ${LW}`}>Authentication</span>
        <RadioGroup value={gw.authenticationType ?? ""} disabled className="flex flex-row gap-4">
          <Label className="flex items-center gap-1.5 text-xs">
            <RadioGroupItem value="pre-shared-key" />
            Pre-Shared Key
          </Label>
          <Label className="flex items-center gap-1.5 text-xs">
            <RadioGroupItem value="certificate" />
            Certificate
          </Label>
        </RadioGroup>
      </div>

      {/* Pre-Shared Key auth fields */}
      {!isCert && (
        <DisplayField label="Pre-Shared Key" value="••••••••" labelWidth={LW} />
      )}

      {/* Certificate auth fields */}
      {isCert && (
        <>
          <DisplayField label="Local Certificate" value={gw.localCertificateName ?? "None"} labelWidth={LW} />

          <Fieldset disabled={!gw.hashAndUrlEnabled}>
            <FieldsetLegend>
              <Label className="flex items-center gap-2">
                <Checkbox checked={gw.hashAndUrlEnabled} disabled />
                HTTP Certificate Exchange
              </Label>
            </FieldsetLegend>
            {gw.hashAndUrlEnabled && (
              <FieldsetContent>
                <DisplayField label="Certificate URL" value={gw.hashAndUrlBaseUrl ?? "None"} />
              </FieldsetContent>
            )}
          </Fieldset>
        </>
      )}

      {/* Local & Peer Identification */}
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium text-foreground shrink-0 ${LW}`}>Local Identification</span>
        <div className="flex h-7 w-sm items-center justify-between rounded-lg border border-input bg-transparent px-2.5 text-xs text-muted-foreground">
          <span>{ID_TYPE_LABELS[gw.localIdType ?? ""] ?? gw.localIdType ?? "None"}</span>
          <ChevronDownIcon className="size-3.5 shrink-0" />
        </div>
        <Input readOnly value={gw.localIdValue ?? "None"} size="sm" className="w-full" />
      </div>

      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium text-foreground shrink-0 ${LW}`}>Peer Identification</span>
        <div className="flex h-7 w-sm items-center justify-between rounded-lg border border-input bg-transparent px-2.5 text-xs text-muted-foreground">
          <span>{ID_TYPE_LABELS[gw.peerIdType ?? ""] ?? gw.peerIdType ?? "None"}</span>
          <ChevronDownIcon className="size-3.5 shrink-0" />
        </div>
        <Input readOnly value={gw.peerIdValue ?? "None"} size="sm" className="w-full" />
      </div>

      {/* Certificate-only: Peer ID Check, payload mismatch, cert profile, strict validation */}
      {isCert && (
        <>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium text-foreground shrink-0 ${LW}`}>Peer ID Check</span>
            <RadioGroup value={gw.peerIdMatching ?? "exact"} disabled className="flex flex-row gap-4">
              <Label className="flex items-center gap-1.5 text-xs">
                <RadioGroupItem value="exact" />
                Exact
              </Label>
              <Label className="flex items-center gap-1.5 text-xs">
                <RadioGroupItem value="wildcard" />
                Wildcard
              </Label>
            </RadioGroup>
          </div>

          <div className={`pl-[calc(theme(width.40)+0.5rem)]`}>
            <Label className="flex items-center gap-2 py-1">
              <Checkbox checked={gw.allowIdPayloadMismatch} disabled />
              <span className="text-xs">Permit peer identification and certificate payload identification mismatch</span>
            </Label>
          </div>

          <DisplayField label="Certificate Profile" value={gw.certificateProfile ?? "None"} labelWidth={LW} />

          <div className={`pl-[calc(theme(width.40)+0.5rem)]`}>
            <Label className="flex items-center gap-2 py-1">
              <Checkbox checked={gw.strictValidationRevocation} disabled />
              <span className="text-xs">Enable strict validation of peer&apos;s extended key use</span>
            </Label>
          </div>
        </>
      )}

      {/* Comment */}
      <DisplayField
        label="Comment"
        value={gw.comment ?? ""}
        labelWidth={LW}
        className={!gw.comment ? "opacity-50" : ""}
      />
    </div>
  )
}

// ─── Advanced Options — IKEv1 sub-tab ─────────────────────────────────────────

function Ikev1SubTab({ gw }: { gw: PanwIkeGateway }) {
  return (
    <div className="space-y-3">
      <DisplayField label="Exchange Mode" value={EXCHANGE_MODE_LABELS[gw.ikev1ExchangeMode ?? ""] ?? gw.ikev1ExchangeMode ?? "Auto"} />
      <DisplayField label="IKE Crypto Profile" value={gw.ikev1CryptoProfile ?? "None"} />

      <Fieldset disabled={!gw.ikev1DpdEnabled}>
        <FieldsetLegend>
          <Label className="flex items-center gap-2">
            <Checkbox checked={gw.ikev1DpdEnabled} disabled />
            Dead Peer Detection
          </Label>
        </FieldsetLegend>
        {gw.ikev1DpdEnabled && (
          <FieldsetContent>
            <DisplayField label="Interval" value={String(gw.ikev1DpdInterval ?? 5)} />
            <DisplayField label="Retry" value={String(gw.ikev1DpdRetry ?? 5)} />
          </FieldsetContent>
        )}
      </Fieldset>
    </div>
  )
}

// ─── Advanced Options — IKEv2 sub-tabs ────────────────────────────────────────

function Ikev2GeneralSubTab({ gw }: { gw: PanwIkeGateway }) {
  return (
    <div className="space-y-3">
      <DisplayField label="IKE Crypto Profile" value={gw.ikev2CryptoProfile ?? "None"} labelWidth={LW} />

      <div className={`pl-[calc(theme(width.40)+0.5rem)]`}>
        <Label className="flex items-center gap-2 py-1">
          <Checkbox checked={gw.ikev2RequireCookie} disabled />
          <span className="text-xs">Strict Cookie Validation</span>
        </Label>
      </div>

      <Fieldset disabled={!gw.ikev2Fragmentation}>
        <FieldsetLegend>
          <Label className="flex items-center gap-2">
            <Checkbox checked={gw.ikev2Fragmentation} disabled />
            IKEv2 Fragmentation
          </Label>
        </FieldsetLegend>
        {gw.ikev2Fragmentation && (
          <FieldsetContent>
            <DisplayField label="MTU" value={String(gw.ikev2FragmentationSize ?? "—")} />
          </FieldsetContent>
        )}
      </Fieldset>

      <Fieldset disabled={!gw.ikev2DpdEnabled}>
        <FieldsetLegend>
          <Label className="flex items-center gap-2">
            <Checkbox checked={gw.ikev2DpdEnabled} disabled />
            Liveness Check
          </Label>
        </FieldsetLegend>
        {gw.ikev2DpdEnabled && (
          <FieldsetContent>
            <DisplayField label="Interval (sec)" value={String(gw.ikev2DpdInterval ?? 5)} />
          </FieldsetContent>
        )}
      </Fieldset>
    </div>
  )
}

function PqPpkSubTab({ gw }: { gw: PanwIkeGateway }) {
  const keys = gw.pqPpkKeys ?? []

  return (
    <Fieldset disabled={!gw.pqPpkEnabled}>
      <FieldsetLegend>
        <Label className="flex items-center gap-2">
          <Checkbox checked={gw.pqPpkEnabled} disabled />
          Enable Post-Quantum Pre-Shared Key (PPK)
        </Label>
      </FieldsetLegend>
      {gw.pqPpkEnabled && (
        <FieldsetContent>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-foreground shrink-0">Negotiation Mode</span>
            <RadioGroup value={gw.pqPpkNegotiationMode ?? ""} disabled className="flex flex-row gap-4">
              <Label className="flex items-center gap-1.5 text-xs">
                <RadioGroupItem value="preferred" />
                Preferred
              </Label>
              <Label className="flex items-center gap-1.5 text-xs">
                <RadioGroupItem value="mandatory" />
                Mandatory
              </Label>
            </RadioGroup>
          </div>

          {keys.length > 0 && (
            <div className="rounded-lg border overflow-hidden mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">PPK KEYID</TableHead>
                    <TableHead className="text-[11px]">POST-QUANTUM PRE-SHARED KEY (PPK)</TableHead>
                    <TableHead className="text-[11px]">ACTIVATE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((k) => (
                    <TableRow key={k.name}>
                      <TableCell className="text-xs font-medium">{k.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">••••••••</TableCell>
                      <TableCell>
                        <Checkbox checked={k.enabled} disabled />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </FieldsetContent>
      )}
    </Fieldset>
  )
}

function PqKemSubTab({ gw }: { gw: PanwIkeGateway }) {
  return (
    <Fieldset disabled={!gw.pqKemEnabled}>
      <FieldsetLegend>
        <Label className="flex items-center gap-2">
          <Checkbox checked={gw.pqKemEnabled} disabled />
          Enable Post-Quantum Key Exchange
        </Label>
      </FieldsetLegend>
      {gw.pqKemEnabled && (
        <FieldsetContent>
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={gw.pqKemBlockVulnerableCipher} disabled />
            <span className="text-xs">Block IKEv2 if vulnerable cipher is used</span>
          </Label>
        </FieldsetContent>
      )}
    </Fieldset>
  )
}

function PqQkdSubTab({ gw }: { gw: PanwIkeGateway }) {
  return (
    <Fieldset disabled={!gw.pqQkdEnabled}>
      <FieldsetLegend>
        <Label className="flex items-center gap-2">
          <Checkbox checked={gw.pqQkdEnabled} disabled />
          Enable Quantum Key Distribution
        </Label>
      </FieldsetLegend>
      {gw.pqQkdEnabled && (
        <FieldsetContent>
          <DisplayField label="Key Size (bits)" value={String(gw.pqQkdKeySize ?? "—")} />
          <DisplayField label="QKD Timeout (secs)" value={String(gw.pqQkdTimeout ?? "—")} />
          <DisplayField label="QKD Profile" value={gw.pqQkdProfile ?? "None"} />
          <DisplayField label="Peer SAE ID" value={gw.pqQkdPeerSaeId ?? "None"} />
        </FieldsetContent>
      )}
    </Fieldset>
  )
}

// ─── Advanced Options Tab ─────────────────────────────────────────────────────

function AdvancedOptionsTab({ gw }: { gw: PanwIkeGateway }) {
  const showIkev1 = gw.version === "ikev1" || gw.version === "ikev2-preferred"
  const showIkev2 = gw.version === "ikev2" || gw.version === "ikev2-preferred"

  return (
    <div className="space-y-4">
      <Fieldset>
        <FieldsetLegend>Common Options</FieldsetLegend>
        <FieldsetContent>
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={gw.passiveMode} disabled />
            <span className="text-xs">Enable Passive Mode</span>
          </Label>
          <Label className="flex items-center gap-2 py-1">
            <Checkbox checked={gw.natTraversal} disabled />
            <span className="text-xs">Enable NAT Traversal</span>
          </Label>
        </FieldsetContent>
      </Fieldset>

      <Tabs defaultValue={showIkev1 && !showIkev2 ? "ikev1" : showIkev1 ? "ikev1" : "ikev2-general"} className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 border-b">
          <TabsList variant="line">
            {showIkev1 && (
              <TabsTrigger value="ikev1">IKEv1</TabsTrigger>
            )}
            {showIkev2 && (
              <>
                <TabsTrigger value="ikev2-general">IKEv2</TabsTrigger>
                <TabsTrigger value="pq-ppk">PQ PPK</TabsTrigger>
                <TabsTrigger value="pq-kem">PQ KEM</TabsTrigger>
                <TabsTrigger value="pq-qkd">PQ QKD</TabsTrigger>
              </>
            )}
          </TabsList>
        </div>
        <div className="pt-4">
          {showIkev1 && (
            <TabsContent value="ikev1"><Ikev1SubTab gw={gw} /></TabsContent>
          )}
          {showIkev2 && (
            <>
              <TabsContent value="ikev2-general"><Ikev2GeneralSubTab gw={gw} /></TabsContent>
              <TabsContent value="pq-ppk"><PqPpkSubTab gw={gw} /></TabsContent>
              <TabsContent value="pq-kem"><PqKemSubTab gw={gw} /></TabsContent>
              <TabsContent value="pq-qkd"><PqQkdSubTab gw={gw} /></TabsContent>
            </>
          )}
        </div>
      </Tabs>
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
    <DetailDialog title="IKE Gateway" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-[75vw]" height="h-[min(90vh,850px)]" noPadding>
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
    </DetailDialog>
  )
}
