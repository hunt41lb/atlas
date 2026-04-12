// @/app/(main)/network/_components/global-protect/gateways/gateways-dialog.tsx

"use client"

import * as React from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { DisplayField } from "@/components/ui/display-field"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import { DialogSidebar, type DialogSidebarItem } from "@/components/ui/dialog-sidebar"
import { DetailDialog } from "@/components/ui/detail-dialog"
import type { PanwGpGateway } from "@/lib/panw-parser/network/global-protect"
import type { PanwGpClientAuth } from "@/lib/panw-parser/network/global-protect"
import { GatewayAgentTab } from "./gateways-dialog-agent"

// ─── Sidebar items ────────────────────────────────────────────────────────────

const SIDEBAR_ITEMS: DialogSidebarItem[] = [
  { label: "General",        value: "general" },
  { label: "Authentication", value: "authentication" },
  { label: "Agent",          value: "agent" },
  { label: "Satellite",      value: "satellite" },
]

// ─── IP Address Family labels ─────────────────────────────────────────────────

const IP_FAMILY_LABELS: Record<string, string> = {
  ipv4: "IPv4",
  ipv6: "IPv6",
  ipv4_ipv6: "IPv4 and IPv6",
}

// ─── Label width ──────────────────────────────────────────────────────────────

const LW = "w-48"

// ─── Client Auth Detail Dialog ────────────────────────────────────────────────

function ClientAuthDetailDialog({
  clientAuth,
  open,
  onOpenChange,
}: {
  clientAuth: PanwGpClientAuth | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!clientAuth) return null

  return (
    <DetailDialog title="Client Authentication" open={open} onOpenChange={onOpenChange} maxWidth="sm:max-w-xl">
      <DisplayField label="Name" value={clientAuth.name} labelWidth={LW} />
      <DisplayField label="OS" value={clientAuth.os ?? "Any"} labelWidth={LW} />
      <DisplayField label="Authentication Profile" value={clientAuth.authenticationProfile ?? "None"} labelWidth={LW} />

      <Label className="flex items-center gap-2 py-1 pl-1">
        <Checkbox checked={clientAuth.autoRetrievePasscode} disabled />
        <span className="text-xs">Automatically retrieve passcode from SoftToken application</span>
      </Label>

      <Fieldset>
        <FieldsetLegend>GlobalProtect App Login Screen</FieldsetLegend>
        <FieldsetContent>
          <DisplayField label="Username Label" value={clientAuth.usernameLabel ?? "None"} labelWidth={LW} />
          <DisplayField label="Password Label" value={clientAuth.passwordLabel ?? "None"} labelWidth={LW} />
          <DisplayField label="Authentication Message" value={clientAuth.authenticationMessage ?? "None"} labelWidth={LW} />
        </FieldsetContent>
      </Fieldset>

      <DisplayField
        label="Allow Authentication with User Credentials OR Client Certificate"
        value={clientAuth.userCredentialOrClientCertRequired ? "Yes (User Credentials OR Client Certificate Required)" : "No"}
        labelWidth={LW}
      />
    </DetailDialog>
  )
}

// ─── General Tab ──────────────────────────────────────────────────────────────

function GeneralTab({ gateway }: { gateway: PanwGpGateway }) {
  const g = gateway.general

  return (
    <div className="space-y-4">
      <DisplayField label="Name" value={gateway.name} labelWidth={LW} />

      <Fieldset>
        <FieldsetLegend>Network Settings</FieldsetLegend>
        <FieldsetContent>
          <DisplayField label="Interface" value={g.interface ?? "None"} labelWidth={LW} />
          <DisplayField label="IP Address Type" value={IP_FAMILY_LABELS[g.ipAddressFamily ?? ""] ?? g.ipAddressFamily ?? "None"} labelWidth={LW} />
          {g.ipv4 && <DisplayField label="IPv4 Address" value={g.ipv4} labelWidth={LW} />}
          {g.ipv6 && <DisplayField label="IPv6 Address" value={g.ipv6} labelWidth={LW} />}
        </FieldsetContent>
      </Fieldset>

      <Fieldset>
        <FieldsetLegend>Log Settings</FieldsetLegend>
        <FieldsetContent>
          <Label className="flex items-center gap-2 py-1 pl-1">
            <Checkbox checked={g.logSuccess} disabled />
            <span className="text-xs">Log Successful SSL Handshake</span>
          </Label>
          <Label className="flex items-center gap-2 py-1 pl-1">
            <Checkbox checked disabled />
            <span className="text-xs">Log Unsuccessful SSL Handshake</span>
          </Label>
          <DisplayField label="Log Forwarding" value={g.logSetting ?? "None"} labelWidth={LW} />
        </FieldsetContent>
      </Fieldset>
    </div>
  )
}

