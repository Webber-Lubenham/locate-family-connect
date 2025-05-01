import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { useDevice } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        login: [
          "bg-blue-600 text-white shadow-sm",
          "hover:bg-blue-700",
          "active:scale-[0.98]",
        ],
        register: [
          "bg-emerald-600 text-white shadow-sm",
          "hover:bg-emerald-700",
          "active:scale-[0.98]",
        ],
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        xs: "h-8 text-xs rounded-md px-2.5 py-1.5",
        mobile: "h-10 w-full px-4 py-2 text-base",
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
    const { isXs, isXxs, orientation, type: deviceType } = useDevice();
    const Comp = asChild ? Slot : "button"
    
    // Auto-adjust button size based on device and orientation unless explicitly set by props
    const getResponsiveSize = () => {
      if (size) return size; // Use provided size if specified
      
      if (orientation === 'portrait') {
        if (isXxs) return 'sm';
        if (isXs) return 'default';
        if (deviceType === 'mobile') return 'lg';
        return 'lg';
      } else {
        // Landscape orientation
        if (isXs) {
          return orientation === 'landscape' ? 'xs' : 'sm';
        }
        
        if (deviceType === 'mobile') {
          return orientation === 'landscape' ? 'sm' : 'default';
        }
        
        return 'default';
      }
    };
    
    // Adjust icon size based on device, orientation, and button size
    const getIconSize = () => {
      const currentSize = getResponsiveSize();
      
      if (orientation === 'portrait') {
        if (currentSize === 'xs' || isXxs) return '[&_svg]:size-4';
        if (currentSize === 'sm') return '[&_svg]:size-4.5';
        if (currentSize === 'lg') return '[&_svg]:size-5';
        return '[&_svg]:size-5';
      } else {
        // Landscape orientation
        if (currentSize === 'xs' || isXs) return '[&_svg]:size-3.5';
        if (currentSize === 'sm') return '[&_svg]:size-4';
        if (currentSize === 'lg') return '[&_svg]:size-5';
        return '[&_svg]:size-4';
      }
    };
    
    // Adjust font size based on orientation
    const getTextSize = () => {
      if (orientation === 'portrait') {
        if (isXxs) return 'text-sm';
        if (isXs) return 'text-base';
        return 'text-base';
      } else {
        return '';  // Use default text size in landscape
      }
    };
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size: getResponsiveSize(), className }),
          getIconSize(),
          getTextSize(),
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
