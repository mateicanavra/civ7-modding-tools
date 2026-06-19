import { repoRoot } from "../paths.js";
import { run, type SpawnResult } from "../spawn.js";
import type { VerifyTargetPlan } from "../workspace-graph/index.js";
import type { VerifyReceipt } from "./schema.js";
import { boundedPreview } from "./command-output.js";

/**
 * Builds the Nx affected argv used by verify.
 *
 * @param base - Git base for the affected calculation.
 * @param targetPlan - D3 target plan that owns which targets verify may request.
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

/**
 * Runs the affected target plan.
 *
 * @param base - Git base for the affected calculation.
 * @param targetPlan - Runnable D3 verify target plan.
 * @returns Spawn result with raw streams for immediate command output and bounded receipt projection.
 */
export function runAffectedVerification(
  base: string,
  targetPlan: Extract<VerifyTargetPlan, { kind: "verify-target-plan" }>
): SpawnResult {
  return run(affectedVerificationArgv(base, targetPlan), {
    cwd: repoRoot,
  });
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
  targetPlan?: VerifyTargetPlan
): Extract<VerifyReceipt["nxAffected"], { kind: "skipped" }> {
  return {
    kind: "skipped",
    skipReason:
      targetPlan?.kind === "verify-target-plan-refused"
        ? "workspace-graph-refused"
        : "habitat-check-failed",
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
      cacheState: taskLine.includes("existing outputs match the cache") ? "cache-hit" : "not-observed",
    };
  });
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}
