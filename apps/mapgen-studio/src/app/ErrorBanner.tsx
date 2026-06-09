export type ErrorBannerProps = {
  /** The error message to surface, or null/undefined to render nothing. */
  message: string | null | undefined;
  /** Top offset (px) so the banner clears the floating header. */
  top: number;
};

/**
 * `ErrorBanner` — the centered, dismissable-by-resolution error chrome
 * (architecture/10 §4). Purely presentational: it renders the destructive-toned
 * banner only when a message is present. Previously an inline conditional in
 * `AppContent`'s return; MOVED here verbatim (same classes, same token-driven
 * destructive styling) so the rendered DOM is unchanged.
 */
export function ErrorBanner({ message, top }: ErrorBannerProps) {
  if (!message) return null;
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-30 max-w-[min(720px,calc(100%-32px))] rounded-lg border border-destructive/40 bg-destructive/15 px-4 py-2 text-xs text-destructive backdrop-blur-sm"
      style={{ top }}
    >
      {message}
    </div>
  );
}
