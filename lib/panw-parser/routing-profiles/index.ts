// @/lib/panw-parser/routing-profiles/index.ts
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

// ─── OSPF (future) ───────────────────────────────────────────────────────────
// export { ... } from "./ospf"

// ─── OSPFv3 (future) ─────────────────────────────────────────────────────────
// export { ... } from "./ospfv3"

// ─── RIPv2 (future) ──────────────────────────────────────────────────────────
// export { ... } from "./ripv2"

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

// ─── Multicast (future) ──────────────────────────────────────────────────────
// export { ... } from "./multicast"
