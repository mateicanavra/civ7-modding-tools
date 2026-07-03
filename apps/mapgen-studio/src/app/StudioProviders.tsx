import { Toaster, TooltipProvider } from "@swooper/mapgen-studio-ui";
import { useEffect } from "react";
import { useThemePreference } from "../ui/hooks";

import { StudioShell } from "./StudioShell";

/**
 * `StudioProviders` — the provider shell (architecture/10 §4). It owns the
 * cross-cutting UI providers (tooltip portal + toast surface) and the theme
 * preference wiring, then renders `StudioShell` with the resolved theme.
 *
 * This is the body of the former `App` wrapper, MOVED here unchanged. The
 * `QueryClientProvider` is intentionally NOT owned here — it lives at the module
 * root in `main.tsx` (client-data slice) so the query cache survives the
 * dev-only StrictMode skip. App.tsx now reduces to re-exporting this shell.
 */
export function StudioProviders() {
  const { preference, isLightMode, cyclePreference } = useThemePreference();

  // Runtime half of the single-`.dark`-class strategy: the index.html bootstrap
  // owns the pre-paint initial state (no flash); this effect owns every change
  // after hydration so the theme toggle actually re-themes the chrome
  // (theme-class-sync spec — without it the cycle only relabels the button).
  // Write BOTH classes explicitly (not just toggle `.dark`) so the rendered theme
  // is unambiguous on the root: components read it back via `useResolvedTheme`,
  // and an explicit `.light` also matches the design-sync bundle's convention.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", !isLightMode);
    root.classList.toggle("light", isLightMode);
  }, [isLightMode]);

  return (
    <TooltipProvider delayDuration={300}>
      <StudioShell themePreference={preference} cyclePreference={cyclePreference} />
      <Toaster />
    </TooltipProvider>
  );
}
