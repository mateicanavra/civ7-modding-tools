import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { createNodesV2 } from "../../src/plugin.js";
import { repoRoot } from "../../src/lib/paths.js";
import { run } from "../../src/lib/spawn.js";
import { projectRuleDiagnostics, rules, type HarnessRule } from "../../src/rules/architecture.js";

type SurfaceClass =
  | "direct-habitat-cli"
  | "direct-habitat-mutation"
  | "direct-legacy-diagnostic"
  | "graph-owned-full-aggregate"
  | "graph-owned-habitat-lint"
  | "graph-owned-project-diagnostic"
  | "graph-owned-verifier-aggregate"
  | "habitat-rule-alias";

const rootScriptPolicy: Record<string, { command: string; surface: SurfaceClass }> = {
  check: {
    command: "nx run-many --targets=build,check,lint,test,verify",
    surface: "graph-owned-full-aggregate",
  },
  "check-types": {
    command: "nx run-many --targets=check",
    surface: "graph-owned-project-diagnostic",
  },
  "check:cli": {
    command: "nx run @mateicanavra/civ7-cli:check",
    surface: "graph-owned-project-diagnostic",
  },
  "check:sdk": {
    command: "nx run @mateicanavra/civ7-sdk:check",
    surface: "graph-owned-project-diagnostic",
  },
  ci: {
    command: "bun run check",
    surface: "graph-owned-full-aggregate",
  },
  "ci:architecture-strict-core": {
    command: "bun run lint:domain-refactor-guardrails:strict-core",
    surface: "direct-legacy-diagnostic",
  },
  habitat: {
    command: "bun tools/habitat-harness/bin/dev.ts",
    surface: "direct-habitat-cli",
  },
  "habitat:check": {
    command: "bun run habitat check",
    surface: "direct-habitat-cli",
  },
  "habitat:fix": {
    command: "bun run habitat fix",
    surface: "direct-habitat-mutation",
  },
  lint: {
    command: "nx run-many --targets=lint,habitat:check",
    surface: "graph-owned-habitat-lint",
  },
  "lint:adapter-boundary": {
    command: "nx run --project=@internal/habitat-harness --target=habitat:rule:adapter-boundary",
    surface: "habitat-rule-alias",
  },
  "lint:adrs": {
    command: "nx run --project=@internal/habitat-harness --target=habitat:rule:adr-lint",
    surface: "habitat-rule-alias",
  },
  "lint:cli": {
    command: "nx run @mateicanavra/civ7-cli:lint",
    surface: "graph-owned-project-diagnostic",
  },
  "lint:doc-ambiguity": {
    command: "nx run --project=@internal/habitat-harness --target=habitat:rule:doc-ambiguity",
    surface: "habitat-rule-alias",
  },
  "lint:domain-refactor-guardrails": {
    command: "nx run --project=mod-swooper-maps --target=habitat:rule:domain-refactor-guardrails",
    surface: "habitat-rule-alias",
  },
  "lint:domain-refactor-guardrails:strict-core": {
    command:
      'REFRACTOR_DOMAINS="foundation,morphology,hydrology,ecology,placement,narrative" DOMAIN_REFACTOR_GUARDRAILS_PROFILE=full DOMAIN_REFACTOR_GUARDRAILS_REQUIRE_FULL=1 ./scripts/lint/lint-domain-refactor-guardrails.sh',
    surface: "direct-legacy-diagnostic",
  },
  "lint:mapgen-docs": {
    command: "nx run --project=@internal/habitat-harness --target=habitat:rule:mapgen-docs",
    surface: "habitat-rule-alias",
  },
  "lint:mapgen-recipe-imports": {
    command: "nx run --project=@internal/habitat-harness --target=grit:check",
    surface: "habitat-rule-alias",
  },
  "lint:normalization-guardrails": {
    command: "nx run --project=mod-swooper-maps --target=habitat:rule:normalization-guardrails",
    surface: "habitat-rule-alias",
  },
  "lint:sdk": {
    command: "nx run @mateicanavra/civ7-sdk:lint",
    surface: "graph-owned-project-diagnostic",
  },
  "lint:workspace-entrypoints": {
    command: "nx run --project=@internal/habitat-harness --target=habitat:rule:workspace-entrypoints",
    surface: "habitat-rule-alias",
  },
  verify: {
    command: "nx run-many --targets=verify",
    surface: "graph-owned-verifier-aggregate",
  },
};

