// @/app/(main)/network/page.tsx

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useConfig } from "@/app/(main)/_context/config-context"
import { EmptyState } from "@/app/(main)/_components/ui/empty-state"

export default function NetworkPage() {
  const { activeConfig } = useConfig()
  const router = useRouter()

  useEffect(() => {
    if (activeConfig) {
      router.replace("/network/interfaces")
    }
  }, [activeConfig, router])

  if (activeConfig) return null

  return <EmptyState />
}
