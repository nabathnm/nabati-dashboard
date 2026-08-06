"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-xs font-medium text-muted-foreground flex items-center gap-1.5",
        className
      )}
      {...props}
    />
  )
}

export { Label }
