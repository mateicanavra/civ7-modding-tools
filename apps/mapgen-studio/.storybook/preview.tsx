// The token system + fonts, at module load, before any story renders. The
// collapsed `src/index.css` now carries BOTH (package theme.css + fonts.css
// imports), so the former direct @fontsource imports are gone with the app
// deps (B2 foundation move).
import "../src/index.css";

import type { Decorator, Preview } from "@storybook/react-vite";
import { Toaster, TooltipProvider } from "@swooper/mapgen-studio-ui";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { createStoryQueryClient } from "../src/storybook/queryStub";
import { resetStudioStores } from "../src/storybook/storeReset";

/**
 * The runtime provider shell MINUS the network seam, mirroring the nesting the
 * app assembles in `main.tsx` (root `QueryClientProvider`) + `StudioProviders.tsx`
 * (`TooltipProvider` wrapping the shell + a sibling `Toaster`):
 *
 *   QueryClientProvider(stub) > TooltipProvider(delay 300) > [Story, Toaster]
 *
 * A fresh stub QueryClient per mount keeps the `/rpc` seam cold and prevents
 * cross-story cache bleed. `TooltipProvider` is mandatory — tooltip-using
 * components render silently blank with no console error if it is absent.
 */
function StudioStoryProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createStoryQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        {children}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

/**
 * Theme is a class on `document.documentElement` (no next-themes). Own it
 * directly from the toolbar global rather than mounting `StudioProviders`/
 * `useThemePreference` (which read+write `localStorage["theme-preference"]`
 * and subscribe to matchMedia — story-hostile side effects). BOTH classes are
 * written explicitly: the package theme is dark-DEFAULT (`:root, .dark` +
 * `.light` re-skin), so light needs its class present, and `<Toaster/>`
 * re-themes off the root via the package's `useResolvedTheme` either way.
 * Set per render so flipping the toolbar re-themes live.
 */
const withStudioContext: Decorator = (Story, context) => {
  const theme = context.globals.theme ?? "dark";
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", theme !== "light");
    document.documentElement.classList.toggle("light", theme === "light");
  }
  return (
    <StudioStoryProviders>
      <Story />
    </StudioStoryProviders>
  );
};

const preview: Preview = {
  // Every story is autodoc-eligible — the story tree doubles as living docs.
  tags: ["autodocs"],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  // Dark-first by workbench convention: the studio is a dark instrument (its
  // pre-paint guard's catch path defaults to dark). The toolbar global — not
  // `localStorage["theme-preference"]` or OS preference — is the source of truth
  // for theme in stories.
  initialGlobals: { theme: "dark" },
  globalTypes: {
    theme: {
      description: "Studio theme (.dark class on <html>)",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "dark", title: "Dark", icon: "circle" },
          { value: "light", title: "Light", icon: "circlehollow" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withStudioContext],
  // Reset the module-singleton stores before each story so view/run/authoring
  // state never bleeds across stories in one preview iframe.
  beforeEach: () => {
    resetStudioStores();
  },
};

export default preview;
