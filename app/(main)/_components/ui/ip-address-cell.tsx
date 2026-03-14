// @/app/(main)/_components/ui/ip-address-cell.tsx
//
// Shared IP address cell renderer for table views.
//
// Handles all display cases:
//   - DHCP client → renders "Dynamic-DHCP Client" badge
//   - IPv4 addresses → mono-font vertical stack
//   - IPv6 addresses → mono-font vertical stack in blue
//   - Template variables ($VAR) → mono-font with tooltip showing resolved value
//   - Mixed IPv4 + IPv6 → both stacked together
//   - No addresses → dash placeholder
//
// Usage:
//   <IpAddressCell ipv4={iface.ipAddresses} dhcpClient={iface.dhcpClient} />
//   <IpAddressCell ipv4={sub.ipAddresses} ipv6={sub.ipv6Addresses} variableMap={varMap} />

"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { MonoValue } from "@/app/(main)/_components/ui/category-shell"

/** Resolved template variable info for tooltip display */
export interface VariableInfo {
  /** The resolved value, e.g. "10.11.11.62/26" */
  value: string
  /** Human-readable description, e.g. "Domain Services IPv4 Subnet" */
  description: string | null
}

/** Map of variable name (with $ prefix) → resolved info */
export type VariableMap = Map<string, VariableInfo>

interface IpAddressCellProps {
  /** IPv4 addresses to display */
  ipv4?: string[]
  /** IPv6 addresses to display (rendered in blue) */
  ipv6?: string[]
  /** When true, renders "Dynamic-DHCP Client" badge instead of addresses */
  dhcpClient?: boolean
  /** Template variable lookup — when provided, $-prefixed values get tooltips */
  variableMap?: VariableMap
}

function IpValue({
  ip,
  className,
  variableMap,
}: {
  ip: string
  className?: string
  variableMap?: VariableMap
}) {
  const isVariable = ip.startsWith("$")
  const varInfo = isVariable && variableMap ? variableMap.get(ip) : undefined

  if (isVariable && varInfo) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <span className="cursor-help border-b border-dashed border-muted-foreground/40" />
          }
        >
          <MonoValue className={className}>{ip}</MonoValue>
        </TooltipTrigger>
        <TooltipContent side="top" align="start">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono font-medium">{varInfo.value}</span>
            {varInfo.description && (
              <span className="text-[10px] opacity-80">{varInfo.description}</span>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }

  return <MonoValue className={className}>{ip}</MonoValue>
}

export function IpAddressCell({ ipv4 = [], ipv6 = [], dhcpClient = false, variableMap }: IpAddressCellProps) {
  if (dhcpClient) {
    return (
      <Badge variant="sky" size="sm">
        Dynamic-DHCP Client
      </Badge>
    )
  }

  const hasIpv4 = ipv4.length > 0
  const hasIpv6 = ipv6.length > 0

  if (!hasIpv4 && !hasIpv6) {
    return <span className="text-muted-foreground text-xs">—</span>
  }

  return (
    <div className="flex flex-col gap-0.5">
      {ipv4.map((ip) => (
        <IpValue key={ip} ip={ip} className="text-xs" variableMap={variableMap} />
      ))}
      {ipv6.map((ip) => (
        <IpValue key={ip} ip={ip} className="text-xs text-blue-500 dark:text-blue-400" variableMap={variableMap} />
      ))}
    </div>
  )
}
