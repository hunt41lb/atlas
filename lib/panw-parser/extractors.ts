// @/lib/panw-parser/extractors.ts

import { resolvePanwColor, resolveFirstTagColor } from "./color"
import { str, members, entries, entryName, entryUuid, dig, membersAt, yesNo } from "./xml-helpers"
import type {
  PanwTag, PanwAddress, PanwAddressGroup, PanwService, PanwServiceGroup,
  PanwApplicationGroup, PanwApplicationFilter, PanwProfileGroup,
  PanwZone, PanwInterface, PanwSubInterface, PanwVirtualRouter, PanwStaticRoute,
  PanwSecurityRule, PanwNatRule, PanwColorKey, PolicyRulebase,
  PolicyAction, RuleType, ZoneType, InterfaceType, InterfaceMode,
  SourceTranslationType, TemplateVariableType, PanwTemplateVariable,
  PanwVlan, PanwVlanMac,
  PanwVirtualWire,
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
    const networkEl = entry["network"] as Record<string, unknown> | undefined

    const tagColor = resolveFirstTagColor(tagNames, tagColorMap)
    const color = tagColor !== "var(--muted-foreground)"
      ? tagColor
      : resolveFirstTagColor([entryName(entry)], tagColorMap)

    return {
      name: entryName(entry),
      type,
      interfaces: zoneInterfaces(entry, type),
      tags: tagNames,
      color,
      zoneProtectionProfile: str(dig(networkEl, "zone-protection-profile")) ?? null,
      logSetting: str(dig(networkEl, "log-setting")) ?? null,
      netInspection: str(dig(networkEl, "net-inspection")) === "yes",
      enableUserIdentification: str(entry["enable-user-identification"]) === "yes",
      enableDeviceIdentification: str(entry["enable-device-identification"]) === "yes",
      prenatUserIdentification: str(dig(networkEl, "prenat-identification", "enable-prenat-user-identification")) === "yes",
      prenatDeviceIdentification: str(dig(networkEl, "prenat-identification", "enable-prenat-device-identification")) === "yes",
      prenatSourceLookup: str(dig(networkEl, "prenat-identification", "enable-prenat-source-policy-lookup")) === "yes",
      prenatSourceIpDownstream: str(dig(networkEl, "prenat-identification", "enable-prenat-source-ip-downstream")) === "yes",
      userAclInclude: members(dig(entry, "user-acl", "include-list")),
      userAclExclude: members(dig(entry, "user-acl", "exclude-list")),
      deviceAclInclude: members(dig(entry, "device-acl", "include-list")),
      deviceAclExclude: members(dig(entry, "device-acl", "exclude-list")),
    }
  })
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

