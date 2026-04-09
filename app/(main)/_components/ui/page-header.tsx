// @/app/(main)/_components/ui/page-header.tsx

"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  ChevronsUpDown, Server, MonitorCheck, Upload,
  Clock, Hash, Layers, LayoutTemplate, Check,
} from "lucide-react"
import { useConfig, type Configuration } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import type { ParsedPanoramaConfig } from "@/lib/panw-parser/general/config"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

function ConfigBadge({ config }: { config: Configuration }) {
  const isFirewall = config.deviceType === "firewall"
  return (
    <div className={cn(
      "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium",
      isFirewall
        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
        : "bg-violet-500/10 text-violet-600 dark:text-violet-400"
    )}>
      {isFirewall ? <Server className="size-3" /> : <MonitorCheck className="size-3" />}
      {isFirewall ? "Firewall" : "Panorama"}
    </div>
  )
}

// ─── Scope selector ───────────────────────────────────────────────────────────

type ScopeSelectorMode = "template" | "device-group"

function ScopeSelector({ mode, panorama }: { mode: ScopeSelectorMode; panorama: ParsedPanoramaConfig }) {
  const { selectedScope, setSelectedScope } = useScope()
  const isTemplate = mode === "template"
  const sectionLabel = isTemplate ? "Templates" : "Device Groups"

  const options = isTemplate
    ? [
        ...panorama.templates.map((t) => ({
          value: t.name,
          label: t.name,
          sublabel: `${t.interfaces.length} interfaces · ${t.zones.length} zones`,
        })),
        ...panorama.templateStacks.map((s) => ({
          value: `stack:${s.name}`,
          label: s.name,
          sublabel: `Stack · ${s.templates.length} templates`,
        })),
      ]
    : panorama.deviceGroups.map((dg) => ({
        value: dg.name,
        label: dg.name,
        sublabel: `${dg.preSecurityRules.length + dg.postSecurityRules.length} rules · ${dg.addresses.length} addr`,
      }))

  const selectedLabel = selectedScope
    ? (options.find((o) => o.value === selectedScope)?.label ?? selectedScope)
    : `All ${sectionLabel}`

  const Icon = isTemplate ? LayoutTemplate : Layers

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        }
      >
        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="max-w-[18ch] truncate font-medium">{selectedLabel}</span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{sectionLabel}</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => setSelectedScope(null)}>
            <div className="flex w-full items-center justify-between gap-2">
              <span>All {sectionLabel}</span>
              {selectedScope === null && <Check className="size-3.5 text-primary" />}
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {options.map((opt) => (
            <DropdownMenuItem key={opt.value} onClick={() => setSelectedScope(opt.value)}>
              <div className="flex w-full items-center justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <p className="truncate text-sm">{opt.label}</p>
                  {opt.sublabel && (
                    <p className="truncate text-xs text-muted-foreground">{opt.sublabel}</p>
                  )}
                </div>
                {selectedScope === opt.value && (
                  <Check className="size-3.5 shrink-0 text-primary" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface PageHeaderProps extends React.ComponentProps<"div"> {
  actions?: React.ReactNode
  onUpload?: () => void
}

export function PageHeader({ className, actions, onUpload, ...props }: PageHeaderProps) {
  const { activeConfig, configs, setActiveConfig } = useConfig()
  const pathname = usePathname()

  if (!activeConfig) return null

  const isPanorama = activeConfig.parsedConfig.deviceType === "panorama"
  const panorama = isPanorama ? (activeConfig.parsedConfig as ParsedPanoramaConfig) : null

  let scopeMode: ScopeSelectorMode | null = null
  if (panorama) {
    if (pathname.startsWith("/network")) scopeMode = "template"
    else if (pathname.startsWith("/objects") || pathname.startsWith("/policies")) scopeMode = "device-group"
  }

  return (
    <div
      data-slot="page-header"
      className={cn(
        "flex h-12 shrink-0 items-center justify-between gap-4 border-b px-4",
        className
      )}
      {...props}
    >
      {/* Left: Config switcher */}
      <div className="flex items-center gap-2 min-w-0">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-0" />
            }
          >
            <ConfigBadge config={activeConfig} />
            <span className="font-medium truncate">{activeConfig.name}</span>
            {activeConfig.softwareVersion && (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {activeConfig.softwareVersion}
              </span>
            )}
            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-72">
            <div className="px-2 py-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{activeConfig.name}</span>
                <ConfigBadge config={activeConfig} />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {activeConfig.hostname && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Server className="size-3 shrink-0" />
                    <span className="truncate">{activeConfig.hostname}</span>
                  </div>
                )}
                {activeConfig.serialNumber && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Hash className="size-3 shrink-0" />
                    <span className="truncate font-mono">{activeConfig.serialNumber}</span>
                  </div>
                )}
                {activeConfig.platformModel && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MonitorCheck className="size-3 shrink-0" />
                    <span className="truncate">{activeConfig.platformModel}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3 shrink-0" />
                  <span>{formatRelativeTime(activeConfig.importedAt)}</span>
                </div>
              </div>
            </div>

            {configs.length > 1 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Switch Configuration</DropdownMenuLabel>
                  {configs
                    .filter((c) => c.id !== activeConfig.id)
                    .map((config) => (
                      <DropdownMenuItem key={config.id} onClick={() => setActiveConfig(config)}>
                        <div className="flex items-center gap-2 min-w-0">
                          {config.deviceType === "firewall"
                            ? <Server className="size-3.5 shrink-0 text-muted-foreground" />
                            : <MonitorCheck className="size-3.5 shrink-0 text-muted-foreground" />
                          }
                          <span className="truncate">{config.name}</span>
                          {config.softwareVersion && (
                            <span className="text-xs text-muted-foreground ml-auto shrink-0">
                              {config.softwareVersion}
                            </span>
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onUpload}>
              <Upload className="size-3.5 text-muted-foreground" />
              <span>Import New Configuration</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Scope selector + page actions */}
      <div className="flex items-center gap-2 shrink-0">
        {scopeMode && panorama && (
          <ScopeSelector mode={scopeMode} panorama={panorama} />
        )}
        {actions}
      </div>
    </div>
  )
}
