// @/lib/panw-parser/types.ts

// ─── Color ──────────────────────────────────────────────────────────────────

/** e.g. "color1" → "var(--panw-color1)", undefined → "var(--muted-foreground)" */
export type PanwColorKey = `color${number}`
export type ResolvedColor = `var(--panw-color${number})` | "var(--muted-foreground)"
export type InterfaceMode = "layer3" | "layer2" | "virtual-wire" | "tap" | "ha" | "decrypt-mirror" | "none"

// ─── Tags ────────────────────────────────────────────────────────────────────

export interface PanwTag {
  name: string
  color: ResolvedColor
  colorKey: PanwColorKey | null
  comments: string | null
}

// ─── Addresses ───────────────────────────────────────────────────────────────

export type AddressType = "ip-netmask" | "ip-range" | "fqdn" | "ip-wildcard"

export interface PanwAddress {
  name: string
  type: AddressType
  value: string
  description: string | null
  tags: string[]
  /** Resolved from first tag */
  color: ResolvedColor
}

export interface PanwAddressGroup {
  name: string
  type: "static" | "dynamic"
  /** Static: member address/group names. Dynamic: filter expression string */
  members: string[]
  dynamicFilter: string | null
  description: string | null
  tags: string[]
  color: ResolvedColor
}

// ─── Services ────────────────────────────────────────────────────────────────

export type ServiceProtocol = "tcp" | "udp" | "sctp"

export interface PanwService {
  name: string
  protocol: ServiceProtocol
  port: string
  description: string | null
  tags: string[]
  color: ResolvedColor
}

export interface PanwServiceGroup {
  name: string
  members: string[]
  tags: string[]
  color: ResolvedColor
}

// ─── Applications ────────────────────────────────────────────────────────────

export interface PanwApplicationGroup {
  name: string
  members: string[]
  tags: string[]
  color: ResolvedColor
}

export interface PanwApplicationFilter {
  name: string
  tags: string[]
  color: ResolvedColor
}

// ─── Zones ───────────────────────────────────────────────────────────────────

export type ZoneType = "layer3" | "layer2" | "virtual-wire" | "tap" | "tunnel" | "external" | "unknown"

export interface PanwZone {
  name: string
  type: ZoneType
  interfaces: string[]
  tags: string[]
  color: ResolvedColor
}

// ─── Interfaces ──────────────────────────────────────────────────────────────

export type InterfaceType = "ethernet" | "loopback" | "vlan" | "tunnel" | "ae"

export interface PanwSubInterface {
  name: string
  tag: number | null
  ipAddresses: string[]
  ipv6Addresses: string[]
  comment: string | null
  managementProfile: string | null
}

export interface PanwInterface {
  name: string
  type: InterfaceType
  mode: InterfaceMode
  ipAddresses: string[]
  subInterfaces: PanwSubInterface[]
  comment: string | null
  managementProfile: string | null
  /** For ethernet members of an AE bond: the aggregate interface name e.g. "ae1" */
  aggregateGroup: string | null
  /** True when the interface is configured as a DHCP client */
  dhcpClient: boolean
  /** Panorama: which template this came from */
  templateName: string | null
}

// ─── Routing ─────────────────────────────────────────────────────────────────

export interface PanwStaticRoute {
  name: string
  destination: string
  nexthop: string | null
  interface: string | null
  metric: number | null
}

export interface PanwVirtualRouter {
  name: string
  interfaces: string[]
  staticRoutes: PanwStaticRoute[]
  /** Panorama: which template this came from */
  templateName: string | null
}

// ─── Policies ────────────────────────────────────────────────────────────────

export type PolicyAction = "allow" | "deny" | "drop" | "reset-client" | "reset-server" | "reset-both"
export type RuleType = "universal" | "intrazone" | "interzone"
export type PolicyRulebase = "pre" | "post" | "local"

export interface PanwSecurityRule {
  name: string
  uuid: string | null
  description: string | null
  tags: string[]
  color: ResolvedColor
  groupTag: string | null
  rulebase: PolicyRulebase
  /** Panorama: device group name */
  scope: string
  from: string[]
  to: string[]
  source: string[]
  destination: string[]
  sourceUser: string[]
  application: string[]
  service: string[]
  category: string[]
  sourceHip: string[]
  destinationHip: string[]
  action: PolicyAction
  ruleType: RuleType
  profileGroup: string | null
  logSetting: string | null
  logStart: boolean
  logEnd: boolean
  disabled: boolean
}

export type NatType = "ipv4" | "nat64" | "nptv6"
export type SourceTranslationType = "dynamic-ip-and-port" | "dynamic-ip" | "static-ip" | "none"

export interface PanwNatRule {
  name: string
  uuid: string | null
  description: string | null
  tags: string[]
  color: ResolvedColor
  groupTag: string | null
  rulebase: PolicyRulebase
  scope: string
  from: string[]
  to: string[]
  source: string[]
  destination: string[]
  service: string
  toInterface: string | null
  sourceTranslationType: SourceTranslationType
  disabled: boolean
}

// ─── Security Profiles ───────────────────────────────────────────────────────

