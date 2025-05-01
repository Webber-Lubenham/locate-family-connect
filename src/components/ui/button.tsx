
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { useDevice } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        xs: "h-8 text-xs rounded-md px-2.5 py-1.5", // New extra small size
        mobile: "h-10 w-full px-4 py-2 text-base", // New full-width mobile size
        touch: "h-11 min-w-[44px] px-4 py-2", // New size optimized for touch
        compact: "h-8 px-3 py-1 text-xs rounded-md", // Compact size for small spaces
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const { isXs, orientation, type: deviceType } = useDevice();
    const Comp = asChild ? Slot : "button"
    
    // Auto-adjust button size based on device unless explicitly set by props
    const getResponsiveSize = () => {
      if (size) return size; // Use provided size if specified
      
      if (isXs) {
        return orientation === 'landscape' ? 'xs' : 'sm';
      }
      
      if (deviceType === 'mobile') {
        return orientation === 'landscape' ? 'sm' : 'default';
      }
      
      return 'default';
    };
    
    // Adjust icon size based on device and button size
    const getIconSize = () => {
      const currentSize = getResponsiveSize();
      
      if (currentSize === 'xs' || isXs) return '[&_svg]:size-3.5';
      if (currentSize === 'sm') return '[&_svg]:size-4';
      if (currentSize === 'lg') return '[&_svg]:size-5';
      
      return '[&_svg]:size-4';
    };
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size: getResponsiveSize(), className }),
          getIconSize(),
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
