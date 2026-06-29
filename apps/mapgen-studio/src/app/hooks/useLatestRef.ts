import { type RefObject, useRef } from "react";

/**
 * `useLatestRef` — keep a ref pointing at the most recent render's `value`.
 *
 * The ref is updated during render (`ref.current = value`), NOT inside an
 * effect. This matters: effects run *after* paint, so an effect-synced ref lags
 * one commit behind during the render that changed `value`. A render-phase write
 * means `ref.current` is current the instant any callback created in this render
 * reads it — which is exactly what the Studio shell's "latest value" refs need
 * (e.g. mirroring operation status / live callbacks so long-lived handlers and
 * subscriptions read fresh state without being re-created on every change).
 *
 * Writing a ref during render is safe here because the write is idempotent and
 * derives only from the current props/state — it has no effect on what this
 * render returns, so it does not violate render purity in any observable way.
 * (React's own docs sanction this exact pattern for caching the latest value.)
 *
 * Returns the same `RefObject` across renders; only `.current` changes.
 */
export function useLatestRef<T>(value: T): RefObject<T> {
  const ref = useRef(value);
  // eslint-disable-next-line react-hooks/refs -- This render-phase ref write IS the hook's purpose: the write is idempotent, derives only from the current value, and affects nothing this render returns. React's own docs sanction caching the latest value this way (see the doc comment above). This is the single sanctioned site; all other "latest ref" mirrors route through here.
  ref.current = value;
  return ref;
}
