import type {
  TargetDependencyDeclaration,
  TargetDependencyResolution,
  WorkspaceGraphTargetNameOptions,
  WorkspaceGraphTargetNames,
  WorkspaceProject,
} from "./workspace-graph/schema.js";

export function workspaceGraphTargetNames(
  options: WorkspaceGraphTargetNameOptions = {}
): WorkspaceGraphTargetNames {
  return {
    aggregateCheck: options.aggregateCheckTargetName ?? "habitat:check:all",
    biomeCheck: options.biomeCheckTargetName ?? "biome:check",
    biomeCi: options.biomeCiTargetName ?? "biome:ci",
    biomeFormat: options.biomeFormatTargetName ?? "biome:format",
    boundaries: options.boundariesTargetName ?? "boundaries",
    check: options.checkTargetName ?? "habitat:check",
    generatedCheck: options.generatedCheckTargetName ?? "generated:check",
    gritCheck: options.gritCheckTargetName ?? "grit:check",
    lint: options.lintTargetName ?? "lint",
    rulePrefix: options.ruleTargetPrefix ?? "habitat:rule:",
  };
}

export function sameProjectTargetDependency(target: string): TargetDependencyDeclaration {
  return { kind: "same-project-target-dependency", target };
}

export function explicitProjectTargetDependency(
  project: string,
  target: string
): TargetDependencyDeclaration {
  return { kind: "explicit-project-target-dependency", project, target };
}

export function aggregateWorkspaceDependency(
  target: string,
  dependencies: readonly TargetDependencyDeclaration[]
): TargetDependencyDeclaration {
  return { kind: "aggregate-workspace-dependency", target, dependencies: [...dependencies] };
}

export function multiDependencyTargetRelationship(
  target: string,
  dependencies: readonly TargetDependencyDeclaration[]
): TargetDependencyDeclaration {
  return { kind: "multi-dependency-target-relationship", target, dependencies: [...dependencies] };
}

export function resolveTargetDependencyDeclaration(
  declaration: TargetDependencyDeclaration,
  context: { declaringProject: string; projects: readonly WorkspaceProject[] }
): TargetDependencyResolution[] {
  const parsedDeclaration = declaration;
  if (parsedDeclaration.kind === "same-project-target-dependency") {
    return [
      resolveProjectTarget(
        parsedDeclaration,
        context,
        context.declaringProject,
        parsedDeclaration.target
      ),
    ];
  }
  if (parsedDeclaration.kind === "explicit-project-target-dependency") {
    return [
      resolveProjectTarget(
        parsedDeclaration,
        context,
        parsedDeclaration.project,
        parsedDeclaration.target
      ),
    ];
  }
  return parsedDeclaration.dependencies.flatMap((child) =>
    resolveTargetDependencyDeclaration(child, context)
  );
}

export function graphRefusalMessage(refusal: {
  reason: string;
  message?: string;
  project?: string;
  target?: string;
}): string {
  if (refusal.reason === "missing-project") {
    return `Workspace graph refusal: project '${refusal.project}' is not visible.`;
  }
  if (refusal.reason === "missing-target") {
    return `Workspace graph refusal: project '${refusal.project}' does not expose target '${refusal.target}'.`;
  }
  return refusal.message ?? "Workspace graph refusal: unresolved alias dependency.";
}

function resolveProjectTarget(
  declaration: TargetDependencyDeclaration,
  context: { projects: readonly WorkspaceProject[] },
  projectName: string,
  targetName: string
): TargetDependencyResolution {
  const project = context.projects.find((candidate) => candidate.name === projectName);
  if (!project) {
    return {
      kind: "unresolved-target-dependency",
      reason: "missing-project",
      declaration,
      project: projectName,
      target: targetName,
    };
  }
  if (!project.targets.some((target) => target.name === targetName)) {
    return {
      kind: "unresolved-target-dependency",
      reason: "missing-target",
      declaration,
      project: projectName,
      target: targetName,
    };
  }
  return {
    kind: "resolved-target-dependency",
    declaration,
    project: projectName,
    target: targetName,
  };
}
