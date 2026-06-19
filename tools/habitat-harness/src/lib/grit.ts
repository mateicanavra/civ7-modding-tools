import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { Effect, Layer } from "effect";
import type { HarnessRule, RuleRunResult } from "../rules/architecture.js";
import type { HabitatDiagnostic } from "./diagnostics.js";
import { runHabitatEffect } from "./effect-runtime.js";
import { generatedZones } from "./generated-zones.js";
import { gritMachineOutputEnv } from "./grit-env.js";
import { renderGritAdapterFailure } from "./grit-failures.js";
import {
  type GritAdapterFailureTag,
  type GritParseStatus,
  GritToolUnavailable,
  type HabitatCommandResult,
  HabitatProcess,
  HabitatProcessLive,
  type HabitatProcessRequest,
} from "./habitat-process.js";
import { repoRoot, toRepoRelative } from "./paths.js";

interface GritPosition {
  line?: number;
  col?: number;
  offset?: number;
}

export interface GritResult {
  check_id?: string;
  local_name?: string;
  path?: string;
  start?: GritPosition;
  end?: GritPosition;
  extra?: {
    message?: string | null;
    severity?: string;
  };
}

export interface GritReport {
  paths: string[];
  results: GritResult[];
}

export type GritCheckParseResult =
  | {
      ok: true;
      report: GritReport;
      parseStatus: Extract<GritParseStatus, "parsed">;
      commandResult: HabitatCommandResult;
    }
  | {
      ok: false;
      failureTag: GritAdapterFailureTag;
      parseStatus: Exclude<GritParseStatus, "parsed">;
      message: string;
      commandResult?: HabitatCommandResult;
    };

export interface GritCheckOptions {
  cacheMode?: GritCheckCacheMode;
  requireObservableCacheStatus?: boolean;
  allowInjectedProbeRoot?: boolean;
  allowDocsRoot?: boolean;
  outputFormat?: GritCheckOutputFormat;
}

export type GritCheckCacheMode = "workspace" | "fresh";
export type GritCheckOutputFormat = "json" | "text";

export interface GritCheckRequestOptions {
  cacheDir?: string;
  observableCacheStatus?: "unknown" | "fresh" | "cache-hit" | "replay";
  outputFormat?: GritCheckOutputFormat;
}

export interface GritProjectionOptions {
  requirePatternFinding?: boolean;
  rejectUnexpectedPatternIdentity?: boolean;
}

const gritScanRootCandidates = [
  "packages",
  "apps/mapgen-studio/src",
  "mods/mod-swooper-maps/src/recipes",
  "mods/mod-swooper-maps/src/maps",
  "mods/mod-swooper-maps/src/domain",
];
const docsGritScanRootCandidates = ["docs"];
const ignoredTestScanRootCandidates = ["mods/mod-swooper-maps/test"];
export const injectedProbeRoot = "tools/habitat-harness/injected-probe-roots";
const protectedScanRootPrefixes = [
  ".civ7/",
  ".git/",
  ".grit/cache/",
  "dist/",
  "node_modules/",
  "tools/habitat-harness/dist/",
];
const gritBin = "grit";
const docsLocalCheckoutPathsRewritePattern =
  ".grit/patterns/habitat/apply/docs_local_checkout_paths_rewrite.md";
const gritCandidateExtensions = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);

export function resetGritCacheForTests(): void {
  // Historical test helper retained for compatibility; the Effect adapter no
  // longer stores a module-level Grit report cache.
}

export async function runGritRule(rule: HarnessRule): Promise<RuleRunResult> {
  const results = await runGritRules([rule]);
  return (
    results.get(rule.id) ?? infrastructureFailure(rule, "GritAdapterInternalContractViolation")
  );
}