type WrapperDisposition = {
  ownerTool: "wrapped-script" | "wrapped-test";
  proofClass: "legacy-script" | "architecture-test";
  parserPolicy: "coarse-exit" | "allowlist-baseline-parser";
  directOutputPolicy: "zero-exit-output-outside-claim" | "baselined-debt" | "generated-output-gated";
  retirementTrigger: string;
};

const wrapperDisposition: Record<string, WrapperDisposition> = {
  "mapgen-docs": {
    ownerTool: "wrapped-script",
    proofClass: "legacy-script",
    parserPolicy: "coarse-exit",
    directOutputPolicy: "zero-exit-output-outside-claim",
    retirementTrigger: "Retire when the docs invariant is Habitat-native or the script emits structured diagnostics.",
  },
  "adapter-boundary": {
    ownerTool: "wrapped-script",
    proofClass: "legacy-script",
    parserPolicy: "allowlist-baseline-parser",
    directOutputPolicy: "baselined-debt",
    retirementTrigger: "Retire when adapter-boundary allowlist debt moves to explicit Habitat baseline state.",
  },
  "domain-refactor-guardrails": {
    ownerTool: "wrapped-script",
    proofClass: "legacy-script",
    parserPolicy: "coarse-exit",
    directOutputPolicy: "zero-exit-output-outside-claim",
    retirementTrigger: "Retire when domain-boundary guardrails are owned by typed Habitat/Grit rules.",
  },
  "arch-test-core-purity": {
    ownerTool: "wrapped-test",
    proofClass: "architecture-test",
    parserPolicy: "coarse-exit",
    directOutputPolicy: "zero-exit-output-outside-claim",
    retirementTrigger: "Retain while package architecture test is the owner of core-purity semantics.",
  },
  "arch-test-rng-authority": {
    ownerTool: "wrapped-test",
    proofClass: "architecture-test",
    parserPolicy: "coarse-exit",
    directOutputPolicy: "zero-exit-output-outside-claim",
    retirementTrigger: "Retain while package architecture test is the owner of RNG-authority semantics.",
  },
  "arch-test-ecology-step-imports": {
    ownerTool: "wrapped-test",
    proofClass: "architecture-test",
    parserPolicy: "coarse-exit",
    directOutputPolicy: "zero-exit-output-outside-claim",
    retirementTrigger: "Retain while package architecture test is the owner of ecology-step topology semantics.",
  },
  "arch-test-m11-projection-band": {
    ownerTool: "wrapped-test",
    proofClass: "architecture-test",
    parserPolicy: "coarse-exit",
    directOutputPolicy: "zero-exit-output-outside-claim",
    retirementTrigger: "Retain while package architecture test is the owner of projection-band semantics.",
  },
  "arch-test-map-bundle-runtime-imports": {
    ownerTool: "wrapped-test",
    proofClass: "architecture-test",
    parserPolicy: "coarse-exit",
    directOutputPolicy: "generated-output-gated",
    retirementTrigger: "Retain while built map bundle freshness is the owner of runtime-import semantics.",
  },
  "arch-test-cutover": {
    ownerTool: "wrapped-test",
    proofClass: "architecture-test",
    parserPolicy: "coarse-exit",
    directOutputPolicy: "zero-exit-output-outside-claim",
    retirementTrigger: "Retain while package architecture test is the owner of cutover semantics.",
  },
};

