// Self-hosted fonts + the token system, at module load, before any story
// renders. Fonts come from DIRECT @fontsource imports — never the package's
// `fonts.css`, whose url()s are dist-layout-relative and dead from source
// (DESIGN.md §2.9). The CSS import is the package's own compile entry
// (`src/styles/index.css`: tailwindcss + tw-animate-css + theme.css +
// package-scoped @source), compiled by the Tailwind v4 Vite plugin — without
// it every story renders unstyled.
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "../src/styles/index.css";

import type { Decorator, Preview } from "@storybook/react-vite";
import { Toaster, TooltipProvider } from "@swooper/mapgen-studio-ui";
import type { ReactNode } from "react";

/**
 * The package's ambient context, and nothing else (LEDGER adjudication 12):
 * TooltipProvider is mandatory — tooltip-using components render silently
 * blank with no console error without it. Toaster is the sink for the Toaster
 * story's toast.*() calls. No QueryClient, no store reset: every storied
 * component is props-driven (classification ledger, frozen 2026-07-01).
 */
function StoryProviders({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={300}>
      {children}
      <Toaster />
    </TooltipProvider>
  );
}

/**
 * Theme = a class on <html>, owned by the toolbar global. Both classes are
 * written explicitly so the decorator is correct under either authoring
 * convention (light-default `:root`+`.dark` or dark-default `:root`+`.light`
 * — the package CSS owns that decision); useResolvedTheme and the Toaster
 * re-theme off the DOM either way.
 */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme ?? "dark";
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", theme !== "light");
    document.documentElement.classList.toggle("light", theme === "light");
  }
  return (
    <StoryProviders>
      <Story />
    </StoryProviders>
  );
};

const preview: Preview = {
  // Every story is autodoc-eligible — the story tree doubles as living docs.
  tags: ["autodocs"],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  // Dark-first by studio convention.
  initialGlobals: { theme: "dark" },
  globalTypes: {
    theme: {
      description: "Studio theme (class on <html>)",
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
  decorators: [withTheme],
};

export default preview;
