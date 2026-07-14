import { readWorkspaceGraph } from "@habitat/cli/providers/nx/graph";
import { repoRoot } from "@habitat/cli/resources/paths";
import type { RuleGraphFacts } from "@habitat/cli/service/model/rules/dto/registry.schema";
import type { WorkspaceProject } from "@habitat/cli/service/model/workspace/index";
import {
  aggregateWorkspaceDependency,
  explicitProjectTarget,
  multiDependencyTargetRelationship,
  resolveDependencyDeclaration,
  ruleAliasTargetState,
  sameProjectTarget,
  workspaceGraphTargetNames,
} from "@habitat/cli/service/model/workspace/index";
import { describe, expect, test } from "vitest";

const projects: WorkspaceProject[] = [
  {
    name: "tooling",
    root: "tools/tooling",
    sourceRoot: null,
    tags: ["kind:tooling"],
    targets: [{ name: "check:boundaries" }, { name: "check:hygiene" }],
  },
  {
    name: "library-a",
    root: "packages/library-a",
    sourceRoot: null,
    tags: ["kind:foundation"],
    targets: [{ name: "build" }, { name: "test" }],
  },
  {
    name: "policy-b",
    root: "packages/policy-b",
    sourceRoot: null,
    tags: ["kind:foundation"],
    targets: [{ name: "verify" }],
  },
];

describe("Workspace graph", () => {
  test("normalizes same-project dependency declarations", () => {
    expect(
      resolveDependencyDeclaration(sameProjectTarget("check:boundaries"), {
        declaringProject: "tooling",
        projects,
      })
    ).toEqual([
      {
        kind: "resolved-target-dependency",
        declaration: { kind: "same-project-target-dependency", target: "check:boundaries" },
        project: "tooling",
        target: "check:boundaries",
      },
    ]);
  });

  test("refuses a same-project dependency when the declaring project lacks the target", () => {
    expect(
      resolveDependencyDeclaration(sameProjectTarget("missing"), {
        declaringProject: "tooling",
        projects,
      })
    ).toEqual([
      {
        kind: "unresolved-target-dependency",
        reason: "missing-target",
        declaration: { kind: "same-project-target-dependency", target: "missing" },
        project: "tooling",
        target: "missing",
      },
    ]);
  });

  test("refuses an explicit dependency when the project is missing", () => {
    expect(
      resolveDependencyDeclaration(explicitProjectTarget("missing-project", "build"), {
        declaringProject: "tooling",
        projects,
      })
    ).toEqual([
      {
        kind: "unresolved-target-dependency",
        reason: "missing-project",
        declaration: {
          kind: "explicit-project-target-dependency",
          project: "missing-project",
          target: "build",
        },
        project: "missing-project",
        target: "build",
      },
    ]);
  });

  test("resolves aggregate dependencies only when every child target is visible", () => {
    const declaration = aggregateWorkspaceDependency("generated:check", [
      explicitProjectTarget("library-a", "build"),
      explicitProjectTarget("policy-b", "verify"),
    ]);

    expect(
      resolveDependencyDeclaration(declaration, {
        declaringProject: "tooling",
        projects,
      })
    ).toEqual([
      {
        kind: "resolved-target-dependency",
        declaration: {
          kind: "explicit-project-target-dependency",
          project: "library-a",
          target: "build",
        },
        project: "library-a",
        target: "build",
      },
      {
        kind: "resolved-target-dependency",
        declaration: {
          kind: "explicit-project-target-dependency",
          project: "policy-b",
          target: "verify",
        },
        project: "policy-b",
        target: "verify",
      },
    ]);
  });

  test("refuses aggregate dependencies when a child project target is missing", () => {
    const declaration = aggregateWorkspaceDependency("generated:check", [
      explicitProjectTarget("library-a", "build"),
      explicitProjectTarget("policy-b", "missing"),
    ]);

    expect(
      resolveDependencyDeclaration(declaration, {
        declaringProject: "tooling",
        projects,
      })
    ).toContainEqual({
      kind: "unresolved-target-dependency",
      reason: "missing-target",
      declaration: {
        kind: "explicit-project-target-dependency",
        project: "policy-b",
        target: "missing",
      },
      project: "policy-b",
      target: "missing",
    });
  });

  test("resolves multi-dependency relationships with scoped project and multi-colon targets", () => {
    const declaration = multiDependencyTargetRelationship("broad:gate", [
      explicitProjectTarget("@scope/project-a", "test:architecture:core"),
      sameProjectTarget("generated:check"),
    ]);
    const scopedProjects: WorkspaceProject[] = [
      {
        name: "@scope/project-a",
        root: "packages/project-a",
        sourceRoot: null,
        tags: [],
        targets: [{ name: "test:architecture:core" }],
      },
      {
        name: "tooling",
        root: "tools/tooling",
        sourceRoot: null,
        tags: [],
        targets: [{ name: "generated:check" }],
      },
    ];

    expect(
      resolveDependencyDeclaration(declaration, {
        declaringProject: "tooling",
        projects: scopedProjects,
      })
    ).toEqual([
      expect.objectContaining({
        kind: "resolved-target-dependency",
        project: "@scope/project-a",
        target: "test:architecture:core",
      }),
      expect.objectContaining({
        kind: "resolved-target-dependency",
        project: "tooling",
        target: "generated:check",
      }),
    ]);
  });

  test("projects unresolved aliases as graph refusals", () => {
    const state = ruleAliasTargetState({
      projects,
      rule: ruleAlias({
        id: "missing-alias",
        target: { project: "missing-project", target: "check" },
      }),
    });

    expect(state).toEqual({
      kind: "graph-refusal",
      reason: "unresolved-alias-dependency",
      project: "tooling",
      target: "habitat:rule:missing-alias",
      message: "Workspace graph refusal: project 'missing-project' is not visible.",
    });
  });

  test("reports Nx graph read failures as closed refusal states", async () => {
    const readFailure = await readWorkspaceGraph(repoRoot, {
      async readProjects() {
        throw new Error("cannot read project graph");
      },
    });
    const daemonFailure = await readWorkspaceGraph(repoRoot, {
      async readProjects() {
        throw new Error("Nx daemon unavailable");
      },
    });

    expect(readFailure).toEqual({
      kind: "nx-read-failure",
      message: "cannot read project graph",
    });
    expect(daemonFailure).toEqual({
      kind: "nx-daemon-failure",
      message: "Nx daemon unavailable",
    });
  });

  test("validates target-name options through TypeBox", () => {
    expect(() => workspaceGraphTargetNames({ checkTargetName: "" })).toThrow();
  });
});

function ruleAlias(input: {
  id: string;
  target: { project: string; target: string };
}): RuleGraphFacts {
  return {
    id: input.id,
    ownerProject: "tooling",
    ownerRoot: "tools/tooling",
    lane: "enforced",
    message: "Fixture graph rule.",
    graphDependencies: [],
    alias: {
      kind: "depends-on",
      target: input.target,
    },
  };
}
