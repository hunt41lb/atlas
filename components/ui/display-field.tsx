// @/components/ui/display-field.tsx

"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

const displayFieldVariants = cva(
  "flex items-center gap-2",
  {
    variants: {
      labelAlign: {
        left: "*:data-[slot=display-field-label]:text-left",
        right: "*:data-[slot=display-field-label]:text-right",
      },
    },
    defaultVariants: {
      labelAlign: "left",
    },
  }
)

function DisplayField({
  label,
  value,
  labelWidth,
  labelAlign,
  className,
}: React.ComponentProps<"div"> & {
  label: string
  value: string
  labelWidth?: string
} & VariantProps<typeof displayFieldVariants>) {
  return (
    <div className={cn(displayFieldVariants({ labelAlign }), className)}>
      <span
        data-slot="display-field-label"
        className={cn("text-sm font-medium text-foreground shrink-0", labelWidth)}
      >
        {label}
      </span>
      <Input readOnly value={value} size="sm" className="w-full" />
    </div>
  )
}

export { DisplayField, displayFieldVariants }
