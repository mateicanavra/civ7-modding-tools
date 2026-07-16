import { createNodesV2 } from "@habitat/cli/nx-plugin";
import { repoRoot } from "@habitat/cli/resources/paths";
import {
  type NxTargetDefinition,
  NxTargetDefinitionSchema,
} from "@habitat/cli/service/model/graph/dto/target-definition.schema";
import { Value } from "typebox/value";
import { beforeEach, describe, expect, test, vi } from "vitest";

const registryState = vi.hoisted(() => ({ value: {} }));

vi.mock("../../src/nx-rule-registry-loader.ts", () => ({
  loadRuleRegistryDocumentForNxPlugin: () => registryState.value,
}));

const ruleIntroductionManifestPath =
  ".habitat/fixtures/rules/sample-rule/rule-introduction-manifest.json";

function commandTarget(target: NxTargetDefinition | undefined) {
  if (!target || !("command" in target)) throw new Error("Expected a command-backed Nx target.");
  return target;
}

describe("Habitat Nx plugin inputs", () => {
  beforeEach(() => {
    registryState.value = registryFixture();
  });

  test("projects local and graph-backed owner work into one Nx graph", () => {
    const projects = inferredProjects();
    const habitatTargets = projects["tools/habitat"]?.targets ?? {};
    const appTargets = projects["apps/sample-app"]?.targets ?? {};
    const graphOnlyTargets = projects["apps/graph-only"]?.targets ?? {};
    const manifestInput = `{workspaceRoot}/${ruleIntroductionManifestPath}`;

    expect(commandTarget(habitatTargets["habitat:rule:sample-rule"]).inputs).toContain(
      manifestInput
    );
    expect(commandTarget(habitatTargets["habitat:rule:sample-rule"]).inputs).toContain(
      "habitatRuntime"
    );
    expect(habitatTargets["habitat:rule:sample-rule"]).toMatchObject({
      command: "bun tools/habitat/bin/dev.ts check --rule sample-rule",
      options: {
        cwd: "{workspaceRoot}",
        env: { HABITAT_REPO_ROOT: repoRoot },
      },
      dependsOn: [{ projects: ["mapgen-core"], target: "build" }],
    });
    expect(habitatTargets["check:policy:local"]).toMatchObject({
      command: "bun tools/habitat/bin/dev.ts check --rule alpha-rule --rule sample-rule",
      inputs: expect.arrayContaining(["{workspaceRoot}/.habitat/**", manifestInput]),
      dependsOn: [{ projects: ["mapgen-core"], target: "build" }],
    });
    expect(habitatTargets["check:policy"]).toEqual(
      expect.objectContaining({
        executor: "nx:noop",
        dependsOn: [
          { projects: ["habitat"], target: "check:policy:local" },
          { projects: ["habitat"], target: "check:hygiene" },
        ],
      })
    );
    expect(habitatTargets["habitat:rule:enforce_formatting_and_import_hygiene"]).toEqual(
      expect.objectContaining({
        executor: "nx:noop",
        dependsOn: [{ projects: ["habitat"], target: "check:hygiene" }],
      })
    );
    expect(appTargets["check:policy:local"]).toEqual(
      expect.objectContaining({
        command: "bun tools/habitat/bin/dev.ts check --rule sample-app-local",
        inputs: expect.arrayContaining(["habitatRuntime"]),
        options: {
          cwd: "{workspaceRoot}",
          env: { HABITAT_REPO_ROOT: repoRoot },
        },
      })
    );
    expect(commandTarget(appTargets["habitat:rule:sample-app-local"]).inputs).toContain(
      "habitatRuntime"
    );
    expect(appTargets["check:policy"]).toEqual(
      expect.objectContaining({
        executor: "nx:noop",
        dependsOn: [
          { projects: ["sample-app"], target: "check:policy:local" },
          { projects: ["sample-app"], target: "lint" },
        ],
      })
    );
    expect(graphOnlyTargets["check:policy:local"]).toBeUndefined();
    expect(graphOnlyTargets["check:policy"]).toEqual(
      expect.objectContaining({
        executor: "nx:noop",
        dependsOn: [{ projects: ["graph-only"], target: "lint" }],
      })
    );
    expect(Object.keys(habitatTargets)).not.toContain("habitat:check:all");
    expect(commandTarget(habitatTargets["habitat:rule:sample-rule"]).command).not.toContain(
      "check.mjs"
    );

    const commands = Object.values(projects).flatMap((project) =>
      Object.values(project.targets).flatMap((target) =>
        "command" in target ? [target.command] : []
      )
    );
    expect(commands.filter((command) => command.includes("nx "))).toEqual([]);
  });

  test("models command and noop targets as closed alternatives", () => {
    expect(() =>
      Value.Parse(NxTargetDefinitionSchema, {
        command: "echo ok",
        executor: "nx:noop",
        options: { cwd: "{workspaceRoot}" },
        cache: false,
      })
    ).toThrow();
    expect(() => Value.Parse(NxTargetDefinitionSchema, { cache: false })).toThrow();
    expect(
      Value.Parse(NxTargetDefinitionSchema, {
        executor: "nx:noop",
        cache: false,
        outputs: [],
        dependsOn: [{ projects: ["habitat"], target: "build" }],
      })
    ).toEqual({
      executor: "nx:noop",
      cache: false,
      outputs: [],
      dependsOn: [{ projects: ["habitat"], target: "build" }],
    });
    for (const candidate of [
      { executor: "nx:noop", cache: false, outputs: [], dependsOn: [] },
      {
        executor: "nx:noop",
        cache: true,
        outputs: [],
        dependsOn: [{ projects: ["habitat"], target: "build" }],
      },
      {
        executor: "nx:noop",
        cache: false,
        outputs: ["dist"],
        dependsOn: [{ projects: ["habitat"], target: "build" }],
      },
      {
        executor: "nx:noop",
        cache: false,
        outputs: [],
        inputs: ["{workspaceRoot}/src/**"],
        dependsOn: [{ projects: ["habitat"], target: "build" }],
      },
    ]) {
      expect(() => Value.Parse(NxTargetDefinitionSchema, candidate)).toThrow();
    }
  });

  test.each([
    "check",
    "check:policy",
    "check:policy:local",
    "habitat:rule:sample-rule",
  ])("rejects graph rules that target generated Habitat routing (%s)", (target) => {
    const fixture = registryFixture();
    registryState.value = {
      ...fixture,
      rules: [...fixture.rules, nxRule("recursive-rule", "habitat", "habitat", target)],
    };

    expect(() => inferredProjects()).toThrow(
      `rule 'recursive-rule' must target leaf work, not generated routing target 'habitat:${target}'`
    );
  });

  test.each([
    "direct",
    "graph-backed",
  ])("rejects %s rule dependencies that target generated Habitat routing", (kind) => {
    const fixture = registryFixture();
    const graphDependencies = [{ project: "habitat", target: "check:policy" }];
    const rule =
      kind === "direct"
        ? localRule("recursive-dependency", { graphDependencies })
        : {
            ...nxRule("recursive-dependency", "habitat", "habitat", "check:hygiene"),
            graphDependencies,
          };
    registryState.value = { ...fixture, rules: [...fixture.rules, rule] };

    expect(() => inferredProjects()).toThrow(
      "rule 'recursive-dependency' must target leaf work, not generated routing target 'habitat:check:policy'"
    );
  });
});

