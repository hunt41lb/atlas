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

// ─── DDNS Vendor Display Names ────────────────────────────────────────────────

export const DDNS_VENDOR_LABELS: Record<string, string> = {
  "paloalto-networks-ddns": "Palo Alto Networks DDNS",
  "duckdns-v1": "DuckDNS v1",
  "dyn-v1": "DynDNS v1",
  "freedns-afraid-dynamic-v1": "FreeDNS Afraid.org Dynamic API v1",
  "freedns-afraid-v1": "FreeDNS Afraid.org v1",
  "noip-v1": "No-IP v1",
}

// ─── DDNS Vendor Config Display Names ─────────────────────────────────────────

export const DDNS_CONFIG_LABELS: Record<string, string> = {
  // Palo Alto Networks DDNS
  "ztp-ddns-ttl": "TTL (sec)",
  // DuckDNS v1
  "duckdns-api-host": "API Host",
  "duckdns-baseuri": "Base URI",
  "duckdns-secret-token": "Secret Token",
  // DynDNS v1
  "dyn-api-host": "API Host",
  "dyn-baseuri": "Base URI",
  "dyn-username": "username",
  "dyn-password": "password",
  // Shared
  "ddns-timeout": "Timeout (sec)",
}

// Device > Setup > Management defaults and related constants

export interface LogQuotaFieldDef {
  key: string
  label: string
}

export const SINGLE_DISK_QUOTA_FIELDS: readonly LogQuotaFieldDef[] = [
  // Left column (visible in PAN-OS Single Disk Storage UI)
  { key: "traffic", label: "Traffic" },
  { key: "threat", label: "Threat" },
  { key: "config", label: "Config" },
  { key: "s", label: "System" },
  { key: "alarm", label: "Alarm" },
  { key: "appstat", label: "App Stats" },
  { key: "hipmatch", label: "HIP Match" },
  { key: "globalprotect", label: "GlobalProtect" },
  { key: "application-pcaps", label: "App Pcaps" },
  { key: "threat-pcaps", label: "Extended Threat Pcaps" },
  { key: "debug-filter-pcaps", label: "Debug Filter Pcaps" },
  { key: "iptag", label: "IP Tag" },
  // Right column (visible in PAN-OS Single Disk Storage UI)
  { key: "trsum", label: "Traffic Summary" },
  { key: "thsum", label: "Threat Summary" },
  { key: "gtpsum", label: "GTP and Tunnel Summary" },
  { key: "sctpsum", label: "SCTP Summary" },
  { key: "urlsum", label: "URL Summary" },
  { key: "desum", label: "Decryption Summary" },
  { key: "hourlytrsum", label: "Hourly Traffic Summary" },
  { key: "hourlythsum", label: "Hourly Threat Summary" },
  { key: "hourlygtpsum", label: "Hourly GTP and Tunnel Summary" },
  { key: "hourlysctpsum", label: "Hourly SCTP Summary" },
  { key: "hourlyurlsum", label: "Hourly URL Summary" },
  { key: "hourlydesum", label: "Hourly Decryption Summary" },
  // Present in XML but not in the Single Disk Storage UI panel
  { key: "dailytrsum", label: "Daily Traffic Summary" },
  { key: "dailythsum", label: "Daily Threat Summary" },
  { key: "dailyurlsum", label: "Daily URL Summary" },
  { key: "dailygtpsum", label: "Daily GTP and Tunnel Summary" },
  { key: "dailysctpsum", label: "Daily SCTP Summary" },
  { key: "dailydesum", label: "Daily Decryption Summary" },
  { key: "weeklytrsum", label: "Weekly Traffic Summary" },
  { key: "weeklythsum", label: "Weekly Threat Summary" },
  { key: "weeklyurlsum", label: "Weekly URL Summary" },
  { key: "weeklygtpsum", label: "Weekly GTP and Tunnel Summary" },
  { key: "weeklysctpsum", label: "Weekly SCTP Summary" },
  { key: "weeklydesum", label: "Weekly Decryption Summary" },
  { key: "dlp-logs", label: "Data Filtering Captures" },
  { key: "hip-reports", label: "HIP Reports" },
  { key: "userid", label: "User-ID" },
  { key: "gtp", label: "GTP and Tunnel" },
  { key: "sctp", label: "SCTP" },
  { key: "auth", label: "Authentication" },
  { key: "decryption", label: "Decryption" },
]

