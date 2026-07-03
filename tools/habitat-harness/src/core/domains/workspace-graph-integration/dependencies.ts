import {
  type TargetDependencyDeclaration,
  TargetDependencyDeclarationSchema,
  type TargetDependencyResolution,
  TargetDependencyResolutionSchema,
  type WorkspaceProject,
} from "@internal/habitat-harness/substrate/providers/nx/schema";
import { Value } from "typebox/value";

export function sameProjectTargetDependency(target: string): TargetDependencyDeclaration {
  return parseDeclaration({ kind: "same-project-target-dependency", target });
}

export function explicitProjectTargetDependency(
  project: string,
  target: string
): TargetDependencyDeclaration {
  return parseDeclaration({ kind: "explicit-project-target-dependency", project, target });
}

export function aggregateWorkspaceDependency(
  target: string,
  dependencies: readonly TargetDependencyDeclaration[]
): TargetDependencyDeclaration {
  return parseDeclaration({
    kind: "aggregate-workspace-dependency",
    target,
    dependencies: [...dependencies],
  });
}

export function multiDependencyTargetRelationship(
  target: string,
  dependencies: readonly TargetDependencyDeclaration[]
): TargetDependencyDeclaration {
  return parseDeclaration({
    kind: "multi-dependency-target-relationship",
    target,
    dependencies: [...dependencies],
  });
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

export const sameProjectTarget = sameProjectTargetDependency;
export const explicitProjectTarget = explicitProjectTargetDependency;
export const aggregateWorkspaceTarget = aggregateWorkspaceDependency;
export const multiDependencyTarget = multiDependencyTargetRelationship;
export const resolveDependencyDeclaration = resolveTargetDependencyDeclaration;

function parseDeclaration(value: unknown): TargetDependencyDeclaration {
  return Value.Parse(TargetDependencyDeclarationSchema, value);
}

function parseResolution(value: unknown): TargetDependencyResolution {
  return Value.Parse(TargetDependencyResolutionSchema, value);
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
    return parseResolution({
      kind: "unresolved-target-dependency",
      reason: "missing-project",
      declaration,
      project: projectName,
      target: targetName,
    });
  }
  if (!project.targets.some((target) => target.name === targetName)) {
    return parseResolution({
      kind: "unresolved-target-dependency",
      reason: "missing-target",
      declaration,
      project: projectName,
      target: targetName,
    });
  }
  return parseResolution({
    kind: "resolved-target-dependency",
    declaration,
    project: projectName,
    target: targetName,
  });
}
