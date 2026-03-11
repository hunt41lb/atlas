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
import type { ParsedConfig } from "@/lib/panw-parser/types"
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
  | { stage: "parsing"; fileName: string }
  | { stage: "confirm"; fileName: string; fileSize: number; parsed: ParsedConfig }
  | { stage: "error"; fileName: string; message: string }

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
          { label: "VLANs",             value: parsed.vlans },
          { label: "Virtual Wires",     value: parsed.virtualWires },
          { label: "IPSec Tunnels",     value: parsed.ipsecTunnels },
          { label: "GRE Tunnels",       value: parsed.greTunnels },
          { label: "DHCP",              value: parsed.dhcpInterfaces },
          { label: "DNS Proxy",         value: parsed.dnsProxies },
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
        { label: "VLANs",             value: parsed.templates.reduce((a, t) => a + t.vlans, 0) },
        { label: "Virtual Wires",     value: parsed.templates.reduce((a, t) => a + t.virtualWires, 0) },
        { label: "IPSec Tunnels",     value: parsed.templates.reduce((a, t) => a + t.ipsecTunnels, 0) },
        { label: "GRE Tunnels",       value: parsed.templates.reduce((a, t) => a + t.greTunnels, 0) },
        { label: "DHCP",              value: parsed.templates.reduce((a, t) => a + t.dhcpInterfaces, 0) },
        { label: "DNS Proxy",         value: parsed.templates.reduce((a, t) => a + t.dnsProxies, 0) },
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

      {/* Icon cluster */}
      <div className="relative flex items-center justify-center">
        <div className={cn(
          "flex size-12 items-center justify-center rounded-xl transition-colors duration-150",
          isDragging ? "bg-primary/15" : "bg-muted"
        )}>
          <Upload className={cn(
            "size-5 transition-colors duration-150",
            isDragging ? "text-primary" : "text-muted-foreground"
          )} />
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-medium">
          {isDragging ? "Release to upload" : "Drop your config file here"}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          or <span className="text-primary underline underline-offset-2">browse files</span>
        </p>
      </div>

      {/* Format hints */}
      <div className="flex items-center gap-3 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileCode2 className="size-3.5 shrink-0" />
          <span>running-config.xml</span>
        </div>
        <div className="h-3 w-px bg-border" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MonitorCheck className="size-3.5 shrink-0" />
          <span>Panorama exports</span>
        </div>
      </div>
    </div>
  )
}

function ParsingState({ fileName }: { fileName: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      {/* Animated ring */}
      <div className="relative flex size-14 items-center justify-center">
        <svg
          className="absolute inset-0 size-14 -rotate-90 animate-spin"
          style={{ animationDuration: "1.4s" }}
          viewBox="0 0 56 56"
        >
          <circle
            cx="28" cy="28" r="23"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="36 108"
            className="text-primary"
          />
        </svg>
        <FileCode2 className="size-5 text-muted-foreground" />
      </div>

      <div className="text-center">
        <p className="text-sm font-medium">Parsing configuration…</p>
        <p className="mt-0.5 max-w-[22ch] truncate text-xs text-muted-foreground">
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
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="flex size-12 items-center justify-center rounded-xl bg-destructive/10">
        <AlertCircle className="size-5 text-destructive" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">Failed to parse file</p>
        <p className="mt-0.5 max-w-[28ch] truncate text-xs text-muted-foreground">
          {fileName}
        </p>
        <p className="mt-2 text-xs text-destructive">{message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
        <RotateCcw className="size-3.5" />
        Try another file
      </Button>
    </div>
  )
}

function ConfirmState({ parsed, fileName, fileSize }: {
  parsed: ParsedConfig
  fileName: string
  fileSize: number
}) {
  const isFirewall = parsed.deviceType === "firewall"
  const sections = getSummarySections(parsed)
  const displayName = deriveConfigName(parsed, fileName)

  return (
    <div className="flex flex-col gap-4">
      {/* Device identity card */}
      <div className="rounded-lg border bg-muted/30 p-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md",
            isFirewall
              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              : "bg-violet-500/10 text-violet-600 dark:text-violet-400"
          )}>
            {isFirewall ? <Server className="size-4" /> : <MonitorCheck className="size-4" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium">{displayName}</span>
              <span className={cn(
                "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                isFirewall
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "bg-violet-500/10 text-violet-600 dark:text-violet-400"
              )}>
                {isFirewall ? "Firewall" : "Panorama"}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
              <span className="text-xs text-muted-foreground">PAN-OS {parsed.panOsVersion}</span>
              {parsed.ipAddress && (
                <span className="text-xs text-muted-foreground">{parsed.ipAddress}</span>
              )}
              <span className="text-xs text-muted-foreground">{formatBytes(fileSize)}</span>
            </div>
          </div>

          <CheckCircle2 className="size-4 shrink-0 text-green-500 dark:text-green-400 mt-0.5" />
        </div>
      </div>

      {/* Three-section summary */}
      <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-0.5">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {section.label}
            </p>
            {section.stats.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">None found</p>
            ) : (
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
  const { addConfig } = useConfig()
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
      })
    } catch (err) {
      setState({
        stage: "error",
        fileName: file.name,
        message: err instanceof Error ? err.message : "Unexpected error reading file.",
      })
    }
  }

  function generateId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID()
    }
    // Fallback for non-secure contexts (e.g. HTTP dev server)
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16)
    })
  }

  function handleConfirm() {
    if (state.stage !== "confirm") return

    const { parsed, fileName, fileSize } = state

    addConfig({
      id: generateId(),
      name: deriveConfigName(parsed, fileName),
      deviceType: parsed.deviceType,
      hostname: parsed.hostname ?? undefined,
      platformModel: parsed.platformModel ?? undefined,
      softwareVersion: parsed.panOsVersion,
      serialNumber: parsed.serialNumber ?? undefined,
      importedAt: new Date(),
      fileName,
      fileSizeBytes: fileSize,
      // Attach the full parsed data for views to consume
      parsedConfig: parsed,
    } as Parameters<typeof addConfig>[0])

    onOpenChange(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = () => setIsDragging(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={state.stage !== "parsing"}
        className={cn(
          "sm:max-w-md gap-0 p-0 overflow-hidden",
        )}
      >
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-4">
          <DialogTitle>Import Configuration</DialogTitle>
          <DialogDescription>
            {state.stage === "idle" && "Upload a Palo Alto Networks firewall or Panorama running-config.xml file."}
            {state.stage === "parsing" && "Reading and validating your configuration file."}
            {state.stage === "confirm" && "Review the parsed configuration before adding it to Atlas."}
            {state.stage === "error" && "Something went wrong. Check the file and try again."}
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
          {state.stage === "parsing" && (
            <ParsingState fileName={state.fileName} />
          )}
          {state.stage === "error" && (
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

        {/* Footer — only shown in idle and confirm states */}
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
