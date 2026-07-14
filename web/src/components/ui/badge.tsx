import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "text-catalog inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider w-fit whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-shop-brass/50 bg-shop-brass/15 text-shop-amber",
        oxblood: "border-shop-oxblood bg-shop-oxblood text-shop-paper",
        outline: "border-border text-muted-foreground",
        paper: "border-transparent bg-shop-paper text-shop-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
