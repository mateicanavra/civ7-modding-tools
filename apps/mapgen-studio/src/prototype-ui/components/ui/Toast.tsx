import React, { useCallback, useState, createContext, useContext } from 'react';
// ============================================================================
// TOAST
// ============================================================================
// Simple toast notification system following shadcn/ui patterns.
// For full toast system, consider using Sonner.
// ============================================================================
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';
// ============================================================================
// Types
// ============================================================================
type ToastVariant = 'default' | 'success' | 'error' | 'info';
interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}
interface ToastContextValue {
  toasts: Toast[];
  toast: (
  message: string,
  options?: {
    variant?: ToastVariant;
    duration?: number;
  })
  => void;
  dismiss: (id: string) => void;
}
// ============================================================================
// Context
// ============================================================================
const ToastContext = createContext<ToastContextValue | null>(null);
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
// ============================================================================
// Provider
// ============================================================================
export interface ToastProviderProps {
  children: React.ReactNode;
  lightMode?: boolean;
}
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  lightMode = false
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback(
    (
    message: string,
    options?: {
      variant?: ToastVariant;
      duration?: number;
    }) =>
    {
      const id = Math.random().toString(36).slice(2);
      const newToast: Toast = {
        id,
        message,
        variant: options?.variant || 'default',
        duration: options?.duration ?? 3000
      };
      setToasts((prev) => [...prev, newToast]);
      if (newToast.duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, newToast.duration);
      }
    },
    []
  );
  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  return (
    <ToastContext.Provider
      value={{
        toasts,
        toast,
        dismiss
      }}>

      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} lightMode={lightMode} />
    </ToastContext.Provider>);

};
// ============================================================================
// Viewport
// ============================================================================
interface ToastViewportProps {
  toasts: Toast[];
  dismiss: (id: string) => void;
  lightMode: boolean;
}
const ToastViewport: React.FC<ToastViewportProps> = ({
  toasts,
  dismiss,
  lightMode
}) => {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2">
      {toasts.map((toast) =>
      <ToastItem
        key={toast.id}
        toast={toast}
        onDismiss={() => dismiss(toast.id)}
        lightMode={lightMode} />

      )}
    </div>);

};
// ============================================================================
// Toast Item
// ============================================================================
interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
  lightMode: boolean;
}
const ToastItem: React.FC<ToastItemProps> = ({
  toast,
  onDismiss,
  lightMode
}) => {
  const icons: Record<ToastVariant, React.ReactNode> = {
    default: null,
    success: <CheckCircle className="h-4 w-4 text-emerald-500" />,
    error: <AlertCircle className="h-4 w-4 text-red-500" />,
    info: <Info className="h-4 w-4 text-blue-500" />
  };
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2.5 rounded-lg border shadow-lg',
        'animate-in slide-in-from-bottom-2 fade-in-0',
        lightMode ?
        'bg-white border-gray-200 text-[#1f2937]' :
        'bg-[#1a1a1f] border-[#2a2a32] text-[#e8e8ed]'
      )}>

      {icons[toast.variant]}
      <span className="text-[12px] font-medium">{toast.message}</span>
      <button
        onClick={onDismiss}
        className={cn(
          'ml-2 p-0.5 rounded transition-colors',
          lightMode ?
          'text-gray-400 hover:text-gray-600 hover:bg-gray-100' :
          'text-[#5a5a66] hover:text-[#8a8a96] hover:bg-[#222228]'
        )}>

        <X className="h-3.5 w-3.5" />
      </button>
    </div>);

};
// ============================================================================
// Simple toast function for direct usage
// ============================================================================
let toastFn: ToastContextValue['toast'] | null = null;
export const setToastFunction = (fn: ToastContextValue['toast']) => {
  toastFn = fn;
};
export const showToast = (
message: string,
options?: {
  variant?: ToastVariant;
  duration?: number;
}) =>
{
  if (toastFn) {
    toastFn(message, options);
  } else {
    console.warn('Toast provider not initialized');
  }
};
