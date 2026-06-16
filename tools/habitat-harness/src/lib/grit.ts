import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
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
}

export type GritCheckCacheMode = "workspace" | "fresh";

export interface GritCheckRequestOptions {
  cacheDir?: string;
  observableCacheStatus?: "unknown" | "fresh" | "cache-hit" | "replay";
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
  const scanRoots = options.scanRoots ?? discoverGritScanRoots();
  const emptyRootFailure = validateScanRoots(scanRoots, {
    allowInjectedProbeRoot: options.allowInjectedProbeRoot,
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

export function gritCheckProgram(scanRoots: readonly string[], options: GritCheckOptions = {}) {
  return Effect.scoped(
    Effect.gen(function* () {
      const emptyRootFailure = validateScanRoots(scanRoots, {
        allowInjectedProbeRoot: options.allowInjectedProbeRoot,
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
            }
          : {};
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
      return parseGritCheckOutput(result);
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
    argv: ["--json", "check", "--level", "error", ...scanRoots],
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
  const selectedPatterns = new Set(selectedRules.map((rule) => rule.gritPattern ?? rule.id));
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
      const pattern = rule.gritPattern ?? rule.id;
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

export function discoverGritScanRoots(): string[] {
  return gritScanRootCandidates.filter((scanPath) => existsSync(path.join(repoRoot, scanPath)));
}

export interface GritScanRootValidationOptions {
  requireExisting?: boolean;
  allowInjectedProbeRoot?: boolean;
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

function isApprovedScanRoot(
  relative: string,
  options: Pick<GritScanRootValidationOptions, "allowInjectedProbeRoot"> = {}
): boolean {
  if (
    options.allowInjectedProbeRoot &&
    (relative === injectedProbeRoot || relative.startsWith(`${injectedProbeRoot}/`))
  ) {
    return true;
  }
  return gritScanRootCandidates.some(
    (root) => relative === root || relative.startsWith(`${root}/`)
  );
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
