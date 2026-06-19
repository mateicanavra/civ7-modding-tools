import { existsSync, mkdirSync, rmdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Effect, Layer } from "effect";
import { activeRuleGritFacts } from "../rules/facts.js";
import type { RuleGritFacts } from "../rules/registry/index.js";
import type { HabitatDiagnostic } from "./diagnostics.js";
import { runHabitatEffect } from "./effect-runtime.js";
import { type HabitatGitState, readGitState } from "./git-state.js";
import { runGritRules, validateScanRoots } from "../adapters/grit/index.js";
import { type GritAdapterFailureTag, isGritAdapterFailureTag } from "./grit-failures.js";
import type { HabitatProcess } from "./habitat-process.js";
import { repoRoot, toRepoRelative } from "./paths.js";
import { run } from "./spawn.js";

export interface InjectedProbeScope {
  adapterRoot: string;
  rulesJsonScope: string;
  sourcePredicate: string;
  scanRoots: readonly string[];
  exclusions: readonly string[];
  matchingProbePath: string;
  outsideScopeControlPath: string;
}

export interface InjectedGritProbeInput {
  ruleId: string;
  patternIdentity: string;
  probePath: string;
  probeBody: string;
  controlPath: string;
  controlBody: string;
  expectedDiagnostic?: string;
  scope: InjectedProbeScope;
  processLayer?: Layer.Layer<HabitatProcess>;
  registry?: readonly RuleGritFacts[];
  requireCleanFinalStatus?: boolean;
}

export type InjectedGritProbeResult =
  | {
      ok: true;
      ruleId: string;
      patternIdentity: string;
      probePath: string;
      controlPath: string;
      diagnostics: HabitatDiagnostic[];
      beforeGitState: HabitatGitState;
      afterGitState: HabitatGitState;
      cleanupRestoredStatus: boolean;
      finalStatusClean: boolean;
      proofClass: "injected-violation";
      nonClaims: readonly string[];
    }
  | InjectedGritProbeFailure;

export interface InjectedGritProbeFailure {
  ok: false;
  failureTag: GritAdapterFailureTag;
  message: string;
  ruleId: string;
  patternIdentity: string;
  probePath: string;
  controlPath: string;
  beforeGitState?: HabitatGitState;
  afterGitState?: HabitatGitState;
}

export async function runInjectedGritProbe(
  input: InjectedGritProbeInput
): Promise<InjectedGritProbeResult> {
  return runHabitatEffect(injectedGritProbeProgram(input));
}

export function injectedGritProbeProgram(
  input: InjectedGritProbeInput
): Effect.Effect<InjectedGritProbeResult> {
  return Effect.gen(function* () {
    const beforeGitState = readGitState(repoRoot);
    const validationFailure = validateInjectedGritProbeInput(input);
    if (validationFailure) return { ...validationFailure, beforeGitState };

    const registry = input.registry ?? activeRuleGritFacts;
    const rule = registry.find((candidate) => candidate.id === input.ruleId);
    if (!rule) {
      return failure(
        input,
        "GritAdapterInternalContractViolation",
        "Injected proof requires a registered Grit check rule.",
        beforeGitState
      );
    }

    const runResult = yield* Effect.scoped(
      Effect.gen(function* () {
        yield* acquireProbeFile(input.probePath, input.probeBody, input);
        yield* acquireProbeFile(input.controlPath, input.controlBody, input);
        return yield* Effect.tryPromise({
          try: () =>
            runGritRules([rule], {
              scanRoots: input.scope.scanRoots,
              processLayer: input.processLayer,
              cacheMode: "fresh",
              requireObservableCacheStatus: true,
              allowInjectedProbeRoot: true,
              projection: { rejectUnexpectedPatternIdentity: true },
            }),
          catch: (error) =>
            failure(
              input,
              "GritAdapterInternalContractViolation",
              `Injected probe adapter execution threw: ${String(error)}.`,
              beforeGitState
            ),
        });
      }).pipe(
        Effect.catchAll((error) =>
          Effect.succeed(
            error.ok === false
              ? error
              : failure(
                  input,
                  "GritAdapterInternalContractViolation",
                  String(error),
                  beforeGitState
                )
          )
        )
      )
    );

    const afterGitState = readGitState(repoRoot);
    if (runResult instanceof Map) {
      return assertInjectedProbeResult(input, rule, runResult, beforeGitState, afterGitState);
    }
    return { ...runResult, afterGitState };
  });
}

