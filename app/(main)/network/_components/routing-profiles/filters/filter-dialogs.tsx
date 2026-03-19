// @/app/(main)/network/_components/routing-profiles/filters/filter-dialogs.tsx
//
// Detail dialogs for the 4 routing filter building blocks.
// Layout matches the PAN-OS Panorama GUI: header fields (Name, Description,
// Type) + entry table with type-specific columns.

"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type {
  PanwAccessList,
  PanwPrefixList,
  PanwCommunityList,
  PanwAsPathAccessList,
} from "@/lib/panw-parser/routing-profiles"

// ─── Shared ───────────────────────────────────────────────────────────────────

function ActionBadge({ action }: { action: string }) {
  return (
    <Badge variant={action === "permit" ? "green" : "red"} size="sm">
      {action}
    </Badge>
  )
}

function Dash() {
  return <span className="text-muted-foreground text-xs">—</span>
}

function HeaderField({ label, value }: { label: string; value: string }) {
  return (
    <>
      <Label className="text-right text-sm">{label}</Label>
      <Input readOnly value={value} className="h-8 text-sm" />
    </>
  )
}

// ─── Access List Dialog ───────────────────────────────────────────────────────

export function AccessListDialog({
  item,
  open,
  onOpenChange,
}: {
  item: PanwAccessList | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="shrink-0 border-b px-5 pt-4 pb-3">
          <DialogTitle>Filters Access List</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Header fields */}
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 mb-5">
            <HeaderField label="Name" value={item.name} />
            <HeaderField label="Description" value={item.description ?? ""} />
            <Label className="text-right text-sm">Type</Label>
            <div className="flex items-center gap-3">
              <Badge variant={item.type === "ipv4" ? "blue" : "purple"} size="sm">
                {item.type.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Entry table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">SEQ</TableHead>
                  <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">ACTION</TableHead>
                  {item.type === "ipv4" ? (
                    <>
                      <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">SRC NETWORK</TableHead>
                      <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">SRC WILDCARD</TableHead>
                      <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">DST NETWORK</TableHead>
                      <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">DST WILDCARD</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">SRC NETWORK/MASK</TableHead>
                      <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">EXACT MATCH</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={item.type === "ipv4" ? 6 : 4} className="py-8 text-center text-sm text-muted-foreground">
                      No entries configured.
                    </TableCell>
                  </TableRow>
                ) : item.entries.map((e) => (
                  <TableRow key={e.sequence}>
                    <TableCell className="text-xs tabular-nums font-medium">{e.sequence}</TableCell>
                    <TableCell><ActionBadge action={e.action} /></TableCell>
                    {item.type === "ipv4" ? (
                      <>
                        <TableCell className="text-xs font-mono">{e.sourceAddress ?? <Dash />}</TableCell>
                        <TableCell className="text-xs font-mono">{e.sourceWildcard ?? <Dash />}</TableCell>
                        <TableCell className="text-xs font-mono">{e.destinationAddress ?? <Dash />}</TableCell>
                        <TableCell className="text-xs font-mono">{e.destinationWildcard ?? <Dash />}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="text-xs font-mono">{e.sourceAddress ?? <Dash />}</TableCell>
                        <TableCell className="text-xs">{e.sourceExactMatch === true ? "true" : e.sourceExactMatch === false ? "false" : <Dash />}</TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="shrink-0 border-t bg-muted/50 rounded-b-xl px-5 py-3 flex justify-end">
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Prefix List Dialog ───────────────────────────────────────────────────────

export function PrefixListDialog({
  item,
  open,
  onOpenChange,
}: {
  item: PanwPrefixList | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="shrink-0 border-b px-5 pt-4 pb-3">
          <DialogTitle>Filters Prefix List</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 mb-5">
            <HeaderField label="Name" value={item.name} />
            <HeaderField label="Description" value={item.description ?? ""} />
            <Label className="text-right text-sm">Type</Label>
            <div className="flex items-center gap-3">
              <Badge variant={item.type === "ipv4" ? "blue" : "purple"} size="sm">
                {item.type.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">SEQ</TableHead>
                  <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">ACTION</TableHead>
                  <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">NETWORK</TableHead>
                  <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">{">="} MIN PREFIX LENGTH</TableHead>
                  <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">{"<="} MAX PREFIX LENGTH</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      No entries configured.
                    </TableCell>
                  </TableRow>
                ) : item.entries.map((e) => (
                  <TableRow key={e.sequence}>
                    <TableCell className="text-xs tabular-nums font-medium">{e.sequence}</TableCell>
                    <TableCell><ActionBadge action={e.action} /></TableCell>
                    <TableCell className="text-xs font-mono">{e.network ?? <Dash />}</TableCell>
                    <TableCell className="text-xs tabular-nums">{e.greaterThanOrEqual !== null ? e.greaterThanOrEqual : <Dash />}</TableCell>
                    <TableCell className="text-xs tabular-nums">{e.lessThanOrEqual !== null ? e.lessThanOrEqual : <Dash />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="shrink-0 border-t bg-muted/50 rounded-b-xl px-5 py-3 flex justify-end">
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Community List Dialog ────────────────────────────────────────────────────

const COMMUNITY_TYPE_LABELS: Record<string, string> = {
  regular: "Regular",
  extended: "Extended",
  large: "Large",
}

/** Column header for the values column varies by community list type */
const COMMUNITY_VALUES_HEADER: Record<string, string> = {
  regular: "COMMUNITY",
  extended: "REGEX",
  large: "REGEX",
}

export function CommunityListDialog({
  item,
  open,
  onOpenChange,
}: {
  item: PanwCommunityList | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!item) return null

  const valuesHeader = COMMUNITY_VALUES_HEADER[item.type] ?? "VALUES"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="shrink-0 border-b px-5 pt-4 pb-3">
          <DialogTitle>Filters Community List</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 mb-5">
            <HeaderField label="Name" value={item.name} />
            <HeaderField label="Description" value={item.description ?? ""} />
            <HeaderField label="Type" value={COMMUNITY_TYPE_LABELS[item.type] ?? item.type} />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">SEQ</TableHead>
                  <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">ACTION</TableHead>
                  <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">{valuesHeader}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                      No entries configured.
                    </TableCell>
                  </TableRow>
                ) : item.entries.map((e) => (
                  <TableRow key={e.sequence}>
                    <TableCell className="text-xs tabular-nums font-medium">{e.sequence}</TableCell>
                    <TableCell><ActionBadge action={e.action} /></TableCell>
                    <TableCell className="text-xs font-mono">
                      {e.values.length === 0 ? <Dash /> : (
                        <div className="flex flex-col gap-0.5">
                          {e.values.map((v) => (
                            <span key={v}>{v}</span>
                          ))}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="shrink-0 border-t bg-muted/50 rounded-b-xl px-5 py-3 flex justify-end">
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── AS Path Access List Dialog ───────────────────────────────────────────────

export function AsPathAccessListDialog({
  item,
  open,
  onOpenChange,
}: {
  item: PanwAsPathAccessList | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="shrink-0 border-b px-5 pt-4 pb-3">
          <DialogTitle>Filters AS Path Access List</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 mb-5">
            <HeaderField label="Name" value={item.name} />
            <HeaderField label="Description" value={item.description ?? ""} />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">SEQ</TableHead>
                  <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">ACTION</TableHead>
                  <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">REGULAR EXPRESSION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                      No entries configured.
                    </TableCell>
                  </TableRow>
                ) : item.entries.map((e) => (
                  <TableRow key={e.sequence}>
                    <TableCell className="text-xs tabular-nums font-medium">{e.sequence}</TableCell>
                    <TableCell><ActionBadge action={e.action} /></TableCell>
                    <TableCell className="text-xs font-mono">{e.regex ?? <Dash />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="shrink-0 border-t bg-muted/50 rounded-b-xl px-5 py-3 flex justify-end">
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
