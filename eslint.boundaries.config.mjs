/**
 * Quarantined ESLint config for the IMPORT LAYER only (habitat-boundary-tags).
 *
 * Exactly one rule lives here: @nx/enforce-module-boundaries, enforcing the
 * dependency-constraint table of docs/projects/habitat-harness/taxonomy.md §3
 * over the kind:* tags in each project's package.json. Nothing else may be
 * added to this config (FRAME hard core #2: one owner per layer — syntax
 * rules belong to GritQL, hygiene to Biome).
 *
 * Run via the `boundaries` Nx target (never `lint`):
 *   bun run nx run-many -t boundaries
 * Locked at adoption: any red edge is a violation, not negotiable debt.
 * Revising the taxonomy is a deliberate change to taxonomy.md + this file
 * together (revision protocol in tools/habitat/README.md).
 */
import nxPlugin from "@nx/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { boundaryRuleOptions } from "./tools/habitat/src/validation/boundary-config.js";

export default [
  {
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: "off",
      reportUnusedInlineConfigs: "off",
    },
  },
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/types/**",
      "**/mod/**",
      "**/example-generated-mod/**",
      ".nx/**",
      ".scratch/**",
      ".civ7/**",
      "docs/**",
      "apps/docs/public/**",
      "**/*.d.ts",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    languageOptions: { parser: tsParser },
    plugins: { "@nx": nxPlugin },
    rules: {
      "@nx/enforce-module-boundaries": ["error", boundaryRuleOptions],
    },
  },
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    plugins: { "@nx": nxPlugin },
    rules: {
      "@nx/enforce-module-boundaries": ["error", boundaryRuleOptions],
    },
  },
];