// ─── Authentication Tab ───────────────────────────────────────────────────────

function AuthenticationTab({ gateway }: { gateway: PanwGpGateway }) {
  const [selectedAuth, setSelectedAuth] = React.useState<PanwGpClientAuth | null>(null)

  return (
    <>
      <div className="space-y-4">
        <Fieldset>
          <FieldsetLegend>Server Authentication</FieldsetLegend>
          <FieldsetContent>
            <DisplayField label="SSL/TLS Service Profile" value={gateway.general.sslTlsServiceProfile ?? "None"} labelWidth={LW} />
          </FieldsetContent>
        </Fieldset>

        <Fieldset>
          <FieldsetLegend>Client Authentication</FieldsetLegend>
          <FieldsetContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">NAME</TableHead>
                    <TableHead className="text-[11px]">OS</TableHead>
                    <TableHead className="text-[11px]">AUTHENTICATION PROFILE</TableHead>
                    <TableHead className="text-[11px]">AUTO RETRIEVE PASSCODE</TableHead>
                    <TableHead className="text-[11px]">USERNAME LABEL</TableHead>
                    <TableHead className="text-[11px]">PASSWORD LABEL</TableHead>
                    <TableHead className="text-[11px]">AUTHENTICATION MESSAGE</TableHead>
                    <TableHead className="text-[11px]">ALLOW AUTHENTICATION WITH USER CREDENTIALS OR CLIENT CERTIFICATE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gateway.clientAuth.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                        No client authentication entries configured.
                      </TableCell>
                    </TableRow>
                  ) : gateway.clientAuth.map((ca) => (
                    <TableRow
                      key={ca.name}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedAuth(ca)}
                    >
                      <TableCell className="text-xs font-medium">{ca.name}</TableCell>
                      <TableCell className="text-xs">{ca.os ?? "Any"}</TableCell>
                      <TableCell className="text-xs">{ca.authenticationProfile ?? "—"}</TableCell>
                      <TableCell><Checkbox checked={ca.autoRetrievePasscode} disabled /></TableCell>
                      <TableCell className="text-xs">{ca.usernameLabel ?? "—"}</TableCell>
                      <TableCell className="text-xs">{ca.passwordLabel ?? "—"}</TableCell>
                      <TableCell className="text-xs">{ca.authenticationMessage ?? "—"}</TableCell>
                      <TableCell className="text-xs">{ca.userCredentialOrClientCertRequired ? "Yes" : "No"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </FieldsetContent>
        </Fieldset>

        <DisplayField label="Certificate Profile" value={gateway.general.certificateProfile ?? "None"} labelWidth={LW} />

        <Label className="flex items-center gap-2 py-1 pl-1">
          <Checkbox checked={gateway.general.blockQuarantinedDevices} disabled />
          <span className="text-xs">Block login for quarantined devices</span>
        </Label>
      </div>

      <ClientAuthDetailDialog
        clientAuth={selectedAuth}
        open={selectedAuth !== null}
        onOpenChange={(open) => { if (!open) setSelectedAuth(null) }}
      />
    </>
  )
}

// ─── Coming Soon placeholder ──────────────────────────────────────────────────

function ComingSoonTab({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
      {label} — coming soon
    </div>
  )
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

export function GatewayDialog({
  gateway,
  open,
  onOpenChange,
}: {
  gateway: PanwGpGateway | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [activePage, setActivePage] = React.useState("general")

  React.useEffect(() => {
    if (open) setActivePage("general")
  }, [open, gateway?.name])

  if (!gateway) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[90vw] h-[min(92vh,740px)] flex flex-col gap-0 p-0 overflow-hidden"
      >
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <DialogTitle>GlobalProtect Gateway Configuration</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          <DialogSidebar
            items={SIDEBAR_ITEMS}
            activeItem={activePage}
            onSelect={setActivePage}
            width="130px"
          />
          <div className="flex-1 min-h-0 overflow-y-auto p-5">
            {activePage === "general" && <GeneralTab gateway={gateway} />}
            {activePage === "authentication" && <AuthenticationTab gateway={gateway} />}
            {activePage === "agent" && <GatewayAgentTab gateway={gateway} />}
            {activePage === "satellite" && <ComingSoonTab label="Satellite" />}
          </div>
        </div>

        <div className="shrink-0 border-t bg-muted/50 rounded-b-xl px-4 py-3 flex justify-end">
          <DialogClose render={<Button variant="outline" size="sm">Close</Button>} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