const legacyLintWrapperFiles: Record<string, "compat-forwarder" | "wrapped-rule-detect"> = {
  "scripts/lint-adapter-boundary.sh": "compat-forwarder",
  "scripts/lint/lint-adapter-boundary.sh": "wrapped-rule-detect",
  "scripts/lint/lint-domain-refactor-guardrails.sh": "wrapped-rule-detect",
  "scripts/lint/lint-mapgen-docs.py": "wrapped-rule-detect",
};

describe("enforcement surface inventory", () => {
  test("classifies every current root structural script", () => {
    const scripts = readRootScripts();
    const structuralScriptNames = Object.keys(scripts)
      .filter((name) => /^(check|ci|habitat|lint|verify)(:|-|$)/.test(name))
      .sort();

    expect(structuralScriptNames).toEqual(Object.keys(rootScriptPolicy).sort());
    for (const [name, policy] of Object.entries(rootScriptPolicy)) {
      expect(scripts[name]).toBe(policy.command);
    }
    expect(Object.values(rootScriptPolicy).map((policy) => policy.surface)).toEqual(
      expect.arrayContaining([
        "graph-owned-full-aggregate",
        "graph-owned-habitat-lint",
        "graph-owned-verifier-aggregate",
        "direct-habitat-cli",
        "direct-habitat-mutation",
        "direct-legacy-diagnostic",
        "habitat-rule-alias",
      ])
    );
  });

  test("keeps CI proof classes explicit", () => {
    const workflow = readFileSync(path.join(repoRoot, ".github", "workflows", "ci.yml"), "utf8");

    expect(workflow).toContain("run: bun run ci");
    expect(workflow).toContain("run: bun run ci:architecture-strict-core");
    expect(workflow).toContain("run: bun run habitat check --json --output habitat-diagnostics.json");
    expect(workflow).toContain("uses: actions/upload-artifact@v4");
    expect(workflow).not.toContain("habitat:verify");
  });

  test("records current rule ownerTool inventory", () => {
    expect(ownerToolCounts()).toEqual({
      biome: 1,
      "file-layer": 4,
      "grit-check": 22,
      "habitat-native": 4,
      "nx-boundaries": 1,
      "wrapped-script": 3,
      "wrapped-test": 6,
    });
  });

  test("proves Habitat-owned Nx target inference from the plugin", () => {
    const projects = inferPluginProjects();

    expect(Object.keys(projects).sort()).toEqual([
      "mods/mod-swooper-maps",
      "packages/civ7-control-orpc",
      "packages/mapgen-core",
      "packages/sdk",
      "tools/habitat-harness",
    ]);
    expect(projects["tools/habitat-harness"]).toEqual(
      expect.arrayContaining([
        "boundaries",
        "biome:ci",
        "generated:check",
        "grit:check",
        "habitat:check",
        "habitat:rule:workspace-entrypoints",
        "habitat:rule:mapgen-docs",
      ])
    );
    expect(projects["mods/mod-swooper-maps"]).toEqual(
      expect.arrayContaining([
        "habitat:check",
        "habitat:rule:domain-refactor-guardrails",
        "habitat:rule:grit-domain-deep-import",
        "habitat:rule:arch-test-map-bundle-runtime-imports",
      ])
    );
    expect(projects["packages/mapgen-core"]).toEqual(
      expect.arrayContaining([
        "habitat:check",
        "habitat:rule:arch-test-core-purity",
        "habitat:rule:grit-mapgen-core-runtime-civ7",
      ])
    );
  });

  test("records disposition for every surviving wrapped rule", () => {
    const wrappedRules = rules
      .filter((rule) => rule.ownerTool === "wrapped-script" || rule.ownerTool === "wrapped-test")
      .sort((left, right) => left.id.localeCompare(right.id));

    expect(Object.keys(wrapperDisposition).sort()).toEqual(wrappedRules.map((rule) => rule.id));
    for (const rule of wrappedRules) {
      const disposition = wrapperDisposition[rule.id];
      expect(disposition.ownerTool).toBe(rule.ownerTool);
      expect(disposition.retirementTrigger).not.toHaveLength(0);
    }
  });

  test("classifies surviving legacy lint wrapper files", () => {
    const lintWrapperFiles = [
      "scripts/lint-adapter-boundary.sh",
      "scripts/lint/lint-adapter-boundary.sh",
      "scripts/lint/lint-domain-refactor-guardrails.sh",
      "scripts/lint/lint-mapgen-docs.py",
    ].sort();

    expect(Object.keys(legacyLintWrapperFiles).sort()).toEqual(lintWrapperFiles);
    for (const file of lintWrapperFiles) {
      expect(readFileSync(path.join(repoRoot, file), "utf8").trim()).not.toHaveLength(0);
    }
  });

  test("projects direct wrapped-script output through the accepted Habitat parser policy", () => {
    const mapgenDocs = runDirectRule("mapgen-docs");
    expect(mapgenDocs.output).toContain("WARN");
    expect(projectRuleDiagnostics(mapgenDocs.rule, mapgenDocs.result)).toEqual([]);

    const adapterBoundary = runDirectRule("adapter-boundary");
    expect(adapterBoundary.output).toContain("Allowlisted violations");
    const adapterDiagnostics = projectRuleDiagnostics(adapterBoundary.rule, adapterBoundary.result);
    expect(adapterDiagnostics).toHaveLength(8);
    expect(adapterDiagnostics.every((diagnostic) => diagnostic.baselined)).toBe(true);

    const domainGuardrails = runDirectRule("domain-refactor-guardrails");
    expect(domainGuardrails.output).toContain("Domain refactor guardrails passed");
    expect(projectRuleDiagnostics(domainGuardrails.rule, domainGuardrails.result)).toEqual([]);
  });

  test("projects direct wrapped-test output without hiding generated-output failures", () => {
    const wrappedTests = rules
      .filter((rule) => rule.ownerTool === "wrapped-test")
      .sort((left, right) => left.id.localeCompare(right.id));

    for (const rule of wrappedTests) {
      const result = run(rule.detect, { cwd: repoRoot });
      const diagnostics = projectRuleDiagnostics(rule, result);

      if (rule.id === "arch-test-map-bundle-runtime-imports" && result.exitCode !== 0) {
        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0]?.message).toContain("--- tool output (tail) ---");
        continue;
      }

      expect(result.exitCode).toBe(0);
      expect(diagnostics).toEqual([]);
    }
  }, 20_000);
});

