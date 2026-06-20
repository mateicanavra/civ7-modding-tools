import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { stagedPatternScanRoots } from "../../domains/structural-check/index.js";
import { repoRoot, toRepoRelative } from "../../lib/paths.js";
import type { SpawnResult } from "../../providers/command/index.js";
import { runHookCommand } from "./command-runner.js";
import type { HookRuntime } from "./runtime.js";

const biomeCandidateExtensions = new Set([
  ".cjs",
  ".css",
  ".cts",
  ".graphql",
  ".html",
  ".js",
  ".json",
  ".jsonc",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);

export function existingStagedPaths(runtime: HookRuntime = {}): string[] {
  const pathExists = runtime.pathExists ?? existsSync;
  return stagedPaths(runtime).filter((candidate) => pathExists(path.join(repoRoot, candidate)));
}

export function biomeHookPaths(staged: readonly string[]): string[] {
  return staged.filter((candidate) => biomeCandidateExtensions.has(path.extname(candidate)));
}

export function hookPatternScanRoots(stagedPaths: readonly string[]): string[] {
  return stagedPatternScanRoots(stagedPaths);
}

export function unstagedAmong(paths: string[], runtime: HookRuntime = {}): string[] {
  if (paths.length === 0) return [];
  const result = runHookCommand(
    runtime,
    "partial-staging",
    ["git", "diff", "--name-only", "-z", "--", ...paths],
    { cwd: repoRoot }
  );
  if (result.exitCode !== 0 || !result.stdout) return [];
  return result.stdout.split("\0").filter(Boolean).map(toRepoRelative);
}

export function gitAdd(paths: string[], runtime: HookRuntime = {}): SpawnResult {
  if (paths.length === 0) return { exitCode: 0, stdout: "", stderr: "" };
  return runHookCommand(runtime, "formatter-restage", ["git", "add", "--", ...paths], {
    cwd: repoRoot,
  });
}

export function fileHash(repoRelativePath: string): string | null {
  const absolute = path.join(repoRoot, repoRelativePath);
  if (!existsSync(absolute)) return null;
  return createHash("sha256").update(readFileSync(absolute)).digest("hex");
}

function stagedPaths(runtime: HookRuntime = {}): string[] {
  const result = runHookCommand(
    runtime,
    "staged-paths",
    ["git", "diff", "--cached", "--name-status", "-z"],
    { cwd: repoRoot }
  );
  if (result.exitCode !== 0 || !result.stdout) return [];
  const tokens = result.stdout.split("\0").filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i < tokens.length; ) {
    const status = tokens[i++] ?? "";
    if (status.startsWith("R") || status.startsWith("C")) {
      const oldPath = tokens[i++];
      const newPath = tokens[i++];
      if (oldPath) out.push(oldPath);
      if (newPath) out.push(newPath);
      continue;
    }
    const file = tokens[i++];
    if (!file || status.startsWith("D")) continue;
    out.push(file);
  }
  return [...new Set(out.map(toRepoRelative))];
}
