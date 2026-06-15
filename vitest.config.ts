import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const r = (p: string) => join(dirname(fileURLToPath(import.meta.url)), p);

export default defineConfig({
  test: {
    environment: "node",
    projects: [
      {
        extends: true,
        root: r("packages/cli"),
        test: {
          name: "cli",
          env: {
            // Ensure oclif does not attempt to load dev plugins (like @oclif/plugin-plugins)
            // during tests; treat tests as production to suppress noisy warnings.
            NODE_ENV: "production",
          },
        },
      },
      {
        extends: true,
        root: r("packages/config"),
        test: { name: "config" },
      },
      {
        extends: true,
        root: r("packages/civ7-direct-control"),
        test: { name: "civ7-direct-control" },
      },
      {
        extends: true,
        root: r("packages/sdk"),
        test: { name: "sdk" },
      },
      {
        extends: true,
        root: r("apps/docs"),
        test: { name: "docs" },
      },
      {
        extends: true,
        root: r("apps/playground"),
        test: { name: "playground" },
      },
      {
        extends: true,
        root: r("apps/mapgen-studio"),
        // Mirror the app's `@/*` -> src alias (tsconfig + vite) so vitest resolves
        // the shadcn `components/ui` -> `@/lib/utils` import chain.
        resolve: {
          alias: [
            { find: "@", replacement: r("apps/mapgen-studio/src") },
            {
              find: /^\/mods\/(.+)$/,
              replacement: `${r("mods")}/$1`,
            },
            {
              find: /^@mapgen\/domain\/config(?:\.js)?$/,
              replacement: r("mods/mod-swooper-maps/src/domain/config.ts"),
            },
            {
              find: /^@mapgen\/domain$/,
              replacement: r("mods/mod-swooper-maps/src/domain/index.ts"),
            },
            {
              find: /^@mapgen\/domain\/(.+)\.js$/,
              replacement: `${r("mods/mod-swooper-maps/src/domain")}/$1.ts`,
            },
            {
              find: /^@mapgen\/domain\/(.+)$/,
              replacement: `${r("mods/mod-swooper-maps/src/domain")}/$1`,
            },
          ],
        },
        test: { name: "mapgen-studio" },
      },
      {
        extends: true,
        root: r("packages/plugins/plugin-files"),
        test: { name: "plugin-files" },
      },
      {
        extends: true,
        root: r("packages/plugins/plugin-graph"),
        test: { name: "plugin-graph" },
      },
      {
        extends: true,
        root: r("packages/plugins/plugin-git"),
        test: { name: "plugin-git" },
      },
      {
        extends: true,
        root: r("packages/plugins/plugin-mods"),
        test: { name: "plugin-mods" },
      },
      {
        extends: true,
        root: r("tools/habitat-harness"),
        test: {
          name: "habitat-harness",
          env: {
            NODE_ENV: "production",
          },
        },
      },
    ],
  },
});
