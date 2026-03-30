// @/app/(main)/network/_components/network-profiles/gp-ipsec-crypto/gp-ipsec-crypto-view.tsx

"use client"

import * as React from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  createColumnHelper,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { FieldGroup, HeaderField } from "../../router-shared/router-dialog/field-display"
import type { PanwGpIpsecCryptoProfile } from "@/lib/panw-parser/network-profiles"

// ─── Dialog ───────────────────────────────────────────────────────────────────

function GpIpsecCryptoDialog({
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="shrink-0 border-b px-5 pt-4 pb-3">
          <DialogTitle>GlobalProtect IPSec Crypto Profile</DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-4">
          <HeaderField label="Name" value={profile.name} />

          <FieldGroup title="Encryption">
            {profile.encryption.length === 0 ? (
              <span className="text-xs text-muted-foreground">None</span>
            ) : (
              <div className="space-y-0.5">
                {profile.encryption.map((e) => (
                  <div key={e} className="text-xs">{e}</div>
                ))}
              </div>
            )}
          </FieldGroup>

          <HeaderField label="Authentication" value={profile.authentication.join(", ") || "None"} />
        </div>

        <div className="shrink-0 border-t bg-muted/50 rounded-b-xl px-5 py-3 flex justify-end">
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const col = createColumnHelper<PanwGpIpsecCryptoProfile>()

function buildColumns(
  isPanorama: boolean,
  onNameClick: (p: PanwGpIpsecCryptoProfile) => void,
): ColumnDef<PanwGpIpsecCryptoProfile, unknown>[] {
  return [
    col.accessor("name", {
      header: "Name",
      enableHiding: false,
      cell: (info) => (
        <button
          type="button"
          className="text-xs font-medium text-foreground hover:underline cursor-pointer"
          onClick={() => onNameClick(info.row.original)}
        >
          {info.getValue()}
        </button>
      ),
    }) as ColumnDef<PanwGpIpsecCryptoProfile, unknown>,

    {
      id: "encryption",
      header: "Encryption",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-xs">{row.original.encryption.join(", ") || "—"}</span>
      ),
    },

    ...(isPanorama ? [{
      id: "template",
      header: "Template",
      enableSorting: true,
      accessorFn: (row: PanwGpIpsecCryptoProfile) => row.templateName ?? "",
      cell: ({ row }: { row: { original: PanwGpIpsecCryptoProfile } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwGpIpsecCryptoProfile, unknown>] : []),
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GpIpsecCryptoView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwGpIpsecCryptoProfile | null>(null)

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).gpIpsecCryptoProfiles
  }, [activeConfig, selectedScope])

  const columns = React.useMemo(() => buildColumns(isPanorama, setSelected), [isPanorama])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
  })

  return (
    <>
      <DataTable table={table} title="GlobalProtect IPSec Crypto Profiles" search={search} onSearch={setSearch} />
      <GpIpsecCryptoDialog profile={selected} open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null) }} />
    </>
  )
}
