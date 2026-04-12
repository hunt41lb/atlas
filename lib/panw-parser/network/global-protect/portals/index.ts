// @/lib/panw-parser/network/global-protect/portals/index.ts

export {
  // Types
  type PanwGpPortal,
  type PanwGpPortalGeneral,
  type PanwGpPortalConfigSelection,
  type PanwGpPortalAgentConfig,
  type PanwGpRootCa,
  type PanwGpPortalConfigEntry,
  type PanwGpConfigAuthentication,
  type PanwGpTwoFactor,
  type PanwGpConfigSelection,
  type PanwGpHostDetection,
  type PanwGpInternalGateway,
  type PanwGpConfigInternal,
  type PanwGpExternalGatewayPriorityRule,
  type PanwGpExternalGateway,
  type PanwGpConfigExternal,
  type PanwGpAppConfig,
  type PanwGpAgentUi,
  type PanwGpHipExclusionVendor,
  type PanwGpHipExclusionCategory,
  type PanwGpHipCollection,
  type PanwGpMdm,
  // Defaults
  GP_APP_CONFIG_DEFAULTS,
  // Extractor
  extractGpPortals,
} from "./portals"

