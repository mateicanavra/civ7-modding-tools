/**
 * Nx inference plugin (createNodesV2): gives the harness project repo-wide
 * `boundaries`, `biome:*`, `grit:check`, and `generated:check` targets, and every project that owns at least one
 * habitat rule a `habitat:check` target running only that project's rules.
 *
 * Plain ESM JS on purpose: Nx loads workspace plugins on Node, and a JS file
 * avoids the optional @swc-node TS-plugin toolchain. The rule data is shared
 * with the CLI via src/rules/rules.json (single source of truth).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const rulesJson = JSON.parse(readFileSync(path.join(here, "rules", "rules.json"), "utf8"));

/** ownerProject -> repo-relative project root (only projects that own rules). */
const OWNER_ROOTS = {
  "@internal/habitat-harness": "tools/habitat-harness",
  "mod-swooper-maps": "mods/mod-swooper-maps",
  "@swooper/mapgen-core": "packages/mapgen-core",
  "@civ7/control-orpc": "packages/civ7-control-orpc",
};

export const createNodesV2 = [
  "tools/habitat-harness/src/rules/rules.json",
  (configFiles, options, _context) => {
    const checkTargetName = options?.checkTargetName ?? "habitat:check";
    const boundariesTargetName = options?.boundariesTargetName ?? "boundaries";
    const biomeFormatTargetName = options?.biomeFormatTargetName ?? "biome:format";
    const biomeCheckTargetName = options?.biomeCheckTargetName ?? "biome:check";
    const biomeCiTargetName = options?.biomeCiTargetName ?? "biome:ci";
    const gritCheckTargetName = options?.gritCheckTargetName ?? "grit:check";
    const generatedCheckTargetName = options?.generatedCheckTargetName ?? "generated:check";
    const owners = new Set(rulesJson.rules.map((r) => r.ownerProject));
    return configFiles.map((configFile) => {
      const projects = {};
      const ensureProject = (root) => {
        projects[root] ??= { targets: {} };
        return projects[root];
      };
      const harnessProject = ensureProject(OWNER_ROOTS["@internal/habitat-harness"]);
      const biomeInputs = [
        "{workspaceRoot}/biome.json",
        "{workspaceRoot}/bun.lock",
        "{workspaceRoot}/package.json",
        "{workspaceRoot}/apps/**",
        "{workspaceRoot}/packages/**",
        "{workspaceRoot}/mods/**",
        "{workspaceRoot}/tools/**",
        "{workspaceRoot}/scripts/**",
        "{workspaceRoot}/docs/**",
        "{workspaceRoot}/vitest.config.ts",
      ];
      harnessProject.targets[biomeFormatTargetName] = {
        command: "bunx --bun @biomejs/biome format --write .",
        options: { cwd: "{workspaceRoot}" },
        cache: false,
        inputs: biomeInputs,
        metadata: {
          description: "Biome formatter write pass for the repo hygiene layer (H4)",
        },
      };
      harnessProject.targets[biomeCheckTargetName] = {
        command: "bunx --bun @biomejs/biome check .",
        options: { cwd: "{workspaceRoot}" },
        cache: true,
        inputs: biomeInputs,
        metadata: {
          description: "Biome formatter, lint hygiene, and safe-assist check (H4)",
        },
      };
      harnessProject.targets[biomeCiTargetName] = {
        command: "bunx --bun @biomejs/biome ci .",
        options: { cwd: "{workspaceRoot}" },
        cache: true,
        inputs: biomeInputs,
        metadata: {
          description: "Biome CI gate for hygiene-layer enforcement (H4)",
        },
      };
      harnessProject.targets[boundariesTargetName] = {
        command:
          "FORCE_COLOR=0 bunx eslint . --quiet --config eslint.boundaries.config.mjs --no-config-lookup",
        options: { cwd: "{workspaceRoot}" },
        cache: true,
        inputs: [
          "{workspaceRoot}/eslint.boundaries.config.mjs",
          "{workspaceRoot}/nx.json",
          "{workspaceRoot}/package.json",
          "{workspaceRoot}/apps/*/package.json",
          "{workspaceRoot}/packages/*/package.json",
          "{workspaceRoot}/packages/plugins/*/package.json",
          "{workspaceRoot}/mods/*/package.json",
          "{workspaceRoot}/tools/*/package.json",
          "{workspaceRoot}/apps/**",
          "{workspaceRoot}/packages/**",
          "{workspaceRoot}/mods/**",
          "{workspaceRoot}/tools/**",
        ],
        metadata: {
          description:
            "project-plane module boundaries via @nx/enforce-module-boundaries (habitat-boundary-tags/H3)",
        },
      };
      harnessProject.targets[gritCheckTargetName] = {
        command: "bun tools/habitat-harness/bin/dev.ts check --tool grit-check",
        options: { cwd: "{workspaceRoot}" },
        cache: true,
        inputs: [
          "{workspaceRoot}/.grit/grit.yaml",
          "{workspaceRoot}/.gritignore",
          "{workspaceRoot}/.gitignore",
          "{workspaceRoot}/package.json",
          "{workspaceRoot}/bun.lock",
          "{workspaceRoot}/.grit/patterns/habitat/**",
          "{workspaceRoot}/tools/habitat-harness/src/**",
          "{workspaceRoot}/tools/habitat-harness/baselines/**",
          "{workspaceRoot}/apps/**",
          "{workspaceRoot}/packages/**",
          "{workspaceRoot}/mods/**",
        ],
        metadata: {
          description: "Habitat-owned GritQL source-shape catalog (habitat-grit-catalog/H5)",
        },
      };
      harnessProject.targets[generatedCheckTargetName] = {
        command: "bun tools/habitat-harness/scripts/verify-generated-zones.mjs",
        options: { cwd: "{workspaceRoot}" },
        cache: false,
        inputs: [
          "{workspaceRoot}/mods/mod-swooper-maps/scripts/generate-map-artifacts.ts",
          "{workspaceRoot}/mods/mod-swooper-maps/src/maps/configs/**",
          "{workspaceRoot}/mods/mod-swooper-maps/src/maps/generated/**",
          "{workspaceRoot}/mods/mod-swooper-maps/mod/config/**",
          "{workspaceRoot}/mods/mod-swooper-maps/mod/text/**",
          "{workspaceRoot}/mods/mod-swooper-maps/mod/swooper-maps.modinfo",
          "{workspaceRoot}/scripts/civ7-map-policy/generate-tables.ts",
          "{workspaceRoot}/packages/civ7-map-policy/src/civ7-tables.gen.ts",
          "{workspaceRoot}/.civ7/outputs/resources/**",
        ],
        metadata: {
          description: "Generated-zone regeneration drift gate (habitat-grit-catalog/H5)",
        },
      };
      for (const owner of owners) {
        const root = OWNER_ROOTS[owner];
        if (!root) continue;
        const project = ensureProject(root);
        project.targets[checkTargetName] = {
          command: `bun tools/habitat-harness/bin/dev.ts check --owner ${owner}`,
          options: { cwd: "{workspaceRoot}" },
          cache: true,
          // Wrapped rules scan broad repo surfaces; inputs are deliberately
          // wide so a cache hit can never mask a real violation. Narrows
          // as rules port to their owning tools (H5/H6).
          inputs: [
            "{workspaceRoot}/tools/habitat-harness/src/**",
            "{workspaceRoot}/tools/habitat-harness/baselines/**",
            "{workspaceRoot}/.grit/patterns/habitat/**",
            "{workspaceRoot}/.grit/grit.yaml",
            "{workspaceRoot}/.gritignore",
            "{workspaceRoot}/package.json",
            "{workspaceRoot}/bun.lock",
            "{workspaceRoot}/scripts/lint/**",
            "{workspaceRoot}/eslint.config.js",
            "{workspaceRoot}/packages/**",
            "{workspaceRoot}/apps/**",
            "{workspaceRoot}/mods/**",
            "{workspaceRoot}/docs/**",
          ],
          metadata: {
            description: `habitat rules owned by ${owner} (wrapped enforcement; see docs/projects/habitat-harness/)`,
          },
        };
      }
      return [configFile, { projects }];
    });
  },
];
