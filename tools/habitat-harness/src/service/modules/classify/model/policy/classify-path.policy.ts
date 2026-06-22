import path from "node:path";
import type {
  GraphRefusalState,
  WorkspaceGraphReadState,
  WorkspaceProject,
} from "@internal/habitat-harness/providers/nx/schema";
import { repoRoot, toRepoRelative } from "@internal/habitat-harness/resources/paths";
import { statKindSync } from "@internal/habitat-harness/resources/platform/filesystem";
import {
  type PathClassification,
  parsePathClassification,
} from "@internal/habitat-harness/service/model/classify/index";
import { activeRuleGraphFacts } from "@internal/habitat-harness/service/model/rules/policy/active-facts.policy";
import {
  findWorkspaceOwningProject,
  ruleGraphTargetStates,
  workspaceTargetStates,
} from "@internal/habitat-harness/service/model/workspace/index";
import { rulesForPath } from "./rule-routing.policy.js";
import { projectTargets, workspaceTargets } from "./target-plan.policy.js";

export function classifyPathFromProjects(
  target: string,
  projects: readonly WorkspaceProject[]
): PathClassification {
  const rel = toRepoRelative(target);
  const graphRefusal = firstGraphRefusal(projects);
  if (graphRefusal) return graphRefusalResult(target, graphRefusal);

  const owner = findWorkspaceOwningProject(rel, projects);
  if (owner) return projectPathResult(target, rel, owner, projects);
  if (isWorkspaceSurface(rel)) return workspacePathResult(target, rel, projects);
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
  projects: readonly WorkspaceProject[]
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
    ruleRouting: rulesForPath(rel, owner),
    runnableTargets: [...targetGuidance.targets, ...workspaceTargets(projects)],
    unavailableTargets: targetGuidance.unavailableTargets,
    recoveryInstructions: [],
  });
}

function workspacePathResult(
  input: string,
  rel: string,
  projects: readonly WorkspaceProject[]
): PathClassification {
  return parsePathClassification({
    schemaVersion: 1,
    state: "workspace-path",
    input,
    path: rel,
    workspaceOwner: "workspace",
    ruleRouting: rulesForPath(rel),
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

function firstGraphRefusal(projects: readonly WorkspaceProject[]): GraphRefusalState | undefined {
  return [
    ...workspaceTargetStates(projects),
    ...ruleGraphTargetStates({ projects, rules: activeRuleGraphFacts }),
  ].find((state): state is GraphRefusalState => state.kind === "graph-refusal");
}

function isWorkspaceSurface(pathInRepo: string): boolean {
  const [rootSegment] = pathInRepo.split("/");
  if (!rootSegment || rootSegment === "." || rootSegment === "..") return false;

  const rootSurfacePath = path.join(repoRoot, rootSegment);
  const rootKind = statKindSync(rootSurfacePath);
  const rootIsFile = rootKind === "File";
  const rootIsDirectory = rootKind === "Directory";
  if (pathInRepo === rootSegment) return rootIsFile || rootIsDirectory;
  return rootIsDirectory;
}
