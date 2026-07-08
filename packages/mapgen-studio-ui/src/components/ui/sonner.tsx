import type * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

import { useResolvedTheme } from "../../lib/useResolvedTheme.js";

/**
 * Toaster — sonner bound to the design tokens. Theme follows the rendered root
 * theme via the package's single theme-read API (`useResolvedTheme` — one theme
 * hook, LEDGER adjudication 5): the `<html>` class is read off the DOM so
 * toasts re-theme with the rest of the chrome under either class convention
 * (`.dark` app/Storybook, `.light` design-sync bundle).
 *
 * Toasts are a floating layer, so they carry a shadow and ride the `popover`
 * tier; styling is token-driven via CSS variables.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useResolvedTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
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

export { Toaster };
