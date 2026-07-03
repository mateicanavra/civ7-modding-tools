import { cn } from "../../lib/utils.js";

export type ErrorBannerProps = {
  /** The error message to surface, or null/undefined to render nothing. */
  message: string | null | undefined;
  /** Top offset (px) so the banner clears the floating header. */
  top: number;
  /**
   * Placement override (positioning-as-chrome): the default absolute
   * centered-overlay placement is app chrome; hosts embedding the banner in a
   * different layout override it here (merged via `cn`, so conflicting
   * placement utilities win over the defaults).
   */
  className?: string;
};

/**
 * `ErrorBanner` — the centered, dismissable-by-resolution error chrome.
 * Purely presentational: it renders the token-driven destructive-toned banner
 * only when a message is present; the host dismisses it by resolution (passing
 * `null`).
 */
export function ErrorBanner({ message, top, className }: ErrorBannerProps) {
  if (!message) return null;
  return (
    // `role="alert"` + `aria-live="assertive"` so assistive tech announces a
    // generation/live failure as soon as it appears (it is the one interruptive
    // banner). It is dismissed by resolution (the parent passes `null`).
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "absolute left-1/2 -translate-x-1/2 z-30 max-w-[min(720px,calc(100%-32px))] rounded-lg border border-destructive/40 bg-destructive/15 px-4 py-2 text-data text-destructive backdrop-blur-sm",
        className
      )}
      style={{ top }}
    >
      {message}
    </div>
  );
}
