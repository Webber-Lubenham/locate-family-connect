
import { useState, createContext, useContext } from "react";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "destructive";
}

interface ToastContextType {
  toasts: Toast[];
  toast: (props: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  
  if (!context) {
    return {
      toasts: [],
      toast: (props: Omit<Toast, "id">) => {
        console.warn("Toast context not found. Using fallback.");
        console.log("Toast:", props);
      },
      dismiss: (id: string) => {
        console.warn("Toast context not found. Using fallback.");
      }
    };
  }
  
  return context;
}

// Export toast function for direct imports
export const toast = (props: Omit<Toast, "id">) => {
  // This is a convenience method that will be properly implemented
  // when a provider is available
  const { toast } = useToast();
  toast(props);
};
