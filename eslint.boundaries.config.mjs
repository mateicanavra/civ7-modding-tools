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
 * together (revision protocol in tools/habitat-harness/README.md).
 */
import nxPlugin from "@nx/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const depConstraints = [
  {
    sourceTag: "kind:workspace",
    onlyDependOnLibsWithTags: [
      "kind:sdk",
      "kind:engine",
      "kind:adapter",
      "kind:control",
      "kind:foundation",
      "kind:plugin",
      "kind:mod",
      "kind:tooling",
    ],
  },
  { sourceTag: "kind:foundation", onlyDependOnLibsWithTags: ["kind:foundation"] },
  { sourceTag: "kind:adapter", onlyDependOnLibsWithTags: ["kind:foundation"] },
  { sourceTag: "kind:engine", onlyDependOnLibsWithTags: ["kind:adapter", "kind:foundation"] },
  { sourceTag: "kind:plugin", onlyDependOnLibsWithTags: ["kind:plugin", "kind:foundation"] },
  {
    sourceTag: "kind:sdk",
    onlyDependOnLibsWithTags: ["kind:engine", "kind:adapter", "kind:foundation", "kind:plugin"],
  },
  {
    sourceTag: "kind:control",
    onlyDependOnLibsWithTags: ["kind:control", "kind:foundation", "kind:adapter", "kind:engine"],
  },
  {
    sourceTag: "kind:mod",
    onlyDependOnLibsWithTags: [
      "kind:sdk",
      "kind:engine",
      "kind:adapter",
      "kind:foundation",
      "kind:control",
      "kind:plugin",
    ],
  },
  {
    sourceTag: "kind:app",
    onlyDependOnLibsWithTags: [
      "kind:sdk",
      "kind:engine",
      "kind:adapter",
      "kind:foundation",
      "kind:plugin",
      "kind:control",
      "kind:mod",
      "kind:tooling",
    ],
  },
  { sourceTag: "kind:tooling", onlyDependOnLibsWithTags: ["kind:tooling", "kind:foundation"] },
  {
    sourceTag: "habitat:runtime",
    onlyDependOnLibsWithTags: ["habitat:runtime", "habitat:service"],
  },
  {
    sourceTag: "habitat:service",
    onlyDependOnLibsWithTags: ["habitat:runtime", "habitat:service"],
  },
  {
    sourceTag: "habitat:cli",
    onlyDependOnLibsWithTags: ["habitat:runtime", "habitat:service", "habitat:cli"],
  },
  {
    sourceTag: "layer:service-entry",
    onlyDependOnLibsWithTags: ["layer:service-shell", "layer:service-entry"],
  },
  {
    sourceTag: "layer:service-shell",
    onlyDependOnLibsWithTags: [
      "habitat:runtime",
      "layer:service-model",
      "layer:service-module",
      "layer:resource-provider",
    ],
  },
  {
    sourceTag: "layer:service-module",
    onlyDependOnLibsWithTags: [
      "layer:service-shell",
      "layer:service-model",
      "layer:resource-provider",
    ],
  },
  {
    sourceTag: "layer:service-model",
    onlyDependOnLibsWithTags: ["layer:service-model", "layer:resource-provider"],
  },
  {
    sourceTag: "layer:resource-provider",
    onlyDependOnLibsWithTags: ["layer:resource-provider", "layer:service-model"],
  },
];

const allow = [
  "/base-standard/**",
  "./nx-plugin.ts",
  "./providers/**",
  "./resources/**",
  "./service/**",
];

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
      "@nx/enforce-module-boundaries": [
        "error",
        {
          // No buildable-lib split in this workspace (bun-run TS + per-package tsup).
          enforceBuildableLibDependency: false,
          // H3 enforces the project plane. Same-project package-entry imports
          // are left to intra-project Grit/file rules when they matter.
          allowCircularSelfDependency: true,
          // Civ7 engine virtual modules are imported by absolute path by design;
          // WHO may import them is the adapter-boundary rule's concern (grit/H5),
          // not the project-tag plane.
          allow,
          depConstraints,
        },
      ],
    },
  },
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    plugins: { "@nx": nxPlugin },
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: false,
          allowCircularSelfDependency: true,
          allow,
          depConstraints,
        },
      ],
    },
  },
];