export async function runGritRules(
  selectedRules: readonly HarnessRule[],
  options: {
    scanRoots?: readonly string[];
    processLayer?: Layer.Layer<HabitatProcess>;
    cacheMode?: GritCheckCacheMode;
    requireObservableCacheStatus?: boolean;
    allowInjectedProbeRoot?: boolean;
    projection?: GritProjectionOptions;
  } = {}
): Promise<Map<string, RuleRunResult>> {
  if (selectedRules.length === 0) return new Map();
  const docsRules = selectedRules.filter(ruleOwnsDocsScope);
  const docsApplyBackedRules = docsRules.filter(ruleUsesDocsApplyDryRun);
  const docsCheckRules = docsRules.filter((rule) => !ruleUsesDocsApplyDryRun(rule));
  const sourceRules = selectedRules.filter((rule) => !ruleOwnsDocsScope(rule));
  if (docsRules.length > 0 && sourceRules.length > 0) {
    return new Map([
      ...(await runGritRuleGroup(sourceRules, options, "json")),
      ...(await runDocsApplyBackedGritRules(docsApplyBackedRules, options)),
      ...(await runGritRuleGroup(docsCheckRules, options, "text")),
    ]);
  }
  if (docsApplyBackedRules.length > 0 && docsCheckRules.length > 0) {
    return new Map([
      ...(await runDocsApplyBackedGritRules(docsApplyBackedRules, options)),
      ...(await runGritRuleGroup(docsCheckRules, options, "text")),
    ]);
  }
  if (docsApplyBackedRules.length > 0) {
    return runDocsApplyBackedGritRules(docsApplyBackedRules, options);
  }
  return runGritRuleGroup(
    selectedRules,
    options,
    docsRules.length > 0 ? "text" : "json"
  );
}

async function runGritRuleGroup(
  selectedRules: readonly HarnessRule[],
  options: {
    scanRoots?: readonly string[];
    processLayer?: Layer.Layer<HabitatProcess>;
    cacheMode?: GritCheckCacheMode;
    requireObservableCacheStatus?: boolean;
    allowInjectedProbeRoot?: boolean;
    projection?: GritProjectionOptions;
  },
  outputFormat: GritCheckOutputFormat
): Promise<Map<string, RuleRunResult>> {
  const scanRoots = effectiveGritScanRoots(
    selectedRules,
    selectedScanRootsForRules(selectedRules, options.scanRoots)
  );
  const emptyRootFailure = validateScanRoots(scanRoots, {
    allowInjectedProbeRoot: options.allowInjectedProbeRoot,
    allowDocsRoot: selectedRules.some(ruleOwnsDocsScope),
  });
  if (emptyRootFailure) {
    return new Map(
      selectedRules.map((rule) => [
        rule.id,
        infrastructureFailure(rule, "GritEmptyScanRoots", emptyRootFailure),
      ])
    );
  }

  const parseResult = await runHabitatEffect(
    gritCheckProgram(scanRoots, {
      cacheMode: options.cacheMode,
      requireObservableCacheStatus: options.requireObservableCacheStatus,
      allowInjectedProbeRoot: options.allowInjectedProbeRoot,
      allowDocsRoot: selectedRules.some(ruleOwnsDocsScope),
      outputFormat,
    }).pipe(Effect.provide(options.processLayer ?? HabitatProcessLive))
  );
  if (!parseResult.ok) {
    return new Map(
      selectedRules.map((rule) => [
        rule.id,
        infrastructureFailure(rule, parseResult.failureTag, parseResult.message),
      ])
    );
  }

  return projectGritResults(selectedRules, parseResult.report, options.projection);
}

