// @/app/(main)/_components/ui/empty-state.tsx

"use client"

import { FolderOpen, Upload, FileCode2, Shield, CircleOff } from "lucide-react"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { useUploadDialog } from "@/app/(main)/_context/upload-dialog-context"

export function EmptyState() {
  const { openDialog } = useUploadDialog()

  return (
    <Empty className="h-full border-0">
      <EmptyHeader>
        <EmptyMedia>
          <div className="relative flex size-16 items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-muted" />
            <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-sidebar-primary/10 to-transparent" />
            <FolderOpen className="relative size-7 text-muted-foreground" />
          </div>
        </EmptyMedia>
        <EmptyTitle className="text-base">No Configuration Selected</EmptyTitle>
        <EmptyDescription>
          Upload a Palo Alto Networks firewall or Panorama configuration
          file to visualize your security policy.
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <Button onClick={openDialog} className="gap-2">
          <Upload className="size-4" />
          Upload Configuration
        </Button>

        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileCode2 className="size-3.5" />
            <span>running-config.xml</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="size-3.5" />
            <span>Panorama exports supported</span>
          </div>
        </div>
      </EmptyContent>
    </Empty>
  )
}

export function NotConfiguredState({ title }: { title: string }) {
  return (
    <Empty className="h-full border-0">
      <EmptyHeader>
        <EmptyMedia>
          <div className="relative flex size-16 items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-muted" />
            <CircleOff className="relative size-7 text-muted-foreground" />
          </div>
        </EmptyMedia>
        <EmptyTitle className="text-base">No {title} Configured</EmptyTitle>
        <EmptyDescription>
          There are no {title.toLowerCase()} in this configuration.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
