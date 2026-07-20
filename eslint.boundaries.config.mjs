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

const depConstraints = [
  {
    sourceTag: "kind:workspace",
    onlyDependOnLibsWithTags: [
      "kind:sdk",
      "kind:engine",
      "kind:mapgen-tool",
      "kind:adapter",
      "kind:control",
      "kind:library",
      "kind:plugin",
      "kind:mod",
      "kind:tooling",
    ],
  },
  { sourceTag: "kind:library", onlyDependOnLibsWithTags: ["kind:library"] },
  { sourceTag: "kind:adapter", onlyDependOnLibsWithTags: ["kind:library"] },
  { sourceTag: "kind:engine", onlyDependOnLibsWithTags: ["kind:adapter", "kind:library"] },
  {
    sourceTag: "kind:mapgen-tool",
    onlyDependOnLibsWithTags: ["kind:engine", "kind:library", "kind:control"],
  },
  { sourceTag: "kind:plugin", onlyDependOnLibsWithTags: ["kind:plugin", "kind:library"] },
  {
    sourceTag: "kind:sdk",
    onlyDependOnLibsWithTags: ["kind:engine", "kind:adapter", "kind:library", "kind:plugin"],
  },
  {
    sourceTag: "kind:control",
    onlyDependOnLibsWithTags: ["kind:control", "kind:library", "kind:adapter", "kind:engine"],
  },
  {
    sourceTag: "kind:mod",
    onlyDependOnLibsWithTags: [
      "kind:sdk",
      "kind:engine",
      "kind:mapgen-tool",
      "kind:adapter",
      "kind:library",
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
      "kind:library",
      "kind:plugin",
      "kind:control",
      "kind:mod",
      "kind:tooling",
    ],
  },
  { sourceTag: "kind:tooling", onlyDependOnLibsWithTags: ["kind:tooling", "kind:library"] },
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
  "./model/**",
  "./nx-plugin.ts",
  "./providers/**",
  "./resources/**",
  "./service/**",
  "../../../../resources/**",
  "../../service/model/rules/dto/registry.schema.ts",
  "../../host/**",
  "../../rules/**",
];

// Habitat's virtual projects expose the admitted architectural layers inside one package.
// Their direction is owned by the tag constraints below, not Nx's library-cycle heuristic.
const habitatVirtualProjectCycles = [
  ["habitat-providers", "habitat-resources"],
  ["habitat-resources", "habitat-service-model"],
  ["habitat-runtime", "habitat-service"],
  ["habitat-service", "habitat-service-check"],
  ["habitat-service", "habitat-service-classify"],
  ["habitat-service", "habitat-service-fix"],
  ["habitat-service", "habitat-service-graph"],
  ["habitat-service", "habitat-service-hook"],
  ["habitat-service", "habitat-service-verify"],
];

const habitatLazyCommandImports = [
  "@habitat/cli/cli/commands/check",
  "@habitat/cli/cli/commands/classify",
  "@habitat/cli/cli/commands/fix",
  "@habitat/cli/cli/commands/graph",
  "@habitat/cli/cli/commands/hook",
  "@habitat/cli/cli/commands/verify",
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
          ignoredCircularDependencies: habitatVirtualProjectCycles,
          // Habitat's CLI boot table lazy-loads its command projects. Other
          // Habitat layers may still import their admitted public surfaces;
          // this exception suppresses only the lazy-load heuristic, not tag
          // or project-boundary enforcement.
          checkDynamicDependenciesExceptions: habitatLazyCommandImports,
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
          ignoredCircularDependencies: habitatVirtualProjectCycles,
          allow,
          depConstraints,
        },
      ],
    },
  },
];
