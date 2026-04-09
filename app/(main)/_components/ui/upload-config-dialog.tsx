// @/app/(main)/_components/ui/upload-config-dialog.tsx

"use client"

import * as React from "react"
import {
  Upload,
  FileCode2,
  Server,
  MonitorCheck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from "lucide-react"
import { useConfig } from "@/app/(main)/_context/config-context"
import { parseConfigFile, deriveConfigName } from "@/lib/panw-parser"
import { uploadConfiguration, fetchConfiguration } from "@/lib/api-client"
import type { ParsedConfig } from "@/lib/panw-parser/general/config"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────

type UploadState =
  | { stage: "idle" }
  | { stage: "parsing";  fileName: string }
  | { stage: "confirm";  fileName: string; fileSize: number; parsed: ParsedConfig; file: File }
  | { stage: "uploading"; fileName: string }
  | { stage: "error";    fileName: string; message: string }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type StatSection = {
  label: string
  stats: { label: string; value: number }[]
}

function getSummarySections(parsed: ParsedConfig): StatSection[] {
  if (parsed.deviceType === "firewall") {
    return [
      {
        label: "Policies",
        stats: [
          { label: "Security",          value: parsed.securityRules.length },
          { label: "NAT",               value: parsed.natRules.length },
          { label: "QoS",               value: parsed.qosRules },
          { label: "Policy Based Fwd",  value: parsed.pbfRules },
          { label: "Decryption",        value: parsed.decryptionRules },
          { label: "Tunnel Inspection", value: parsed.tunnelInspectionRules },
          { label: "App Override",      value: parsed.appOverrideRules },
          { label: "Authentication",    value: parsed.authenticationRules },
          { label: "DoS Protection",    value: parsed.dosRules },
          { label: "SD-WAN",            value: parsed.sdwanPolicyRules },
        ].filter((s) => s.value > 0),
      },
      {
        label: "Objects",
        stats: [
          { label: "Addresses",         value: parsed.addresses.length },
          { label: "Address Groups",    value: parsed.addressGroups.length },
          { label: "Services",          value: parsed.services.length },
          { label: "Service Groups",    value: parsed.serviceGroups.length },
          { label: "App Groups",        value: parsed.applicationGroups.length },
          { label: "App Filters",       value: parsed.applicationFilters.length },
          { label: "Tags",              value: parsed.tags.length },
          { label: "Ext Dynamic Lists", value: parsed.externalDynamicLists },
          { label: "Schedules",         value: parsed.schedules },
          { label: "Regions",           value: parsed.regions },
          { label: "Security Profiles", value: parsed.securityProfiles },
          { label: "Profile Groups",    value: parsed.profileGroups.length },
          { label: "Log Forwarding",    value: parsed.logForwardingProfiles },
          { label: "Auth Profiles",     value: parsed.authenticationProfiles },
          { label: "Decryption Profiles", value: parsed.decryptionProfiles },
        ].filter((s) => s.value > 0),
      },
      {
        label: "Network",
        stats: [
          { label: "Interfaces",        value: parsed.interfaces.length },
          { label: "Zones",             value: parsed.zones.length },
          { label: "Virtual Routers",   value: parsed.virtualRouters.length },
          { label: "VLANs",             value: parsed.vlans.length },
          { label: "Virtual Wires",     value: parsed.virtualWires.length },
          { label: "IPSec Tunnels",     value: parsed.ipsecTunnels.length },
          { label: "GRE Tunnels",       value: parsed.greTunnels.length },
          { label: "DHCP", value: (parsed.dhcpServers?.length ?? 0) + (parsed.dhcpRelays?.length ?? 0) },
          { label: "DNS Proxy",         value: parsed.dnsProxies.length },
        ].filter((s) => s.value > 0),
      },
    ]
  }

  // ── Panorama ──
  const dgs = parsed.deviceGroups
  const totalSecRules = (
    parsed.sharedPreSecurityRules.length + parsed.sharedPostSecurityRules.length +
    dgs.reduce((a, d) => a + d.preSecurityRules.length + d.postSecurityRules.length, 0)
  )
  const sum = (fn: (dg: typeof dgs[number]) => number) => dgs.reduce((a, d) => a + fn(d), 0)

  return [
    {
      label: "Policies",
      stats: [
        { label: "Security",          value: totalSecRules },
        { label: "NAT",               value: sum((d) => d.preNatRules.length + d.postNatRules.length) },
        { label: "QoS",               value: sum((d) => d.qosRules) },
        { label: "Policy Based Fwd",  value: sum((d) => d.pbfRules) },
        { label: "Decryption",        value: sum((d) => d.decryptionRules) },
        { label: "Tunnel Inspection", value: sum((d) => d.tunnelInspectionRules) },
        { label: "App Override",      value: sum((d) => d.appOverrideRules) },
        { label: "Authentication",    value: sum((d) => d.authenticationRules) },
        { label: "DoS Protection",    value: sum((d) => d.dosRules) },
        { label: "SD-WAN",            value: sum((d) => d.sdwanPolicyRules) },
      ].filter((s) => s.value > 0),
    },
    {
      label: "Objects",
      stats: [
        { label: "Device Groups",       value: dgs.length },
        { label: "Addresses",           value: parsed.sharedAddresses.length + sum((d) => d.addresses.length) },
        { label: "Address Groups",      value: parsed.sharedAddressGroups.length + sum((d) => d.addressGroups.length) },
        { label: "Services",            value: parsed.sharedServices.length + sum((d) => d.services.length) },
        { label: "Service Groups",      value: parsed.sharedServiceGroups.length + sum((d) => d.serviceGroups.length) },
        { label: "App Groups",          value: parsed.sharedApplicationGroups.length },
        { label: "App Filters",         value: parsed.sharedApplicationFilters.length },
        { label: "Tags",                value: parsed.sharedTags.length + sum((d) => d.tags.length) },
        { label: "Ext Dynamic Lists",   value: parsed.sharedExternalDynamicLists + sum((d) => d.externalDynamicLists) },
        { label: "Schedules",           value: parsed.sharedSchedules + sum((d) => d.schedules) },
        { label: "Regions",             value: parsed.sharedRegions + sum((d) => d.regions) },
        { label: "Security Profiles",   value: parsed.sharedSecurityProfiles + sum((d) => d.securityProfiles) },
        { label: "Profile Groups",      value: parsed.sharedProfileGroups.length },
        { label: "Log Forwarding",      value: parsed.sharedLogForwardingProfiles + sum((d) => d.logForwardingProfiles) },
        { label: "Auth Profiles",       value: parsed.sharedAuthenticationProfiles + sum((d) => d.authenticationProfiles) },
        { label: "Decryption Profiles", value: parsed.sharedDecryptionProfiles + sum((d) => d.decryptionProfiles) },
      ].filter((s) => s.value > 0),
    },
    {
      label: "Network",
      stats: [
        { label: "Templates",         value: parsed.templates.length },
        { label: "Template Stacks",   value: parsed.templateStacks.length },
        { label: "Interfaces",        value: parsed.templates.reduce((a, t) => a + t.interfaces.length, 0) },
        { label: "Zones",             value: parsed.templates.reduce((a, t) => a + t.zones.length, 0) },
        { label: "Virtual Routers",   value: parsed.templates.reduce((a, t) => a + t.virtualRouters.length, 0) },
        { label: "VLANs",             value: parsed.templates.reduce((a, t) => a + t.vlans.length, 0) },
        { label: "Virtual Wires",     value: parsed.templates.reduce((a, t) => a + t.virtualWires.length, 0) },
        { label: "IPSec Tunnels",     value: parsed.templates.reduce((a, t) => a + t.ipsecTunnels.length, 0) },
        { label: "GRE Tunnels",       value: parsed.templates.reduce((a, t) => a + t.greTunnels.length, 0) },
        { label: "DHCP",              value: parsed.templates.reduce((a, t) => a + (t.dhcpServers?.length ?? 0) + (t.dhcpRelays?.length ?? 0), 0) },
        { label: "DNS Proxy",         value: parsed.templates.reduce((a, t) => a + t.dnsProxies.length, 0) },
      ].filter((s) => s.value > 0),
    },
  ]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DropZone({
  onFile,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  onFile: (file: File) => void
  isDragging: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 transition-all duration-150 select-none",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border hover:border-primary/50 hover:bg-muted/40"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xml"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = ""
        }}
      />
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Upload className="size-5 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">Drop your config file here</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          or click to browse
        </p>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <FileCode2 className="size-3" /> running-config.xml
        </span>
        <span className="flex items-center gap-1">
          <Server className="size-3" /> Panorama exports supported
        </span>
      </div>
    </div>
  )
}

