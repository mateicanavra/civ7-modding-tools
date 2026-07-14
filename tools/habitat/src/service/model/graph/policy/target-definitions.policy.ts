import type { NxTargetDefinition, NxTargetDependency } from "../dto/target-definition.schema.js";

const workspaceCwd = { cwd: "{workspaceRoot}" };

export function habitatInputs(): string[] {
  return [
    "{workspaceRoot}/.habitat/**",
    "{workspaceRoot}/tools/habitat/src/**",
    "{workspaceRoot}/package.json",
    "{workspaceRoot}/bun.lock",
    "{workspaceRoot}/packages/**",
    "{workspaceRoot}/apps/**",
    "{workspaceRoot}/mods/**",
    "{workspaceRoot}/docs/**",
  ];
}

export function aliasRuleTarget(
  dependsOn: readonly NxTargetDependency[],
  description: string
): NxTargetDefinition {
  return noopTarget(dependsOn, description);
}

export function directRuleTarget(
  ruleId: string,
  ownerProject: string,
  inputs = habitatInputs(),
  graphDependencies: readonly NxTargetDependency[] = []
): NxTargetDefinition {
  return {
    command: `bun tools/habitat/bin/dev.ts check --rule ${ruleId}`,
    options: workspaceCwd,
    cache: true,
    inputs,
    outputs: [],
    ...(graphDependencies.length > 0
      ? { dependsOn: uniqueTargetDependencies(graphDependencies) }
      : {}),
    metadata: { description: `Habitat rule ${ruleId} owned by ${ownerProject}` },
  };
}

/**
 * Nx-owned owner checks project local execution and graph-backed work as sibling dependencies;
 * neither leaf starts another Nx scheduler.
 */
export function ownerCheckTarget(input: {
  owner: string;
  localTarget?: string;
  graphDependencies: readonly NxTargetDependency[];
}): NxTargetDefinition {
  const localDependency = input.localTarget
    ? [{ projects: [input.owner], target: input.localTarget }]
    : [];
  return noopTarget(
    [...localDependency, ...input.graphDependencies],
    `Habitat rule checks owned by ${input.owner}`
  );
}

export function ownerLocalCheckTarget(input: {
  owner: string;
  ruleIds: readonly [string, ...string[]];
  inputs: string[];
  graphDependencies?: readonly NxTargetDependency[];
}): NxTargetDefinition {
  const selectors = input.ruleIds.map((ruleId) => `--rule ${ruleId}`).join(" ");
  return {
    command: `bun tools/habitat/bin/dev.ts check ${selectors}`,
    options: workspaceCwd,
    cache: true,
    inputs: input.inputs,
    outputs: [],
    ...(input.graphDependencies && input.graphDependencies.length > 0
      ? { dependsOn: uniqueTargetDependencies(input.graphDependencies) }
      : {}),
    metadata: {
      description: `local Habitat rules owned by ${input.owner}`,
    },
  };
}

function noopTarget(
  dependsOn: readonly NxTargetDependency[],
  description: string
): NxTargetDefinition {
  return {
    executor: "nx:noop",
    cache: false,
    outputs: [],
    dependsOn: uniqueTargetDependencies(dependsOn),
    metadata: { description },
  };
}

function uniqueTargetDependencies(
  dependencies: readonly NxTargetDependency[]
): NxTargetDependency[] {
  const unique = new Map<string, NxTargetDependency>();
  for (const dependency of dependencies) {
    const projects = [...dependency.projects].sort();
    unique.set(`${projects.join("\u0000")}\u0000${dependency.target}`, {
      projects,
      target: dependency.target,
    });
  }
  return [...unique.values()];
}
