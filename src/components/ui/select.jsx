import * as React from "react"
import { cn } from "@/lib/utils"

const Select = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-lg border border-blue-500/30 bg-slate-800/80 backdrop-blur-sm px-4 py-2 text-sm text-gray-200 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:border-blue-500 transition-all disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:shadow-md",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

export { Select }

