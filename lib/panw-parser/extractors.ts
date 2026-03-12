// @/lib/panw-parser/extractors.ts

import { resolvePanwColor, resolveFirstTagColor } from "./color"
import { str, members, entries, entryName, entryUuid, dig, membersAt, yesNo } from "./xml-helpers"
import type {
  PanwTag, PanwAddress, PanwAddressGroup, PanwService, PanwServiceGroup,
  PanwApplicationGroup, PanwApplicationFilter, PanwProfileGroup,
  PanwZone, PanwInterface, PanwSubInterface, PanwVirtualRouter, PanwStaticRoute,
  PanwSecurityRule, PanwNatRule, PanwColorKey, PolicyRulebase,
  PolicyAction, RuleType, ZoneType, InterfaceType, InterfaceMode,
  SourceTranslationType,
} from "./types"

// ─── Tags ────────────────────────────────────────────────────────────────────

export function extractTags(tagEl: unknown): PanwTag[] {
  return entries(tagEl).map((entry) => {
    const colorKey = str(entry["color"]) as PanwColorKey | null
    return {
      name: entryName(entry),
      colorKey,
      color: resolvePanwColor(colorKey),
      comments: str(entry["comments"]),
    }
  })
}

/** Build a name→colorKey lookup map from extracted tags */
export function buildTagColorMap(tags: PanwTag[]): Map<string, PanwColorKey | null> {
  return new Map(tags.map((t) => [t.name, t.colorKey]))
}

// ─── Addresses ───────────────────────────────────────────────────────────────

export function extractAddresses(
  addrEl: unknown,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwAddress[] {
  return entries(addrEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    const ipNetmask = str(entry["ip-netmask"])
    const ipRange = str(entry["ip-range"])
    const fqdn = str(entry["fqdn"])
    const ipWildcard = str(entry["ip-wildcard"])

    const type = ipNetmask ? "ip-netmask"
      : ipRange ? "ip-range"
      : fqdn ? "fqdn"
      : "ip-wildcard"

    const value = ipNetmask ?? ipRange ?? fqdn ?? ipWildcard ?? ""

    return {
      name: entryName(entry),
      type,
      value,
      description: str(entry["description"]),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
    }
  })
}

// ─── Address Groups ───────────────────────────────────────────────────────────

export function extractAddressGroups(
  agEl: unknown,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwAddressGroup[] {
  return entries(agEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    const staticEl = entry["static"]
    const dynamicEl = entry["dynamic"]
    const isStatic = staticEl !== undefined && staticEl !== null

    const staticMembers = isStatic ? members(staticEl) : []
    const dynamicFilter = isStatic ? null : str(dig(dynamicEl, "filter"))

    return {
      name: entryName(entry),
      type: isStatic ? "static" : "dynamic",
      members: staticMembers,
      dynamicFilter,
      description: str(entry["description"]),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
    }
  })
}

// ─── Services ────────────────────────────────────────────────────────────────

export function extractServices(
  svcEl: unknown,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwService[] {
  return entries(svcEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    const proto = entry["protocol"] as Record<string, unknown> | undefined
    const tcpEl = dig(proto, "tcp")
    const udpEl = dig(proto, "udp")
    const sctpEl = dig(proto, "sctp")

    const protocol = tcpEl ? "tcp" : udpEl ? "udp" : "sctp"
    const protoData = (tcpEl ?? udpEl ?? sctpEl) as Record<string, unknown> | undefined
    const port = str(protoData?.["port"]) ?? ""

    return {
      name: entryName(entry),
      protocol,
      port,
      description: str(entry["description"]),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
    }
  })
}

// ─── Service Groups ───────────────────────────────────────────────────────────

export function extractServiceGroups(
  sgEl: unknown,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwServiceGroup[] {
  return entries(sgEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    return {
      name: entryName(entry),
      members: members(entry["members"]),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
    }
  })
}

// ─── Application Groups ───────────────────────────────────────────────────────

export function extractApplicationGroups(
  agEl: unknown,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwApplicationGroup[] {
  return entries(agEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    return {
      name: entryName(entry),
      members: members(entry["members"]),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
    }
  })
}

// ─── Application Filters ──────────────────────────────────────────────────────

export function extractApplicationFilters(
  afEl: unknown,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwApplicationFilter[] {
  return entries(afEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    return {
      name: entryName(entry),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
    }
  })
}

// ─── Profile Groups ───────────────────────────────────────────────────────────

export function extractProfileGroups(pgEl: unknown): PanwProfileGroup[] {
  return entries(pgEl).map((entry) => ({
    name: entryName(entry),
    virus: str(entry["virus"]),
    spyware: str(entry["spyware"]),
    vulnerability: str(entry["vulnerability"]),
    urlFiltering: str(entry["url-filtering"]),
    fileBlocking: str(entry["file-blocking"]),
    wildfireAnalysis: str(entry["wildfire-analysis"]),
    dataFiltering: str(entry["data-filtering"]),
  }))
}

