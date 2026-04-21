// @/app/(main)/device/_components/setup-view.tsx

"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { SetupManagement } from "@/lib/panw-parser/device/setup/management"
import { ManagementView } from "./setup/management-view"

interface SetupViewProps {
  setupManagement: SetupManagement
}

const SETUP_TABS = [
  { value: "management", label: "Management" },
  { value: "operations", label: "Operations" },
  { value: "services", label: "Services" },
  { value: "interfaces", label: "Interfaces" },
  { value: "content-id", label: "Content-ID" },
  { value: "wildfire", label: "WildFire" },
  { value: "session", label: "Session" },
  { value: "hsm", label: "HSM" },
  { value: "ace", label: "ACE" },
  { value: "quantum", label: "Quantum" },
  { value: "pan-os-security", label: "PAN-OS Security" },
] as const

export function SetupView({ setupManagement }: SetupViewProps) {
  return (
    <Tabs defaultValue="management">
      <TabsList variant="line">
        {SETUP_TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="management">
        <ManagementView setupManagement={setupManagement} />
      </TabsContent>

      {SETUP_TABS.slice(1).map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          <NotImplementedPlaceholder name={tab.label} />
        </TabsContent>
      ))}
    </Tabs>
  )
}

// Temporary placeholder for tabs that haven't been built yet.
// (Distinct from <Empty /> which is reserved for the real "no data configured" state.)
function NotImplementedPlaceholder({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center p-12 text-muted-foreground">
      <p>{name} section is not yet implemented.</p>
    </div>
  )
}