function assertInjectedProbeResult(
  input: InjectedGritProbeInput,
  rule: RuleGritFacts,
  results: Map<string, { exitCode: number; diagnostics: HabitatDiagnostic[] }>,
  beforeGitState: HabitatGitState,
  afterGitState: HabitatGitState
): InjectedGritProbeResult {
  const result = results.get(rule.id);
  if (!result) {
    return failure(
      input,
      "GritPatternProjectionMiss",
      `No result was returned for ${rule.id}.`,
      beforeGitState,
      afterGitState
    );
  }

  const adapterFailure = findAdapterFailure(result.diagnostics);
  if (adapterFailure) {
    return failure(
      input,
      adapterFailure,
      "Adapter failure surfaced during injected proof.",
      beforeGitState,
      afterGitState
    );
  }

  const probeRel = normalizeProbePath(input.probePath);
  const controlRel = normalizeProbePath(input.controlPath);
  const matchingDiagnostic = result.diagnostics.find(
    (diagnostic) =>
      diagnostic.ruleId === rule.id &&
      normalizeProbePath(diagnostic.path) === probeRel &&
      !diagnostic.baselined &&
      (!input.expectedDiagnostic || diagnostic.message.includes(input.expectedDiagnostic))
  );
  if (!matchingDiagnostic) {
    return failure(
      input,
      "GritPatternProjectionMiss",
      `Expected unbaselined finding for ${rule.id} at ${probeRel}.`,
      beforeGitState,
      afterGitState
    );
  }

  const controlDiagnostic = result.diagnostics.find(
    (diagnostic) => normalizeProbePath(diagnostic.path) === controlRel
  );
  if (controlDiagnostic) {
    return failure(
      input,
      "GritUnexpectedPatternIdentity",
      `Outside-scope control probe produced ${rule.id} at ${controlRel}.`,
      beforeGitState,
      afterGitState
    );
  }

  const cleanupRestoredStatus = beforeGitState.statusDigest === afterGitState.statusDigest;
  if (input.requireCleanFinalStatus && afterGitState.dirty) {
    return failure(
      input,
      "GritAdapterInternalContractViolation",
      "Injected proof final status is dirty.",
      beforeGitState,
      afterGitState
    );
  }

  return {
    ok: true,
    ruleId: rule.id,
    patternIdentity: input.patternIdentity,
    probePath: probeRel,
    controlPath: controlRel,
    diagnostics: result.diagnostics,
    beforeGitState,
    afterGitState,
    cleanupRestoredStatus,
    finalStatusClean: !afterGitState.dirty,
    proofClass: "injected-violation",
    nonClaims: [
      "does-not-prove-all-grit-rows",
      "does-not-prove-baseline-shrink",
      "does-not-prove-apply-transaction",
      "does-not-prove-product-runtime",
    ],
  };
}

function validateInjectedGritProbeInput(
  input: InjectedGritProbeInput
): InjectedGritProbeFailure | null {
  for (const [field, value] of [
    ["adapterRoot", input.scope.adapterRoot],
    ["rulesJsonScope", input.scope.rulesJsonScope],
    ["sourcePredicate", input.scope.sourcePredicate],
    ["matchingProbePath", input.scope.matchingProbePath],
    ["outsideScopeControlPath", input.scope.outsideScopeControlPath],
  ] as const) {
    if (value.trim().length === 0) {
      return failure(
        input,
        "GritAdapterInternalContractViolation",
        `Injected probe metadata is missing ${field}.`
      );
    }
  }
  if (
    input.scope.matchingProbePath !== input.probePath ||
    input.scope.outsideScopeControlPath !== input.controlPath
  ) {
    return failure(
      input,
      "GritAdapterInternalContractViolation",
      "Injected probe metadata paths do not match requested probe paths."
    );
  }
  if (
    (input.registry ?? activeRuleGritFacts).find((rule) => rule.id === input.ruleId)
      ?.gritPattern !== input.patternIdentity
  ) {
    return failure(
      input,
      "GritAdapterInternalContractViolation",
      "Injected probe pattern identity does not match rules.json."
    );
  }
  const scanRootFailure = validateScanRoots(input.scope.scanRoots, {
    allowInjectedProbeRoot: true,
  });
  if (scanRootFailure) return failure(input, "GritEmptyScanRoots", scanRootFailure);
  for (const probePath of [input.probePath, input.controlPath]) {
    const pathFailure = validateProbePath(probePath, input.scope.scanRoots);
    if (pathFailure) return failure(input, "GritAdapterInternalContractViolation", pathFailure);
  }
  if (normalizeProbePath(input.probePath) === normalizeProbePath(input.controlPath)) {
    return failure(
      input,
      "GritAdapterInternalContractViolation",
      "Probe and control paths must be distinct."
    );
  }
  return null;
}

