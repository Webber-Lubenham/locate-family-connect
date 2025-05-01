
import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
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

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean>(false)
  
  React.useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT)
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

// Para determinar o tipo de dispositivo
export function useDeviceType() {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  
  if (isMobile) return 'mobile'
  if (isTablet) return 'tablet'
  return 'desktop'
}

// Adicionando default export como compatibilidade
export default useIsMobile
