// @/lib/panw-parser/types.ts

import type { PanwBfdProfile, PanwBgpRoutingProfiles, PanwRoutingFilters } from "./routing-profiles"

// ─── Color ──────────────────────────────────────────────────────────────────

/** e.g. "color1" → "var(--panw-color1)", undefined → "var(--muted-foreground)" */
export type PanwColorKey = `color${number}`
export type ResolvedColor = `var(--panw-color${number})` | "var(--muted-foreground)"
export type InterfaceMode = "layer3" | "layer2" | "virtual-wire" | "tap" | "ha" | "decrypt-mirror" | "none"
export type TemplateVariableType = "ip-netmask" | "ip-range" | "fqdn" | "ip-wildcard"

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
  zoneProtectionProfile: string | null
  logSetting: string | null
  netInspection: boolean
  enableUserIdentification: boolean
  enableDeviceIdentification: boolean
  userAclInclude: string[]
  userAclExclude: string[]
  deviceAclInclude: string[]
  deviceAclExclude: string[]
  prenatUserIdentification: boolean
  prenatDeviceIdentification: boolean
  prenatSourceLookup: boolean
  prenatSourceIpDownstream: boolean
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
  // ── Feature flags ──────────────────────────────────────────────────────
  bonjourEnabled: boolean
  ndpProxy: boolean
  adjustTcpMss: boolean
  sdwanEnabled: boolean
  dhcpClient: boolean
}

export interface PanwInterface {
  name: string
  type: InterfaceType
  mode: InterfaceMode
  ipAddresses: string[]
  ipv6Addresses: string[]            // ← NEW: was missing on parent
  subInterfaces: PanwSubInterface[]
  comment: string | null
  managementProfile: string | null
  aggregateGroup: string | null
  /** Panorama: which template this came from */
  templateName: string | null
  // ── Feature flags ──────────────────────────────────────────────────────
  dhcpClient: boolean
  lldpEnabled: boolean
  lldpProfile: string | null
  ndpProxy: boolean
  sdwanEnabled: boolean
  // ── LACP (AE interfaces only) ──────────────────────────────────────────
  lacpEnabled: boolean
  lacpMode: string | null
  lacpTransmissionRate: string | null
  mtu: number | null
  netflowProfile: string | null
  adjustTcpMss: boolean
  ddnsEnabled: boolean
  poeConfigured: boolean
  poeEnabled: boolean
  poeReservedPower: number | null
}

// ─── VLANs ───────────────────────────────────────────────────────────────────

export interface PanwVlanMac {
  mac: string
  interface: string | null
}

export interface PanwVlan {
  name: string
  virtualInterface: string | null
  memberInterfaces: string[]
  staticMacs: PanwVlanMac[]
  /** Panorama: which template this came from */
  templateName: string | null
}

// ─── Virtual Wires ───────────────────────────────────────────────────────────

export interface PanwVirtualWire {
  name: string
  interface1: string | null
  interface2: string | null
  tagAllowed: string | null
  multicastFirewalling: boolean
  /** Panorama: which template this came from */
  templateName: string | null
}

// ─── Routing ─────────────────────────────────────────────────────────────────

export interface PanwPathMonitorDestination {
  name: string
  enabled: boolean
  source: string | null
  sourceOverride: string | null
  destinationType: string | null
  destinationIp: string | null
  destinationFqdn: string | null
  interval: number | null
  count: number | null
}

export interface PanwStaticRoute {
  name: string
  destination: string
  nexthopType: string
  nexthop: string | null
  adminDistance: number | null
  interface: string | null
  metric: number | null
  routeTable: string | null
  bfdProfile: string | null
  pathMonitorEnabled: boolean
  pathMonitorFailureCondition: string | null
  pathMonitorHoldTime: number | null
  monitorDestinations: PanwPathMonitorDestination[]
}

export interface PanwAdminDistances {
  static: number | null
  staticIpv6: number | null
  ospfIntra: number | null
  ospfInter: number | null
  ospfExt: number | null
  ospfv3Intra: number | null
  ospfv3Inter: number | null
  ospfv3Ext: number | null
  bgpInternal: number | null
  bgpExternal: number | null
  bgpLocal: number | null
  rip: number | null
}

export interface PanwRedistProfile {
  name: string
  priority: number | null
  action: string
  filterTypes: string[]
  filterInterfaces: string[]
  filterDestinations: string[]
  filterNexthops: string[]
}

// ─── RIP ─────────────────────────────────────────────────────────────────────

export interface PanwRipInterface {
  name: string
  enabled: boolean
  mode: string | null
  bfdProfile: string | null
  defaultRouteAdvertise: boolean
  defaultRouteMetric: number | null
  authProfile: string | null
}

export interface PanwRipTimers {
  intervalSeconds: number | null
  updateIntervals: number | null
  expireIntervals: number | null
  deleteIntervals: number | null
}