function validateProbePath(probePath: string, scanRoots: readonly string[]): string | null {
  const relative = normalizeProbePath(probePath);
  if (relative === ".." || relative.startsWith("../")) {
    return `Injected probe path is outside the repo: ${probePath}.`;
  }
  if (!scanRoots.some((scanRoot) => relative === scanRoot || relative.startsWith(`${scanRoot}/`))) {
    return `Injected probe path is outside the effective scan roots: ${relative}.`;
  }
  if (!hasProbeOwnershipMarker(relative)) {
    return `Injected probe path must include a probe-owned __habitat path segment: ${relative}.`;
  }
  const parent = path.dirname(relative);
  const scanRootFailure = validateScanRoots([parent], {
    requireExisting: false,
    allowInjectedProbeRoot: true,
  });
  if (scanRootFailure) return scanRootFailure.replace("Grit scan root", "Injected probe parent");
  if (existsSync(path.join(repoRoot, relative))) {
    return `Injected probe path already exists: ${relative}.`;
  }
  const ignored = run(["git", "check-ignore", "--quiet", relative], { cwd: repoRoot });
  if (ignored.exitCode === 0) return `Injected probe path is ignored by Git: ${relative}.`;
  return null;
}

function acquireProbeFile(probePath: string, body: string, input: InjectedGritProbeInput) {
  return Effect.acquireRelease(
    Effect.try({
      try: () => {
        const relative = normalizeProbePath(probePath);
        const absolute = path.join(repoRoot, relative);
        const createdDirs = ensureProbeParentDirs(path.dirname(absolute));
        writeFileSync(absolute, body);
        return { relative, createdDirs };
      },
      catch: (error) =>
        failure(
          input,
          "GritAdapterInternalContractViolation",
          `Failed to create injected probe ${probePath}: ${String(error)}.`
        ),
    }),
    ({ relative, createdDirs }) =>
      Effect.sync(() => {
        rmSync(path.join(repoRoot, relative), { force: true });
        for (const dir of createdDirs) {
          try {
            rmdirSync(dir);
          } catch (error) {
            if (!isIgnorableDirectoryCleanupError(error)) throw error;
          }
        }
      })
  );
}

function ensureProbeParentDirs(parentDir: string): string[] {
  const createdDirs: string[] = [];
  let current = parentDir;
  while (!existsSync(current)) {
    createdDirs.push(current);
    const next = path.dirname(current);
    if (next === current) break;
    current = next;
  }
  mkdirSync(parentDir, { recursive: true });
  return createdDirs;
}

function isIgnorableDirectoryCleanupError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error.code === "ENOENT" || error.code === "ENOTEMPTY")
  );
}

function hasProbeOwnershipMarker(relative: string): boolean {
  return relative.split(/[\\/]+/).some((segment) => segment.startsWith("__habitat"));
}

function findAdapterFailure(
  diagnostics: readonly HabitatDiagnostic[]
): GritAdapterFailureTag | null {
  for (const diagnostic of diagnostics) {
    const match = diagnostic.message.match(/grit adapter failure \(([^)]+)\)/);
    if (match && isGritAdapterFailureTag(match[1])) return match[1];
  }
  return null;
}

function failure(
  input: Pick<InjectedGritProbeInput, "ruleId" | "patternIdentity" | "probePath" | "controlPath">,
  failureTag: GritAdapterFailureTag,
  message: string,
  beforeGitState?: HabitatGitState,
  afterGitState?: HabitatGitState
): InjectedGritProbeFailure {
  return {
    ok: false,
    failureTag,
    message,
    ruleId: input.ruleId,
    patternIdentity: input.patternIdentity,
    probePath: normalizeProbePath(input.probePath),
    controlPath: normalizeProbePath(input.controlPath),
    beforeGitState,
    afterGitState,
  };
}

function normalizeProbePath(probePath: string): string {
  return toRepoRelative(probePath).replace(/^\.\//, "");
}