async function runDocsApplyBackedGritRules(
  selectedRules: readonly HarnessRule[],
  options: {
    scanRoots?: readonly string[];
    processLayer?: Layer.Layer<HabitatProcess>;
  }
): Promise<Map<string, RuleRunResult>> {
  if (selectedRules.length === 0) return new Map();
  const scanRoots = selectedScanRootsForRules(selectedRules, options.scanRoots);
  const emptyRootFailure = validateScanRoots(scanRoots, { allowDocsRoot: true });
  if (emptyRootFailure) {
    return new Map(
      selectedRules.map((rule) => [
        rule.id,
        infrastructureFailure(rule, "GritEmptyScanRoots", emptyRootFailure),
      ])
    );
  }

  let commandResult: HabitatCommandResult;
  try {
    commandResult = await runHabitatEffect(
      docsApplyDryRunProgram(scanRoots).pipe(
        Effect.provide(options.processLayer ?? HabitatProcessLive)
      )
    );
  } catch (error) {
    return new Map(
      selectedRules.map((rule) => [
        rule.id,
        infrastructureFailure(
          rule,
          "GritToolUnavailable",
          error instanceof Error ? error.message : "Grit executable unavailable."
        ),
      ])
    );
  }
  if (commandResult.exit.code !== 0 || commandResult.exit.interrupted) {
    return new Map(
      selectedRules.map((rule) => [
        rule.id,
        infrastructureFailure(
          rule,
          commandResult.failureTag ?? "GritCommandFailed",
          `Grit docs rewrite dry-run exited ${commandResult.exit.code}.`
        ),
      ])
    );
  }

  const findingPaths = parseGritApplyDryRunPaths(commandResult.stdout.text);
  return new Map(
    selectedRules.map((rule) => [
      rule.id,
      {
        exitCode: findingPaths.length > 0 ? 1 : 0,
        diagnostics: findingPaths.map((filePath) => ({
          ruleId: rule.id,
          path: filePath,
          message: rule.message,
          severity: rule.lane === "advisory" ? ("advisory" as const) : ("error" as const),
          baselined: false,
        })),
      },
    ])
  );
}

function docsApplyDryRunProgram(scanRoots: readonly string[]) {
  return Effect.scoped(
    Effect.gen(function* () {
      const process = yield* HabitatProcess;
      return yield* process.run(docsApplyDryRunRequest(scanRoots));
    })
  );
}

function docsApplyDryRunRequest(scanRoots: readonly string[]): HabitatProcessRequest {
  const cacheDir = path.join(repoRoot, ".grit", "cache");
  mkdirSync(cacheDir, { recursive: true });
  return {
    commandId: "grit-docs-apply-dry-run",
    kind: "grit-apply",
    executable: gritBin,
    argv: [
      "apply",
      docsLocalCheckoutPathsRewritePattern,
      ...scanRoots,
      "--dry-run",
      "--force",
      "--output",
      "standard",
    ],
    cwd: repoRoot,
    env: {
      ...gritMachineOutputEnv,
      GRIT_CACHE_DIR: cacheDir,
      GRIT_TELEMETRY_DISABLED: "true",
    },
    scanRoots,
    cachePolicy: {
      mode: "isolated",
      cacheDir,
      observableStatus: "unknown",
    },
    nonClaims: ["does-not-prove-apply-transaction", "does-not-prove-product-runtime"],
  };
}

function parseGritApplyDryRunPaths(stdout: string): string[] {
  const changedPaths: string[] = [];
  let currentPath: string | null = null;
  let sawRewriteLine = false;

  for (const line of stdout.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("Processed ") || trimmed.startsWith("Skipped ")) continue;
    if (trimmed.endsWith(".md") && !trimmed.includes(": ERROR ")) {
      if (currentPath && sawRewriteLine) changedPaths.push(normalizeGritPath(currentPath));
      currentPath = trimmed;
      sawRewriteLine = false;
      continue;
    }
    if (currentPath && (trimmed.startsWith("-") || trimmed.startsWith("+"))) {
      sawRewriteLine = true;
    }
  }
  if (currentPath && sawRewriteLine) changedPaths.push(normalizeGritPath(currentPath));
  return sortedUnique(changedPaths);
}

function selectedScanRootsForRules(
  selectedRules: readonly HarnessRule[],
  scanRoots: readonly string[] | undefined
): string[] {
  if (!scanRoots) return discoverGritScanRoots(selectedRules);
  const wantsDocs = selectedRules.some(ruleOwnsDocsScope);
  return scanRoots.filter((scanRoot) =>
    wantsDocs ? isDocsScanRoot(scanRoot) : !isDocsScanRoot(scanRoot)
  );
}

