import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";

/**
 * MapGen Studio component workbench (Stage 1).
 *
 * The builder inherits the app's `vite.config.ts` essentials through `viteFinal`
 * — the `@` and `child_process` resolve aliases plus the Tailwind v4 plugin — so
 * stories render the real components in their real styling context. It does NOT
 * carry the app's dev `server` block: there is no `/rpc` proxy and no daemon
 * watch here, because the workbench runs with no daemon (Stage-1 invariant: no
 * story fires a live `/rpc` call). `@vitejs/plugin-react` is intentionally not
 * re-added — `@storybook/react-vite` already provides it.
 *
 * Storybook 9 dissolved `addon-essentials` (viewport/controls/interactions/
 * actions moved into core); `@storybook/addon-docs` is the one addon that must
 * be installed + registered explicitly for autodocs.
 */
const config: StorybookConfig = {
  framework: { name: "@storybook/react-vite", options: {} },
  stories: ["../src/**/*.stories.@(tsx|jsx)"],
  addons: ["@storybook/addon-docs"],
  core: { disableTelemetry: true },
  viteFinal: (viteConfig, { configType }) => {
    viteConfig.resolve ??= {};

    // Mirror vite.config.ts aliases. Paths resolve relative to `.storybook/`,
    // one level deeper than the app's `vite.config.ts`, so `./src` becomes
    // `../src`. The `@swooper/mapgen-viz` source alias is dev/serve-only, exactly
    // as the app gates it on `command === "serve"`.
    const extraAlias: Record<string, string> = {
      "@": fileURLToPath(new URL("../src", import.meta.url)),
      child_process: fileURLToPath(new URL("../src/shims/child_process.ts", import.meta.url)),
      ...(configType === "DEVELOPMENT"
        ? {
            "@swooper/mapgen-viz": fileURLToPath(
              new URL("../../../packages/mapgen-viz/src/index.ts", import.meta.url)
            ),
          }
        : {}),
    };

    const existingAlias = viteConfig.resolve.alias;
    viteConfig.resolve.alias = Array.isArray(existingAlias)
      ? [
          ...existingAlias,
          ...Object.entries(extraAlias).map(([find, replacement]) => ({ find, replacement })),
        ]
      : { ...(existingAlias as Record<string, string> | undefined), ...extraAlias };

    // Tailwind v4 is wired through Vite (not PostCSS); without this plugin the
    // `@import "tailwindcss"` + `@custom-variant`/token directives in
    // `src/index.css` never compile and every story renders unstyled. React stays
    // framework-owned.
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];

    return viteConfig;
  },
};

export default config;
