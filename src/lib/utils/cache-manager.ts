/**
 * Cache management utility for the application
 */

// Keys used for storage in the application
const STORAGE_KEYS = {
  AUTH: 'supabase.auth.token',
  PROFILE: 'app.user.profile',
  SETTINGS: 'app.settings',
  API_ERROR: 'app.api.error',
};

/**
 * Clears application cache including localStorage, sessionStorage
 * and optionally reloads the page
 */
export const clearAppCache = (reload = true): void => {
  console.log('[CACHE] Clearing application cache...');
  
  try {
    // Clear localStorage items related to our app
    Object.values(STORAGE_KEYS).forEach(key => {
      try {
        localStorage.removeItem(key);
        // Also try to remove any items that start with the key
        for (let i = 0; i < localStorage.length; i++) {
          const storageKey = localStorage.key(i);
          if (storageKey && storageKey.startsWith('supabase.auth.')) {
            localStorage.removeItem(storageKey);
          }
        }
      } catch (e) {
        console.warn(`[CACHE] Failed to remove localStorage item: ${key}`, e);
      }
    });
    
    // Clear sessionStorage items
    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn('[CACHE] Failed to clear sessionStorage', e);
    }
    
    console.log('[CACHE] Application cache cleared successfully');
    
    // Optionally reload the page
    if (reload) {
      console.log('[CACHE] Reloading page...');
      window.location.reload();
    }
  } catch (error) {
    console.error('[CACHE] Error clearing cache:', error);
    // If something goes wrong, attempt a hard reload
    if (reload) {
      window.location.href = window.location.origin + window.location.pathname + '?cache=clear&t=' + Date.now();
    }
  }
};

/**
 * Check if the current page load is a result of a cache clear request
 */
export const checkCacheClearRequest = (): void => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('cache') === 'clear') {
    console.log('[CACHE] Cache clear request detected in URL');
    
    // Clean URL by removing the cache parameter
    const newUrl = window.location.pathname + 
      (window.location.search ? window.location.search.replace(/[?&]cache=clear/, '') : '') + 
      window.location.hash;
      
    window.history.replaceState({}, document.title, newUrl);
  }
};

/**
 * Records an API error in localStorage
 */
export const recordApiError = (status: number, endpoint: string): void => {
  try {
    const errors = getApiErrors();
    errors.push({
      status,
      endpoint,
      timestamp: new Date().toISOString()
    });
    
    // Only keep the most recent 5 errors
    if (errors.length > 5) {
      errors.shift();
    }
    
    localStorage.setItem(STORAGE_KEYS.API_ERROR, JSON.stringify(errors));
    console.warn(`[CACHE] API Error recorded: ${status} on ${endpoint}`);
  } catch (e) {
    console.error('[CACHE] Failed to record API error:', e);
  }
};

/**
 * Get recorded API errors
 */
export const getApiErrors = (): Array<{status: number, endpoint: string, timestamp: string}> => {
  try {
    const errors = localStorage.getItem(STORAGE_KEYS.API_ERROR);
    return errors ? JSON.parse(errors) : [];
  } catch (e) {
    console.error('[CACHE] Failed to get API errors:', e);
    return [];
  }
};

/**
 * Check if the application has experienced API errors
 */
export const hasApiErrors = (): boolean => {
  return getApiErrors().length > 0;
};

/**
 * Clear recorded API errors
 */
export const clearApiErrors = (): void => {
  localStorage.removeItem(STORAGE_KEYS.API_ERROR);
};
