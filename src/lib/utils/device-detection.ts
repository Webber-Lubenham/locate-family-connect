/**
 * Utilitário para detectar se o dispositivo atual é um dispositivo móvel
 * baseado no user agent e na largura da tela.
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') {
    return false; // SSR check
  }
  
  // Verificação por User Agent (mais comum)
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Verificação por tamanho de tela como backup
  const isMobileWidth = window.innerWidth <= 768;
  
  return (
    /android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent) || 
    ('ontouchstart' in window && isMobileWidth)
  );
}

/**
 * Retorna a plataforma específica do dispositivo móvel
 */
export function getMobilePlatform(): string | null {
  if (typeof window === 'undefined') {
    return null; // SSR check
  }
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad|ipod/i.test(userAgent)) {
    return 'ios';
  } else if (/android/i.test(userAgent)) {
    return 'android';
  } else if (/windows phone/i.test(userAgent)) {
    return 'windows';
  } else if (isMobileDevice()) {
    return 'unknown-mobile';
  }
  
  return null;
}
