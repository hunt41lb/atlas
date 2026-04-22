// @/app/(main)/device/[category]/page.tsx

"use client"

import * as React from "react"
import { notFound } from "next/navigation"
import { useConfig } from "@/app/(main)/_context/config-context"
import { EmptyState } from "@/app/(main)/_components/ui/empty-state"
import { ComingSoonView } from "@/app/(main)/_components/ui/category-shell"

// Pages
import { ManagementView} from "../_components/setup/management-view"

// ─── Route map ────────────────────────────────────────────────────────────────

const DEVICE_VIEWS: Record<string, { title: string; component?: React.ComponentType; countKey?: string }> = {
  "setup-management":                                { title: "Management",             component: ManagementView },
  "setup-operations":                                { title: "Operations" },
  "high-availability":                               { title: "High Availability" },
  "log-forwarding-card":                             { title: "Log Forwarding Card" },
  "password-profiles":                               { title: "Password Profiles" },
  "administrators":                                  { title: "Administrators" },
  "admin-roles":                                     { title: "Admin Roles" },
  "authentication-profiles":                         { title: "Authentication Profiles" },
  "authentication-sequence":                         { title: "Authentication Sequence" },
  "delegation-profile":                              { title: "Delegation Profile" },
  "user-identification":                             { title: "User Identification" },
  "iot-security":                                    { title: "IoT Security" },
  "iot-security-dhcp-server-log-ingestion":          { title: "DHCP Server Log Ingestion" },
  "data-redistribution":                             { title: "Data Redistribution" },
  "cloud-redistribution":                            { title: "Cloud Redistribution" },
  "vm-information-sources":                          { title: "VM Information Sources" },
  "certificate-management":                          { title: "Certificate Management" },
  "certificate-management-certificates":             { title: "Certificates" },
  "certificate-management-certificate-profile":      { title: "Certificate Profile" },
  "certificate-management-ocsp-responder":           { title: "OCSP Responder" },
  "certificate-management-ssl-tls-service-profile":  { title: "SSL/TLS Service Profile" },
  "certificate-management-scep":                     { title: "SCEP" },
  "certificate-management-ssl-decryption-exclusion": { title: "SSL Decryption Exclusion" },
  "certificate-management-ssh-service-profile":      { title: "SSH Service Profile" },
  "response-pages":                                  { title: "Response Pages" },
  "log-settings":                                    { title: "Log Settings" },
  "server-profiles":                                 { title: "Server Profiles" },
  "server-profiles-snmp-trap":                       { title: "SNMP Trap" },
  "server-profiles-syslog":                          { title: "Syslog" },
  "server-profiles-email":                           { title: "Email" },
  "server-profiles-http":                            { title: "HTTP" },
  "server-profiles-netflow":                         { title: "Netflow" },
  "server-profiles-radius":                          { title: "RADIUS" },
  "server-profiles-scp":                             { title: "SCP" },
  "server-profiles-tacacs":                          { title: "TACACS+" },
  "server-profiles-ldap":                            { title: "LDAP" },
  "server-profiles-kerberos":                        { title: "Kerberos" },
  "server-profiles-saml-identity-provider":          { title: "SAML Identity Provider" },
  "server-profiles-multi-factor-authentication":     { title: "Multi Factor Authentication" },
  "local-user-database":                             { title: "Local User Database" },
  "local-user-database-users":                       { title: "Users" },
  "local-user-database-user-groups":                 { title: "User Groups" },
  "scheduled-log-export":                            { title: "Scheduled Log Export" },
  "dynamic-updates":                                 { title: "Dynamic Updates" },
  "vm-series":                                       { title: "VM-Series" },
  "master-key-and-diagnostics":                      { title: "Master Key and Diagnostics" },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DeviceCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = React.use(params)
  const { activeConfig } = useConfig()

  const view = DEVICE_VIEWS[category]
  if (!view) notFound()

  if (!activeConfig) return <EmptyState />

  if (view.component) {
    const View = view.component
    return <View />
  }

  return <ComingSoonView title={view.title} />
}
