// @/app/(main)/network/_components/routing-profiles/bgp/bgp-filter-dialog.tsx

"use client"

import * as React from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import { cn } from "@/lib/utils"

import type {
  PanwBgpFilteringProfile,
  PanwBgpFilteringSubConfig,
  PanwBgpFilteringCondAdvert,
} from "@/lib/panw-parser/network/routing-profiles"

// ─── Field primitives ────────────────────────────────────────────────────────
// Small helpers to keep the panel declarative. Read-only inputs throughout.

function FieldRow({
  label,
  value,
  disabled,
}: {
  label: string
  value: string | null | undefined
  disabled?: boolean
}) {
  return (
    <div className="grid grid-cols-[8rem_1fr] items-center gap-x-3">
      <Label
        className={cn(
          "text-right text-sm",
          disabled && "text-muted-foreground/60",
        )}
      >
        {label}
      </Label>
      <Input
        readOnly
        disabled={disabled}
        value={value ?? ""}
        placeholder={disabled ? "None" : "—"}
        className="h-8 text-sm"
      />
    </div>
  )
}

// ─── Network Filter block (Inbound / Outbound pair) ──────────────────────────
// PAN-OS renders Distribute List and Prefix List as two dropdowns, but they are
// mutually exclusive. We show both rows because the parser returns both fields
// independently, and one of them may be set.

function NetworkFilterBlock({
  title,
  distributeList,
  prefixList,
  disabled,
}: {
  title: "Inbound" | "Outbound"
  distributeList: string | null
  prefixList: string | null
  disabled?: boolean
}) {
  return (
    <Fieldset>
      <FieldsetLegend className={cn(disabled && "text-muted-foreground/60")}>
        {title}
      </FieldsetLegend>
      <FieldsetContent className="gap-2">
        <FieldRow label="Distribute List" value={distributeList} disabled={disabled} />
        <FieldRow label="Prefix List" value={prefixList} disabled={disabled} />
      </FieldsetContent>
    </Fieldset>
  )
}

// ─── Conditional Advertisement block ─────────────────────────────────────────
// PAN-OS labels the Non-Exist block's first row as "Non Exist Map"; under the
// hood PAN-OS stores both under the same field shape, so the parser aliases to
// `existMap`. We display the correct label per block.

function CondAdvertBlock({
  title,
  advert,
  firstFieldLabel,
  disabled,
}: {
  title: "Exist" | "Non-Exist"
  advert: PanwBgpFilteringCondAdvert | null
  firstFieldLabel: string
  disabled?: boolean
}) {
  return (
    <Fieldset>
      <FieldsetLegend className={cn(disabled && "text-muted-foreground/60")}>
        {title}
      </FieldsetLegend>
      <FieldsetContent className="gap-2">
        <FieldRow label={firstFieldLabel} value={advert?.existMap ?? null} disabled={disabled} />
        <FieldRow label="Advertise Map" value={advert?.advertiseMap ?? null} disabled={disabled} />
      </FieldsetContent>
    </Fieldset>
  )
}

// ─── Sub-config panel (the body of a Unicast / Multicast tab) ────────────────

