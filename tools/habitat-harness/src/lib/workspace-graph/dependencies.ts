import { Value } from "typebox/value";
import {
  graphRefusalMessage,
  aggregateWorkspaceDependency as rawAggregateWorkspaceDependency,
  explicitProjectTargetDependency as rawExplicitProjectTargetDependency,
  multiDependencyTargetRelationship as rawMultiDependencyTargetRelationship,
  resolveTargetDependencyDeclaration as rawResolveTargetDependencyDeclaration,
  sameProjectTargetDependency as rawSameProjectTargetDependency,
} from "../workspace-graph-contract.js";
import {
  type TargetDependencyDeclaration,
  TargetDependencyDeclarationSchema,
  type TargetDependencyResolution,
  TargetDependencyResolutionSchema,
  type WorkspaceProject,
} from "./schema.js";

export { graphRefusalMessage };

export function sameProjectTargetDependency(target: string): TargetDependencyDeclaration {
  return parseDeclaration(rawSameProjectTargetDependency(target));
}

export function explicitProjectTargetDependency(
  project: string,
  target: string
): TargetDependencyDeclaration {
  return parseDeclaration(rawExplicitProjectTargetDependency(project, target));
}

export function aggregateWorkspaceDependency(
  target: string,
  dependencies: readonly TargetDependencyDeclaration[]
): TargetDependencyDeclaration {
  return parseDeclaration(rawAggregateWorkspaceDependency(target, dependencies));
}

export function multiDependencyTargetRelationship(
  target: string,
  dependencies: readonly TargetDependencyDeclaration[]
): TargetDependencyDeclaration {
  return parseDeclaration(rawMultiDependencyTargetRelationship(target, dependencies));
}

export function resolveTargetDependencyDeclaration(
  declaration: TargetDependencyDeclaration,
  context: { declaringProject: string; projects: readonly WorkspaceProject[] }
): TargetDependencyResolution[] {
  return rawResolveTargetDependencyDeclaration(declaration, context).map(parseResolution);
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
