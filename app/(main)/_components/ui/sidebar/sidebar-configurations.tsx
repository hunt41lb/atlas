// @/app/(main)/_components/ui/sidebar/sidebar-configurations.tsx

"use client"

import * as React from "react"
import { ArchiveX, MoreHorizontal, Trash2, type LucideIcon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useConfig } from "@/app/(main)/_context/config-context"
import {
  archiveConfiguration,
  deleteConfiguration,
} from "@/lib/api-client"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfigProject {
  id:        string
  name:      string
  url:       string
  icon:      LucideIcon
  onClick?:  () => void
  isActive?: boolean
}

type PendingAction =
  | { type: "archive"; id: string; name: string }
  | { type: "delete";  id: string; name: string }

const ARCHIVE_DAYS_DEFAULT = 30

// ─── Component ────────────────────────────────────────────────────────────────

export function SidebarConfigurations({
  projects,
  loading,
}: {
  projects: ConfigProject[]
  loading?: boolean
}) {
  const { isMobile } = useSidebar()
  const { removeConfig } = useConfig()

  // Dialog state — set via dropdown, cleared on close/confirm
  const [pendingAction, setPendingAction] = React.useState<PendingAction | null>(null)
  const [archiveDays,   setArchiveDays]   = React.useState(ARCHIVE_DAYS_DEFAULT)
  const [busy,          setBusy]          = React.useState(false)
  const [error,         setError]         = React.useState<string | null>(null)

  // Reset input + errors whenever a dialog opens
  React.useEffect(() => {
    if (pendingAction) {
      setError(null)
      if (pendingAction.type === "archive") setArchiveDays(ARCHIVE_DAYS_DEFAULT)
    }
  }, [pendingAction])

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleArchiveConfirm() {
    if (!pendingAction || pendingAction.type !== "archive") return
    setBusy(true)
    setError(null)
    try {
      await archiveConfiguration(pendingAction.id, archiveDays)
      removeConfig(pendingAction.id)
      setPendingAction(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Archive failed.")
    } finally {
      setBusy(false)
    }
  }

  async function handleDeleteConfirm() {
    if (!pendingAction || pendingAction.type !== "delete") return
    setBusy(true)
    setError(null)
    try {
      await deleteConfiguration(pendingAction.id)
      removeConfig(pendingAction.id)
      setPendingAction(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.")
    } finally {
      setBusy(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Configurations</SidebarGroupLabel>
        <SidebarMenu>
          {loading ? (
            <>
              {[1, 2].map((i) => (
                <SidebarMenuItem key={i}>
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <Skeleton className="size-4 rounded" />
                    <Skeleton className="h-4 w-24 rounded" />
                  </div>
                </SidebarMenuItem>
              ))}
            </>
          ) : projects.length === 0 ? (
            <SidebarMenuItem>
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                No configurations — upload one to get started.
              </div>
            </SidebarMenuItem>
          ) : (
            projects.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={item.onClick}
                  isActive={item.isActive}
                  className="cursor-pointer"
                >
                  <item.icon />
                  <span>{item.name}</span>
                </SidebarMenuButton>

                <DropdownMenu>
                  <DropdownMenuTrigger render={<SidebarMenuAction showOnHover />}>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-52"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    <DropdownMenuItem
                      onClick={() =>
                        setPendingAction({ type: "archive", id: item.id, name: item.name })
                      }
                    >
                      <ArchiveX className="text-muted-foreground" />
                      <span>Archive…</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() =>
                        setPendingAction({ type: "delete", id: item.id, name: item.name })
                      }
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="text-destructive" />
                      <span>Permanently Delete…</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </SidebarGroup>

      {/* ── Archive Dialog ────────────────────────────────────────────────── */}
      <AlertDialog
        open={pendingAction?.type === "archive"}
        onOpenChange={(open) => { if (!open && !busy) setPendingAction(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <ArchiveX className="text-muted-foreground" />
            </AlertDialogMedia>
            <AlertDialogTitle>Archive Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{pendingAction?.name}</strong> will be archived and automatically
              deleted after the retention period. You can re-upload the config at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2.5 text-sm">
            <span className="shrink-0 text-muted-foreground">Delete after</span>
            <input
              type="number"
              min={1}
              max={365}
              value={archiveDays}
              onChange={(e) =>
                setArchiveDays(Math.max(1, Math.min(365, Number(e.target.value))))
              }
              disabled={busy}
              className="w-16 rounded border bg-background px-2 py-0.5 text-center tabular-nums focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
            />
            <span className="shrink-0 text-muted-foreground">days</span>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveConfirm} disabled={busy}>
              {busy
                ? "Archiving…"
                : `Archive for ${archiveDays} day${archiveDays !== 1 ? "s" : ""}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Permanent Delete Dialog ───────────────────────────────────────── */}
      <AlertDialog
        open={pendingAction?.type === "delete"}
        onOpenChange={(open) => { if (!open && !busy) setPendingAction(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2 className="text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>Permanently Delete</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{pendingAction?.name}</strong> and all associated data will be
              permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={busy}
              variant="destructive"
            >
              {busy ? "Deleting…" : "Permanently Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
