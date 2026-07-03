import type { RuleFactsCatalog } from "@habitat/cli/service/model/rules/policy/catalog.policy";
import type { WorkspaceGraphReadState } from "@habitat/cli/service/model/workspace/index";
import { Effect } from "effect";
import {
  type ClassifyResult,
  type PathClassification,
  parseClassifyResult,
  stringifyClassifyResult,
} from "../dto/classify.schema.js";
import {
  classifyPathFromProjects,
  graphReadRefusal,
  graphRefusalResult,
} from "./classify-path.policy.js";
import { type ClassifyFileSystem, diffText, extractDiffPaths } from "./diff-target.policy.js";

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
  graph: WorkspaceGraphReadState | (() => WorkspaceGraphReadState);
  fileSystem: ClassifyFileSystem;
  repoRoot: string;
  rules: RuleFactsCatalog;
}

export function classifyTargetResult(target: string, options: ClassifyOptions): ClassifyResult {
  const diff = diffText(target, options);
  if (diff) {
    const paths = extractDiffPaths(diff);
    if (paths.length === 0) return malformedOrPathlessDiffResult(target);

    const graph = readGraph(options);
    if (graph.kind !== "graph-ready") return graphRefusalResult(target, graphReadRefusal(graph));

    return parseClassifyResult({
      schemaVersion: 1,
      state: "diff",
      input: target,
      paths: paths.map((path) => classifyPathFromProjects(path, graph.snapshot.projects, options)),
      recoveryInstructions: [],
    });
  }

  const graph = readGraph(options);
  if (graph.kind !== "graph-ready") return graphRefusalResult(target, graphReadRefusal(graph));
  return classifyPathFromProjects(target, graph.snapshot.projects, options);
}

export function classifyTargetResultEffect(
  target: string,
  readGraph: Effect.Effect<WorkspaceGraphReadState>,
  context: {
    readonly repoRoot: string;
    readonly rules: RuleFactsCatalog;
    readonly fileSystem: ClassifyFileSystem;
  }
): Effect.Effect<ClassifyResult> {
  const diff = diffText(target, context);
  if (diff) {
    const paths = extractDiffPaths(diff);
    if (paths.length === 0) return Effect.succeed(malformedOrPathlessDiffResult(target));

    return readGraph.pipe(
      Effect.map((graph) =>
        graph.kind === "graph-ready"
          ? parseClassifyResult({
              schemaVersion: 1,
              state: "diff",
              input: target,
              paths: paths.map((path) =>
                classifyPathFromProjects(path, graph.snapshot.projects, context)
              ),
              recoveryInstructions: [],
            })
          : graphRefusalResult(target, graphReadRefusal(graph))
      )
    );
  }

  return readGraph.pipe(
    Effect.map((graph) =>
      graph.kind === "graph-ready"
        ? classifyPathFromProjects(target, graph.snapshot.projects, context)
        : graphRefusalResult(target, graphReadRefusal(graph))
    )
  );
}

export function classifyPathResult(target: string, options: ClassifyOptions): PathClassification {
  const graph = readGraph(options);
  if (graph.kind !== "graph-ready") return graphRefusalResult(target, graphReadRefusal(graph));
  return classifyPathFromProjects(target, graph.snapshot.projects, options);
}

export function classifyTarget(target: string, options: ClassifyOptions): ClassifyResult {
  return classifyTargetResult(target, options);
}

export function classifyPath(target: string, options: ClassifyOptions): PathClassification {
  return classifyPathResult(target, options);
}

export function commandSummary(rules: RuleFactsCatalog): string {
  return `rule pack: ${rules.selector.length} rules (+ baseline-integrity built-in)`;
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

function readGraph(options: ClassifyOptions): WorkspaceGraphReadState {
  return typeof options.graph === "function" ? options.graph() : options.graph;
}