export function gritCheckProgram(scanRoots: readonly string[], options: GritCheckOptions = {}) {
  return Effect.scoped(
    Effect.gen(function* () {
      const emptyRootFailure = validateScanRoots(scanRoots, {
        allowInjectedProbeRoot: options.allowInjectedProbeRoot,
        allowDocsRoot: options.allowDocsRoot,
      });
      if (emptyRootFailure) {
        return {
          ok: false as const,
          failureTag: "GritEmptyScanRoots" as const,
          parseStatus: "unsupported-mode" as const,
          message: emptyRootFailure,
        };
      }
      const process = yield* HabitatProcess;
      const requestOptions =
        options.cacheMode === "fresh"
          ? {
              cacheDir: yield* acquireGritCheckCacheDir(),
              observableCacheStatus: "fresh" as const,
              outputFormat: options.outputFormat,
            }
          : { outputFormat: options.outputFormat };
      const result = yield* process.run(gritCheckRequest(scanRoots, requestOptions)).pipe(
        Effect.catchTag("GritToolUnavailable", (error) =>
          Effect.fail(
            new GritToolUnavailable({
              commandId: error.commandId,
              executable: error.executable,
              argv: error.argv,
              cwd: error.cwd,
              cause: error.cause,
            })
          )
        )
      );
      if (
        options.requireObservableCacheStatus &&
        result.cachePolicy.observableStatus === "unknown"
      ) {
        return {
          ok: false as const,
          failureTag: "GritCacheProvenanceMissing" as const,
          parseStatus: "unsupported-mode" as const,
          message: "Grit cache/fresh status is not observable for this command result.",
          commandResult: {
            ...result,
            parseStatus: "unsupported-mode" as const,
            failureTag: "GritCacheProvenanceMissing" as const,
          },
        };
      }
      return options.outputFormat === "text"
        ? parseGritCheckTextOutput(result)
        : parseGritCheckOutput(result);
    }).pipe(
      Effect.catchTag("GritToolUnavailable", (error) =>
        Effect.succeed({
          ok: false as const,
          failureTag: "GritToolUnavailable" as const,
          parseStatus: "unparsed" as const,
          message: `Grit executable unavailable: ${error.executable}.`,
        })
      )
    )
  );
}

export function gritCheckRequest(
  scanRoots: readonly string[],
  options: GritCheckRequestOptions = {}
): HabitatProcessRequest {
  const cacheDir = options.cacheDir ?? path.join(repoRoot, ".grit", "cache");
  mkdirSync(cacheDir, { recursive: true });
  return {
    commandId: "grit-check-current-tree",
    kind: "grit-check",
    executable: gritBin,
    argv:
      options.outputFormat === "text"
        ? ["check", "--level", "error", ...scanRoots]
        : ["--json", "check", "--level", "error", ...scanRoots],
    cwd: repoRoot,
    env: {
      ...gritMachineOutputEnv,
      GRIT_CACHE_DIR: cacheDir,
      GRIT_TELEMETRY_DISABLED: "true",
    },
    scanRoots,
    cachePolicy: {
      mode: "isolated",
      cacheDir,
      observableStatus: options.observableCacheStatus ?? "unknown",
    },
    nonClaims: [
      "does-not-prove-injected-violation",
      "does-not-prove-baseline-shrink",
      "does-not-prove-apply-transaction",
      "does-not-prove-product-runtime",
    ],
  };
}

function acquireGritCheckCacheDir() {
  return Effect.acquireRelease(
    Effect.sync(() => mkdtempSync(path.join(tmpdir(), "habitat-grit-check-"))),
    (cacheDir) => Effect.sync(() => rmSync(cacheDir, { recursive: true, force: true }))
  );
}

export function parseGritCheckTextOutput(commandResult: HabitatCommandResult): GritCheckParseResult {
  if (commandResult.exit.interrupted) {
    return parseFailure(
      commandResult,
      commandResult.failureTag ?? "GritCommandFailed",
      "unparsed",
      "Grit command was interrupted."
    );
  }

  const text = `${commandResult.stdout.text}\n${commandResult.stderr.text}`;
  const results = parseGritTextResults(text);
  if (commandResult.exit.code !== 0 && results.length === 0) {
    return parseFailure(
      commandResult,
      commandResult.failureTag ?? "GritCommandFailed",
      "unparsed",
      `Grit command exited ${commandResult.exit.code}.`
    );
  }

  return {
    ok: true,
    report: {
      paths: [...new Set(results.map((result) => result.path).filter(isString))],
      results,
    },
    parseStatus: "parsed",
    commandResult: { ...commandResult, parseStatus: "parsed", failureTag: null },
  };
}

