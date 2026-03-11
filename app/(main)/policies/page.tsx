// @/app/(main)/policies/page.tsx

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useConfig } from "@/app/(main)/_context/config-context"
import { EmptyState } from "@/app/(main)/_components/ui/empty-state"

export default function PoliciesPage() {
  const { activeConfig } = useConfig()
  const router = useRouter()

  useEffect(() => {
    if (activeConfig) {
      router.replace("/policies/security")
    }
  }, [activeConfig, router])

  if (activeConfig) return null

  return <EmptyState />
}
