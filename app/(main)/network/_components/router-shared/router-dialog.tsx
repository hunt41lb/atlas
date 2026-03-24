// @/app/(main)/network/_components/router-shared/router-dialog.tsx

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
import { GeneralPage, type RouterDialogPageProps } from "./router-dialog/router-dialog-general"
import { StaticPage } from "./router-dialog/router-dialog-static"
import type { PanwVirtualRouter } from "@/lib/panw-parser/types"
import { OspfPage, Ospfv3Page } from "./router-dialog/router-dialog-ospf"
import { RipPage } from "./router-dialog/router-dialog-rip"
import { BgpPage } from "./router-dialog/router-dialog-bgp"
import { MulticastPage } from "./router-dialog/router-dialog-multicast"

// ─── Types ────────────────────────────────────────────────────────────────────

interface RouterDialogProps {
  router: PanwVirtualRouter | null
  open: boolean
  onOpenChange: (open: boolean) => void
  routerLabel?: string
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

const PAGE_COMPONENTS: Record<string, React.ComponentType<RouterDialogPageProps>> = {
  general: GeneralPage,
  static: StaticPage,
  ospf: OspfPage,
  ospfv3: Ospfv3Page,
  ripv2: RipPage,
  bgp: BgpPage,
  multicast: MulticastPage,
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
  const PageComponent = PAGE_COMPONENTS[activePage]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[90vw] h-[min(92vh,740px)] flex flex-col gap-0 p-0 overflow-hidden"
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