function inferredProjects() {
  const handler = createNodesV2[1];
  if (typeof handler !== "function") throw new Error("Expected a createNodesV2 handler.");
  const [[, result]] = handler([".habitat/index.json"], {});
  return result.projects;
}

function registryFixture() {
  return {
    schemaVersion: 2,
    ownerRoots: {
      habitat: "tools/habitat",
      "sample-app": "apps/sample-app",
      "graph-only": "apps/graph-only",
    },
    rules: [
      localRule("sample-rule", {
        supportFiles: { ruleIntroductionManifest: ruleIntroductionManifestPath },
        graphDependencies: [{ project: "mapgen-core", target: "build" }],
      }),
      localRule("alpha-rule"),
      localRule("sample-app-local", { ownerProject: "sample-app" }),
      nxRule("enforce_formatting_and_import_hygiene", "habitat", "habitat", "check:hygiene"),
      nxRule("sample-app-lint", "sample-app", "sample-app", "lint"),
      nxRule("graph-only-lint", "graph-only", "graph-only", "lint"),
    ],
  };
}

function localRule(
  id: string,
  options: {
    ownerProject?: string;
    supportFiles?: { ruleIntroductionManifest?: string };
    graphDependencies?: readonly { project: string; target: string }[];
  } = {}
) {
  return {
    schemaVersion: 2,
    id,
    title: id,
    placement: { niche: "fixtures", blueprint: "_self", category: "quality" },
    operation: { kind: "check" },
    ownerProject: options.ownerProject ?? "habitat",
    lane: "enforced",
    forbids: "broken structure",
    why: "Keeps the workspace structurally coherent.",
    remediate: null,
    message: "Fix the structural issue.",
    pathCoverage: [{ kind: "project-owner" }],
    manifestFilePath: `.habitat/fixtures/rules/${id}/rule.json`,
    supportFiles: {
      baseline: `.habitat/fixtures/rules/${id}/baseline.json`,
      ...options.supportFiles,
    },
    ...(options.graphDependencies ? { graphDependencies: options.graphDependencies } : {}),
    runner: {
      name: "habitat",
      mode: "script",
      files: { script: `.habitat/fixtures/rules/${id}/check.mjs` },
      runtime: "node",
    },
  };
}

function nxRule(id: string, ownerProject: string, project: string, target: string) {
  return {
    ...localRule(id),
    ownerProject,
    graphTarget: { project, target },
    runner: { name: "nx", target: { project, target } },
  };
}