export const SESSION_LOG_QUOTA_FIELDS: readonly LogQuotaFieldDef[] = [
  // Left column (matches PAN-OS Multi Disk Storage > Session Log Storage UI order)
  { key: "traffic", label: "Traffic" },
  { key: "threat", label: "Threat" },
  { key: "trsum", label: "Traffic Summary" },
  { key: "thsum", label: "Threat Summary" },
  { key: "urlsum", label: "URL Summary" },
  { key: "hourlytrsum", label: "Hourly Traffic Summary" },
  { key: "hourlythsum", label: "Hourly Threat Summary" },
  { key: "hourlyurlsum", label: "Hourly URL Summary" },
  { key: "dailytrsum", label: "Daily Traffic Summary" },
  { key: "hipmatch", label: "HIP Match" },
  { key: "globalprotect", label: "GlobalProtect" },
  { key: "userid", label: "User-ID" },
  { key: "iptag", label: "IP Tag" },
  { key: "gtp", label: "GTP and Tunnel" },
  { key: "sctp", label: "SCTP" },
  { key: "auth", label: "Authentication" },
  { key: "decryption", label: "Decryption" },
  // Right column
  { key: "dailythsum", label: "Daily Threat Summary" },
  { key: "dailyurlsum", label: "Daily URL Summary" },
  { key: "weeklytrsum", label: "Weekly Traffic Summary" },
  { key: "weeklythsum", label: "Weekly Threat Summary" },
  { key: "weeklyurlsum", label: "Weekly URL Summary" },
  { key: "threat-pcaps", label: "Extended Threat Pcaps" },
  { key: "gtpsum", label: "GTP and Tunnel Summary" },
  { key: "hourlygtpsum", label: "Hourly GTP and Tunnel Summary" },
  { key: "dailygtpsum", label: "Daily GTP and Tunnel Summary" },
  { key: "weeklygtpsum", label: "Weekly GTP and Tunnel Summary" },
  { key: "sctpsum", label: "SCTP Summary" },
  { key: "hourlysctpsum", label: "Hourly SCTP Summary" },
  { key: "dailysctpsum", label: "Daily SCTP Summary" },
  { key: "weeklysctpsum", label: "Weekly SCTP Summary" },
  { key: "desum", label: "Decryption Summary" },
  { key: "hourlydesum", label: "Hourly Decryption Summary" },
  { key: "dailydesum", label: "Daily Decryption Summary" },
  { key: "weeklydesum", label: "Weekly Decryption Summary" },
]

export const MANAGEMENT_LOG_QUOTA_FIELDS: readonly LogQuotaFieldDef[] = [
  { key: "config", label: "Config" },
  { key: "s", label: "System" },
  { key: "alarm", label: "Alarm" },
  { key: "appstat", label: "App Stats" },
  { key: "hip-reports", label: "HIP Reports" },
  { key: "dlp-logs", label: "Data Filtering Captures" },
  { key: "application-pcaps", label: "App Pcaps" },
  { key: "debug-filter-pcaps", label: "Debug Filter Pcaps" },
]

/**
 * Pre-Defined Reports canonical list.
 * Each entry maps an XML <member> name to its UI label and category.
 * Frontend uses this to render the 4-column Pre-Defined Reports dialog.
 */
export type PredefinedReportCategory =
  | "Application"
  | "Traffic"
  | "Threat"
  | "URL Filtering"

export interface PredefinedReportDef {
  xmlName: string
  label: string
  category: PredefinedReportCategory
}

