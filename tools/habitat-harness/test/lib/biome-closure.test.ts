import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, test } from "vitest";
import { repoRoot } from "../../src/lib/paths.js";
import { createNodesV2 } from "../../src/plugin.js";
import { rules } from "../../src/rules/architecture.js";

describe("Biome hygiene closure", () => {
  test("keeps Biome as the formatter, hygiene linter, and import organizer", () => {
    const config = readJson("biome.json");

    expect(config.formatter).toMatchObject({
      enabled: true,
      indentStyle: "space",
      indentWidth: 2,
      lineWidth: 100,
      lineEnding: "lf",
    });
    expect(config.javascript.formatter).toMatchObject({
      quoteStyle: "double",
      semicolons: "always",
      trailingCommas: "es5",
    });
    expect(config.linter).toMatchObject({
      enabled: true,
      rules: {
        recommended: false,
      },
    });
    expect(Object.keys(config.linter.rules).sort()).toEqual([
      "correctness",
      "recommended",
      "suspicious",
    ]);
    expect(config.assist).toMatchObject({
      enabled: true,
      actions: {
        source: {
          organizeImports: "on",
        },
      },
    });
  });

  test("excludes generated and protected zones from Biome ownership", () => {
    const config = readJson("biome.json");

    expect(config.files.includes).toEqual(
      expect.arrayContaining([
        "!node_modules/**",
        "!dist/**",
        "!**/dist/**",
        "!types/**",
        "!**/types/**",
        "!mod/**",
        "!**/mod/**",
        "!.nx/**",
        "!.civ7/outputs/**",
        "!docs/_archive/**",
        "!**/_archive/**",
        "!mods/mod-swooper-maps/src/maps/generated/**",
        "!packages/civ7-types/generated/**",
        "!packages/civ7-map-policy/src/civ7-tables.gen.ts",
      ])
    );
  });

  test("keeps Prettier retired as a direct repo formatting surface", () => {
    const packageJson = readJson("package.json");

    expect(existsSync(path.join(repoRoot, ".prettierrc"))).toBe(false);
    expect(existsSync(path.join(repoRoot, ".prettierrc.json"))).toBe(false);
    expect(existsSync(path.join(repoRoot, "prettier.config.js"))).toBe(false);
    expect(packageJson.devDependencies).toHaveProperty("@biomejs/biome", "2.4.16");
    expect(packageJson.devDependencies).not.toHaveProperty("prettier");
    expect(packageJson.scripts).toMatchObject({
      "biome:format": "biome format --write .",
      "biome:check": "biome check .",
      "biome:ci": "biome ci .",
    });
    for (const [name, script] of Object.entries(packageJson.scripts)) {
      if (name.startsWith("biome:")) continue;
      expect(script).not.toMatch(/\bprettier\b/);
    }
  });

  test("exposes Biome through Habitat-owned namespaced Nx targets", () => {
    const harnessTargets = inferHarnessTargets();

    expect(harnessTargets["biome:format"]).toMatchObject({
      command: "biome format --write .",
      options: { cwd: "{workspaceRoot}" },
      cache: false,
    });
    expect(harnessTargets["biome:check"]).toMatchObject({
      command: "biome check .",
      options: { cwd: "{workspaceRoot}" },
      cache: true,
    });
    expect(harnessTargets["biome:ci"]).toMatchObject({
      command: "biome ci .",
      options: { cwd: "{workspaceRoot}" },
      cache: true,
    });
    expect(harnessTargets).not.toHaveProperty("lint");
    expect(harnessTargets).not.toHaveProperty("format");
  });

  test("keeps the Habitat rule registry aligned to one Biome rule", () => {
    const biomeRules = rules.filter((rule) => rule.ownerTool === "biome");

    expect(biomeRules).toHaveLength(1);
    expect(biomeRules[0]).toMatchObject({
      id: "biome-ci",
      ownerProject: "@internal/habitat-harness",
      lane: "enforced",
      detect: ["biome", "ci", "."],
      remediate: "bun run habitat:fix",
      exceptionPath: "none",
    });
  });

  test("keeps ESLint quarantined to project-plane boundaries", async () => {
    const eslintConfig = await import(
      pathToFileURL(path.join(repoRoot, "eslint.boundaries.config.mjs")).href
    );
    const ruleKeys = eslintConfig.default.flatMap((entry: { rules?: Record<string, unknown> }) =>
      Object.keys(entry.rules ?? {})
    );

    expect([...new Set(ruleKeys)]).toEqual(["@nx/enforce-module-boundaries"]);
    expect(ruleKeys).toHaveLength(2);
  });

  test("keeps the dedicated reformat commit blame-shielded", () => {
    const ignoreRevs = readFileSync(path.join(repoRoot, ".git-blame-ignore-revs"), "utf8");

    expect(ignoreRevs).toContain("b6c2b7c384a7d5068353116efc78da88451f4f13");
  });
});

function readJson(relativePath: string): any {
  return JSON.parse(readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

function inferHarnessTargets(): Record<string, any> {
  const [, createNodes] = createNodesV2;
  const result = createNodes(["tools/habitat-harness/src/rules/rules.json"], {}, {});
  const [, data] = result[0] as [
    string,
    {
      projects: Record<string, { targets: Record<string, unknown> }>;
    },
  ];
  return data.projects["tools/habitat-harness"]?.targets ?? {};
}
