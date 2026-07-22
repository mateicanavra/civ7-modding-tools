import type { NxProviderService } from "@habitat/cli/providers/nx/index";
import {
  type SpawnResult,
  spawnResultFromCommandResult,
} from "@habitat/cli/resources/command/index";
import type { VerifyTargetPlan } from "@habitat/cli/service/model/workspace/index";
import { Effect, Match, Option } from "effect";
import type { VerifyReceipt } from "../dto/verify.schema.js";
import { boundedPreview } from "./command-output.policy.js";

type SkippedNxAffectedReason = Extract<
  VerifyReceipt["nxAffected"],
  { kind: "skipped" }
>["skipReason"];

export type VerifyNxAffectedPort = Pick<NxProviderService, "affected">;

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
    kind: nxAffectedKind(affected.exitCode),
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
    skipReason: skippedReason(options),
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
  return Match.value(targetFlagIndex).pipe(
    Match.when(-1, () => []),
    Match.orElse((index) =>
      (argv[index + 1] ?? "").split(",").filter((target) => target.length > 0)
    )
  );
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
  return tasks.map(nxTaskCacheState);
}

function nxTaskCacheState(
  match: RegExpMatchArray
): Extract<VerifyReceipt["nxAffected"], { kind: "executed" }>["cacheStateByTask"][number] {
  const project = match[1];
  const target = match[2];
  const taskLine = match[3] ?? "";
  const cacheState = Match.value(taskLine.includes("existing outputs match the cache")).pipe(
    Match.when(true, () => "cache-hit" as const),
    Match.orElse(() => "not-observed" as const)
  );
  return {
    taskId: `${project}:${target}`,
    project,
    target,
    cacheState,
  };
}

function nxAffectedKind(exitCode: number): "executed" | "failed" {
  return Match.value(exitCode).pipe(
    Match.when(0, () => "executed" as const),
    Match.orElse(() => "failed" as const)
  );
}

function skippedReason(options: {
  readonly reason?: SkippedNxAffectedReason;
  readonly targetPlan?: VerifyTargetPlan;
}): SkippedNxAffectedReason {
  const inferred = Match.value(options.targetPlan?.kind).pipe(
    Match.when("verify-target-plan-refused", () => "workspace-graph-refused" as const),
    Match.orElse(() => "habitat-check-failed" as const)
  );
  return Option.fromNullable(options.reason).pipe(Option.getOrElse(() => inferred));
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}
