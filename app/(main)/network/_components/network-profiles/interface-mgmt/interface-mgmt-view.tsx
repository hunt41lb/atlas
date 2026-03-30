// @/app/(main)/network/_components/network-profiles/interface-mgmt/interface-mgmt-view.tsx

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

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable } from "@/components/ui/data-table"
import { useConfig } from "@/app/(main)/_context/config-context"
import { useScope } from "@/app/(main)/_context/scope-context"
import { resolveNetworkData } from "@/app/(main)/_lib/resolve-config-data"
import { ReadOnlyCheckbox, FieldGroup } from "../../router-shared/router-dialog/field-display"
import type { PanwInterfaceMgmtProfile } from "@/lib/panw-parser/network-profiles"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NETWORK_SERVICES: { key: keyof PanwInterfaceMgmtProfile; label: string }[] = [
  { key: "https",         label: "HTTPS" },
  { key: "http",          label: "HTTP" },
  { key: "httpOcsp",      label: "HTTP OCSP" },
  { key: "ssh",           label: "SSH" },
  { key: "telnet",        label: "Telnet" },
  { key: "ping",          label: "Ping" },
  { key: "snmp",          label: "SNMP" },
  { key: "responsePages", label: "Response Pages" },
]

const USERID_SERVICES: { key: keyof PanwInterfaceMgmtProfile; label: string }[] = [
  { key: "useridService",            label: "User-ID Service" },
  { key: "useridSyslogListenerSsl",  label: "User-ID Syslog Listener (SSL)" },
  { key: "useridSyslogListenerUdp",  label: "User-ID Syslog Listener (UDP)" },
]

// ─── Detail Dialog ────────────────────────────────────────────────────────────

function InterfaceMgmtDialog({
  profile,
  open,
  onOpenChange,
}: {
  profile: PanwInterfaceMgmtProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!profile) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="shrink-0 border-b px-5 pt-4 pb-3">
          <DialogTitle>Interface Management Profile</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-20 shrink-0 text-right">Name</span>
            <span className="text-sm font-medium">{profile.name}</span>
          </div>

          <FieldGroup title="Network Services">
            <div className="grid grid-cols-2 gap-x-4">
              {NETWORK_SERVICES.map((s) => (
                <ReadOnlyCheckbox key={s.key} checked={profile[s.key] as boolean} label={s.label} />
              ))}
            </div>
          </FieldGroup>

          <FieldGroup title="User-ID Services">
            {USERID_SERVICES.map((s) => (
              <ReadOnlyCheckbox key={s.key} checked={profile[s.key] as boolean} label={s.label} />
            ))}
          </FieldGroup>

          <FieldGroup title="Permitted IP Addresses">
            {profile.permittedIps.length === 0 ? (
              <span className="text-xs text-muted-foreground">None</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {profile.permittedIps.map((ip) => (
                  <Badge key={ip} variant="secondary" className="font-mono text-xs">{ip}</Badge>
                ))}
              </div>
            )}
          </FieldGroup>
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const col = createColumnHelper<PanwInterfaceMgmtProfile>()

function buildColumns(
  isPanorama: boolean,
  onNameClick: (p: PanwInterfaceMgmtProfile) => void,
): ColumnDef<PanwInterfaceMgmtProfile, unknown>[] {
  const check = (key: keyof PanwInterfaceMgmtProfile): ColumnDef<PanwInterfaceMgmtProfile, unknown> => ({
    id: key,
    header: key === "httpOcsp" ? "HTTP OCSP"
      : key === "responsePages" ? "Response Pages"
      : key === "useridService" ? "User-ID"
      : key === "useridSyslogListenerSsl" ? "User-ID Syslog Listener-SSL"
      : key === "useridSyslogListenerUdp" ? "User-ID Syslog Listener-UDP"
      : key.toUpperCase(),
    enableSorting: false,
    cell: ({ row }) => (
      <Checkbox checked={row.original[key] as boolean} disabled />
    ),
  })

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
    }) as ColumnDef<PanwInterfaceMgmtProfile, unknown>,

    check("ping"),
    check("telnet"),
    check("ssh"),
    check("http"),
    check("httpOcsp"),
    check("https"),
    check("snmp"),
    check("responsePages"),
    check("useridService"),
    check("useridSyslogListenerSsl"),
    check("useridSyslogListenerUdp"),

    {
      id: "permittedIps",
      header: "Permitted IP Addresses",
      enableSorting: false,
      cell: ({ row }) => {
        const ips = row.original.permittedIps
        if (ips.length === 0) return <span className="text-muted-foreground text-xs">—</span>
        return (
          <div className="flex flex-col gap-0.5">
            {ips.map((ip) => (
              <span key={ip} className="font-mono text-xs">{ip}</span>
            ))}
          </div>
        )
      },
    },

    ...(isPanorama ? [{
      id: "template",
      header: "Template",
      enableSorting: true,
      accessorFn: (row: PanwInterfaceMgmtProfile) => row.templateName ?? "",
      cell: ({ row }: { row: { original: PanwInterfaceMgmtProfile } }) => row.original.templateName
        ? <span className="text-xs">{row.original.templateName}</span>
        : <span className="text-muted-foreground text-xs">—</span>,
    } as ColumnDef<PanwInterfaceMgmtProfile, unknown>] : []),
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InterfaceMgmtView() {
  const { activeConfig } = useConfig()
  const { selectedScope } = useScope()
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "name", desc: false }])
  const [selected, setSelected] = React.useState<PanwInterfaceMgmtProfile | null>(null)

  const isPanorama = activeConfig?.parsedConfig.deviceType === "panorama"

  const data = React.useMemo(() => {
    if (!activeConfig) return []
    return resolveNetworkData(activeConfig.parsedConfig, selectedScope).interfaceMgmtProfiles
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
      <DataTable
        table={table}
        title="Interface Management Profiles"
        search={search}
        onSearch={setSearch}
      />
      <InterfaceMgmtDialog
        profile={selected}
        open={selected !== null}
        onOpenChange={(open) => { if (!open) setSelected(null) }}
      />
    </>
  )
}
