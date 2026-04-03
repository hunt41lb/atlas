// @/app/(main)/_components/ui/network-empty.tsx

"use client"

import { ShieldOff } from "lucide-react"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"

export function NetworkProfileEmpty({ title }: { title: string }) {
  return (
    <Empty className="h-full border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShieldOff />
        </EmptyMedia>
        <EmptyTitle>{title} is Empty</EmptyTitle>
        <EmptyDescription>
          Configure {title.toLowerCase()} on your Palo Alto Networks device and upload the configuration to view details here.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