export interface PanwRipConfig {
  enabled: boolean
  globalBfdProfile: string | null
  rejectDefaultRoute: boolean
  interfaces: PanwRipInterface[]
  timers: PanwRipTimers | null
}

// ─── OSPF ────────────────────────────────────────────────────────────────────

export interface PanwOspfInterface {
  name: string
  enabled: boolean
  passive: boolean
  metric: number | null
  priority: number | null
  helloInterval: number | null
  deadCounts: number | null
  retransmitInterval: number | null
  transitDelay: number | null
  grDelay: number | null
  linkType: string | null
  bfdProfile: string | null
}

export interface PanwOspfArea {
  id: string
  type: string
  interfaces: PanwOspfInterface[]
}

export interface PanwOspfConfig {
  enabled: boolean
  routerId: string | null
  globalBfdProfile: string | null
  rejectDefaultRoute: boolean
  areas: PanwOspfArea[]
}

// ─── OSPFv3 ──────────────────────────────────────────────────────────────────

export interface PanwOspfv3Interface {
  name: string
  enabled: boolean
  passive: boolean
  instanceId: number | null
  metric: number | null
  priority: number | null
  helloInterval: number | null
  deadCounts: number | null
  retransmitInterval: number | null
  transitDelay: number | null
  grDelay: number | null
  linkType: string | null
  bfdProfile: string | null
}

export interface PanwOspfv3Area {
  id: string
  type: string
  interfaces: PanwOspfv3Interface[]
}

export interface PanwOspfv3Config {
  enabled: boolean
  routerId: string | null
  globalBfdProfile: string | null
  rejectDefaultRoute: boolean
  areas: PanwOspfv3Area[]
}

// ─── BGP ─────────────────────────────────────────────────────────────────────

export interface PanwBgpPeer {
  name: string
  enabled: boolean
  peerAs: string | null
  peerAddress: string | null
  localInterface: string | null
  bfdProfile: string | null
  maxPrefixes: number | null
  addressFamily: string | null
  reflectorClient: string | null
  peeringType: string | null
}

export interface PanwBgpPeerGroup {
  name: string
  enabled: boolean
  type: string | null
  peers: PanwBgpPeer[]
}

export interface PanwBgpConfig {
  enabled: boolean
  routerId: string | null
  localAs: string | null
  installRoute: boolean
  gracefulRestartEnabled: boolean
  rejectDefaultRoute: boolean
  peerGroups: PanwBgpPeerGroup[]
}

// ─── Multicast ───────────────────────────────────────────────────────────────

export interface PanwMulticastInterfaceGroup {
  name: string
  description: string | null
  interfaces: string[]
  pimEnabled: boolean
  igmpEnabled: boolean
  igmpVersion: string | null
}

export interface PanwMulticastConfig {
  enabled: boolean
  interfaceGroups: PanwMulticastInterfaceGroup[]
}

export interface PanwVirtualRouter {
  name: string
  interfaces: string[]
  staticRoutes: PanwStaticRoute[]
  staticRoutesV6: PanwStaticRoute[]
  /** Panorama: which template this came from */
  templateName: string | null
  // ── ECMP ───────────────────────────────────────────────────────────────
  ecmpEnabled: boolean
  ecmpAlgorithm: string | null
  ecmpStrictSourcePath: boolean
  ecmpSymmetricReturn: boolean
  // ── Protocol summary flags ─────────────────────────────────────────────
  bgp: PanwBgpConfig
  ospf: PanwOspfConfig
  ospfv3: PanwOspfv3Config
  // ── RIP ────────────────────────────────────────────────────────────────
  rip: PanwRipConfig
  // ── Redistribution ─────────────────────────────────────────────────────
  redistProfiles: PanwRedistProfile[]
  // ── Multicast ──────────────────────────────────────────────────────────
  multicast: PanwMulticastConfig
  // ── Admin Distances ────────────────────────────────────────────────────
  adminDistances: PanwAdminDistances | null
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
  variables: PanwTemplateVariable[]
  // Network counts from template
  vlans: PanwVlan[]
  virtualWires: PanwVirtualWire[]
  bfdProfiles: PanwBfdProfile[]
  bgpRoutingProfiles: PanwBgpRoutingProfiles
  routingFilters: PanwRoutingFilters
  ipsecTunnels: number
  greTunnels: number
  dhcpInterfaces: number
  dnsProxies: number
}

export interface PanwTemplateVariable {
  /** Variable name including $ prefix, e.g. "$DOMAIN_SERVICES_IPV4_SUBNET" */
  name: string
  /** The variable type (ip-netmask, fqdn, etc.) */
  type: TemplateVariableType
  /** The resolved value, e.g. "10.11.11.62/26" or "dc01.ndit.io" */
  value: string
  /** Human-readable description */
  description: string | null
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
  vlans: PanwVlan[]
  virtualWires: PanwVirtualWire[]
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