function SubConfigPanel({
  sub,
  showInherit,
  disabled,
}: {
  sub: PanwBgpFilteringSubConfig | null
  /** Whether the "Inherit from Unicast" checkbox should render (Multicast only) */
  showInherit: boolean
  /** Master disabled flag — when Multicast has `inherit: true`, everything below is muted */
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-3 pt-3">
      {showInherit && (
        <div className="flex items-center gap-2">
          <Checkbox checked={disabled} disabled />
          <Label className="text-sm">Inherit from Unicast</Label>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FieldRow label="Inbound Filter List"  value={sub?.filterListInbound}  disabled={disabled} />
        <FieldRow label="Outbound Filter List" value={sub?.filterListOutbound} disabled={disabled} />
      </div>

      <Fieldset>
        <FieldsetLegend className={cn(disabled && "text-muted-foreground/60")}>
          Network Filter
        </FieldsetLegend>
        <FieldsetContent>
          <div className="grid grid-cols-2 gap-4">
            <NetworkFilterBlock
              title="Inbound"
              distributeList={sub?.inboundDistributeList ?? null}
              prefixList={sub?.inboundPrefixList ?? null}
              disabled={disabled}
            />
            <NetworkFilterBlock
              title="Outbound"
              distributeList={sub?.outboundDistributeList ?? null}
              prefixList={sub?.outboundPrefixList ?? null}
              disabled={disabled}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <FieldRow label="Inbound Route Map"  value={sub?.routeMapInbound}  disabled={disabled} />
            <FieldRow label="Outbound Route Map" value={sub?.routeMapOutbound} disabled={disabled} />
          </div>
        </FieldsetContent>
      </Fieldset>

      <Fieldset>
        <FieldsetLegend className={cn(disabled && "text-muted-foreground/60")}>
          Conditional Advertisement
        </FieldsetLegend>
        <FieldsetContent>
          <div className="grid grid-cols-2 gap-4">
            <CondAdvertBlock
              title="Exist"
              firstFieldLabel="Exist Map"
              advert={sub?.conditionalAdvertExist ?? null}
              disabled={disabled}
            />
            <CondAdvertBlock
              title="Non-Exist"
              firstFieldLabel="Non Exist Map"
              advert={sub?.conditionalAdvertNonExist ?? null}
              disabled={disabled}
            />
          </div>
        </FieldsetContent>
      </Fieldset>

      <FieldRow label="Unsuppress Map" value={sub?.unsuppressMap} disabled={disabled} />
    </div>
  )
}

// ─── Dialog ──────────────────────────────────────────────────────────────────

export function FilteringProfileDialog({
  profile,
  open,
  onOpenChange,
}: {
  profile: PanwBgpFilteringProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [afi, setAfi] = React.useState<"ipv4" | "ipv6">("ipv4")

  // Reset AFI when a new profile opens
  React.useEffect(() => {
    if (profile) setAfi("ipv4")
  }, [profile])

  if (!profile) return null

  const unicast   = afi === "ipv4" ? profile.ipv4Unicast   : profile.ipv6Unicast
  const multicast = afi === "ipv4" ? profile.ipv4Multicast : null   // IPv6 has Unicast only in PAN-OS
  const multicastInherit = multicast?.inherit ?? false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>BGP Filtering Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3">
            <Label className="text-right text-sm">Name</Label>
            <Input readOnly value={profile.name} className="h-8 text-sm" />
            <Label className="text-right text-sm">Description</Label>
            <Input readOnly value={profile.description ?? ""} className="h-8 text-sm" />
            <Label className="text-right text-sm">AFI</Label>
            <RadioGroup
              value={afi}
              onValueChange={(v) => setAfi(v as "ipv4" | "ipv6")}
              className="flex items-center gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="ipv4" id="afi-ipv4" />
                <Label htmlFor="afi-ipv4" className="text-sm cursor-pointer">IPv4</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="ipv6" id="afi-ipv6" />
                <Label htmlFor="afi-ipv6" className="text-sm cursor-pointer">IPv6</Label>
              </div>
            </RadioGroup>
          </div>

          <Tabs defaultValue="unicast" className="flex flex-col">
            <div className="shrink-0 border-b">
              <TabsList variant="line">
                <TabsTrigger value="unicast">Unicast</TabsTrigger>
                {afi === "ipv4" && <TabsTrigger value="multicast">Multicast</TabsTrigger>}
              </TabsList>
            </div>

            <TabsContent value="unicast">
              <SubConfigPanel sub={unicast} showInherit={false} />
            </TabsContent>

            {afi === "ipv4" && (
              <TabsContent value="multicast">
                <SubConfigPanel
                  sub={multicast}
                  showInherit
                  disabled={multicastInherit}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
