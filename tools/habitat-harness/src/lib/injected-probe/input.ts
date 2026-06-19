import { existsSync } from "node:fs";
import path from "node:path";
import type { Layer } from "effect";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import { decideGritScanRoots } from "../../adapters/grit/scan-roots/index.js";
import { activeRuleGritFacts } from "../../rules/facts.js";
import type { RuleGritFacts } from "../../rules/registry/index.js";
import type {
  DiagnosticScanRootRefusalReason,
  InjectedProbeOutcome,
  InjectedProbeRefusalReason,
} from "../diagnostic-catalog/index.js";
import type { HabitatProcess } from "../habitat-process.js";
import { repoRoot, toRepoRelative } from "../paths.js";
import { run } from "../spawn.js";
import { probeRefused } from "./outcome.js";

const NonEmptyStringSchema = Type.String({ minLength: 1 });

export const InjectedProbeScopeSchema = Type.Object(
  {
    scanRoots: Type.Array(NonEmptyStringSchema),
    matchingProbePath: NonEmptyStringSchema,
    outsideScopeControlPath: NonEmptyStringSchema,
  },
  { additionalProperties: false }
);

export const InjectedGritProbeRequestSchema = Type.Object(
  {
    ruleId: NonEmptyStringSchema,
    patternIdentity: NonEmptyStringSchema,
    probePath: NonEmptyStringSchema,
    probeBody: Type.String(),
    controlPath: NonEmptyStringSchema,
    controlBody: Type.String(),
    expectedDiagnostic: Type.Optional(Type.String()),
    scope: InjectedProbeScopeSchema,
    requireCleanFinalStatus: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false }
);

export type InjectedProbeScope = Static<typeof InjectedProbeScopeSchema>;
export type InjectedGritProbeRequest = Static<typeof InjectedGritProbeRequestSchema>;
export type InjectedGritProbeInput = InjectedGritProbeRequest & {
  processLayer?: Layer.Layer<HabitatProcess>;
  registry?: readonly RuleGritFacts[];
};

export function validateInjectedGritProbeInput(
  input: InjectedGritProbeInput
): InjectedProbeOutcome | null {
  const request = injectedGritProbeRequest(input);
  const shapeIssues = [...Value.Errors(InjectedGritProbeRequestSchema, request)];
  if (shapeIssues.length > 0) {
    const firstIssue = shapeIssues[0];
    return probeRefused(
      "metadata-missing",
      `Injected probe metadata is malformed at ${firstIssue.instancePath || "/"}: ${
        firstIssue.message
      }.`
    );
  }
  if (
    input.scope.matchingProbePath !== input.probePath ||
    input.scope.outsideScopeControlPath !== input.controlPath
  ) {
    return probeRefused(
      "metadata-mismatched",
      "Injected probe metadata paths do not match requested probe paths."
    );
  }
  const registeredRule = (input.registry ?? activeRuleGritFacts).find(
    (rule) => rule.id === input.ruleId
  );
  if (!registeredRule) return null;
  if (registeredRule.gritPattern !== input.patternIdentity) {
    return probeRefused(
      "pattern-identity-mismatch",
      "Injected probe pattern identity does not match rules.json."
    );
  }
  const scanRootDecision = decideGritScanRoots(input.scope.scanRoots, {
    allowInjectedProbeRoot: true,
  });
  if (scanRootDecision.kind === "refused") {
    return probeRefused("probe-path-outside-scan-root", "Injected probe scan roots are refused.");
  }
  for (const probePath of [input.probePath, input.controlPath]) {
    const pathFailure = validateProbePath(probePath, input.scope.scanRoots);
    if (pathFailure) return probeRefused(pathFailure.reason, pathFailure.message);
  }
  if (normalizeProbePath(input.probePath) === normalizeProbePath(input.controlPath)) {
    return probeRefused("same-probe-and-control-path", "Probe and control paths must be distinct.");
  }
  return null;
}

function injectedGritProbeRequest(input: InjectedGritProbeInput): InjectedGritProbeRequest {
  const request: InjectedGritProbeRequest = {
    ruleId: input.ruleId,
    patternIdentity: input.patternIdentity,
    probePath: input.probePath,
    probeBody: input.probeBody,
    controlPath: input.controlPath,
    controlBody: input.controlBody,
    scope: input.scope,
  };
  if (input.expectedDiagnostic !== undefined) request.expectedDiagnostic = input.expectedDiagnostic;
  if (input.requireCleanFinalStatus !== undefined) {
    request.requireCleanFinalStatus = input.requireCleanFinalStatus;
  }
  return request;
}

export function normalizeProbePath(probePath: string): string {
  return toRepoRelative(probePath).replace(/^\.\//, "");
}

function validateProbePath(
  probePath: string,
  scanRoots: readonly string[]
): { reason: InjectedProbeRefusalReason; message: string } | null {
  const relative = normalizeProbePath(probePath);
  if (relative === ".." || relative.startsWith("../")) {
    return {
      reason: "probe-path-outside-repo",
      message: `Injected probe path is outside the repo: ${probePath}.`,
    };
  }
  if (!scanRoots.some((scanRoot) => relative === scanRoot || relative.startsWith(`${scanRoot}/`))) {
    return {
      reason: "probe-path-outside-scan-root",
      message: `Injected probe path is outside the effective scan roots: ${relative}.`,
    };
  }
  if (!hasProbeOwnershipMarker(relative)) {
    return {
      reason: "missing-habitat-ownership-segment",
      message: `Injected probe path must include a probe-owned __habitat path segment: ${relative}.`,
    };
  }
  const parentDecision = decideGritScanRoots([path.dirname(relative)], {
    requireExisting: false,
    allowInjectedProbeRoot: true,
  });
  if (parentDecision.kind === "refused") {
    return {
      reason: probeRefusalReasonFromScanRoot(parentDecision.reason),
      message: `Injected probe parent is refused: ${parentDecision.root ?? relative}.`,
    };
  }
  if (existsSync(path.join(repoRoot, relative))) {
    return {
      reason: "probe-path-pre-existing",
      message: `Injected probe path already exists: ${relative}.`,
    };
  }
  const ignored = run(["git", "check-ignore", "--quiet", relative], { cwd: repoRoot });
  if (ignored.exitCode === 0) {
    return {
      reason: "probe-path-ignored",
      message: `Injected probe path is ignored by Git: ${relative}.`,
    };
  }
  return null;
}

function probeRefusalReasonFromScanRoot(
  reason: DiagnosticScanRootRefusalReason
): InjectedProbeRefusalReason {
  switch (reason) {
    case "outside-repo":
      return "probe-path-outside-repo";
    case "generated-output":
      return "probe-path-generated";
    case "protected-root":
      return "probe-path-protected";
    default:
      return "probe-path-outside-scan-root";
  }
}

function hasProbeOwnershipMarker(relative: string): boolean {
  return relative.split(/[\\/]+/).some((segment) => segment.startsWith("__habitat"));
}
