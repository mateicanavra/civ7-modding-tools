import { useCallback } from "react";

import { toast as sonnerToast } from "../../components/ui";

export type ToastVariant = "default" | "success" | "error" | "info";

export type ToastFn = (
  message: string,
  options?: { variant?: ToastVariant; duration?: number },
) => void;

/**
 * `useToast` — the sonner adapter that preserves the legacy
 * `toast(message, { variant })` call shape used throughout the Studio shell.
 *
 * This was previously an inline `useCallback` at the top of `AppContent`. It is
 * MOVED here verbatim (presentation-only): the variant maps to the matching
 * sonner method and the optional `duration` threads through unchanged. Extracting
 * it lets every container/hook depend on a stable, single toast contract instead
 * of re-deriving the adapter, without altering any notification behavior.
 */
export function useToast(): ToastFn {
  return useCallback<ToastFn>((message, options) => {
    const sonnerOptions = options?.duration !== undefined ? { duration: options.duration } : undefined;
    switch (options?.variant) {
      case "success":
        sonnerToast.success(message, sonnerOptions);
        break;
      case "error":
        sonnerToast.error(message, sonnerOptions);
        break;
      case "info":
        sonnerToast.info(message, sonnerOptions);
        break;
      default:
        sonnerToast(message, sonnerOptions);
    }
  }, []);
}
