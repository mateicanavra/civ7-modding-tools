import { activeRuleSelectorFacts } from "../../rules/facts.js";
import { diffText, extractDiffPaths } from "./diff.js";
import { graphReadRefusal, classifyPathFromProjects, graphRefusalResult } from "./path.js";
import {
  parseClassifyResult,
  stringifyClassifyResult,
  type ClassifyNonClaimId,
  type ClassifyResult,
  type PathClassification,
} from "./schema.js";
import {
  readWorkspaceGraph,
  type WorkspaceGraphProjectReader,
} from "../workspace-graph/index.js";

export type {
  ClassifiedTarget,
  ClassifyDiffResult,
  ClassifyNonClaimId,
  ClassifyResult,
  GraphRefusalClassification,
  MalformedOrPathlessDiffResult,
  ProjectPathClassification,
  RuleCoverageKind,
  RuleRouting,
  UnresolvedOwnerClassification,
  UnavailableClassifiedTarget,
  PathClassification,
  WorkspacePathClassification,
} from "./schema.js";
export {
  ClassifyDiffResultSchema,
  ClassifyResultSchema,
  GraphRefusalClassificationSchema,
  MalformedOrPathlessDiffResultSchema,
  PathClassificationSchema,
  ProjectPathClassificationSchema,
  UnresolvedOwnerClassificationSchema,
  WorkspacePathClassificationSchema,
  stringifyClassifyResult,
  validateClassifyResult,
} from "./schema.js";

export interface ClassifyOptions {
  nxProjects?: WorkspaceGraphProjectReader;
}

export async function classifyTargetResult(
  target: string,
  options: ClassifyOptions = {}
): Promise<ClassifyResult> {
  const diff = diffText(target);
  if (diff) {
    const paths = extractDiffPaths(diff);
    if (paths.length === 0) return malformedOrPathlessDiffResult(target);

    const graph = await readWorkspaceGraph(options.nxProjects);
    if (graph.kind !== "graph-ready") return graphRefusalResult(target, graphReadRefusal(graph));

    return parseClassifyResult({
      schemaVersion: 1,
      state: "diff",
      input: target,
      paths: paths.map((path) => classifyPathFromProjects(path, graph.snapshot.projects)),
      recoveryInstructions: [],
      nonClaims: baseNonClaims(),
    });
  }

  const graph = await readWorkspaceGraph(options.nxProjects);
  if (graph.kind !== "graph-ready") return graphRefusalResult(target, graphReadRefusal(graph));
  return classifyPathFromProjects(target, graph.snapshot.projects);
}

export async function classifyPathResult(
  target: string,
  options: ClassifyOptions = {}
): Promise<PathClassification> {
  const graph = await readWorkspaceGraph(options.nxProjects);
  if (graph.kind !== "graph-ready") return graphRefusalResult(target, graphReadRefusal(graph));
  return classifyPathFromProjects(target, graph.snapshot.projects);
}

export async function classifyTarget(
  target: string,
  options: ClassifyOptions = {}
): Promise<ClassifyResult> {
  return classifyTargetResult(target, options);
}

export async function classifyPath(
  target: string,
  options: ClassifyOptions = {}
): Promise<PathClassification> {
  return classifyPathResult(target, options);
}

export function commandSummary(): string {
  return `rule pack: ${activeRuleSelectorFacts.length} rules (+ baseline-integrity built-in)`;
}

function malformedOrPathlessDiffResult(input: string): ClassifyResult {
  return parseClassifyResult({
    schemaVersion: 1,
    state: "malformed-or-pathless-diff",
    input,
    reason: "no-classifiable-diff-paths",
    recoveryInstructions: [
      "Provide a repo path or a unified diff with diff --git or +++ b/ changed-file headers.",
    ],
    nonClaims: [
      ...baseNonClaims(),
      "does-not-infer-project-owner",
      "does-not-prove-target-availability",
    ],
  });
}

function baseNonClaims(): ClassifyNonClaimId[] {
  return [
    "does-not-run-targets",
    "does-not-prove-rule-correctness",
    "does-not-prove-safety",
    "does-not-prove-authoring-support",
  ];
}
