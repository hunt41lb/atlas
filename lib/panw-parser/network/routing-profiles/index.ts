// @/src/lib/panw-parser/network/routing-profiles/index.ts
//
// Barrel re-export for all routing profile types and extractors.
// Import from "routing-profiles" instead of individual protocol files.

// ─── BFD ──────────────────────────────────────────────────────────────────────
export { type PanwBfdProfile, BFD_DEFAULTS, extractBfdProfiles } from "./bfd"

// ─── BGP ──────────────────────────────────────────────────────────────────────
export {
  type PanwBgpAuthProfile,
  type PanwBgpTimerProfile,
  type PanwBgpDampeningProfile,
  type PanwBgpRedistEntry,
  type PanwBgpRedistSubConfig,
  type PanwBgpRedistributionProfile,
  type PanwBgpAddressFamilySubConfig,
  type PanwBgpAddressFamilyProfile,
  type PanwBgpFilteringCondAdvert,
  type PanwBgpFilteringSubConfig,
  type PanwBgpFilteringProfile,
  type PanwBgpRoutingProfiles,
  // Defaults
  BGP_TIMER_DEFAULTS,
  BGP_DAMPENING_DEFAULTS,
  // Extractor
  extractBgpRoutingProfiles,
} from "./bgp"

// ─── OSPF ─────────────────────────────────────────────────────────────────────
export {
  // Shared types (OSPF + OSPFv3)
  type PanwOspfSpfTimerProfile,
  type PanwOspfIfTimerProfile,
  type PanwOspfRedistEntry,
  type PanwOspfRedistProfile,
  // OSPF-specific types
  type PanwOspfAuthProfile,
  type PanwOspfRoutingProfiles,
  // OSPFv3-specific types
  type PanwOspfv3AuthProfile,
  type PanwOspfv3RoutingProfiles,
  // Extractors
  extractOspfRoutingProfiles,
  extractOspfv3RoutingProfiles,
} from "./ospf"

// ─── RIP ──────────────────────────────────────────────────────────────────────
export {
  type PanwRipGlobalTimerProfile,
  type PanwRipAuthProfile,
  type PanwRipRedistEntry,
  type PanwRipRedistProfile,
  type PanwRipRoutingProfiles,
  extractRipRoutingProfiles,
} from "./rip"

// ─── Filters ─────────────────────────────────────────────────────────────────
export {
  type PanwAccessListEntry,
  type PanwAccessList,
  type PanwPrefixListEntry,
  type PanwPrefixList,
  type PanwCommunityListEntry,
  type PanwCommunityList,
  type PanwAsPathAccessListEntry,
  type PanwAsPathAccessList,
  type PanwRouteMapFilterRef,
  type PanwRouteMapMetric,
  type PanwRouteMapAggregator,
  type PanwBgpRouteMapMatch,
  type PanwBgpRouteMapSet,
  type PanwBgpRouteMapEntry,
  type PanwBgpRouteMap,
  type PanwRedistRouteMapMatch,
  type PanwRedistRouteMapSet,
  type PanwRedistRouteMapEntry,
  type PanwRedistRouteMap,
  type PanwRoutingFilters,
  // Extractor
  extractRoutingFilters,
} from "./filters"

// ─── Multicast ────────────────────────────────────────────────────────────────
export {
  type PanwPimInterfaceTimerProfile,
  type PanwIgmpInterfaceQueryProfile,
  type PanwMsdpAuthProfile,
  type PanwMsdpTimerProfile,
  type PanwMulticastRoutingProfiles,
  extractMulticastRoutingProfiles,
} from "./multicast"
