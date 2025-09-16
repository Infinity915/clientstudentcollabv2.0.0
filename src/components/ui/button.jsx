import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-2xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group press-effect hover-lift',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-primary via-primary to-purple-600 text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/30 hover:scale-105',
        // ... other variants
      },
      size: {
        sm: 'h-10 px-5 py-2 text-sm',
        default: 'h-12 px-8 py-3',
        lg: 'h-14 px-10 py-4 text-lg',
        // ... other sizes
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, loading = false, glow = false, children, ...props }, ref) => {
  if (asChild) {
    // --- THIS IS THE FIX ---
    // If asChild is true, we render ONLY the Slot and the child passed to it.
    // We do not render the extra decorative divs.
    return (
      <Slot
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Slot>
    )
  }

  // If it's a regular button (asChild is false), we render it with all the effects.
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }), {
        'shadow-glow hover:shadow-xl hover:shadow-primary/60 animate-pulse': glow,
        'cursor-not-allowed opacity-70': loading,
      })}
      ref={ref}
      disabled={loading || props.disabled}
      {...props}
    >
      {(variant === 'default' || variant === 'gradient' || variant === 'neon') && (
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
        </div>
      )}
      {/* ... all your other effect divs ... */}
      <div className="relative flex items-center space-x-2 z-10">
        {loading && <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"><div className="absolute inset-0 border-2 border-transparent border-t-current/40 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div></div>}
        {children}
      </div>
      {glow && <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>}
    </button>
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }