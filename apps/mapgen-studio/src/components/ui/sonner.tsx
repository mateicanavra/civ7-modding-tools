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
const useThemeFromClass = (): "light" | "dark" => {
  const getTheme = React.useCallback(
    (): "light" | "dark" =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark")
        ? "dark"
        : "light",
    [],
  );

  const [theme, setTheme] = React.useState<"light" | "dark">(getTheme);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const observer = new MutationObserver(() => setTheme(getTheme()));
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    setTheme(getTheme());
    return () => observer.disconnect();
  }, [getTheme]);

  return theme;
};

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
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
