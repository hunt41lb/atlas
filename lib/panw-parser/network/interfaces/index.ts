// @/lib/panw-parser/network/interfaces/index.ts

export {
  type InterfaceType,
  type InterfaceMode,
  type PanwSubInterface,
  type PanwInterface,
  type PanwIpEntry,
  type PanwIpv6Entry,
  type PanwArpEntry,
  type PanwNdEntry,
  type PanwNdpProxyAddress,
  type PanwDdnsVendorConfig,
  extractInterfaces,
} from "./interfaces"

export {
  type PanwSdwanInterface,
  extractSdwanInterfaces,
} from "./sdwan-interfaces"

export {
  type PanwCellularApnProfile,
  type PanwCellularSimSlot,
  type PanwCellularDdnsVendorConfig,
  type PanwCellularInterface,
  extractCellularInterfaces,
} from "./cellular-interfaces"

export {
  type PanwFailOpen,
  extractFailOpen,
} from "./fail-open"

