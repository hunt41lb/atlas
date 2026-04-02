// @/lib/panw-parser/network-profiles/index.ts

// ─── Interface Management ─────────────────────────────────────────────────────
export {
  type PanwInterfaceMgmtProfile,
  extractInterfaceMgmtProfiles,
} from "./interface-mgmt"

// ─── Monitor ──────────────────────────────────────────────────────────────────
export {
  type PanwMonitorProfile,
  MONITOR_DEFAULTS,
  extractMonitorProfiles,
} from "./monitor"

// ─── Zone Protection ──────────────────────────────────────────────────────────
export {
  type PanwZoneProtectionProfile,
  type PanwScanEntry,
  type PanwScanWhiteListEntry,
  type PanwNonIpProtocolEntry,
  type PanwSgtTagEntry,
  extractZoneProtectionProfiles,
} from "./zone-protection"

// ─── IKE Crypto ───────────────────────────────────────────────────────────────
export {
  type PanwIkeCryptoProfile,
  type PanwIkeCryptoAke,
  extractIkeCryptoProfiles,
} from "./ike-crypto"

// ─── IPSec Crypto ─────────────────────────────────────────────────────────────
export {
  type PanwIpsecCryptoProfile,
  type PanwIpsecCryptoAke,
  extractIpsecCryptoProfiles,
} from "./ipsec-crypto"

// ─── IKE Gateways ─────────────────────────────────────────────────────────────
export {
  type PanwIkeGateway,
  type PanwIkeGatewayPpkKey,
  ID_TYPE_LABELS,
  extractIkeGateways,
} from "./ike-gateways"

// ─── GP IPSec Crypto ──────────────────────────────────────────────────────────
export {
  type PanwGpIpsecCryptoProfile,
  extractGpIpsecCryptoProfiles,
} from "./gp-ipsec-crypto"

// ─── Network BFD ──────────────────────────────────────────────────────────────
export {
  type PanwNetworkBfdProfile,
  NETWORK_BFD_DEFAULTS,
  extractNetworkBfdProfiles,
} from "./bfd"

// ─── LLDP ─────────────────────────────────────────────────────────────────────
export {
  type PanwLldpProfile,
  type PanwLldpMgmtAddress,
  extractLldpProfiles,
} from "./lldp"

// ─── MACsec ───────────────────────────────────────────────────────────────────
export {
  type PanwMacsecProfile,
  MACSEC_DEFAULTS,
  extractMacsecProfiles,
} from "./macsec"

// ─── QoS ──────────────────────────────────────────────────────────────────────
export {
  type PanwQosProfile,
  type PanwQosClass,
  extractQosProfiles,
} from "./qos"
