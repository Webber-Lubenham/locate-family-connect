import { useState, useRef, useCallback } from 'react';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Hook for managing Supabase API calls with standardized error handling.
 * Prevents infinite loops, provides development mode fallbacks, and handles errors consistently.
 */
export function useSupabaseQuery<T>() {
  // State for data and loading status
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Removido uso de toast para evitar erros
  
  // Use refs to track fetch attempts and prevent infinite loops
  const fetchAttemptedRef = useRef(false);
  const lastParamsRef = useRef<string | null>(null);
  const lastErrorRef = useRef<string | null>(null);
  
  /**
   * Execute a query with standardized error handling
   * @param queryFn The function that executes the Supabase query
   * @param params The parameters used for the query (for tracking repeat attempts)
   * @param options Additional options like mock data for development
   */
  const executeQuery = useCallback(async <P extends object>(
    queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
    params?: P,
    options?: {
      mockData?: T;
      skipParamsCheck?: boolean;
      forceFetch?: boolean;
      successMessage?: string;
    }
  ) => {
    // Create a params key for tracking repeat attempts with the same parameters
    const paramsKey = params ? JSON.stringify(params) : 'no-params';
    
    // Skip repeated fetch attempts with the same parameters (unless forced)
    if (
      !options?.forceFetch && 
      fetchAttemptedRef.current && 
      lastErrorRef.current &&
      !options?.skipParamsCheck && 
      paramsKey === lastParamsRef.current
    ) {
      console.log('[API] Skipping duplicate query due to previous error:', lastErrorRef.current);
      return { data, error: lastErrorRef.current };
    }
    
    // Update tracking refs
    fetchAttemptedRef.current = true;
    lastParamsRef.current = paramsKey;
    
    // Start the query
    setLoading(true);
    setError(null);
    
    try {
      // Execute the query function
      const { data: queryData, error: queryError } = await queryFn();
      
      // Handle query errors
      if (queryError) {
        console.error('[API] Query error:', queryError);
        setError(queryError.message);
        lastErrorRef.current = queryError.message;
        
        // Use mock data in development mode
        if (import.meta.env.DEV && options?.mockData) {
          console.log('[API] DEVELOPMENT MODE: Using mock data');
          setData(options.mockData);
          
          console.log("[DEV MODE] Usando dados fictícios devido a erro:", queryError.message);
          
          setLoading(false);
          return { data: options.mockData, error: queryError.message };
        }
        
        console.error("[API] Erro na consulta:", queryError.message);
        
        setLoading(false);
        return { data: null, error: queryError.message };
      }
      
      // Handle successful query
      setData(queryData);
      
      if (options?.successMessage) {
        console.log("[API] Sucesso:", options.successMessage);
      }
      
      setLoading(false);
      return { data: queryData, error: null };
    } catch (err: any) {
      // Handle unexpected errors
      console.error('[API] Unexpected error:', err);
      const errorMessage = err?.message || 'Erro desconhecido na consulta';
      setError(errorMessage);
      lastErrorRef.current = errorMessage;
      
      // Use mock data in development mode
      if (import.meta.env.DEV && options?.mockData) {
        console.log('[API] DEVELOPMENT MODE: Using mock data due to exception');
        setData(options.mockData);
        
        console.log("[DEV MODE] Usando dados fictícios devido a exceção:", errorMessage);
        
        setLoading(false);
        return { data: options.mockData, error: errorMessage };
      }
      
      console.error("[API] Erro na consulta (exceção):", errorMessage);
      
      setLoading(false);
      return { data: null, error: errorMessage };
    }
  }, []);
  
  /**
   * Reset error state and fetch tracking to allow trying again
   */
  const resetState = useCallback(() => {
    fetchAttemptedRef.current = false;
    lastParamsRef.current = null;
    lastErrorRef.current = null;
    setError(null);
  }, []);
  
  return {
    data,
    loading,
    error,
    executeQuery,
    resetState
  };
}
