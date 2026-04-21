// @/app/(main)/device/_components/setup/management-view.tsx

"use client"

import type { SetupManagement } from "@/lib/panw-parser/device/setup/management"
import { GeneralSettingsCard } from "./management/general-settings-card"

interface ManagementViewProps {
  setupManagement: SetupManagement
}

export function ManagementView({ setupManagement }: ManagementViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
      {/* Left column — order mirrors PAN-OS Management layout */}
      <div className="space-y-4">
        <GeneralSettingsCard generalSettings={setupManagement.generalSettings} />
        {/* TODO: AuthenticationSettingsCard */}
        {/* TODO: LoggingAndReportingSettingsCard */}
        {/* TODO: LogInterfaceCard */}
        {/* TODO: AutoFocusCard */}
        {/* TODO: CloudLoggingCard */}
        {/* TODO: AccountingServerSettingsCard */}
        {/* TODO: SshManagementProfileSettingCard */}
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {/* TODO: PanoramaSettingsCard */}
        {/* TODO: SecureCommunicationSettingsCard */}
        {/* TODO: BannersAndMessagesCard */}
        {/* TODO: MinimumPasswordComplexityCard */}
        {/* TODO: PanOsEdgeServiceSettingsCard */}
        {/* TODO: AdvancedDnsSecurityCard */}
      </div>
    </div>
  )
}