export interface PanwProfileGroup {
  name: string
  virus: string | null
  spyware: string | null
  vulnerability: string | null
  urlFiltering: string | null
  fileBlocking: string | null
  wildfireAnalysis: string | null
  dataFiltering: string | null
}

// ─── Network (Panorama Templates) ────────────────────────────────────────────

export interface PanwTemplate {
  name: string
  description: string | null
  interfaces: PanwInterface[]
  virtualRouters: PanwVirtualRouter[]
  logicalRouters: PanwVirtualRouter[]
  zones: PanwZone[]
  dhcpRelayInterfaces: string[]
  // Network counts from template
  vlans: number
  virtualWires: number
  ipsecTunnels: number
  greTunnels: number
  dhcpInterfaces: number
  dnsProxies: number
}

// ─── Device Group (Panorama) ─────────────────────────────────────────────────

export interface PanwDeviceGroup {
  name: string
  description: string | null
  // Deeply parsed objects
  addresses: PanwAddress[]
  addressGroups: PanwAddressGroup[]
  services: PanwService[]
  serviceGroups: PanwServiceGroup[]
  tags: PanwTag[]
  preSecurityRules: PanwSecurityRule[]
  postSecurityRules: PanwSecurityRule[]
  preNatRules: PanwNatRule[]
  postNatRules: PanwNatRule[]
  // Additional policy counts
  qosRules: number
  pbfRules: number
  decryptionRules: number
  tunnelInspectionRules: number
  appOverrideRules: number
  authenticationRules: number
  dosRules: number
  sdwanPolicyRules: number
  // Additional object counts
  externalDynamicLists: number
  schedules: number
  regions: number
  securityProfiles: number
  logForwardingProfiles: number
  authenticationProfiles: number
  decryptionProfiles: number
}

// ─── Template Stacks (Panorama) ──────────────────────────────────────────────

export interface PanwTemplateStack {
  name: string
  templates: string[]
  deviceSerials: string[]
  zoneOverrides: PanwZone[]
}

// ─── Top-level Parsed Config ─────────────────────────────────────────────────

export interface ParsedFirewallConfig {
  deviceType: "firewall"
  hostname: string | null
  panOsVersion: string
  panOsDetailVersion: string
  serialNumber: string | null
  ipAddress: string | null
  platformModel: string | null
  // Objects (deeply parsed)
  tags: PanwTag[]
  addresses: PanwAddress[]
  addressGroups: PanwAddressGroup[]
  services: PanwService[]
  serviceGroups: PanwServiceGroup[]
  applicationGroups: PanwApplicationGroup[]
  applicationFilters: PanwApplicationFilter[]
  profileGroups: PanwProfileGroup[]
  // Network (deeply parsed)
  interfaces: PanwInterface[]
  zones: PanwZone[]
  virtualRouters: PanwVirtualRouter[]
  logicalRouters: PanwVirtualRouter[]
  // Policies (deeply parsed)
  securityRules: PanwSecurityRule[]
  natRules: PanwNatRule[]
  // Additional policy counts
  qosRules: number
  pbfRules: number
  decryptionRules: number
  tunnelInspectionRules: number
  appOverrideRules: number
  authenticationRules: number
  dosRules: number
  sdwanPolicyRules: number
  // Additional object counts
  externalDynamicLists: number
  schedules: number
  regions: number
  securityProfiles: number
  logForwardingProfiles: number
  authenticationProfiles: number
  decryptionProfiles: number
  // Additional network counts
  vlans: number
  virtualWires: number
  ipsecTunnels: number
  greTunnels: number
  dhcpInterfaces: number
  dnsProxies: number
}

export interface ParsedPanoramaConfig {
  deviceType: "panorama"
  hostname: string | null
  panOsVersion: string
  panOsDetailVersion: string
  serialNumber: string | null
  ipAddress: string | null
  platformModel: string | null
  // Shared objects (deeply parsed)
  sharedTags: PanwTag[]
  sharedAddresses: PanwAddress[]
  sharedAddressGroups: PanwAddressGroup[]
  sharedServices: PanwService[]
  sharedServiceGroups: PanwServiceGroup[]
  sharedApplicationGroups: PanwApplicationGroup[]
  sharedApplicationFilters: PanwApplicationFilter[]
  sharedProfileGroups: PanwProfileGroup[]
  sharedPreSecurityRules: PanwSecurityRule[]
  sharedPostSecurityRules: PanwSecurityRule[]
  // Shared object counts
  sharedExternalDynamicLists: number
  sharedSchedules: number
  sharedRegions: number
  sharedSecurityProfiles: number
  sharedLogForwardingProfiles: number
  sharedAuthenticationProfiles: number
  sharedDecryptionProfiles: number
  // Device groups (include per-DG counts)
  deviceGroups: PanwDeviceGroup[]
  // Templates (include per-template network counts)
  templates: PanwTemplate[]
  templateStacks: PanwTemplateStack[]
}

export type ParsedConfig = ParsedFirewallConfig | ParsedPanoramaConfig

export interface ParseError {
  code: "INVALID_XML" | "UNKNOWN_DEVICE_TYPE" | "MISSING_ROOT" | "PARSE_FAILED"
  message: string
}

export type ParseResult =
  | { success: true; config: ParsedConfig }
  | { success: false; error: ParseError }
