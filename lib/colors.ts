// @/lib/colors.ts
//
// Centralized color-variant utility for status badges, type indicators,
// and any UI element that follows the tinted-background pattern:
//
//   bg-{color}-500/10  text-{color}-600  dark:text-{color}-400  border-{color}-500/20
//
// Usage:
//   import { colorVariant, type ColorVariant } from "@/lib/colors"
//
//   <span className={cn("rounded border px-1.5 py-0.5", colorVariant("green"))}>
//     allow
//   </span>
//
// Or use the pre-built semantic maps for domain-specific lookups:
//
//   <TypeBadge label={label} className={colorVariant(ACTION_COLORS[action])} />

// ─── Color variant map ──────────────────────────────────────────────────────

export const COLOR_VARIANTS = {
  green:  "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  red:    "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  rose:   "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  amber:  "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  blue:   "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  cyan:   "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  sky:    "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  muted:  "bg-muted text-muted-foreground border-border",
} as const

export type ColorVariant = keyof typeof COLOR_VARIANTS

/**
 * Returns the Tailwind class string for a tinted-background color variant.
 *
 * Accepts either a known color name or `undefined`/`null`, in which case
 * it falls back to the neutral "muted" variant.
 *
 * @example
 *   colorVariant("green")   // "bg-green-500/10 text-green-600 …"
 *   colorVariant(undefined)  // "bg-muted text-muted-foreground border-border"
 */
export function colorVariant(color?: ColorVariant | null): string {
  if (!color) return COLOR_VARIANTS.muted
  return COLOR_VARIANTS[color] ?? COLOR_VARIANTS.muted
}

// ─── Semantic domain maps ─────────────────────────────────────────────────────
// These map domain values → ColorVariant names, keeping the domain knowledge
// separate from the color implementation. Views use these with colorVariant():
//
//   colorVariant(INTERFACE_MODE_COLORS[iface.mode])

/** Security rule actions (allow, deny, drop, reset-*) */
export const ACTION_COLORS: Record<string, ColorVariant> = {
  allow:          "green",
  deny:           "red",
  drop:           "orange",
  "reset-client": "amber",
  "reset-server": "amber",
  "reset-both":   "amber",
}

/** Transport protocols (tcp, udp, sctp) */
export const PROTOCOL_COLORS: Record<string, ColorVariant> = {
  tcp:  "blue",
  udp:  "violet",
  sctp: "cyan",
}

/** Interface modes + aggregate group (layer3, layer2, virtual-wire, tap, ha, aggregate) */
export const INTERFACE_MODE_COLORS: Record<string, ColorVariant> = {
  layer3:           "green",
  layer2:           "violet",
  "virtual-wire":   "violet",
  tap:              "cyan",
  ha:               "orange",
  "decrypt-mirror": "amber",
  aggregate:        "amber",
}

/** Zone types (layer3, layer2, virtual-wire, tap, tunnel, external) */
export const ZONE_TYPE_COLORS: Record<string, ColorVariant> = {
  layer3:         "blue",
  layer2:         "cyan",
  "virtual-wire": "violet",
  tap:            "orange",
  tunnel:         "amber",
  external:       "muted",
  unknown:        "muted",
}

/** Rulebase position (pre, post) */
export const RULEBASE_COLORS: Record<string, ColorVariant> = {
  pre:  "blue",
  post: "purple",
}

/** Device type (firewall, panorama) — used in config badges */
export const DEVICE_TYPE_COLORS: Record<string, ColorVariant> = {
  firewall: "blue",
  panorama: "violet",
}

/** Object group types (static, dynamic) — address groups, service groups */
export const GROUP_TYPE_COLORS: Record<string, ColorVariant> = {
  static:  "muted",
  dynamic: "amber",
}

/** Address object types (ip-netmask, ip-range, fqdn, ip-wildcard) */
export const ADDRESS_TYPE_COLORS: Record<string, ColorVariant> = {
  "ip-netmask":  "blue",
  "ip-range":    "violet",
  "fqdn":        "cyan",
  "ip-wildcard": "amber",
}

/** DHCP roles — used in interface features and the DHCP view */
export const DHCP_COLORS: Record<string, ColorVariant> = {
  client: "sky",
  relay:  "violet",
  server: "blue",
}

/** NAT rule types (for the upcoming NAT view) */
export const NAT_TYPE_COLORS: Record<string, ColorVariant> = {
  ipv4:  "blue",
  nat64: "violet",
  nptv6: "cyan",
}
