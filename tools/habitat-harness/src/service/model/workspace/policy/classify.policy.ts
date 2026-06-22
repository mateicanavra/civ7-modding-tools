import { activeRuleSelectorFacts } from "@internal/habitat-harness/service/model/rules/policy/active-facts.policy";
import {
  readWorkspaceGraph,
  type WorkspaceGraphProjectReader,
} from "@internal/habitat-harness/providers/nx/graph";
import { diffText, extractDiffPaths } from "../helpers/diff.helper.js";
import {
  classifyPathFromProjects,
  graphReadRefusal,
  graphRefusalResult,
} from "./classify-path.policy.js";
import {
  type ClassifyResult,
  type PathClassification,
  parseClassifyResult,
  stringifyClassifyResult,
} from "../dto/classify.schema.js";

export type {
  ClassifiedTarget,
  ClassifyDiffResult,
  ClassifyResult,
  GraphRefusalClassification,
  MalformedOrPathlessDiffResult,
  PathClassification,
  ProjectPathClassification,
  RuleCoverageKind,
  RuleRouting,
  UnavailableClassifiedTarget,
  UnresolvedOwnerClassification,
  WorkspacePathClassification,
} from "../dto/classify.schema.js";
export {
  ClassifyDiffResultSchema,
  ClassifyResultSchema,
  GraphRefusalClassificationSchema,
  MalformedOrPathlessDiffResultSchema,
  PathClassificationSchema,
  ProjectPathClassificationSchema,
  stringifyClassifyResult,
  UnresolvedOwnerClassificationSchema,
  validateClassifyResult,
  WorkspacePathClassificationSchema,
} from "../dto/classify.schema.js";

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
  });
}