function parseGritTextResults(text: string): GritResult[] {
  const results: GritResult[] = [];
  let currentPath = ".";
  let currentLine: number | undefined;
  let currentColumn: number | undefined;

  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    if (line.includes(" files with ") || line.startsWith("Run grit check ")) continue;
    if (!line.startsWith(" ") && !line.includes(" files with ")) {
      currentPath = normalizeGritPath(line.trim());
      currentLine = undefined;
      currentColumn = undefined;
      continue;
    }

    const positionMatch = line.match(/^\s+(\d+):(\d+)\s+/);
    if (positionMatch) {
      currentLine = Number(positionMatch[1]);
      currentColumn = Number(positionMatch[2]);
    }

    const patternMatch = line.match(/\b([a-z][a-z0-9_]+)\s*$/);
    if (!patternMatch) continue;
    results.push({
      local_name: patternMatch[1],
      path: currentPath,
      start: currentLine ? { line: currentLine, col: currentColumn } : undefined,
    });
  }

  return results;
}

export function parseGritCheckOutput(commandResult: HabitatCommandResult): GritCheckParseResult {
  if (commandResult.exit.code !== 0 || commandResult.exit.interrupted) {
    return parseFailure(
      commandResult,
      commandResult.failureTag ?? "GritCommandFailed",
      "unparsed",
      `Grit command exited ${commandResult.exit.code}.`
    );
  }

  const candidates = [
    {
      stream: "stdout",
      text: commandResult.stdout.text,
      truncated: commandResult.stdout.truncated,
    },
    {
      stream: "stderr",
      text: commandResult.stderr.text,
      truncated: commandResult.stderr.truncated,
    },
  ];
  const nonEmpty = candidates.filter((candidate) => candidate.text.trim().length > 0);
  if (nonEmpty.length === 0) {
    return parseFailure(commandResult, "GritNoJson", "no-json", "Grit emitted no JSON output.");
  }
  const truncated = nonEmpty.find((candidate) => candidate.truncated);
  if (truncated) {
    return parseFailure(
      commandResult,
      "GritAdapterInternalContractViolation",
      "unsupported-mode",
      `Grit ${truncated.stream} output exceeded the parser capture limit.`
    );
  }

  for (const candidate of nonEmpty) {
    const trimmed = candidate.text.trim();
    if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) continue;
    try {
      return validateGritReport(commandResult, JSON.parse(trimmed));
    } catch {
      return parseFailure(
        commandResult,
        "GritMalformedJson",
        "malformed",
        `Grit ${candidate.stream} is not valid JSON.`
      );
    }
  }

  const containsJsonLikeText = nonEmpty.some(
    (candidate) => candidate.text.includes("{") || candidate.text.includes("}")
  );
  return parseFailure(
    commandResult,
    containsJsonLikeText ? "GritMalformedJson" : "GritNoJson",
    containsJsonLikeText ? "malformed" : "no-json",
    containsJsonLikeText
      ? "Grit output contains wrapper text around JSON; Habitat requires exact JSON."
      : "Grit output did not contain a JSON object."
  );
}

export function projectGritResults(
  selectedRules: readonly HarnessRule[],
  report: GritReport,
  options: GritProjectionOptions = {}
): Map<string, RuleRunResult> {
  const selectedPatterns = new Set(selectedRules.map(gritPatternForRule));
  if (options.rejectUnexpectedPatternIdentity) {
    const unexpected = report.results
      .map(resultPatternIdentity)
      .find((identity): identity is string => Boolean(identity && !selectedPatterns.has(identity)));
    if (unexpected) {
      return new Map(
        selectedRules.map((rule) => [
          rule.id,
          infrastructureFailure(
            rule,
            "GritUnexpectedPatternIdentity",
            `Grit output included unexpected pattern identity: ${unexpected}.`
          ),
        ])
      );
    }
  }

  return new Map(
    selectedRules.map((rule) => {
      const pattern = gritPatternForRule(rule);
      const diagnostics = report.results
        .filter((result) => matchesPattern(result, pattern))
        .map((result) => ({
          ruleId: rule.id,
          path: normalizeGritPath(result.path),
          line: result.start?.line,
          message: result.extra?.message ?? rule.message,
          severity: rule.lane === "advisory" ? ("advisory" as const) : ("error" as const),
          baselined: false,
        }));
      if (options.requirePatternFinding && diagnostics.length === 0) {
        return [
          rule.id,
          infrastructureFailure(
            rule,
            "GritPatternProjectionMiss",
            `Expected Grit pattern identity was not projected: ${pattern}.`
          ),
        ];
      }
      return [rule.id, { exitCode: diagnostics.length > 0 ? 1 : 0, diagnostics }];
    })
  );
}

