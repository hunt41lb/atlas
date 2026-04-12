// @/lib/panw-parser/network/global-protect/gateways/index.ts

export {
  // Types
  type PanwGpGateway,
  type PanwGpGatewayGeneral,
  type PanwGpGatewayTunnelSettings,
  type PanwGpGatewayConfigSourceAddress,
  type PanwGpGatewayConfigIpPools,
  type PanwGpGatewayConfigSplitTunnel,
  type PanwGpGatewayConfigNetworkServices,
  type PanwGpGatewayConfigEntry,
  type PanwGpGatewayDhcpServer,
  type PanwGpGatewayClientIpPool,
  type PanwGpGatewayNetworkServices,
  type PanwGpGatewayConnectionSettings,
  type PanwGpGatewayVideoTraffic,
  type PanwGpHipNotificationMessage,
  type PanwGpHipNotification,
  // Extractor
  extractGpGateways,
} from "./gateways"
