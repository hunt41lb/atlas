// @/src/lib/panw-parser/policies/nat-rules/nat-rules.ts
//
// NAT Rule types and extractor.
// Path: pre-rulebase|post-rulebase > nat > rules > entry[]

import { entries, entryName, entryUuid, str, membersAt, yesNo } from "../../xml-helpers"
import { resolveFirstTagColor } from "../../objects/tags"
import type { PanwColorKey, ResolvedColor } from "../../objects/tags"
import type { PolicyRulebase } from "../shared"

// ─── Types ────────────────────────────────────────────────────────────────────

export type NatType = "ipv4" | "nat64" | "nptv6"
export type SourceTranslationType = "dynamic-ip-and-port" | "dynamic-ip" | "static-ip" | "none"

export interface PanwNatRule {
  name: string
  uuid: string | null
  description: string | null
  tags: string[]
  color: ResolvedColor
  groupTag: string | null
  rulebase: PolicyRulebase
  scope: string
  from: string[]
  to: string[]
  source: string[]
  destination: string[]
  service: string
  toInterface: string | null
  sourceTranslationType: SourceTranslationType
  disabled: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectSourceTranslationType(natEl: unknown): SourceTranslationType {
  if (!natEl || typeof natEl !== "object") return "none"
  const obj = natEl as Record<string, unknown>
  const src = obj["source-translation"] as Record<string, unknown> | undefined
  if (!src) return "none"
  if (src["dynamic-ip-and-port"]) return "dynamic-ip-and-port"
  if (src["dynamic-ip"]) return "dynamic-ip"
  if (src["static-ip"]) return "static-ip"
  return "none"
}

// ─── Extractor ────────────────────────────────────────────────────────────────

/**
 * Extract NAT Rules from a rulebase element.
 * Path: rulesEl → entry[]
 */
export function extractNatRules(
  rulesEl: unknown,
  scope: string,
  rulebase: PolicyRulebase,
  tagColorMap: Map<string, PanwColorKey | null>
): PanwNatRule[] {
  return entries(rulesEl).map((entry) => {
    const tagNames = membersAt(entry, "tag")
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
      service: str(entry["service"]) ?? "any",
      toInterface: str(entry["to-interface"]),
      sourceTranslationType: detectSourceTranslationType(entry),
      disabled: yesNo(entry["disabled"]),
    }
  })
}