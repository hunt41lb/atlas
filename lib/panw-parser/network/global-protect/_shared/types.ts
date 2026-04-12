// @/lib/panw-parser/network/global-protect/_shared/types.ts
//
// Shared types and extraction helpers used by both GlobalProtect Portals and Gateways.

import { entries, entryName, str, yesNo } from "../../../xml-helpers"

// ─── Client Authentication ────────────────────────────────────────────────────

export interface PanwGpClientAuth {
  name: string
  os: string | null
  authenticationProfile: string | null
  authenticationMessage: string | null
  userCredentialOrClientCertRequired: boolean
  autoRetrievePasscode: boolean
  useDefaultBrowser: boolean            // portal-only; gateway will always be false
  usernameLabel: string | null
  passwordLabel: string | null
}

export function extractGpClientAuth(clientAuthEl: unknown): PanwGpClientAuth[] {
  return entries(clientAuthEl).map((entry) => ({
    name: entryName(entry),
    os: str(entry["os"]) ?? null,
    authenticationProfile: str(entry["authentication-profile"]) ?? null,
    authenticationMessage: str(entry["authentication-message"]) ?? null,
    userCredentialOrClientCertRequired: yesNo(entry["user-credential-or-client-cert-required"]),
    autoRetrievePasscode: yesNo(entry["auto-retrieve-passcode"]),
    useDefaultBrowser: yesNo(entry["use-default-browser"]),
    usernameLabel: str(entry["username-label"]) ?? null,
    passwordLabel: str(entry["password-label"]) ?? null,
  }))
}

// ─── Authentication Override ──────────────────────────────────────────────────

export interface PanwGpAuthOverride {
  generateCookie: boolean
  acceptCookie: boolean
  cookieLifetimeUnit: string | null     // "days", "hours", "minutes"
  cookieLifetimeValue: number | null
  cookieEncryptDecryptCert: string | null
}

export function extractGpAuthOverride(el: unknown): PanwGpAuthOverride {
  const aoEl = el as Record<string, unknown> | undefined
  if (!aoEl) {
    return { generateCookie: false, acceptCookie: false, cookieLifetimeUnit: null, cookieLifetimeValue: null, cookieEncryptDecryptCert: null }
  }

  const acceptEl = aoEl["accept-cookie"] as Record<string, unknown> | undefined
  const lifetimeEl = acceptEl?.["cookie-lifetime"] as Record<string, unknown> | undefined

  let cookieLifetimeUnit: string | null = null
  let cookieLifetimeValue: number | null = null
  if (lifetimeEl) {
    if (lifetimeEl["lifetime-in-days"] !== undefined) {
      cookieLifetimeUnit = "days"
      cookieLifetimeValue = Number(lifetimeEl["lifetime-in-days"])
    } else if (lifetimeEl["lifetime-in-hours"] !== undefined) {
      cookieLifetimeUnit = "hours"
      cookieLifetimeValue = Number(lifetimeEl["lifetime-in-hours"])
    } else if (lifetimeEl["lifetime-in-minutes"] !== undefined) {
      cookieLifetimeUnit = "minutes"
      cookieLifetimeValue = Number(lifetimeEl["lifetime-in-minutes"])
    }
  }

  return {
    generateCookie: yesNo(aoEl["generate-cookie"]),
    acceptCookie: acceptEl !== undefined,
    cookieLifetimeUnit,
    cookieLifetimeValue,
    cookieEncryptDecryptCert: str(aoEl["cookie-encrypt-decrypt-cert"]) ?? null,
  }
}
