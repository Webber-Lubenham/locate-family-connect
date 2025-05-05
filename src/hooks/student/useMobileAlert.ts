
import { useCallback } from 'react';

/**
 * Hook to handle mobile alerts
 */
export interface MobileAlertProps {
  setAlertOpen: (open: boolean) => void;
  setAlertSuccess: (success: boolean) => void;
  setAlertMessage: (message: string) => void;
  setAlertDetails: (details: string) => void;
}

export function useMobileAlert({
  setAlertOpen,
  setAlertSuccess,
  setAlertMessage,
  setAlertDetails
}: MobileAlertProps) {
  
  /**
   * Shows a mobile alert
   */
  const showMobileAlert = useCallback((
    success: boolean, 
    message: string, 
    details: string
  ) => {
    setAlertSuccess(success);
    setAlertMessage(message);
    setAlertDetails(details);
    setAlertOpen(true);
  }, [setAlertOpen, setAlertSuccess, setAlertMessage, setAlertDetails]);

  return {
    showMobileAlert
  };
}
