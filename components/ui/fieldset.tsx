// @/components/ui/fieldset.tsx

"use client"

import { cn } from "@/lib/utils"

function Fieldset({
  className,
  disabled,
  ...props
}: React.ComponentProps<"fieldset"> & { disabled?: boolean }) {
  return (
    <fieldset
      data-slot="fieldset"
      data-disabled={disabled || undefined}
      className={cn("rounded-md border bg-card px-3 py-2.5", className)}
      {...props}
    />
  )
}

function FieldsetLegend({ className, ...props }: React.ComponentProps<"legend">) {
  return (
    <legend
      data-slot="fieldset-legend"
      className={cn(
        "px-1 text-md font-medium text-foreground",
        "in-data-disabled:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function FieldsetContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="fieldset-content"
      className={cn(
        "space-y-1.5",
        "in-data-disabled:bg-muted/50 in-data-disabled:rounded-md in-data-disabled:-mx-2 in-data-disabled:px-2 in-data-disabled:py-1.5",
        className
      )}
      {...props}
    />
  )
}

export { Fieldset, FieldsetLegend, FieldsetContent }
