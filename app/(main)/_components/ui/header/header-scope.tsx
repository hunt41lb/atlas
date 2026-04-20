// @/app/(main)/_components/ui/header/header-scope.tsx

"use client"

import { usePathname } from "next/navigation"
import { Check, ChevronsUpDown, Layers, LayoutTemplate } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import type { ParsedPanoramaConfig } from "@/lib/panw-parser/general/config"

// ─── Helpers ─────────────────────────────────────────────────────────────────

type ScopeMode = "template" | "device-group"

function resolveScopeMode(pathname: string): ScopeMode | null {
  if (pathname.startsWith("/network")) return "template"
  if (pathname.startsWith("/objects") || pathname.startsWith("/policies")) return "device-group"
  return null
}

// ─── Component ───────────────────────────────────────────────────────────────

export function HeaderScope() {
  const { activeConfig } = useConfig()
  const { selectedScope, setSelectedScope } = useScope()
  const pathname = usePathname()

  if (!activeConfig || activeConfig.parsedConfig.deviceType !== "panorama") return null

  const mode = resolveScopeMode(pathname)
  if (!mode) return null

  const panorama = activeConfig.parsedConfig as ParsedPanoramaConfig
  const isTemplate = mode === "template"
  const sectionLabel  = isTemplate ? "Templates"  : "Device Groups"
  const singularLabel = isTemplate ? "Template"   : "Device Group"
  const Icon = isTemplate ? LayoutTemplate : Layers

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            aria-label={`${singularLabel}: ${selectedLabel}`}
            className="flex h-7 items-center gap-1.5 rounded-md border border-border bg-background px-2 text-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:px-2.5"
          />
        }
      >
        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="hidden text-muted-foreground md:inline">{singularLabel}:</span>
        <span className="hidden max-w-[18ch] truncate font-medium md:inline">{selectedLabel}</span>
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
