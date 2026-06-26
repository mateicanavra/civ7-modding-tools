import {
  type SpawnResult,
  spawnResultFromCommandResult,
} from "@internal/habitat-harness/resources/command/index";
import type { HabitatCommandResult } from "@internal/habitat-harness/resources/command/types";
import type { VerifyTargetPlan } from "@internal/habitat-harness/service/model/workspace/index";
import { Effect } from "effect";
import type { VerifyReceipt } from "../dto/verify.schema.js";
import { boundedPreview } from "./command-output.policy.js";

type SkippedNxAffectedReason = Extract<
  VerifyReceipt["nxAffected"],
  { kind: "skipped" }
>["skipReason"];

export interface VerifyNxAffectedPort {
  readonly affected: (request: {
    readonly base: string;
    readonly targets: readonly string[];
  }) => Effect.Effect<HabitatCommandResult, unknown, any>;
}

/**
 * Builds the Nx affected argv used by verify.
 *
 * @param base - Git base for the affected calculation.
 * @param targetPlan - Target plan that owns which targets verify may request.
 * @returns Argument vector passed to the repository-local Nx entrypoint.
 */
export function affectedVerificationArgv(base: string, targetPlan: VerifyTargetPlan): string[] {
  return [
    "nx",
    "affected",
    "-t",
    targetPlan.targets.join(","),
    "--base",
    base,
    "--head",
    "HEAD",
    "--outputStyle=static",
  ];
}

export function runAffectedVerificationEffect(
  nx: VerifyNxAffectedPort,
  base: string,
  targets: readonly string[]
) {
  return nx.affected({ base, targets }).pipe(Effect.map(spawnResultFromCommandResult));
}

/**
 * Projects a completed Nx affected command into receipt-safe metadata.
 *
 * @param argv - Affected command argv.
 * @param affected - Completed Nx spawn result.
 * @returns Executed or failed receipt state without raw stdout/stderr bodies.
 */
export function completedNxAffected(
  argv: string[],
  affected: SpawnResult
): Extract<VerifyReceipt["nxAffected"], { kind: "executed" | "failed" }> {
  const stdout = boundedPreview(affected.stdout);
  const stderr = boundedPreview(affected.stderr);
  return {
    kind: affected.exitCode === 0 ? "executed" : "failed",
    argv,
    targets: targetsFromArgv(argv),
    projects: parseNxAffectedProjects(affected.stdout),
    cacheStateByTask: parseNxTaskCacheStates(affected.stdout),
    exitCode: affected.exitCode,
    stdoutLength: affected.stdout.length,
    stderrLength: affected.stderr.length,
    stdoutPreview: stdout.text,
    stderrPreview: stderr.text,
    stdoutTruncated: stdout.truncated,
    stderrTruncated: stderr.truncated,
  };
}

/**
 * Records that Nx affected did not run because an upstream Habitat boundary blocked it.
 *
 * @param argv - Affected command argv that would have run.
 * @param targetPlan - Optional refused target plan; absence means Habitat check blocked first.
 * @returns Skipped receipt state with empty stream metadata.
 */
export function skippedNxAffected(
  argv: string[],
  options: {
    reason?: SkippedNxAffectedReason;
    targetPlan?: VerifyTargetPlan;
  } = {}
): Extract<VerifyReceipt["nxAffected"], { kind: "skipped" }> {
  return {
    kind: "skipped",
    skipReason:
      options.reason ??
      (options.targetPlan?.kind === "verify-target-plan-refused"
        ? "workspace-graph-refused"
        : "habitat-check-failed"),
    argv,
    targets: targetsFromArgv(argv),
    projects: [],
    cacheStateByTask: [],
    exitCode: null,
    stdoutLength: 0,
    stderrLength: 0,
    stdoutPreview: "",
    stderrPreview: "",
    stdoutTruncated: false,
    stderrTruncated: false,
  };
}

function targetsFromArgv(argv: readonly string[]): string[] {
  const targetFlagIndex = argv.indexOf("-t");
  if (targetFlagIndex === -1) return [];
  return (argv[targetFlagIndex + 1] ?? "").split(",").filter((target) => target.length > 0);
}

function parseNxAffectedProjects(stdout: string): string[] {
  const projectLines = [...stdout.matchAll(/^\s*-\s+([^\s].*)$/gm)].map((match) => match[1].trim());
  return sortedUnique(
    projectLines
      .map((line) => line.split(/\s+/)[0])
      .filter((project) => project.length > 0 && !project.includes(":"))
  );
}

function parseNxTaskCacheStates(
  stdout: string
): Extract<VerifyReceipt["nxAffected"], { kind: "executed" }>["cacheStateByTask"] {
  const tasks = [...stdout.matchAll(/^>\s+nx run ([^:\s]+):([^\s]+)(.*)$/gm)];
  return tasks.map((match) => {
    const project = match[1];
    const target = match[2];
    const taskLine = match[3] ?? "";
    return {
      taskId: `${project}:${target}`,
      project,
      target,
      cacheState: taskLine.includes("existing outputs match the cache")
        ? "cache-hit"
        : "not-observed",
    };
  });
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}
