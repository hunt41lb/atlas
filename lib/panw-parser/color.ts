// @/lib/panw-parser/color.ts

import type { PanwColorKey, ResolvedColor } from "./types"

const VALID_COLOR_KEYS = new Set([
  "color1","color2","color3","color4","color5","color6","color7",
  "color8","color9","color10","color11","color12","color13","color14",
  "color15","color16","color17","color19","color20","color21","color22",
  "color23","color24","color25","color26","color27","color28","color29",
  "color30","color31","color32","color33","color34","color35","color36",
  "color37","color38","color39","color40","color41","color42",
])

/**
 * Resolves a PANW color key (e.g. "color14") to a CSS variable reference.
 * Falls back to --muted-foreground for uncolored or invalid keys.
 */
export function resolvePanwColor(colorKey: string | null | undefined): ResolvedColor {
  if (colorKey && VALID_COLOR_KEYS.has(colorKey)) {
    const num = colorKey.replace("color", "")
    return `var(--panw-color${num})` as ResolvedColor
  }
  return "var(--muted-foreground)"
}

/**
 * Given an ordered list of tag names and a tag→colorKey map,
 * returns the resolved color of the first tag that has a color assigned.
 * Falls back to --muted-foreground if no tags have colors.
 */
export function resolveFirstTagColor(
  tagNames: string[],
  tagColorMap: Map<string, PanwColorKey | null>
): ResolvedColor {
  for (const name of tagNames) {
    const key = tagColorMap.get(name)
    if (key) return resolvePanwColor(key)
  }
  return "var(--muted-foreground)"
}
