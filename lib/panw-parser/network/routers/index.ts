// @/lib/panw-parser/network/routers/index.ts

export {
  // ─── Types ──────────────────────────────────────────────────────────────────
  // Path Monitor
  type PanwPathMonitorDestination,
  // Static Routes
  type PanwStaticRoute,
  // Admin Distances
  type PanwAdminDistances,
  // Redistribution
  type PanwRedistProfile,
  // RIP
  type PanwRipInterface,
  type PanwRipTimers,
  type PanwRipConfig,
  // OSPF
  type PanwOspfInterface,
  type PanwOspfRange,
  type PanwOspfGracefulRestart,
  type PanwOspfVirtualLink,
  type PanwOspfArea,
  type PanwOspfConfig,
  // OSPFv3
  type PanwOspfv3Interface,
  type PanwOspfv3Area,
  type PanwOspfv3Config,
  // BGP
  type PanwBgpPeer,
  type PanwBgpPeerGroup,
  type PanwBgpGracefulRestart,
  type PanwBgpNetworkEntry,
  type PanwBgpConfig,
  // Multicast
  type PanwMulticastInterfaceGroup,
  type PanwMulticastStaticRoute,
  type PanwMulticastPimSptThreshold,
  type PanwMulticastPimInterface,
  type PanwMulticastPimRp,
  type PanwMulticastPimExternalRp,
  type PanwMulticastPimConfig,
  type PanwMulticastIgmpDynamicInterface,
  type PanwMulticastIgmpStaticEntry,
  type PanwMulticastIgmpConfig,
  type PanwMulticastMsdpPeer,
  type PanwMulticastMsdpConfig,
  type PanwMulticastConfig,
  // ECMP
  type PanwEcmpIpHash,
  type PanwEcmpWeightedInterface,
  type PanwEcmpConfig,
  // Logical Router Refs
  type PanwLrAreaRef,
  type PanwLrOspfRefs,
  type PanwLrRipRefs,
  type PanwLrBgpPeerGroup,
  type PanwLrBgpAggregateRoute,
  type PanwLrBgpRefs,
  type PanwLrRibFilter,
  type PanwLrMsdpRefs,
  // Virtual Router
  type PanwVirtualRouter,
  // ─── Extractors ─────────────────────────────────────────────────────────────
  extractVirtualRouters,
  extractLogicalRouters,
  extractDhcpRelayInterfaces,
} from "./routers"