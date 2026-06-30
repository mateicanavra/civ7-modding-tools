import * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Toaster — sonner bound to the design tokens. Theme follows the single
 * `.dark` class strategy (no next-themes, no prefers-color-scheme): we read
 * the class off `<html>` so toasts re-theme with the rest of the chrome.
 *
 * Toasts are a floating layer, so they carry a shadow and ride the `popover`
 * tier; styling is token-driven via CSS variables.
 */

/** Theme is an EXTERNAL store (the `<html>` class), not React state. */
type ThemeMode = "light" | "dark";

/**
 * Subscribe to `<html>` class mutations. Module-scoped so its identity is stable
 * across renders (a changing `subscribe` would make `useSyncExternalStore`
 * re-subscribe every render). Returns the unsubscribe cleanup.
 */
function subscribeToThemeClass(onStoreChange: () => void): () => void {
  if (typeof document === "undefined") return () => {};
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

/** Read the current theme off the `<html>` class. Returns a primitive, so it is
 * referentially stable when unchanged — no `useSyncExternalStore` tearing/loop. */
function getThemeSnapshot(): ThemeMode {
  return typeof document !== "undefined" && document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}

/** SSR / non-DOM snapshot: the app's default surface is light. */
function getThemeServerSnapshot(): ThemeMode {
  return "light";
}

/**
 * `useThemeFromClass` — the toast theme, sourced from the DOM class via
 * `useSyncExternalStore`. This is the correct primitive for reading an external
 * mutable source: no effect, no setState-in-render, no stale first paint. The
 * store re-themes toasts the instant the chrome's `.dark` class flips.
 */
function useThemeFromClass(): ThemeMode {
  return React.useSyncExternalStore(
    subscribeToThemeClass,
    getThemeSnapshot,
    getThemeServerSnapshot
  );
}

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useThemeFromClass();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "hsl(var(--popover))",
          "--normal-text": "hsl(var(--popover-foreground))",
          "--normal-border": "hsl(var(--border))",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg group-[.toaster]:text-data",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, useThemeFromClass };
