
import * as React from "react"

// Breakpoints definidos para diferentes tamanhos de tela
export const BREAKPOINTS = {
  XS: 360,    // Smartphones pequenos
  MOBILE: 640,  // Smartphones
  TABLET: 768,  // Tablets pequenos
  LAPTOP: 1024, // Tablets grandes e laptops
  DESKTOP: 1280 // Desktop
}

// Tipo para orientação do dispositivo
export type DeviceOrientation = 'portrait' | 'landscape';

// Tipo para o tipo de dispositivo
export type DeviceType = 'mobile' | 'tablet' | 'laptop' | 'desktop';

/**
 * Hook que fornece informações completas sobre o dispositivo
 * Retorna tipo de dispositivo, orientação, e se o dispositivo é móvel, tablet, etc.
 */
export function useDevice() {
  const [deviceInfo, setDeviceInfo] = React.useState({
    type: 'desktop' as DeviceType,
    orientation: 'portrait' as DeviceOrientation,
    isMobile: false,
    isTablet: false,
    isSmallDevice: false,
    isXs: false,
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });
  
  React.useEffect(() => {
    // Função para atualizar todas as informações do dispositivo de uma vez
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const orientation = height > width ? 'portrait' : 'landscape';
      
      // Determinar o tipo de dispositivo
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
        width,
        height
      });
    };
    
    // Atualizar na montagem
    updateDeviceInfo();
    
    // Adicionar listener para redimensionamento
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);
    
    // Limpar event listeners
    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);
  
  return deviceInfo;
}

/**
 * Hook para verificar se o dispositivo é mobile (< 640px)
 * Mantido para compatibilidade com código existente
 */
export function useIsMobile() {
  const { isMobile } = useDevice();
  return isMobile;
}

/**
 * Hook para verificar se o dispositivo é tablet (640px-1023px)
 * Mantido para compatibilidade com código existente
 */
export function useIsTablet() {
  const { isTablet } = useDevice();
  return isTablet;
}

/**
 * Hook para verificar se o dispositivo é um dispositivo pequeno (mobile ou tablet)
 * Mantido para compatibilidade com código existente
 */
export function useIsSmallDevice() {
  const { isSmallDevice } = useDevice();
  return isSmallDevice;
}

/**
 * Hook para determinar o tipo de dispositivo
 * Mantido para compatibilidade com código existente
 */
export function useDeviceType() {
  const { type } = useDevice();
  return type;
}

/**
 * Hook para verificar a orientação do dispositivo
 * Mantido para compatibilidade com código existente
 */
export function useOrientation() {
  const { orientation } = useDevice();
  return orientation;
}

// Hook para verificar tamanhos específicos
export function useBreakpoint(breakpoint: number) {
  const { width } = useDevice();
  return width >= breakpoint;
}

// Adicionando default export como compatibilidade
export default useIsMobile;