export const PREDEFINED_REPORTS: readonly PredefinedReportDef[] = [
  // Application (8)
  { xmlName: "top-applications", label: "Applications", category: "Application" },
  { xmlName: "top-application-categories", label: "Application Categories", category: "Application" },
  { xmlName: "top-technology-categories", label: "Technology Categories", category: "Application" },
  { xmlName: "top-http-applications", label: "HTTP Applications", category: "Application" },
  { xmlName: "top-denied-applications", label: "Denied Applications", category: "Application" },
  { xmlName: "risk-trend", label: "Risk Trend", category: "Application" },
  { xmlName: "bandwidth-trend", label: "Bandwidth Trend", category: "Application" },
  { xmlName: "SaaS Application Usage", label: "SaaS Application Usage", category: "Application" },
  // Traffic (14)
  { xmlName: "top-rules", label: "Security Rules", category: "Traffic" },
  { xmlName: "top-sources", label: "Sources", category: "Traffic" },
  { xmlName: "top-source-countries", label: "Source Countries", category: "Traffic" },
  { xmlName: "top-destinations", label: "Destinations", category: "Traffic" },
  { xmlName: "top-destination-countries", label: "Destination Countries", category: "Traffic" },
  { xmlName: "top-connections", label: "Connections", category: "Traffic" },
  { xmlName: "top-ingress-zones", label: "Source Zones", category: "Traffic" },
  { xmlName: "top-egress-zones", label: "Destination Zones", category: "Traffic" },
  { xmlName: "top-ingress-interfaces", label: "Ingress Interfaces", category: "Traffic" },
  { xmlName: "top-egress-interfaces", label: "Egress Interfaces", category: "Traffic" },
  { xmlName: "top-denied-sources", label: "Denied Sources", category: "Traffic" },
  { xmlName: "top-denied-destinations", label: "Denied Destinations", category: "Traffic" },
  { xmlName: "unknown-tcp-connections", label: "Unknown TCP Sessions", category: "Traffic" },
  { xmlName: "unknown-udp-connections", label: "Unknown UDP Sessions", category: "Traffic" },
  // Threat (18)
  { xmlName: "risky-users", label: "Risky Users", category: "Threat" },
  { xmlName: "top-attacks", label: "Threats", category: "Threat" },
  { xmlName: "threat-trend", label: "Threat Trend", category: "Threat" },
  { xmlName: "top-inline-cloud-analysis", label: "Inline Cloud Analysis", category: "Threat" },
  { xmlName: "top-attacker-sources", label: "Attacker Sources", category: "Threat" },
  { xmlName: "top-attacker-destinations", label: "Attacker Destinations", category: "Threat" },
  { xmlName: "top-attackers-by-source-countries", label: "Attackers By Source Countries", category: "Threat" },
  { xmlName: "top-attackers-by-destination-countries", label: "Attackers By Destination Countries", category: "Threat" },
  { xmlName: "top-victim-sources", label: "Victim Sources", category: "Threat" },
  { xmlName: "top-victim-destinations", label: "Victim Destinations", category: "Threat" },
  { xmlName: "top-victims-by-source-countries", label: "Victims By Source Countries", category: "Threat" },
  { xmlName: "top-victims-by-destination-countries", label: "Victims By Destination Countries", category: "Threat" },
  { xmlName: "top-viruses", label: "Viruses", category: "Threat" },
  { xmlName: "top-spyware-threats", label: "Spyware Threats", category: "Threat" },
  { xmlName: "top-vulnerabilities", label: "Vulnerabilities", category: "Threat" },
  { xmlName: "spyware-infected-hosts", label: "Spyware Infected Hosts", category: "Threat" },
  { xmlName: "top-users", label: "Top Users", category: "Threat" },
  { xmlName: "wildfire-file-digests", label: "WildFire File Digests", category: "Threat" },
  // URL Filtering (10)
  { xmlName: "top-url-categories", label: "URL Categories", category: "URL Filtering" },
  { xmlName: "top-inline-categorization-verdict", label: "Inline Categorization Verdicts", category: "URL Filtering" },
  { xmlName: "top-url-users", label: "URL Users", category: "URL Filtering" },
  { xmlName: "top-url-user-behavior", label: "URL User Behavior", category: "URL Filtering" },
  { xmlName: "top-websites", label: "Web Sites", category: "URL Filtering" },
  { xmlName: "top-blocked-url-categories", label: "Blocked Categories", category: "URL Filtering" },
  { xmlName: "top-blocked-url-users", label: "Blocked Users", category: "URL Filtering" },
  { xmlName: "top-blocked-url-user-behavior", label: "Blocked User Behavior", category: "URL Filtering" },
  { xmlName: "top-blocked-websites", label: "Blocked Sites", category: "URL Filtering" },
  { xmlName: "blocked-credential-post", label: "Credential Post Detected", category: "URL Filtering" },
]

/**
 * Banners & Messages color palette.
 * PAN-OS stores banner colors as `color1`–`color15` in XML.
 * Values below reflect the standard PAN-OS palette — confirm against your
 * install if any look off for the visual swatch.
 */
export const BANNER_COLOR_LABELS: Record<string, string> = {
  color1: "Red",
  color2: "Green",
  color3: "Blue",
  color4: "Yellow",
  color5: "Cyan",
  color6: "Magenta",
  color7: "Orange",
  color8: "Pink",
  color9: "Purple",
  color10: "Brown",
  color11: "Gray",
  color12: "Light Green",
  color13: "White",
  color14: "Black",
  color15: "Olive",
}
