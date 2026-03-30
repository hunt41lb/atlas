// @/lib/panw-parser/types.ts

import type { PanwBfdProfile, PanwBgpRoutingProfiles, PanwMulticastRoutingProfiles, PanwOspfRoutingProfiles, PanwOspfv3RoutingProfiles, PanwRipRoutingProfiles, PanwRoutingFilters } from "./routing-profiles"
import type { PanwInterfaceMgmtProfile, PanwMonitorProfile, PanwZoneProtectionProfile, PanwIkeCryptoProfile } from "./network-profiles"

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

// ─── Shared sub-types for LR protocol references ─────────────────────────────
export interface PanwLrAreaRef {
  id: string
  abrImportList: string | null
  abrExportList: string | null
  abrInboundFilterList: string | null
  abrOutboundFilterList: string | null
  authProfile: string | null
  interfaces: {
    name: string
    timingProfile: string | null
    authProfile: string | null
    bfdProfile: string | null
  }[]
}

export interface PanwLrOspfRefs {
  enabled: boolean
  routerId: string | null
  redistProfileName: string | null
  spfTimerName: string | null
  globalIfTimerName: string | null
  globalBfdProfile: string | null
  areas: PanwLrAreaRef[]
}

export interface PanwLrRipRefs {
  enabled: boolean
  globalTimerName: string | null
  authProfileName: string | null
  redistProfileName: string | null
  globalBfdProfile: string | null
  globalInboundDistList: string | null
  globalOutboundDistList: string | null
  interfaces: {
    name: string
    inboundDistList: string | null
    inboundDistMetric: number | null
    outboundDistList: string | null
    outboundDistMetric: number | null
    authProfile: string | null
    bfdProfile: string | null
  }[]
}

export interface PanwLrBgpPeerGroup {
  name: string
  enabled: boolean
  type: string | null
  addressFamily: { ipv4: string | null; ipv6: string | null }
  filteringProfile: { ipv4: string | null; ipv6: string | null }
  connectionOptions: { auth: string | null; timers: string | null; dampening: string | null; multihop: string | null }
  peers: {
    name: string
    enabled: boolean
    peerAs: string | null
    inherit: boolean
    localAddress: string | null
    peerAddress: string | null
    passive: boolean
    senderSideLoopDetection: boolean
    connectionOptions: { auth: string | null; timers: string | null; dampening: string | null; multihop: string | null }
    bfdProfile: string | null
  }[]
}

export interface PanwLrBgpAggregateRoute {
  name: string
  description: string | null
  enabled: boolean
  asSet: boolean
  summaryOnly: boolean
  sameMed: boolean
  type: "ipv4" | "ipv6" | null
  summaryPrefix: string | null
  suppressMap: string | null
  attributeMap: string | null
}

export interface PanwLrBgpRefs {
  enabled: boolean
  routerId: string | null
  localAs: string | null
  globalBfdProfile: string | null
  redistProfile: { ipv4Unicast: string | null; ipv6Unicast: string | null }
  peerGroups: PanwLrBgpPeerGroup[]
  aggregateRoutes: PanwLrBgpAggregateRoute[]
}

export interface PanwLrRibFilter {
  ipv4: { bgp: string | null; ospf: string | null; static: string | null; rip: string | null }
  ipv6: { bgp: string | null; ospfv3: string | null; static: string | null }
}

export interface PanwLrMsdpRefs {
  globalTimerName: string | null
  globalAuthName: string | null
  peers: {
    name: string
    authProfile: string | null
    inboundSaFilter: string | null
    outboundSaFilter: string | null
  }[]
}

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
  splitHorizon: string | null
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
  defaultInformationOriginate: boolean
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
  authProfile: string | null
  timingProfile: string | null
  bfdProfile: string | null
  mtuIgnore: boolean
}

export interface PanwOspfRange {
  prefix: string
  substitute: string | null
  advertise: boolean
}

export interface PanwOspfGracefulRestart {
  enabled: boolean
  helperEnabled: boolean
  strictLsaChecking: boolean
  gracePeriod: number | null
  maxNeighborRestartTime: number | null
}

export interface PanwOspfArea {
  id: string
  type: string
  ranges: PanwOspfRange[]
  interfaces: PanwOspfInterface[]
  virtualLinks: PanwOspfVirtualLink[]
}

export interface PanwOspfConfig {
  enabled: boolean
  routerId: string | null
  globalBfdProfile: string | null
  rejectDefaultRoute: boolean
  gracefulRestart: PanwOspfGracefulRestart | null
  rfc1583: boolean
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
  authProfile: string | null
  timingProfile: string | null
  bfdProfile: string | null
  mtuIgnore: boolean
}

export interface PanwOspfVirtualLink {
  name: string
  enabled: boolean
  neighborId: string | null
  transitAreaId: string | null
  authProfile: string | null
  timingProfile: string | null
}

export interface PanwOspfv3Area {
  id: string
  type: string
  ranges: PanwOspfRange[]
  interfaces: PanwOspfv3Interface[]
  virtualLinks: PanwOspfVirtualLink[]
}

