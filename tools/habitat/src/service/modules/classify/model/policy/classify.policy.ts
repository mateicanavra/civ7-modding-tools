import type { NxProviderService } from "@habitat/cli/providers/nx/index";
import type { RuleFactsCatalog } from "@habitat/cli/service/model/rules/policy/catalog.policy";
import type { WorkspaceGraphReadState } from "@habitat/cli/service/model/workspace/index";
import { Effect, Match } from "effect";
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
  return Match.value(diff).pipe(
    Match.when(Match.string, (contents) => classifyDiffTarget(target, contents, options)),
    Match.when(Match.undefined, () => classifyPathTarget(target, options)),
    Match.exhaustive
  );
}

export const classifyTargetResultEffect = Effect.fn("habitat.classify.target")(function* (
  target: string,
  readGraph: ReturnType<NxProviderService["workspaceGraph"]>,
  context: {
    readonly repoRoot: string;
    readonly rules: RuleFactsCatalog;
    readonly fileSystem: ClassifyFileSystem;
  }
) {
  const plan = classifyTargetPlan(target, diffText(target, context));
  const graphBased = readGraph.pipe(
    Effect.map((graph) => classifyPlanFromGraph(target, plan, graph, context))
  );
  return yield* Effect.if(plan.kind === "immediate", {
    onTrue: () => Effect.succeed(immediatePlanResult(plan)),
    onFalse: () => graphBased,
  });
});

type ClassifyTargetPlan =
  | { readonly kind: "immediate"; readonly result: ClassifyResult }
  | { readonly kind: "path" }
  | { readonly kind: "diff"; readonly paths: readonly string[] };

function classifyTargetPlan(target: string, diff: string | undefined): ClassifyTargetPlan {
  return Match.value(diff).pipe(
    Match.when(Match.undefined, () => ({ kind: "path" as const })),
    Match.when(Match.string, (contents) => classifyDiffPlan(target, contents)),
    Match.exhaustive
  );
}

function classifyDiffPlan(target: string, diff: string): ClassifyTargetPlan {
  const paths = extractDiffPaths(diff);
  return Match.value(paths.length === 0).pipe(
    Match.when(true, () => ({
      kind: "immediate" as const,
      result: malformedOrPathlessDiffResult(target),
    })),
    Match.when(false, () => ({ kind: "diff" as const, paths })),
    Match.exhaustive
  );
}

function immediatePlanResult(plan: ClassifyTargetPlan): ClassifyResult {
  return Match.value(plan).pipe(
    Match.when({ kind: "immediate" }, ({ result }) => result),
    Match.orElse(() => {
      throw new Error("habitat internal error: expected an immediate classification plan");
    })
  );
}

function classifyPlanFromGraph(
  target: string,
  plan: ClassifyTargetPlan,
  graph: WorkspaceGraphReadState,
  context: Pick<ClassifyOptions, "fileSystem" | "repoRoot" | "rules">
): ClassifyResult {
  return Match.value(plan).pipe(
    Match.when({ kind: "path" }, () => classifyPathFromGraph(target, graph, context)),
    Match.when({ kind: "diff" }, ({ paths }) =>
      classifyDiffFromGraph(target, paths, graph, context)
    ),
    Match.when({ kind: "immediate" }, ({ result }) => result),
    Match.exhaustive
  );
}

export function classifyPathResult(target: string, options: ClassifyOptions): PathClassification {
  return classifyPathFromGraph(target, readGraph(options), options);
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
  return Match.value(typeof options.graph === "function").pipe(
    Match.when(true, () => (options.graph as () => WorkspaceGraphReadState)()),
    Match.when(false, () => options.graph as WorkspaceGraphReadState),
    Match.exhaustive
  );
}

function classifyDiffTarget(
  target: string,
  diff: string,
  options: ClassifyOptions
): ClassifyResult {
  const paths = extractDiffPaths(diff);
  return Match.value(paths.length === 0).pipe(
    Match.when(true, () => malformedOrPathlessDiffResult(target)),
    Match.when(false, () => classifyDiffFromGraph(target, paths, readGraph(options), options)),
    Match.exhaustive
  );
}

function classifyPathTarget(target: string, options: ClassifyOptions): ClassifyResult {
  return classifyPathFromGraph(target, readGraph(options), options);
}

function classifyDiffFromGraph(
  target: string,
  paths: readonly string[],
  graph: WorkspaceGraphReadState,
  context: Pick<ClassifyOptions, "fileSystem" | "repoRoot" | "rules">
): ClassifyResult {
  return Match.value(graph).pipe(
    Match.when({ kind: "graph-ready" }, ({ snapshot }) =>
      parseClassifyResult({
        schemaVersion: 1,
        state: "diff",
        input: target,
        paths: paths.map((path) => classifyPathFromProjects(path, snapshot.projects, context)),
        recoveryInstructions: [],
      })
    ),
    Match.orElse((refusal) => graphRefusalResult(target, graphReadRefusal(refusal)))
  );
}

function classifyPathFromGraph(
  target: string,
  graph: WorkspaceGraphReadState,
  context: Pick<ClassifyOptions, "fileSystem" | "repoRoot" | "rules">
): PathClassification {
  return Match.value(graph).pipe(
    Match.when({ kind: "graph-ready" }, ({ snapshot }) =>
      classifyPathFromProjects(target, snapshot.projects, context)
    ),
    Match.orElse((refusal) => graphRefusalResult(target, graphReadRefusal(refusal)))
  );
}