function extractSubInterfaces(unitsEl: unknown): PanwSubInterface[] {
  return entries(unitsEl).map((entry) => {
    const ipEntries = entries(dig(entry, "ip"))
    const ipAddresses = ipEntries.map((ip) => entryName(ip)).filter(Boolean)

    // IPv6 addresses
    const ipv6Entries = entries(dig(entry, "ipv6", "address"))
    const ipv6Addresses = ipv6Entries.map((ip) => entryName(ip)).filter(Boolean)

    // Feature flags
    const bonjourEnabled = str(dig(entry, "bonjour", "enable")) === "yes"
    const ndpProxy = str(dig(entry, "ndp-proxy", "enabled")) === "yes"
    const adjustTcpMss = str(dig(entry, "adjust-tcp-mss", "enable")) === "yes"
    const sdwanEnabled = str(dig(entry, "sdwan-link-settings", "enable")) === "yes"
    const dhcpClient = dig(entry, "dhcp-client") !== undefined

    return {
      name: entryName(entry),
      tag: entry["tag"] !== undefined ? Number(entry["tag"]) : null,
      ipAddresses,
      ipv6Addresses,
      comment: str(entry["comment"]),
      managementProfile: str(entry["interface-management-profile"]),
      bonjourEnabled,
      ndpProxy,
      adjustTcpMss,
      sdwanEnabled,
      dhcpClient,
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

    // For tunnel/loopback/vlan, there is no mode wrapper — IP, IPv6, units,
    // and feature elements sit directly on the entry.  For ethernet/ae they
    // live inside the mode element (e.g. <layer3>).  We use `propEl` as the
    // element to read these shared properties from.
    const propEl: Record<string, unknown> = modeEl ?? entry

    // Direct IP addresses on the interface
    const directIpEntries = entries(dig(propEl, "ip"))
    const directIps = directIpEntries.map((ip) => entryName(ip)).filter(Boolean)

    // IPv6 addresses on the parent interface
    const ipv6Entries = entries(dig(propEl, "ipv6", "address"))
    const ipv6Addresses = ipv6Entries.map((ip) => entryName(ip)).filter(Boolean)

    // Sub-interfaces (units)
    const subInterfaces = extractSubInterfaces(dig(propEl, "units"))

    // Aggregate Groups
    const aggregateGroup = str(entry["aggregate-group"]) ?? null

    // DHCP Client
    const dhcpClient =
      dig(entry["layer3"] as Record<string, unknown> | null, "dhcp-client") !== undefined

    // LLDP — lives inside the mode element (e.g. <layer3><lldp>)
    const lldpEnabled = str(dig(modeEl, "lldp", "enable")) === "yes"
    const lldpProfile = str(dig(modeEl, "lldp", "profile"))

    // NDP Proxy — can be on modeEl (ethernet) or directly on entry (vlan/loopback)
    const ndpProxy = str(dig(propEl, "ndp-proxy", "enabled")) === "yes"

    // SD-WAN Link Settings
    const sdwanEnabled = str(dig(propEl, "sdwan-link-settings", "enable")) === "yes"

    // LACP (aggregate-ethernet interfaces only)
    const lacpEnabled = str(dig(modeEl, "lacp", "enable")) === "yes"
    const lacpMode = str(dig(modeEl, "lacp", "mode"))
    const lacpTransmissionRate = str(dig(modeEl, "lacp", "transmission-rate"))

    // ── New fields ───────────────────────────────────────────────────────
    // MTU — direct on entry for tunnel/loopback/vlan, inside modeEl for ethernet
    const mtuRaw = str(propEl["mtu"]) ?? str(entry["mtu"])
    const mtu = mtuRaw ? Number(mtuRaw) : null

    // Netflow Profile — same pattern
    const netflowProfile = str(propEl["netflow-profile"]) ?? str(entry["netflow-profile"]) ?? null

    // Adjust TCP MSS — lives on propEl for all types
    const adjustTcpMss = str(dig(propEl, "adjust-tcp-mss", "enable")) === "yes"

    // DDNS Config — present on vlan interfaces
    const ddnsEnabled = dig(propEl, "ddns-config") !== undefined

    // PoE — lives directly on the ethernet entry (not inside mode)
    const poeConfigured = dig(entry, "poe") !== undefined
    const poeEnabled = str(dig(entry, "poe", "poe-enabled")) === "yes"
    const poeRsvd = str(dig(entry, "poe", "poe-rsvd-pwr"))
    const poeReservedPower = poeRsvd ? Number(poeRsvd) : null

    return {
      name: entryName(entry),
      type,
      mode,
      ipAddresses: directIps,
      ipv6Addresses,
      subInterfaces,
      comment: str(entry["comment"]),
      managementProfile: str(entry["interface-management-profile"]),
      aggregateGroup,
      dhcpClient,
      templateName,
      lldpEnabled,
      lldpProfile,
      ndpProxy,
      sdwanEnabled,
      lacpEnabled,
      lacpMode,
      lacpTransmissionRate,
      mtu,
      netflowProfile,
      adjustTcpMss,
      ddnsEnabled,
      poeConfigured,
      poeEnabled,
      poeReservedPower,
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
    ...extractInterfacesOfType(ifaceEl["aggregate-ethernet"], "ae", templateName),
    // Loopback, VLAN, and Tunnel entries are nested inside <units>
    ...extractInterfacesOfType(dig(ifaceEl["loopback"], "units"), "loopback", templateName),
    ...extractInterfacesOfType(dig(ifaceEl["vlan"], "units"), "vlan", templateName),
    ...extractInterfacesOfType(dig(ifaceEl["tunnel"], "units"), "tunnel", templateName),
  ]
}

// ─── VLANs ────────────────────────────────────────────────────────────────────

export function extractVlans(
  networkEl: unknown,
  templateName: string | null
): PanwVlan[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const net = networkEl as Record<string, unknown>
  const vlanEl = net["vlan"]

  return entries(vlanEl).map((entry) => {
    const macEntries = entries(dig(entry, "mac"))
    const staticMacs: PanwVlanMac[] = macEntries.map((m) => ({
      mac: entryName(m),
      interface: str(m["interface"]) ?? null,
    }))

    return {
      name: entryName(entry),
      virtualInterface: str(dig(entry, "virtual-interface", "interface")) ?? null,
      memberInterfaces: members(dig(entry, "interface")),
      staticMacs,
      templateName,
    }
  })
}

// ─── Virtual Wires ────────────────────────────────────────────────────────────

export function extractVirtualWires(
  networkEl: unknown,
  templateName: string | null
): PanwVirtualWire[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const net = networkEl as Record<string, unknown>
  const vwEl = net["virtual-wire"]

  return entries(vwEl).map((entry) => ({
    name: entryName(entry),
    interface1: str(entry["interface1"]) ?? null,
    interface2: str(entry["interface2"]) ?? null,
    tagAllowed: str(entry["tag-allowed"]) ?? null,
    multicastFirewalling: str(dig(entry, "multicast-firewalling", "enable")) === "yes",
    templateName,
  }))
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

// ───  DHCP Relay ──────────────────────────────────────────────────────────────

export function extractDhcpRelayInterfaces(networkEl: unknown): string[] {
  if (!networkEl || typeof networkEl !== "object") return []
  const net = networkEl as Record<string, unknown>
  const dhcpIfaceEntries = entries(dig(net, "dhcp", "interface"))
  return dhcpIfaceEntries
    .filter((entry) => {
      // Check if relay is configured (IPv4 or IPv6 enabled)
      const ipEnabled = str(dig(entry, "relay", "ip", "enabled"))
      const ipv6Enabled = str(dig(entry, "relay", "ipv6", "enabled"))
      return ipEnabled === "yes" || ipv6Enabled === "yes"
    })
    .map((entry) => entryName(entry))
    .filter(Boolean)
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

export function extractTemplateVariables(variableEl: unknown): PanwTemplateVariable[] {
   return entries(variableEl).map((entry) => {
     const typeEl = entry["type"] as Record<string, unknown> | undefined

     // Type contains a single key whose name is the variable type
     // and whose value is the resolved value
     let type: TemplateVariableType = "ip-netmask"
     let value = ""

     if (typeEl) {
       for (const key of ["ip-netmask", "ip-range", "fqdn", "ip-wildcard"] as const) {
         if (typeEl[key] !== undefined) {
           type = key
           value = str(typeEl[key]) ?? ""
           break
         }
       }
     }

     return {
       name: entryName(entry),
       type,
       value,
       description: str(entry["description"]),
     }
   })
}
