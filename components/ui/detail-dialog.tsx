// @/components/ui/detail-dialog.tsx

"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function DetailDialog({
  title,
  open,
  onOpenChange,
  children,
  maxWidth = "sm:max-w-lg",
  height,
  noPadding = false,
}: {
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  maxWidth?: string
  height?: string
  noPadding?: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(maxWidth, height, "flex flex-col gap-0 p-0 overflow-hidden")}
      >
        <DialogHeader className="shrink-0 border-b px-5 pt-4 pb-3">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className={cn("flex-1 overflow-y-auto", !noPadding && "p-5 space-y-3")}>
          {children}
        </div>
        <div className="shrink-0 border-t bg-muted/50 rounded-b-xl px-5 py-3 flex justify-end">
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
