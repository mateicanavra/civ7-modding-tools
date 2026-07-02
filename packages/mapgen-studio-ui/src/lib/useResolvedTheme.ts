import { useSyncExternalStore } from "react";

// ============================================================================
// Resolved theme — the single source of truth for JS-forked surfaces
// ============================================================================
//
// The chrome themes purely off the CSS custom-property cascade and needs nothing
// from here. But a few surfaces can't skin off tokens alone — the deck.gl WebGL
// grid (literal RGBA in a <canvas>), the recipe-DAG lane colors (data color baked
// into SVG), and the sonner toast mode — so they need the RENDERED theme as a JS
// value. Reading it from the DOM root (rather than from a preference/prop) makes
// them follow whatever the host puts on the root, with no prop threading.
//
// Robust to BOTH class conventions in play, which is the whole point:
//   - the app + Storybook use a `.dark` class on <html> (absence => light `:root`)
//   - the design-sync bundle re-targets `:root` to dark and toggles a `.light`
//     class (absence => dark)
// Reading the winning `color-scheme` (which every one of those :root/.dark/.light
// rules declares) resolves correctly under either — so a component follows the
// app toolbar, the Storybook toolbar, OR claude.ai/design identically.

export type ResolvedTheme = "light" | "dark";

/** Read the theme rendered on the root right now. Returns a primitive, so it is
 * referentially stable when unchanged (no `useSyncExternalStore` tearing/loop). */
export function resolveThemeFromDom(): ResolvedTheme {
  if (typeof document === "undefined") return "dark";
  const root = document.documentElement;
  // Fast path: an explicit theme class (either convention) avoids a layout read.
  if (root.classList.contains("dark")) return "dark";
  if (root.classList.contains("light")) return "light";
  // No explicit class: trust the resolved color-scheme of the winning :root rule.
  return getComputedStyle(root).colorScheme.trim() === "light" ? "light" : "dark";
}

/** Subscribe to `<html>` class mutations. Module-scoped so its identity is stable
 * across renders (a changing `subscribe` re-subscribes every render). */
function subscribe(onStoreChange: () => void): () => void {
  if (typeof document === "undefined") return () => {};
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

/**
 * `useResolvedTheme` — the rendered theme via `useSyncExternalStore`, the correct
 * primitive for an external mutable source (the `<html>` class): no effect, no
 * setState-in-render, no stale first paint. Re-renders the instant the host flips
 * the theme class. SSR snapshot is dark (the studio is dark-first).
 */
export function useResolvedTheme(): ResolvedTheme {
  return useSyncExternalStore(subscribe, resolveThemeFromDom, () => "dark");
}
