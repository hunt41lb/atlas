// @/app/(main)/network/_components/interfaces/fail-open-tab.tsx

"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Fieldset, FieldsetLegend, FieldsetContent } from "@/components/ui/fieldset"
import type { PanwFailOpen } from "@/lib/panw-parser/network/interfaces"

export function FailOpenTab({ data }: { data: PanwFailOpen[] }) {
  // Merge across templates — fail-open is enabled if any template enables it
  const enabled = data.some((f) => f.enabled)

  return (
    <div className="p-4">
      <Fieldset>
        <FieldsetLegend>Fail Open Pair Setting</FieldsetLegend>
        <FieldsetContent>
          <Label className="flex items-center gap-2 pl-1">
            <Checkbox checked={enabled} disabled />
            <span>Enable Fail Open</span>
          </Label>
        </FieldsetContent>
      </Fieldset>
    </div>
  )
}
