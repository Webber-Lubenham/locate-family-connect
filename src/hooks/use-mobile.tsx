
import * as React from "react"

// Breakpoints definidos para diferentes tamanhos de tela
export const BREAKPOINTS = {
  MOBILE: 640,  // Smartphones
  TABLET: 768,  // Tablets pequenos
  LAPTOP: 1024, // Tablets grandes e laptops
  DESKTOP: 1280 // Desktop
}

/**
 * Hook para verificar se o dispositivo é mobile (< 640px)
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.MOBILE)
    }
    
    // Verificar inicialmente
    checkMobile()
    
    // Adicionar evento de redimensionamento
    window.addEventListener('resize', checkMobile)
    
    // Limpar evento ao desmontar
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

/**
 * Hook para verificar se o dispositivo é tablet (640px-1023px)
 */
export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean>(false)
  
  React.useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth
      setIsTablet(width >= BREAKPOINTS.MOBILE && width < BREAKPOINTS.LAPTOP)
    }
    
    // Verificar inicialmente
    checkTablet()
    
    // Adicionar evento de redimensionamento
    window.addEventListener('resize', checkTablet)
    
    // Limpar evento ao desmontar
    return () => window.removeEventListener('resize', checkTablet)
  }, [])
  
  return isTablet
}

/**
 * Hook para verificar se o dispositivo é um dispositivo pequeno (mobile ou tablet)
 */
export function useIsSmallDevice() {
  const [isSmallDevice, setIsSmallDevice] = React.useState<boolean>(false)
  
  React.useEffect(() => {
    const checkSmallDevice = () => {
      setIsSmallDevice(window.innerWidth < BREAKPOINTS.LAPTOP)
    }
    
    // Verificar inicialmente
    checkSmallDevice()
    
    // Adicionar evento de redimensionamento
    window.addEventListener('resize', checkSmallDevice)
    
    // Limpar evento ao desmontar
    return () => window.removeEventListener('resize', checkSmallDevice)
  }, [])
  
  return isSmallDevice
}

/**
 * Hook para determinar o tipo de dispositivo
 */
export function useDeviceType() {
  const [deviceType, setDeviceType] = React.useState<'mobile' | 'tablet' | 'laptop' | 'desktop'>('desktop')
  
  React.useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth
      if (width < BREAKPOINTS.MOBILE) {
        setDeviceType('mobile')
      } else if (width < BREAKPOINTS.LAPTOP) {
        setDeviceType('tablet')
      } else if (width < BREAKPOINTS.DESKTOP) {
        setDeviceType('laptop')
      } else {
        setDeviceType('desktop')
      }
    }
    
    // Verificar inicialmente
    checkDeviceType()
    
    // Adicionar evento de redimensionamento
    window.addEventListener('resize', checkDeviceType)
    
    // Limpar evento ao desmontar
    return () => window.removeEventListener('resize', checkDeviceType)
  }, [])
  
  return deviceType
}

/**
 * Hook para verificar a orientação do dispositivo
 */
export function useOrientation() {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  )
  
  React.useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }
    
    // Verificar inicialmente
    checkOrientation()
    
    // Adicionar evento de redimensionamento
    window.addEventListener('resize', checkOrientation)
    
    // Limpar evento ao desmontar
    return () => window.removeEventListener('resize', checkOrientation)
  }, [])
  
  return orientation
}

// Hooks para verificar tamanhos específicos
export function useBreakpoint(breakpoint: number) {
  const [matches, setMatches] = React.useState<boolean>(false)
  
  React.useEffect(() => {
    const checkBreakpoint = () => {
      setMatches(window.innerWidth >= breakpoint)
    }
    
    // Verificar inicialmente
    checkBreakpoint()
    
    // Adicionar evento de redimensionamento
    window.addEventListener('resize', checkBreakpoint)
    
    // Limpar evento ao desmontar
    return () => window.removeEventListener('resize', checkBreakpoint)
  }, [breakpoint])
  
  return matches
}

// Adicionando default export como compatibilidade
export default useIsMobile
