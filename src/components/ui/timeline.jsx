import * as React from "react"
import { cn } from "@/lib/utils"

const Timeline = ({ className, children, ...props }) => (
  <div className={cn("relative", className)} {...props}>
    {children}
  </div>
)

const TimelineItem = ({ className, children, ...props }) => (
  <div className={cn("relative flex gap-4 pb-8 last:pb-0", className)} {...props}>
    {children}
  </div>
)

const TimelineIndicator = ({ className, ...props }) => (
  <div
    className={cn(
      "absolute left-0 top-2 flex h-6 w-6 items-center justify-center rounded-full border-[3px] border-blue-300 bg-slate-800 shadow-xl ring-2 ring-blue-400/50",
      className
    )}
    {...props}
  >
    <div className="h-3 w-3 rounded-full bg-blue-300" />
  </div>
)

const TimelineContent = ({ className, children, ...props }) => (
  <div className={cn("flex-1 pl-10", className)} {...props}>
    {children}
  </div>
)

const TimelineConnector = ({ className, ...props }) => (
  <div
    className={cn(
      "absolute left-[11px] top-8 h-full w-1 bg-blue-300/70 shadow-sm",
      className
    )}
    {...props}
  />
)

export { Timeline, TimelineItem, TimelineIndicator, TimelineContent, TimelineConnector }

