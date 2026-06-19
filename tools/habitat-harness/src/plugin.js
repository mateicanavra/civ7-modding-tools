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
import { ruleGraphFacts } from "./plugin/rule-graph.ts";
import { parseRuleRegistryText } from "./rules/registry/load.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const rulesPath = path.join(here, "rules", "rules.json");
const rulesParse = parseRuleRegistryText(readFileSync(rulesPath, "utf8"), rulesPath);
if (!rulesParse.ok) {
  throw new Error(
    `Habitat rule registry is invalid:\n${rulesParse.issues
      .map((issue) => `- ${issue.path}: ${issue.message}`)
      .join("\n")}`
  );
}
const rulesJson = rulesParse.document;

export const createNodesV2 = [
  "tools/habitat-harness/src/rules/rules.json",
  (configFiles, options, _context) => {
    const checkTargetName = options?.checkTargetName ?? "habitat:check";
    const aggregateCheckTargetName = options?.aggregateCheckTargetName ?? "habitat:check:all";
    const boundariesTargetName = options?.boundariesTargetName ?? "boundaries";
    const biomeFormatTargetName = options?.biomeFormatTargetName ?? "biome:format";
    const biomeCheckTargetName = options?.biomeCheckTargetName ?? "biome:check";
    const biomeCiTargetName = options?.biomeCiTargetName ?? "biome:ci";
    const gritCheckTargetName = options?.gritCheckTargetName ?? "grit:check";
    const generatedCheckTargetName = options?.generatedCheckTargetName ?? "generated:check";
    const ruleTargetPrefix = options?.ruleTargetPrefix ?? "habitat:rule:";
    const ownerRoots = new Map(Object.entries(rulesJson.ownerRoots ?? {}));
    const graphFacts = ruleGraphFacts(rulesJson.rules, ownerRoots, {
      boundaries: boundariesTargetName,
      biomeCi: biomeCiTargetName,
      generatedCheck: generatedCheckTargetName,
      gritCheck: gritCheckTargetName,
    });
    const owners = new Map(graphFacts.map((rule) => [rule.ownerProject, rule.ownerRoot]));
    return configFiles.map((configFile) => {
      const projects = {};
      const ensureProject = (root) => {
        projects[root] ??= { targets: {} };
        return projects[root];
      };
      const harnessRoot = ownerRoots.get("@internal/habitat-harness");
      if (!harnessRoot) {
        throw new Error(
          "Habitat graph metadata contract failure: unknown ownerProject '@internal/habitat-harness'."
        );
      }
      const harnessProject = ensureProject(harnessRoot);
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
        command: "biome format --write .",
        options: { cwd: "{workspaceRoot}" },
        cache: false,
        inputs: biomeInputs,
        metadata: {
          description: "Biome formatter write pass for the repo hygiene layer (H4)",
        },
      };
      harnessProject.targets[biomeCheckTargetName] = {
        command: "biome check .",
        options: { cwd: "{workspaceRoot}" },
        cache: true,
        inputs: biomeInputs,
        metadata: {
          description: "Biome formatter, lint hygiene, and safe-assist check (H4)",
        },
      };
      harnessProject.targets[biomeCiTargetName] = {
        command: "biome ci .",
        options: { cwd: "{workspaceRoot}" },
        cache: true,
        inputs: biomeInputs,
        metadata: {
          description: "Biome CI gate for hygiene-layer enforcement (H4)",
        },
      };
      harnessProject.targets[boundariesTargetName] = {
        command:
          "FORCE_COLOR=0 eslint . --quiet --config eslint.boundaries.config.mjs --no-config-lookup",
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
        dependsOn: [
          {
            projects: ["@swooper/mapgen-core"],
            target: "build",
          },
          {
            projects: ["@civ7/map-policy"],
            target: "verify",
          },
        ],
        inputs: [
          "{workspaceRoot}/mods/mod-swooper-maps/scripts/generate-map-artifacts.ts",
          "{workspaceRoot}/mods/mod-swooper-maps/src/maps/configs/**",
          "{workspaceRoot}/mods/mod-swooper-maps/src/maps/generated/**",
          "{workspaceRoot}/mods/mod-swooper-maps/mod/config/**",
          "{workspaceRoot}/mods/mod-swooper-maps/mod/text/**",
          "{workspaceRoot}/mods/mod-swooper-maps/mod/swooper-maps.modinfo",
          "{workspaceRoot}/packages/civ7-map-policy/scripts/verify.ts",
          "{workspaceRoot}/packages/civ7-map-policy/src/civ7-tables.gen.ts",
          "{workspaceRoot}/.civ7/outputs/resources/**",
        ],
        metadata: {
          description: "Generated-zone regeneration drift gate (habitat-grit-catalog/H5)",
        },
      };
      const habitatInputs = [
        "{workspaceRoot}/tools/habitat-harness/src/**",
        "{workspaceRoot}/tools/habitat-harness/baselines/**",
        "{workspaceRoot}/.grit/patterns/habitat/**",
        "{workspaceRoot}/.grit/grit.yaml",
        "{workspaceRoot}/.gritignore",
        "{workspaceRoot}/package.json",
        "{workspaceRoot}/bun.lock",
        "{workspaceRoot}/scripts/lint/**",
        "{workspaceRoot}/packages/**",
        "{workspaceRoot}/apps/**",
        "{workspaceRoot}/mods/**",
        "{workspaceRoot}/docs/**",
      ];
      harnessProject.targets[aggregateCheckTargetName] = {
        command: "bun tools/habitat-harness/bin/dev.ts check",
        options: { cwd: "{workspaceRoot}" },
        cache: true,
        inputs: habitatInputs,
        metadata: {
          description: "aggregate Habitat rule check; runs broad native-tool checks once",
        },
      };
      const aliasRuleTarget = (dependency, description) => ({
        command: 'node -e ""',
        options: { cwd: "{workspaceRoot}" },
        cache: false,
        outputs: [],
        dependsOn: [dependency],
        metadata: { description },
      });
      for (const rule of graphFacts) {
        const project = ensureProject(rule.ownerRoot);
        const targetName = `${ruleTargetPrefix}${rule.id}`;
        if (rule.alias.kind === "depends-on") {
          project.targets[targetName] = aliasRuleTarget(
            { projects: [rule.alias.target.project], target: rule.alias.target.target },
            `Alias for ${rule.alias.target.project}:${rule.alias.target.target} (${rule.id})`
          );
        } else {
          project.targets[targetName] = {
            command: `bun tools/habitat-harness/bin/dev.ts check --rule ${rule.id}`,
            options: { cwd: "{workspaceRoot}" },
            cache: true,
            inputs: habitatInputs,
            metadata: {
              description: `Habitat rule ${rule.id} owned by ${rule.ownerProject}`,
            },
          };
        }
      }
      for (const [owner, root] of owners) {
        const project = ensureProject(root);
        project.targets[checkTargetName] = {
          command: `bun tools/habitat-harness/bin/dev.ts check --owner ${owner}`,
          options: { cwd: "{workspaceRoot}" },
          cache: true,
          // Wrapped rules scan broad repo surfaces; inputs are deliberately
          // wide so a cache hit can never mask a real violation. Narrows
          // as rules port to their owning tools (H5/H6).
          inputs: habitatInputs,
          metadata: {
            description: `habitat rules owned by ${owner} (wrapped enforcement; see docs/projects/habitat-harness/)`,
          },
        };
      }
      return [configFile, { projects }];
    });
  },
];
