
import * as React from "react"

// Enhanced breakpoints for greater granularity
export const BREAKPOINTS = {
  XXS: 320,   // Extra small smartphones
  XS: 360,    // Small smartphones
  SM: 480,    // Medium smartphones
  MOBILE: 640,  // Large smartphones
  TABLET: 768,  // Small tablets
  MD: 900,    // Medium tablets
  LAPTOP: 1024, // Large tablets/small laptops
  LG: 1200,   // Standard laptops
  DESKTOP: 1280, // Small desktops
  XL: 1536    // Large desktops
}

// Type for orientation of the device
export type DeviceOrientation = 'portrait' | 'landscape';

// Type for the device type
export type DeviceType = 'mobile' | 'tablet' | 'laptop' | 'desktop';

/**
 * Enhanced hook that provides comprehensive device information
 * Returns device type, orientation, and various device state flags
 */
export function useDevice() {
  const [deviceInfo, setDeviceInfo] = React.useState({
    type: 'desktop' as DeviceType,
    orientation: 'portrait' as DeviceOrientation,
    isMobile: false,
    isTablet: false,
    isSmallDevice: false,
    isXs: false,
    isXxs: false,
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    aspectRatio: typeof window !== 'undefined' ? window.innerWidth / window.innerHeight : 1.6,
    isHighDensity: typeof window !== 'undefined' ? window.devicePixelRatio > 1.5 : false
  });
  
  React.useEffect(() => {
    // Enhanced function to update all device information at once
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const orientation = height > width ? 'portrait' : 'landscape';
      const aspectRatio = width / height;
      const isHighDensity = window.devicePixelRatio > 1.5;
      
      // Enhanced device type determination with more granularity
      let type: DeviceType;
      if (width < BREAKPOINTS.MOBILE) {
        type = 'mobile';
      } else if (width < BREAKPOINTS.LAPTOP) {
        type = 'tablet';
      } else if (width < BREAKPOINTS.DESKTOP) {
        type = 'laptop';
      } else {
        type = 'desktop';
      }
      
      setDeviceInfo({
        type,
        orientation,
        isMobile: width < BREAKPOINTS.MOBILE,
        isTablet: width >= BREAKPOINTS.MOBILE && width < BREAKPOINTS.LAPTOP,
        isSmallDevice: width < BREAKPOINTS.LAPTOP,
        isXs: width < BREAKPOINTS.XS,
        isXxs: width < BREAKPOINTS.XXS,
        width,
        height,
        aspectRatio,
        isHighDensity
      });
    };
    
    // Initial update
    updateDeviceInfo();
    
    // Add listeners for resize and orientation change
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);
  
  return deviceInfo;
}

/**
 * Hook to check if device is mobile (< 640px)
 * Kept for backward compatibility
 */
export function useIsMobile() {
  const { isMobile } = useDevice();
  return isMobile;
}

/**
 * Hook to check if device is tablet (640px-1023px)
 * Kept for backward compatibility
 */
export function useIsTablet() {
  const { isTablet } = useDevice();
  return isTablet;
}

/**
 * Hook to check if device is a small device (mobile or tablet)
 * Kept for backward compatibility
 */
export function useIsSmallDevice() {
  const { isSmallDevice } = useDevice();
  return isSmallDevice;
}

/**
 * Hook to determine device type
 * Kept for backward compatibility
 */
export function useDeviceType() {
  const { type } = useDevice();
  return type;
}

/**
 * Hook to check device orientation
 * Kept for backward compatibility
 */
export function useOrientation() {
  const { orientation } = useDevice();
  return orientation;
}

// Hook to check specific breakpoints
export function useBreakpoint(breakpoint: number) {
  const { width } = useDevice();
  return width >= breakpoint;
}

// Adding default export for compatibility
export default useIsMobile;
