// @/lib/panw-defaults.ts
//
// PAN-OS factory default values for routers and protocols.
// Used by the RouterDialog to show "Defaults" view alongside
// the actual configuration for comparison/troubleshooting.

// ─── Administrative Distances ─────────────────────────────────────────────────

export const DEFAULT_ADMIN_DISTANCES = {
  static: 10,
  staticIpv6: 10,
  ospfIntra: 30,
  ospfInter: 110,
  ospfExt: 110,
  ospfv3Intra: 30,
  ospfv3Inter: 110,
  ospfv3Ext: 110,
  bgpInternal: 200,
  bgpExternal: 20,
  bgpLocal: 20,
  rip: 120,
} as const

// ─── ECMP ─────────────────────────────────────────────────────────────────────

export const DEFAULT_ECMP = {
  enabled: false,
  symmetricReturn: false,
  strictSourcePath: false,
  maxPath: 2,
  algorithm: "None",
} as const

// ─── ECMP Algorithm Labels ────────────────────────────────────────────────────

export const ECMP_ALGORITHM_LABELS: Record<string, string> = {
  "ip-modulo": "IP Modulo",
  "ip-hash": "IP Hash",
  "weighted-round-robin": "Weighted Round Robin",
  "balanced-round-robin": "Balanced Round Robin",
}

// ─── RIB Filter ───────────────────────────────────────────────────────────────

export const DEFAULT_RIB_FILTER = {
  ipv4: {
    bgpRouteMap: "None",
    ospfv2RouteMap: "None",
    staticRouteMap: "None",
    ripRouteMap: "None",
  },
  ipv6: {
    bgpRouteMap: "None",
    ospfv3RouteMap: "None",
    staticRouteMap: "None",
  },
} as const