export function discoverGritScanRoots(selectedRules: readonly HarnessRule[] = []): string[] {
  const needsSourceRoots =
    selectedRules.length === 0 || selectedRules.some((rule) => !ruleOwnsDocsScope(rule));
  const candidates = [
    ...(needsSourceRoots ? gritScanRootCandidates : []),
    ...(selectedRules.some(ruleOwnsDocsScope) ? discoverDocsGritScanRoots(selectedRules) : []),
    ...(selectedRules.some(ruleOwnsIgnoredTestScope) ? ignoredTestScanRootCandidates : []),
  ];
  return candidates.filter((scanPath) => existsSync(path.join(repoRoot, scanPath)));
}

export function effectiveGritScanRoots(
  selectedRules: readonly HarnessRule[],
  scanRoots: readonly string[]
): string[] {
  if (!selectedRules.some(ruleOwnsIgnoredTestScope)) return [...scanRoots];
  const exactTestFiles = scanRoots.flatMap(collectIgnoredTestFiles);
  if (exactTestFiles.length === 0) return [...scanRoots];
  return sortedUnique([
    ...scanRoots.filter((scanRoot) => !isIgnoredTestDirectoryRoot(scanRoot)),
    ...exactTestFiles,
  ]);
}

export interface GritScanRootValidationOptions {
  requireExisting?: boolean;
  allowInjectedProbeRoot?: boolean;
  allowDocsRoot?: boolean;
}

export function validateScanRoots(
  scanRoots: readonly string[],
  options: GritScanRootValidationOptions = {}
): string | null {
  const requireExisting = options.requireExisting ?? true;
  if (scanRoots.length === 0) return "Grit scan roots are empty.";
  for (const scanRoot of scanRoots) {
    const absolute = path.resolve(repoRoot, scanRoot);
    const relative = toRepoRelative(absolute);
    if (relative === ".." || relative.startsWith("../"))
      return `Grit scan root is outside the repo: ${scanRoot}.`;
    if (requireExisting && !existsSync(absolute))
      return `Grit scan root does not exist: ${scanRoot}.`;
    if (isGeneratedRoot(relative)) return `Grit scan root is generated output: ${relative}.`;
    if (isProtectedRoot(relative)) return `Grit scan root is protected: ${relative}.`;
    if (!isApprovedScanRoot(relative, options))
      return `Grit scan root is not approved: ${relative}.`;
  }
  return null;
}

function validateGritReport(
  commandResult: HabitatCommandResult,
  value: unknown
): GritCheckParseResult {
  if (!value || typeof value !== "object") {
    return parseFailure(
      commandResult,
      "GritSchemaDrift",
      "schema-drift",
      "Grit JSON is not an object."
    );
  }
  const report = value as Partial<GritReport>;
  if (!Array.isArray(report.results)) {
    return parseFailure(
      commandResult,
      "GritSchemaDrift",
      "schema-drift",
      "Grit JSON is missing a results array."
    );
  }
  if (report.paths !== undefined && !isStringArray(report.paths)) {
    return parseFailure(
      commandResult,
      "GritUnexpectedResultShape",
      "schema-drift",
      "Grit JSON paths must be an array of strings."
    );
  }
  for (const result of report.results) {
    const problem = validateGritResult(result);
    if (problem) {
      return parseFailure(commandResult, "GritUnexpectedResultShape", "schema-drift", problem);
    }
  }
  return {
    ok: true,
    report: {
      paths: report.paths ?? [],
      results: report.results,
    },
    parseStatus: "parsed",
    commandResult: { ...commandResult, parseStatus: "parsed", failureTag: null },
  };
}

