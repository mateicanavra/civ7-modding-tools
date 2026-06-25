import path from "node:path";
import type { RuleFactsCatalog } from "@habitat/cli/service/model/rules/policy/catalog.policy";
import type {
  GraphRefusalState,
  WorkspaceGraphReadState,
  WorkspaceProject,
} from "@habitat/cli/service/model/workspace/index";
import {
  findWorkspaceOwningProject,
  ruleGraphTargetStates,
  workspaceTargetStates,
} from "@habitat/cli/service/model/workspace/index";
import { type PathClassification, parsePathClassification } from "../dto/classify.schema.js";
import type { ClassifyFileSystem } from "./diff-target.policy.js";
import { rulesForPath } from "./rule-routing.policy.js";
import { projectTargets, workspaceTargets } from "./target-plan.policy.js";

export function classifyPathFromProjects(
  target: string,
  projects: readonly WorkspaceProject[],
  context: {
    readonly repoRoot: string;
    readonly rules: RuleFactsCatalog;
    readonly fileSystem: ClassifyFileSystem;
  }
): PathClassification {
  const rel = toRepoRelative(context.repoRoot, target);
  const graphRefusal = firstGraphRefusal(projects, context.rules);
  if (graphRefusal) return graphRefusalResult(target, graphRefusal);

  const owner = findWorkspaceOwningProject(rel, projects);
  if (owner) return projectPathResult(target, rel, owner, projects, context.rules);
  if (isWorkspaceSurface(rel, context))
    return workspacePathResult(target, rel, projects, context.rules);
  return unresolvedOwnerResult(target, rel);
}

export function graphRefusalResult(input: string, refusal: GraphRefusalState): PathClassification {
  return parsePathClassification({
    schemaVersion: 1,
    state: "graph-refusal",
    input,
    refusal,
    recoveryInstructions: ["Resolve the workspace graph refusal before using target guidance."],
  });
}

export function graphReadRefusal(
  readState: Exclude<WorkspaceGraphReadState, { kind: "graph-ready" }>
): GraphRefusalState {
  return {
    kind: "graph-refusal",
    reason: readState.kind,
    message: readState.message,
  };
}

function projectPathResult(
  input: string,
  rel: string,
  owner: WorkspaceProject,
  projects: readonly WorkspaceProject[],
  rules: RuleFactsCatalog
): PathClassification {
  const targetGuidance = projectTargets(owner);
  return parsePathClassification({
    schemaVersion: 1,
    state: "project-path",
    input,
    path: rel,
    owner: {
      project: owner.name,
      projectRoot: owner.root,
      tags: owner.tags,
    },
    ruleRouting: rulesForPath(rel, rules.routing, owner),
    runnableTargets: [...targetGuidance.targets, ...workspaceTargets(projects)],
    unavailableTargets: targetGuidance.unavailableTargets,
    recoveryInstructions: [],
  });
}

function workspacePathResult(
  input: string,
  rel: string,
  projects: readonly WorkspaceProject[],
  rules: RuleFactsCatalog
): PathClassification {
  return parsePathClassification({
    schemaVersion: 1,
    state: "workspace-path",
    input,
    path: rel,
    workspaceOwner: "workspace",
    ruleRouting: rulesForPath(rel, rules.routing),
    runnableTargets: workspaceTargets(projects),
    recoveryInstructions: [],
  });
}

function unresolvedOwnerResult(input: string, rel: string): PathClassification {
  return parsePathClassification({
    schemaVersion: 1,
    state: "unresolved-owner",
    input,
    path: rel,
    reason: "no-project-or-workspace-owner",
    recoveryInstructions: [
      "Classify a path under a resolved Nx project root or an intentional workspace-level file.",
    ],
  });
}

function firstGraphRefusal(
  projects: readonly WorkspaceProject[],
  rules: RuleFactsCatalog
): GraphRefusalState | undefined {
  return [
    ...workspaceTargetStates(projects),
    ...ruleGraphTargetStates({ projects, rules: rules.graph }),
  ].find((state): state is GraphRefusalState => state.kind === "graph-refusal");
}

function isWorkspaceSurface(
  pathInRepo: string,
  context: { readonly repoRoot: string; readonly fileSystem: ClassifyFileSystem }
): boolean {
  const [rootSegment] = pathInRepo.split("/");
  if (!rootSegment || rootSegment === "." || rootSegment === "..") return false;

  const rootSurfacePath = path.join(context.repoRoot, rootSegment);
  const rootKind = context.fileSystem.statKind(rootSurfacePath);
  const rootIsFile = rootKind === "File";
  const rootIsDirectory = rootKind === "Directory";
  if (pathInRepo === rootSegment) return rootIsFile || rootIsDirectory;
  return rootIsDirectory;
}

function toRepoRelative(repoRoot: string, target: string): string {
  return path.relative(repoRoot, path.resolve(repoRoot, target)).split(path.sep).join("/");
}
