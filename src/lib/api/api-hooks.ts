
import { useState, useCallback } from 'react';
import { supabase } from '../supabase';
import { toast } from '@/components/ui/use-toast';
import { recordApiError } from '../utils/cache-manager';

// Base options for all API requests
const baseApiHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

/**
 * Custom hook for making database requests with consistent error handling
 */
export function useDbQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  /**
   * Execute a query against the Supabase database with proper error handling
   */
  const executeQuery = useCallback(async <T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    options?: { 
      errorMessage?: string;
      successMessage?: string;
      endpointName?: string;
    }
  ) => {
    
    const {
      errorMessage = 'Erro ao executar operação',
      successMessage,
      endpointName = 'unknown-endpoint'
    } = options || {};
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await queryFn();
      
      if (error) {
        console.error(`Error executing query: ${error.message}`);
        console.error(`Error details:`, error);
        
        // Record the error for tracking
        const statusCode = typeof error.code === 'string' 
          ? parseInt(error.code) || 500 
          : (typeof error.code === 'number' ? error.code : 500);
        recordApiError(statusCode, endpointName);
        
        // Show error toast
        toast({
          title: 'Erro',
          description: errorMessage,
          variant: 'destructive',
        });
        
        setError(new Error(error.message || errorMessage));
        return { data: null, error };
      }
      
      // Show success message if provided
      if (successMessage) {
        toast({
          title: 'Sucesso',
          description: successMessage,
        });
      }
      
      return { data, error: null };
    } catch (err: any) {
      console.error(`Exception executing query:`, err);
      
      // Record the error for tracking
      recordApiError(500, endpointName);
      
      // Show error toast
      toast({
        title: 'Erro inesperado',
        description: errorMessage,
        variant: 'destructive',
      });
      
      setError(err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Get query builder with headers already applied
   */
  const getQueryBuilder = useCallback((table: string) => {
    // Return the table query builder
    return supabase.client.from(table);
    // Headers will be applied in specific query methods as needed in options
  }, []);
  
  return {
    executeQuery,
    getQueryBuilder,
    loading,
    error,
  };
}
