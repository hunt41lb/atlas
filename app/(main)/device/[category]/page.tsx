// @/app/(main)/device/[category]/page.tsx

import { notFound } from "next/navigation"
import { SetupView } from "@/app/(main)/device/_components/setup-view"
import type { SetupManagement } from "@/lib/panw-parser/device/setup/management"

type PageProps = {
  params: Promise<{ category: string }>
  searchParams: Promise<{ template?: string }>
}

export default async function DeviceCategoryPage({ params, searchParams }: PageProps) {
  const { category } = await params
  const { template: templateName } = await searchParams

  // ─── TODO: Wire up your real config-loading pattern here ───────────────────
  // This is a stub. Replace with however your existing pages (e.g. network/[category])
  // resolve the active config + template for the current view.
  const setupManagement = await loadSetupManagement(templateName)
  // ───────────────────────────────────────────────────────────────────────────

  switch (category) {
    case "setup":
      return <SetupView setupManagement={setupManagement} />
    // Future device categories (high-availability, password-profiles, administrators, etc.)
    // get added as `case` branches here.
    default:
      notFound()
  }
}

// ─── Data-loading stub (replace with your real implementation) ──────────────
async function loadSetupManagement(_templateName?: string): Promise<SetupManagement> {
  throw new Error(
    "loadSetupManagement is a stub — wire this up to your actual config-loading pattern (matches whatever network/[category]/page.tsx does).",
  )
}