function validateGritResult(value: unknown): string | null {
  if (!value || typeof value !== "object") return "Grit result must be an object.";
  const result = value as GritResult;
  if (result.local_name !== undefined && typeof result.local_name !== "string")
    return "Grit result local_name must be a string when present.";
  if (result.check_id !== undefined && typeof result.check_id !== "string")
    return "Grit result check_id must be a string when present.";
  if (result.path !== undefined && typeof result.path !== "string")
    return "Grit result path must be a string when present.";
  if (result.start !== undefined && typeof result.start?.line !== "number")
    return "Grit result start.line must be a number when present.";
  if (result.extra !== undefined) {
    if (typeof result.extra !== "object") return "Grit result extra must be an object.";
    if (
      result.extra.message !== undefined &&
      typeof result.extra.message !== "string" &&
      result.extra.message !== null
    )
      return "Grit result extra.message must be a string or null when present.";
  }
  return null;
}

function parseFailure(
  commandResult: HabitatCommandResult,
  failureTag: GritAdapterFailureTag,
  parseStatus: Exclude<GritParseStatus, "parsed">,
  message: string
): GritCheckParseResult {
  return {
    ok: false,
    failureTag,
    parseStatus,
    message,
    commandResult: { ...commandResult, parseStatus, failureTag },
  };
}

function infrastructureFailure(
  rule: HarnessRule,
  failureTag: GritAdapterFailureTag,
  detail = "Grit adapter failed before producing rule findings."
): RuleRunResult {
  return {
    exitCode: 1,
    diagnostics: [
      {
        ruleId: rule.id,
        path: ".",
        message: `${rule.message}\n${renderGritAdapterFailure(failureTag, detail)}`,
        severity: rule.lane === "advisory" ? "advisory" : "error",
        baselined: false,
      },
    ],
  };
}

function matchesPattern(result: GritResult, pattern: string): boolean {
  return result.local_name === pattern || result.check_id?.includes(`#${pattern}/`) === true;
}