// ─── Zones ────────────────────────────────────────────────────────────────────

function detectZoneType(entry: Record<string, unknown>): ZoneType {
  const net = entry["network"] as Record<string, unknown> | undefined
  if (!net) return "unknown"
  if (net["layer3"] !== undefined) return "layer3"
  if (net["layer2"] !== undefined) return "layer2"
  if (net["virtual-wire"] !== undefined) return "virtual-wire"
  if (net["tap"] !== undefined) return "tap"
  if (net["tunnel"] !== undefined) return "tunnel"
  if (net["external"] !== undefined) return "external"
  return "unknown"
}

function zoneInterfaces(entry: Record<string, unknown>, type: ZoneType): string[] {
  const net = entry["network"] as Record<string, unknown> | undefined
  if (!net) return []
  const typeEl = net[type]
  if (!typeEl) return []
  return membersAt(typeEl, "member").length > 0
    ? membersAt(typeEl, "member")
    : members(typeEl)
}

export function extractZones(
  zoneEl: unknown,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwZone[] {
  return entries(zoneEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    const type = detectZoneType(entry)
    return {
      name: entryName(entry),
      type,
      interfaces: zoneInterfaces(entry, type),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
    }
  })
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

function extractSubInterfaces(unitsEl: unknown): PanwSubInterface[] {
  return entries(unitsEl).map((entry) => {
    const ipEntries = entries(dig(entry, "ip"))
    const ipAddresses = ipEntries.map((ip) => entryName(ip)).filter(Boolean)
    return {
      name: entryName(entry),
      tag: entry["tag"] !== undefined ? Number(entry["tag"]) : null,
      ipAddresses,
      comment: str(entry["comment"]),
      managementProfile: str(entry["interface-management-profile"]),
    }
  })
}

function detectInterfaceMode(entry: Record<string, unknown>): InterfaceMode {
  if (entry["layer3"]) return "layer3"
  if (entry["layer2"]) return "layer2"
  if (entry["virtual-wire"]) return "virtual-wire"
  if (entry["tap"]) return "tap"
  if (entry["ha"]) return "ha"
  if (entry["decrypt-mirror"]) return "decrypt-mirror"
  return "none"
}

function extractInterfacesOfType(
  ifaceEl: unknown,
  type: InterfaceType,
  templateName: string | null
): PanwInterface[] {
  return entries(ifaceEl).map((entry) => {
    const mode = detectInterfaceMode(entry)
    const modeEl = mode !== "none" ? (entry[mode] as Record<string, unknown>) : null

    // Direct IP addresses on the interface
    const directIpEntries = entries(dig(modeEl, "ip"))
    const directIps = directIpEntries.map((ip) => entryName(ip)).filter(Boolean)

    // Sub-interfaces
    const subInterfaces = modeEl ? extractSubInterfaces(dig(modeEl, "units")) : []

    const aggregateGroup = str(entry["aggregate-group"]) ?? null
    const dhcpClient = !!(
      dig(entry["layer3"] as Record<string, unknown> | null, "dhcp-client")
    )

    return {
      name: entryName(entry),
      type,
      mode,
      ipAddresses: directIps,
      subInterfaces,
      comment: str(entry["comment"]),
      managementProfile: str(entry["interface-management-profile"]),
      aggregateGroup,
      dhcpClient,
      templateName,
    }
  })
}

export function extractInterfaces(
  networkEl: unknown,
  templateName: string | null
): PanwInterface[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const net = networkEl as Record<string, unknown>
  const ifaceEl = net["interface"] as Record<string, unknown> | undefined
  if (!ifaceEl) return []

  return [
    ...extractInterfacesOfType(ifaceEl["ethernet"], "ethernet", templateName),
    ...extractInterfacesOfType(ifaceEl["loopback"], "loopback", templateName),
    ...extractInterfacesOfType(ifaceEl["vlan"], "vlan", templateName),
    ...extractInterfacesOfType(ifaceEl["tunnel"], "tunnel", templateName),
    ...extractInterfacesOfType(ifaceEl["aggregate-ethernet"], "ae", templateName),
  ]
}

// ─── Virtual Routers ──────────────────────────────────────────────────────────

export function extractVirtualRouters(
  networkEl: unknown,
  templateName: string | null
): PanwVirtualRouter[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const net = networkEl as Record<string, unknown>
  const vrEl = net["virtual-router"]

  return entries(vrEl).map((entry) => {
    const ifaces = membersAt(entry, "interface")
    const routeEntries = entries(dig(entry, "routing-table", "ip", "static-route"))
    const staticRoutes: PanwStaticRoute[] = routeEntries.map((r) => {
      const nexthopEl = r["nexthop"] as Record<string, unknown> | undefined
      const nexthop = nexthopEl
        ? str(nexthopEl["ip-address"]) ?? str(nexthopEl["next-vr"])
        : null
      return {
        name: entryName(r),
        destination: str(r["destination"]) ?? "",
        nexthop,
        interface: str(r["interface"]),
        metric: r["metric"] !== undefined ? Number(r["metric"]) : null,
      }
    })

    return {
      name: entryName(entry),
      interfaces: ifaces,
      staticRoutes,
      templateName,
    }
  })
}

// ─── Logical Routers (PAN-OS 11+) ────────────────────────────────────────────

export function extractLogicalRouters(
  networkEl: unknown,
  templateName: string | null
): PanwVirtualRouter[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const net = networkEl as Record<string, unknown>
  const lrEl = net["logical-router"]
  if (!lrEl) return []

  return entries(lrEl).flatMap((lrEntry) => {
    const lrName = entryName(lrEntry)
    // Each LR has one or more VRFs; we flatten them all (usually just "default")
    return entries(dig(lrEntry, "vrf")).map((vrfEntry) => {
      const vrfName = entryName(vrfEntry)
      const displayName = vrfName === "default" ? lrName : `${lrName}/${vrfName}`

      const ifaces = membersAt(vrfEntry, "interface")
      const routeEntries = entries(dig(vrfEntry, "routing-table", "ip", "static-route"))
      const staticRoutes: PanwStaticRoute[] = routeEntries.map((r) => {
        const nexthopEl = r["nexthop"] as Record<string, unknown> | undefined
        const nexthop = nexthopEl
          ? str(nexthopEl["ip-address"])
            ?? str(nexthopEl["next-vr"])
            ?? str(nexthopEl["next-lr"])
          : null
        return {
          name: entryName(r),
          destination: str(r["destination"]) ?? "",
          nexthop,
          interface: str(r["interface"]),
          metric: r["metric"] !== undefined ? Number(r["metric"]) : null,
        }
      })

      return {
        name: displayName,
        interfaces: ifaces,
        staticRoutes,
        templateName,
      }
    })
  })
}

// ─── Security Rules ───────────────────────────────────────────────────────────

export function extractSecurityRules(
  rulesEl: unknown,
  scope: string,
  rulebase: PolicyRulebase,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwSecurityRule[] {
  return entries(rulesEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    const profileSetting = entry["profile-setting"] as Record<string, unknown> | undefined
    const profileGroup = profileSetting ? str(profileSetting["group"]) ?? str(members(profileSetting["group"])[0]) : null

    return {
      name: entryName(entry),
      uuid: entryUuid(entry),
      description: str(entry["description"]),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
      groupTag: str(entry["group-tag"]),
      rulebase,
      scope,
      from: membersAt(entry, "from"),
      to: membersAt(entry, "to"),
      source: membersAt(entry, "source"),
      destination: membersAt(entry, "destination"),
      sourceUser: membersAt(entry, "source-user"),
      application: membersAt(entry, "application"),
      service: membersAt(entry, "service"),
      category: membersAt(entry, "category"),
      sourceHip: membersAt(entry, "source-hip"),
      destinationHip: membersAt(entry, "destination-hip"),
      action: (str(entry["action"]) ?? "deny") as PolicyAction,
      ruleType: (str(entry["rule-type"]) ?? "universal") as RuleType,
      profileGroup,
      logSetting: str(entry["log-setting"]),
      logStart: yesNo(entry["log-start"]),
      logEnd: yesNo(entry["log-end"]),
      disabled: yesNo(entry["disabled"]),
    }
  })
}

// ─── NAT Rules ────────────────────────────────────────────────────────────────

function detectSourceTranslationType(natEl: unknown): SourceTranslationType {
  if (!natEl || typeof natEl !== "object") return "none"
  const obj = natEl as Record<string, unknown>
  const src = obj["source-translation"] as Record<string, unknown> | undefined
  if (!src) return "none"
  if (src["dynamic-ip-and-port"]) return "dynamic-ip-and-port"
  if (src["dynamic-ip"]) return "dynamic-ip"
  if (src["static-ip"]) return "static-ip"
  return "none"
}

export function extractNatRules(
  rulesEl: unknown,
  scope: string,
  rulebase: PolicyRulebase,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwNatRule[] {
  return entries(rulesEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    return {
      name: entryName(entry),
      uuid: entryUuid(entry),
      description: str(entry["description"]),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
      groupTag: str(entry["group-tag"]),
      rulebase,
      scope,
      from: membersAt(entry, "from"),
      to: membersAt(entry, "to"),
      source: membersAt(entry, "source"),
      destination: membersAt(entry, "destination"),
      service: str(entry["service"]) ?? "any",
      toInterface: str(entry["to-interface"]),
      sourceTranslationType: detectSourceTranslationType(entry),
      disabled: yesNo(entry["disabled"]),
    }
  })
}

