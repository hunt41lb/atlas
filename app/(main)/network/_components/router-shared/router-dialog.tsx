// @/app/(main)/network/_components/router-shared/router-dialog.tsx
//
// Reusable dialog for inspecting a Virtual Router or Logical Router.
// Mimics the PAN-OS GUI: left sidebar navigation + tabbed content area.
// Includes a "Defaults" toggle to compare config vs PAN-OS factory defaults.
//
// Page content is in separate files:
//   router-dialog-general.tsx  — General page (Interface, Admin Dist, ECMP, RIB)
//   router-dialog-static.tsx   — Static Routes (future)
//   router-dialog-ospf.tsx     — OSPF (future)
//   etc.

"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { DialogSidebar, type DialogSidebarItem } from "@/components/ui/dialog-sidebar"
import { ComingSoonView } from "@/app/(main)/_components/ui/category-shell"
import { GeneralPage, type RouterDialogPageProps } from "./router-dialog/router-dialog-general"
import { StaticPage } from "./router-dialog/router-dialog-static"
import type { PanwVirtualRouter } from "@/lib/panw-parser/types"

// ─── Types ────────────────────────────────────────────────────────────────────

interface RouterDialogProps {
  router: PanwVirtualRouter | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** "Logical Router" | "Virtual Router" */
  routerLabel?: string
  /** Which sidebar pages to show (by value) */
  pages?: DialogSidebarItem[]
}

// ─── Default sidebar pages ────────────────────────────────────────────────────

const DEFAULT_PAGES: DialogSidebarItem[] = [
  { label: "General",   value: "general" },
  { label: "Static",    value: "static" },
  { label: "OSPF",      value: "ospf" },
  { label: "OSPFv3",    value: "ospfv3" },
  { label: "RIPv2",     value: "ripv2" },
  { label: "BGP",       value: "bgp" },
  { label: "Multicast", value: "multicast" },
]

// ─── Page registry ────────────────────────────────────────────────────────────
// Map page values to their components. Add new pages here as they're built.

const PAGE_COMPONENTS: Record<
  string,
  React.ComponentType<RouterDialogPageProps>
> = {
  general: GeneralPage,
  static: StaticPage,
}

// Fallback for pages not yet built
function ComingSoonPage({ router }: RouterDialogPageProps) {
  const label = DEFAULT_PAGES.find((p) =>
    Object.keys(PAGE_COMPONENTS).every((k) => k !== p.value)
  )?.label
  return <ComingSoonView title={label ?? "Page"} />
}

// ─── View toggle (Configuration vs Defaults) ─────────────────────────────────

function ViewToggle({
  showDefaults,
  onToggle,
}: {
  showDefaults: boolean
  onToggle: (value: boolean) => void
}) {
  return (
    <ButtonGroup>
      <Button
        size="sm"
        variant={!showDefaults ? "default" : "outline"}
        onClick={() => onToggle(false)}
      >
        Configuration
      </Button>
      <Button
        size="sm"
        variant={showDefaults ? "default" : "outline"}
        onClick={() => onToggle(true)}
      >
        Defaults
      </Button>
    </ButtonGroup>
  )
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

export function RouterDialog({
  router,
  open,
  onOpenChange,
  routerLabel = "Router",
  pages = DEFAULT_PAGES,
}: RouterDialogProps) {
  const [activePage, setActivePage] = React.useState(pages[0]?.value ?? "general")
  const [showDefaults, setShowDefaults] = React.useState(false)

  // Reset state when dialog opens with a new router
  React.useEffect(() => {
    if (open && pages.length > 0) {
      setActivePage(pages[0].value)
      setShowDefaults(false)
    }
  }, [open, router?.name, pages])

  if (!router) return null

  // Resolve page component
  const PageComponent = PAGE_COMPONENTS[activePage] ?? ComingSoonPage

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[90vw] h-[min(85vh,680px)] flex flex-col gap-0 p-0 overflow-hidden"
      >
        {/* Header */}
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <DialogTitle>{routerLabel} - {router.name}</DialogTitle>
        </DialogHeader>

        {/* Body: sidebar + content */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <DialogSidebar
            items={pages}
            activeItem={activePage}
            onSelect={setActivePage}
          />
          <div className="flex-1 min-h-0 overflow-hidden">
            <PageComponent router={router} showDefaults={showDefaults} />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t bg-muted/50 rounded-b-xl px-4 py-3 flex items-center justify-between">
          <DialogClose render={<Button variant="outline" size="sm">Close</Button>} />
          <ViewToggle showDefaults={showDefaults} onToggle={setShowDefaults} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