export interface PanwOspfv3Config {
  enabled: boolean
  routerId: string | null
  globalBfdProfile: string | null
  rejectDefaultRoute: boolean
  gracefulRestart: PanwOspfGracefulRestart | null
  disableTransitTraffic: boolean
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

export interface PanwBgpGracefulRestart {
  enabled: boolean
  staleRouteTime: number | null
  maxPeerRestartTime: number | null
  localRestartTime: number | null
}

export interface PanwBgpNetworkEntry {
  network: string
  unicast: boolean
  multicast: boolean
  backdoor: boolean
}

export interface PanwBgpConfig {
  enabled: boolean
  routerId: string | null
  localAs: string | null
  globalBfdProfile: string | null
  installRoute: boolean
  fastExternalFailover: boolean
  gracefulShutdown: boolean
  ecmpMultiAs: boolean
  enforceFirstAs: boolean
  defaultLocalPreference: number | null
  alwaysAdvertiseNetworkRoute: boolean
  gracefulRestart: PanwBgpGracefulRestart
  alwaysCompareMed: boolean
  deterministicMedComparison: boolean
  rejectDefaultRoute: boolean
  peerGroups: PanwBgpPeerGroup[]
  ipv4Networks: PanwBgpNetworkEntry[]
  ipv6Networks: PanwBgpNetworkEntry[]
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

export interface PanwMulticastStaticRoute {
  name: string
  destination: string | null
  nexthop: string | null
  interface: string | null
  preference: number | null
}

export interface PanwMulticastPimSptThreshold {
  groupAddress: string
  threshold: string | null
}

export interface PanwMulticastPimInterface {
  name: string
  drPriority: number | null
  ifTimer: string | null
  neighborFilter: string | null
  description: string | null
  sendBsm: boolean
}

export interface PanwMulticastPimRp {
  address: string | null
  groupList: string | null
  interface: string | null
  override: boolean
}

export interface PanwMulticastPimExternalRp {
  ipAddress: string
  groupList: string | null
  override: boolean
}

export interface PanwMulticastPimConfig {
  enabled: boolean
  rpfLookupMode: string | null
  routeAgeoutTime: number | null
  groupPermission: string | null
  ssmGroupList: string | null
  interfaces: PanwMulticastPimInterface[]
  sptThresholds: PanwMulticastPimSptThreshold[]
  localRp: PanwMulticastPimRp | null
  externalRps: PanwMulticastPimExternalRp[]
}

export interface PanwMulticastIgmpDynamicInterface {
  name: string
  groupFilter: string | null
  queryProfile: string | null
  version: string | null
  robustness: number | null
  maxGroups: string | null
  maxSources: string | null
  routerAlertPolicing: boolean
}

export interface PanwMulticastIgmpStaticEntry {
  name: string
  interface: string | null
  groupAddress: string | null
  sourceAddress: string | null
}

export interface PanwMulticastIgmpConfig {
  enabled: boolean
  dynamicInterfaces: PanwMulticastIgmpDynamicInterface[]
  staticEntries: PanwMulticastIgmpStaticEntry[]
}

export interface PanwMulticastMsdpPeer {
  name: string
  peerAddress: string | null
  localInterface: string | null
  localIp: string | null
  authProfile: string | null
  maxSa: number | null
  inboundSaFilter: string | null
  outboundSaFilter: string | null
}

export interface PanwMulticastMsdpConfig {
  enabled: boolean
  globalTimer: string | null
  globalAuth: string | null
  originatorIp: string | null
  originatorInterface: string | null
  peers: PanwMulticastMsdpPeer[]
}

export interface PanwMulticastConfig {
  enabled: boolean
  interfaceGroups: PanwMulticastInterfaceGroup[]
  staticRoutes: PanwMulticastStaticRoute[]
  pim: PanwMulticastPimConfig | null
  igmp: PanwMulticastIgmpConfig | null
  msdp: PanwMulticastMsdpConfig | null
}

export interface PanwEcmpIpHash {
  srcOnly: boolean
  usePort: boolean
  hashSeed: number | null
}

export interface PanwEcmpWeightedInterface {
  name: string
  weight: number | null
}

export interface PanwEcmpConfig {
  enabled: boolean
  maxPath: number | null
  algorithm: string | null
  symmetricReturn: boolean
  strictSourcePath: boolean
  ipHash: PanwEcmpIpHash | null
  weightedInterfaces: PanwEcmpWeightedInterface[]
}

export interface PanwVirtualRouter {
  name: string
  interfaces: string[]
  staticRoutes: PanwStaticRoute[]
  staticRoutesV6: PanwStaticRoute[]
  templateName: string | null
  ecmp: PanwEcmpConfig
  bgp: PanwBgpConfig
  ospf: PanwOspfConfig
  ospfv3: PanwOspfv3Config
  rip: PanwRipConfig
  redistProfiles: PanwRedistProfile[]
  multicast: PanwMulticastConfig
  adminDistances: PanwAdminDistances | null
  ospfRefs?: PanwLrOspfRefs
  ospfv3Refs?: PanwLrOspfRefs
  ripRefs?: PanwLrRipRefs
  bgpRefs?: PanwLrBgpRefs
  ribFilter?: PanwLrRibFilter
  msdpRefs?: PanwLrMsdpRefs
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
  ospfRoutingProfiles: PanwOspfRoutingProfiles
  ospfv3RoutingProfiles: PanwOspfv3RoutingProfiles
  ripRoutingProfiles: PanwRipRoutingProfiles
  multicastRoutingProfiles: PanwMulticastRoutingProfiles
  routingFilters: PanwRoutingFilters
  interfaceMgmtProfiles: PanwInterfaceMgmtProfile[]
  monitorProfiles: PanwMonitorProfile[]
  zoneProtectionProfiles: PanwZoneProtectionProfile[]
  ikeCryptoProfiles: PanwIkeCryptoProfile[]
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

