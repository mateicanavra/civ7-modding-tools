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
// The package theme source (`styles/theme.css`) is dark-default: `:root, .dark`
// own the dark palette and `.light` re-skins — hosts (the app pre-paint script,
// the Storybook decorator, claude.ai/design's toggle) set an explicit class, and
// a class-less document renders dark. This resolver stays robust to any of those
// hosts: an explicit `.dark`/`.light` class wins, and otherwise the winning
// `color-scheme` (declared by every :root/.dark/.light rule) decides — so a
// component follows the app toolbar, the Storybook toolbar, OR claude.ai/design
// identically.

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
