// @/lib/panw-parser/routing-profiles/index.ts
//
// Barrel re-export for all routing profile types and extractors.
// Import from "routing-profiles" instead of individual protocol files.

// ─── BFD ──────────────────────────────────────────────────────────────────────
export { type PanwBfdProfile, BFD_DEFAULTS, extractBfdProfiles } from "./bfd"

// ─── BGP ──────────────────────────────────────────────────────────────────────
export {
  // Types
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

// ─── Filters (future) ────────────────────────────────────────────────────────
// export { ... } from "./filters"

// ─── Multicast (future) ──────────────────────────────────────────────────────
// export { ... } from "./multicast"