function readRootScripts(): Record<string, string> {
  const packageJson = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8")) as {
    scripts: Record<string, string>;
  };
  return packageJson.scripts;
}

function ownerToolCounts(): Record<string, number> {
  return Object.fromEntries(
    Object.entries(
      rules.reduce<Record<string, number>>((counts, rule) => {
        counts[rule.ownerTool] = (counts[rule.ownerTool] ?? 0) + 1;
        return counts;
      }, {})
    ).sort(([left], [right]) => left.localeCompare(right))
  );
}

function inferPluginProjects(): Record<string, string[]> {
  const [, createNodes] = createNodesV2;
  const result = createNodes(["tools/habitat-harness/src/rules/rules.json"], {}, {});
  const [, data] = result[0] as [
    string,
    {
      projects: Record<string, { targets: Record<string, unknown> }>;
    },
  ];
  return Object.fromEntries(
    Object.entries(data.projects)
      .map(([root, project]) => [root, Object.keys(project.targets).sort()])
      .sort(([left], [right]) => left.localeCompare(right))
  );
}

function runDirectRule(ruleId: string): {
  rule: HarnessRule;
  result: ReturnType<typeof run>;
  output: string;
} {
  const rule = rules.find((candidate) => candidate.id === ruleId);
  expect(rule).toBeDefined();
  const result = run(rule!.detect, { cwd: repoRoot });
  return {
    rule: rule!,
    result,
    output: `${result.stdout}${result.stderr}`,
  };
}
