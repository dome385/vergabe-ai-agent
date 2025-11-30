"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type ProgressProps = React.ComponentPropsWithRef<"div"> & {
  value?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.min(100, Math.max(0, Math.round(value)))}
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-slate-200",
        className
      )}
      {...props}
    >
      <div
        className="h-full rounded-full bg-blue-600 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
)
Progress.displayName = "Progress"

export { Progress }
