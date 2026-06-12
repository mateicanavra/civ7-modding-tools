import { Toaster, TooltipProvider } from "../components/ui";
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
  return (
    <TooltipProvider delayDuration={300}>
      <StudioShell
        themePreference={preference}
        isLightMode={isLightMode}
        cyclePreference={cyclePreference}
      />
      <Toaster />
    </TooltipProvider>
  );
}