function ParsingState({ fileName }: { fileName: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <div className="text-center">
        <p className="text-sm font-medium">Parsing configuration</p>
        <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-65">
          {fileName}
        </p>
      </div>
    </div>
  )
}

function UploadingState({ fileName }: { fileName: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <div className="text-center">
        <p className="text-sm font-medium">Saving to Atlas</p>
        <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-65">
          {fileName}
        </p>
      </div>
    </div>
  )
}

function ErrorState({
  fileName,
  message,
  onRetry,
}: {
  fileName: string
  message: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="size-5 text-destructive" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">Failed to import</p>
        <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-65">
          {fileName}
        </p>
        <p className="mt-2 text-xs text-destructive">{message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
        <RotateCcw className="size-3.5" />
        Try again
      </Button>
    </div>
  )
}

function ConfirmState({
  parsed,
  fileName,
  fileSize,
}: {
  parsed: ParsedConfig
  fileName: string
  fileSize: number
}) {
  const sections = getSummarySections(parsed)
  const isFirewall = parsed.deviceType === "firewall"

  return (
    <div className="space-y-3">
      {/* Device summary */}
      <div className="rounded-lg border bg-muted/30 px-3.5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background border">
            {isFirewall
              ? <MonitorCheck className="size-4 text-muted-foreground" />
              : <Server className="size-4 text-muted-foreground" />
            }
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-tight">
              {parsed.hostname ?? fileName}
            </p>
            <p className="text-xs text-muted-foreground">
              {isFirewall ? "Firewall" : "Panorama"} · PAN-OS {parsed.panOsVersion ?? "unknown"} · {formatBytes(fileSize)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2 max-h-70 overflow-y-auto pr-0.5">
        {sections.map((section) => (
          <div key={section.label}>
            {section.stats.length > 0 && (
              <>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {section.label}
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {section.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded border bg-muted/20 px-2.5 py-1.5"
                    >
                      <p className="text-[10px] text-muted-foreground leading-tight truncate">
                        {stat.label}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold tabular-nums">
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface UploadConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadConfigDialog({ open, onOpenChange }: UploadConfigDialogProps) {
  const { addConfig, refreshConfigs } = useConfig()
  const [state, setState] = React.useState<UploadState>({ stage: "idle" })
  const [isDragging, setIsDragging] = React.useState(false)

  // Reset to idle when dialog closes
  React.useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => setState({ stage: "idle" }), 200)
      return () => clearTimeout(timer)
    }
  }, [open])

  async function processFile(file: File) {
    if (!file.name.endsWith(".xml")) {
      setState({ stage: "error", fileName: file.name, message: "Only .xml configuration files are supported." })
      return
    }

    setState({ stage: "parsing", fileName: file.name })

    try {
      const text = await file.text()
      const result = await parseConfigFile(text)

      if (!result.success) {
        setState({ stage: "error", fileName: file.name, message: result.error.message })
        return
      }

      setState({
        stage: "confirm",
        fileName: file.name,
        fileSize: file.size,
        parsed: result.config,
        file,
      })
    } catch (err) {
      setState({
        stage: "error",
        fileName: file.name,
        message: err instanceof Error ? err.message : "Unexpected error reading file.",
      })
    }
  }

  async function handleConfirm() {
    if (state.stage !== "confirm") return
    const { file, fileName, parsed } = state

    setState({ stage: "uploading", fileName })

    try {
      // Upload to backend — it stores in DB and returns the new config ID
      const result = await uploadConfiguration(file)

      // Fetch the full stored config so we have the DB-assigned ID
      const detail = await fetchConfiguration(result.configId)

      addConfig({
        id:              detail.id,
        name:            detail.device_hostname ?? deriveConfigName(parsed, fileName),
        deviceType:      result.deviceType,
        hostname:        result.hostname ?? undefined,
        platformModel:   undefined,
        softwareVersion: detail.pan_os_version ?? undefined,
        serialNumber:    detail.device_serial ?? undefined,
        importedAt:      new Date(detail.backed_up_at),
        fileName:        detail.file_name,
        fileSizeBytes:   Number(detail.file_size_bytes),
        parsedConfig:    detail.parsed,
      })

      // Refresh the sidebar list so any auto-SCP'd configs appear too
      await refreshConfigs()

      onOpenChange(false)
    } catch (err) {
      setState({
        stage: "error",
        fileName,
        message: err instanceof Error ? err.message : "Failed to save configuration.",
      })
    }
  }

  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)
  const handleDrop      = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const isBusy = state.stage === "parsing" || state.stage === "uploading"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={!isBusy}
        className={cn("sm:max-w-md gap-0 p-0 overflow-hidden")}
      >
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-4">
          <DialogTitle>Import Configuration</DialogTitle>
          <DialogDescription>
            {state.stage === "idle"      && "Upload a Palo Alto Networks firewall or Panorama running-config.xml file."}
            {state.stage === "parsing"   && "Reading and validating your configuration file."}
            {state.stage === "uploading" && "Saving your configuration to Atlas."}
            {state.stage === "confirm"   && "Review the parsed configuration before adding it to Atlas."}
            {state.stage === "error"     && "Something went wrong. Check the file and try again."}
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="px-5 pb-2">
          {state.stage === "idle" && (
            <DropZone
              onFile={processFile}
              isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />
          )}
          {state.stage === "parsing"   && <ParsingState  fileName={state.fileName} />}
          {state.stage === "uploading" && <UploadingState fileName={state.fileName} />}
          {state.stage === "error"     && (
            <ErrorState
              fileName={state.fileName}
              message={state.message}
              onRetry={() => setState({ stage: "idle" })}
            />
          )}
          {state.stage === "confirm" && (
            <ConfirmState
              parsed={state.parsed}
              fileName={state.fileName}
              fileSize={state.fileSize}
            />
          )}
        </div>

        {/* Footer */}
        {(state.stage === "idle" || state.stage === "confirm") && (
          <DialogFooter className="mt-4">
            {state.stage === "confirm" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState({ stage: "idle" })}
                className="gap-1.5"
              >
                <RotateCcw className="size-3.5" />
                Try another file
              </Button>
            )}
            {state.stage === "confirm" && (
              <Button size="sm" onClick={handleConfirm} className="gap-1.5">
                <CheckCircle2 className="size-3.5" />
                Add Configuration
              </Button>
            )}
            {state.stage === "idle" && (
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
