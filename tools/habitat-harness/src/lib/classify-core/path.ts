import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { activeRuleGraphFacts } from "../../rules/facts.js";
import { repoRoot, toRepoRelative } from "../paths.js";
import {
  findWorkspaceOwningProject,
  ruleGraphTargetStates,
  workspaceTargetStates,
  type GraphRefusalState,
  type WorkspaceGraphReadState,
  type WorkspaceProject,
} from "../workspace-graph/index.js";
import { rulesForPath } from "./routing.js";
import {
  parsePathClassification,
  type ClassifyNonClaimId,
  type PathClassification,
} from "./schema.js";
import { projectTargets, workspaceTargets } from "./targets.js";

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
    nonClaims: [...baseNonClaims(), "does-not-prove-target-availability"],
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
    nonClaims: baseNonClaims(),
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
    nonClaims: [...baseNonClaims(), "does-not-infer-project-owner"],
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
    nonClaims: [
      ...baseNonClaims(),
      "does-not-infer-project-owner",
      "does-not-prove-target-availability",
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
  if (!existsSync(rootSurfacePath)) return false;

  const rootSurface = statSync(rootSurfacePath);
  if (pathInRepo === rootSegment) return rootSurface.isFile() || rootSurface.isDirectory();
  return rootSurface.isDirectory();
}

function baseNonClaims(): ClassifyNonClaimId[] {
  return [
    "does-not-run-targets",
    "does-not-prove-rule-correctness",
    "does-not-prove-safety",
    "does-not-prove-authoring-support",
  ];
}
