
import * as React from "react"
import { cn } from "@/lib/utils"
import { useDevice } from "@/hooks/use-mobile"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const { isXs, isXxs, orientation, type: deviceType } = useDevice();
    
    // Adjust input height and padding based on device and orientation
    const getInputStyles = () => {
      if (orientation === 'portrait') {
        if (isXxs) {
          return 'h-10 px-3 py-2 text-sm'; 
        }
        if (isXs) {
          return 'h-11 px-3.5 py-2.5';
        }
        if (deviceType === 'mobile') {
          return 'h-12 px-4 py-2.5';
        }
        return 'h-12 px-4 py-3 md:h-14 md:px-5 md:py-3.5';
      } else {
        // Landscape orientation
        if (isXs) {
          return orientation === 'landscape' 
            ? 'h-8 px-2 py-1 text-sm' 
            : 'h-9 px-2.5 py-1.5 text-sm';
        }
        
        if (deviceType === 'mobile') {
          return orientation === 'landscape'
            ? 'h-9 px-2.5 py-1.5'
            : 'h-10 px-3 py-2';
        }
        
        return 'h-10 px-3 py-2 md:h-11 md:px-4 md:py-2';
      }
    };
    
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-md border border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          getInputStyles(),
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
