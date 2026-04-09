// @/src/lib/panw-parser/policies/security-rules/security-rules.ts
//
// Security Rule types and extractor.
// Path: pre-rulebase|post-rulebase > security > rules > entry[]

import { entries, entryName, entryUuid, str, members, membersAt, yesNo } from "../../xml-helpers"
import { resolveFirstTagColor } from "../../objects/tags"
import type { PanwColorKey, ResolvedColor } from "../../objects/tags"
import type { PolicyRulebase } from "../shared"

// ─── Types ────────────────────────────────────────────────────────────────────

export type PolicyAction = "allow" | "deny" | "drop" | "reset-client" | "reset-server" | "reset-both"
export type RuleType = "universal" | "intrazone" | "interzone"

export interface PanwSecurityRule {
  name: string
  uuid: string | null
  description: string | null
  tags: string[]
  color: ResolvedColor
  groupTag: string | null
  rulebase: PolicyRulebase
  /** Panorama: device group name */
  scope: string
  from: string[]
  to: string[]
  source: string[]
  destination: string[]
  sourceUser: string[]
  application: string[]
  service: string[]
  category: string[]
  sourceHip: string[]
  destinationHip: string[]
  action: PolicyAction
  ruleType: RuleType
  profileGroup: string | null
  logSetting: string | null
  logStart: boolean
  logEnd: boolean
  disabled: boolean
}

// ─── Extractor ────────────────────────────────────────────────────────────────

/**
 * Extract Security Rules from a rulebase element.
 * Path: rulesEl → entry[]
 */
export function extractSecurityRules(
  rulesEl: unknown,
  scope: string,
  rulebase: PolicyRulebase,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwSecurityRule[] {
  return entries(rulesEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
    const profileSetting = entry["profile-setting"] as Record<string, unknown> | undefined
    const profileGroup = profileSetting ? str(profileSetting["group"]) ?? str(members(profileSetting["group"])[0]) : null

    return {
      name: entryName(entry),
      uuid: entryUuid(entry),
      description: str(entry["description"]),
      tags: tagNames,
      color: resolveFirstTagColor(tagNames, tagColorMap),
      groupTag: str(entry["group-tag"]),
      rulebase,
      scope,
      from: membersAt(entry, "from"),
      to: membersAt(entry, "to"),
      source: membersAt(entry, "source"),
      destination: membersAt(entry, "destination"),
      sourceUser: membersAt(entry, "source-user"),
      application: membersAt(entry, "application"),
      service: membersAt(entry, "service"),
      category: membersAt(entry, "category"),
      sourceHip: membersAt(entry, "source-hip"),
      destinationHip: membersAt(entry, "destination-hip"),
      action: (str(entry["action"]) ?? "deny") as PolicyAction,
      ruleType: (str(entry["rule-type"]) ?? "universal") as RuleType,
      profileGroup,
      logSetting: str(entry["log-setting"]),
      logStart: yesNo(entry["log-start"]),
      logEnd: yesNo(entry["log-end"]),
      disabled: yesNo(entry["disabled"]),
    }
  })
}