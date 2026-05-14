import * as React from "react"
import { cn } from "@/src/lib/utils"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'ghost' | 'danger', size?: 'default' | 'sm' | 'lg' }>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95",
          {
            "bg-[#5a5a40] text-white hover:bg-[#4a4a35] shadow-sm": variant === "default",
            "border-2 border-[#5a5a40]/10 bg-transparent hover:bg-[#5a5a40]/5 text-[#5a5a40]": variant === "outline",
            "hover:bg-[#5a5a40]/5 text-[#5a5a40]": variant === "ghost",
            "bg-red-500 text-white hover:bg-red-600 shadow-sm": variant === "danger",
            "h-10 px-4 py-2": size === "default",
            "h-9 px-3": size === "sm",
            "h-14 px-8 text-base font-semibold": size === "lg",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
