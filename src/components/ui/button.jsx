import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:from-secondary hover:to-primary": variant === "default",
            "bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground hover:from-destructive/90 hover:to-destructive": variant === "destructive",
            "border border-luxury bg-charcoal text-foreground hover:bg-card/80 hover:border-accent/60": variant === "outline",
            "bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/90 hover:to-secondary": variant === "secondary",
            "bg-transparent hover:bg-accent/20 text-foreground hover:text-accent": variant === "ghost",
            "text-accent underline-offset-4 hover:underline hover:text-accent/80": variant === "link",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

