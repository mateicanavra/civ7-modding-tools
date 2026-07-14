import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";

/**
 * Studio UI component workbench — the design-sync fidelity oracle.
 *
 * Stories import the package by its published name (the public API is the
 * story contract). The exact-match alias below points that name at the source
 * barrel so the workbench renders and HMRs source directly and never depends
 * on a prebuilt dist. It is UNCONDITIONAL by design (DESIGN.md §2.7): the
 * oracle's compare is dist-rendered cards (the converter bundles
 * `dist/index.js`) vs this source-rendered reference, so a source↔dist build
 * defect SURFACES as a compare mismatch. The converter side is
 * alias-independent: bare package specifiers shim to window.<Global> by rule
 * (lib/story-imports.mjs).
 *
 * Storybook 9 dissolved addon-essentials; @storybook/addon-docs is the one
 * addon installed + registered explicitly for autodocs.
 */
const config: StorybookConfig = {
  framework: { name: "@storybook/react-vite", options: {} },
  stories: ["../src/**/*.stories.@(tsx|jsx)"],
  addons: ["@storybook/addon-docs"],
  core: { disableTelemetry: true },
  viteFinal: (viteConfig) => {
    viteConfig.resolve ??= {};
    // Bun's isolated linker can install additional React copies for workspace
    // tooling (for example, Mintlify's MDX pipeline). Storybook's autodocs
    // must share the preview renderer's React instance or MDX hooks fail. Keep
    // MDX out of Vite's dependency prebundle so dedupe also applies within it.
    viteConfig.resolve.dedupe = [
      ...new Set([...(viteConfig.resolve.dedupe ?? []), "@mdx-js/react", "react", "react-dom"]),
    ];
    viteConfig.optimizeDeps ??= {};
    viteConfig.optimizeDeps.exclude = [
      ...new Set([...(viteConfig.optimizeDeps.exclude ?? []), "@mdx-js/react"]),
    ];
    const selfAlias = {
      // Exact match only — subpath imports (`./types` is types-only and never
      // resolved at runtime) must not be rewritten under src/index.ts.
      find: /^@swooper\/mapgen-studio-ui$/,
      replacement: fileURLToPath(new URL("../src/index.ts", import.meta.url)),
    };
    const existingAlias = viteConfig.resolve.alias;
    viteConfig.resolve.alias = Array.isArray(existingAlias)
      ? [...existingAlias, selfAlias]
      : [
          ...Object.entries((existingAlias as Record<string, string> | undefined) ?? {}).map(
            ([find, replacement]) => ({ find, replacement })
          ),
          selfAlias,
        ];
    // Tailwind v4 is Vite-wired (no PostCSS); without this plugin the package
    // CSS source never compiles and every story renders unstyled.
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    return viteConfig;
  },
};

export default config;