function resultPatternIdentity(result: GritResult): string | undefined {
  if (result.local_name) return result.local_name;
  const match = result.check_id?.match(/#([^/]+)\//);
  return match?.[1];
}

function normalizeGritPath(gritPath: string | undefined): string {
  if (!gritPath) return ".";
  return toRepoRelative(gritPath.replace(/^\.\//, ""));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isApprovedScanRoot(
  relative: string,
  options: Pick<GritScanRootValidationOptions, "allowInjectedProbeRoot" | "allowDocsRoot"> = {}
): boolean {
  if (
    options.allowInjectedProbeRoot &&
    (relative === injectedProbeRoot || relative.startsWith(`${injectedProbeRoot}/`))
  ) {
    return true;
  }
  const standardRoot = [...gritScanRootCandidates, ...ignoredTestScanRootCandidates].some(
    (root) => relative === root || relative.startsWith(`${root}/`)
  );
  if (standardRoot) return true;
  return (
    Boolean(options.allowDocsRoot) &&
    docsGritScanRootCandidates.some((root) => relative === root || relative.startsWith(`${root}/`))
  );
}

function ruleOwnsDocsScope(rule: HarnessRule): boolean {
  return rule.scope.includes("docs/");
}

function ruleUsesDocsApplyDryRun(rule: HarnessRule): boolean {
  return rule.gritPattern === "docs_local_checkout_paths";
}

function gritPatternForRule(rule: HarnessRule): string {
  if (rule.ownerTool === "grit-check" && rule.gritPattern) return rule.gritPattern;
  throw new Error(`Habitat Grit rule ${JSON.stringify(rule.id)} is missing gritPattern metadata.`);
}

function isDocsScanRoot(scanRoot: string): boolean {
  const relative = toRepoRelative(scanRoot);
  return docsGritScanRootCandidates.some(
    (root) => relative === root || relative.startsWith(`${root}/`)
  );
}

function discoverDocsGritScanRoots(selectedRules: readonly HarnessRule[]): string[] {
  const scopeRoots = selectedRules.flatMap(docsScopeRootsForRule);
  const roots = scopeRoots.length > 0 ? scopeRoots : docsGritScanRootCandidates;
  return sortedUnique(roots.flatMap(collectMarkdownScanRoots));
}

function docsScopeRootsForRule(rule: HarnessRule): string[] {
  return [...rule.scope.matchAll(/\bdocs\/[^\s,;)]+/g)]
    .map((match) => match[0])
    .map((scope) => scope.replace(/\*\*\/\*\.md$/, ""))
    .map((scope) => scope.replace(/\*\*\/\*$/, ""))
    .map((scope) => scope.replace(/\*\.md$/, ""))
    .map((scope) => scope.replace(/\/+$/, ""))
    .filter((scope) => scope.length > 0);
}

function collectMarkdownScanRoots(scanRoot: string): string[] {
  const absolute = path.join(repoRoot, scanRoot);
  if (!existsSync(absolute)) return [];
  const relative = toRepoRelative(absolute);
  const stats = statSync(absolute);
  if (stats.isFile()) return path.extname(relative) === ".md" ? [relative] : [];
  if (!stats.isDirectory()) return [];
  const files: string[] = [];
  collectMarkdownFiles(absolute, files);
  return files.map(toRepoRelative);
}

function collectMarkdownFiles(absoluteRoot: string, files: string[]): void {
  for (const entry of readdirSync(absoluteRoot, { withFileTypes: true })) {
    const absolute = path.join(absoluteRoot, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") continue;
      collectMarkdownFiles(absolute, files);
      continue;
    }
    if (entry.isFile() && path.extname(entry.name) === ".md") files.push(absolute);
  }
}

function ruleOwnsIgnoredTestScope(rule: HarnessRule): boolean {
  return /(^|[,{]\s*)[^,\s]*\/test\/\*\*/.test(rule.scope) || /\btest\/\*\*/.test(rule.scope);
}

function collectIgnoredTestFiles(scanRoot: string): string[] {
  const absolute = path.resolve(repoRoot, scanRoot);
  if (!existsSync(absolute)) return [];
  const relative = toRepoRelative(absolute);
  const stats = statSync(absolute);
  if (stats.isFile()) return isIgnoredTestCandidate(relative) ? [relative] : [];
  if (!stats.isDirectory()) return [];
  const files: string[] = [];
  collectFiles(absolute, files);
  return files.map(toRepoRelative).filter(isIgnoredTestCandidate);
}

function isIgnoredTestDirectoryRoot(scanRoot: string): boolean {
  const absolute = path.resolve(repoRoot, scanRoot);
  if (!existsSync(absolute)) return false;
  if (!statSync(absolute).isDirectory()) return false;
  const relative = toRepoRelative(absolute);
  return relative.endsWith("/test") || relative.includes("/test/");
}

function collectFiles(absoluteRoot: string, files: string[]): void {
  for (const entry of readdirSync(absoluteRoot, { withFileTypes: true })) {
    const absolute = path.join(absoluteRoot, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") continue;
      collectFiles(absolute, files);
      continue;
    }
    if (entry.isFile()) files.push(absolute);
  }
}

function isIgnoredTestCandidate(relative: string): boolean {
  if (!gritCandidateExtensions.has(path.extname(relative))) return false;
  return relative.includes("/test/") || /\.test\.[cm]?[jt]sx?$/.test(relative);
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values.map(toRepoRelative))].sort((a, b) => a.localeCompare(b));
}

function isGeneratedRoot(relative: string): boolean {
  return generatedZones.some((zone) => {
    if (zone.kind === "exact") return relative === zone.path;
    return relative === zone.path.slice(0, -1) || relative.startsWith(zone.path);
  });
}

function isProtectedRoot(relative: string): boolean {
  const normalized = relative.endsWith("/") ? relative : `${relative}/`;
  return protectedScanRootPrefixes.some(
    (prefix) => normalized === prefix || normalized.startsWith(prefix)
  );
}
