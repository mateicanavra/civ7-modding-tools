import { spawnSync } from "node:child_process";
import path from "node:path";
import { repoRoot } from "./paths.js";

export interface SpawnResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

/**
 * Argument-array spawning only (no shell interpolation, ever).
 * cwd defaults to the repo root resolved by the caller.
 */
export function run(
  argv: string[],
  opts: { cwd: string; env?: Record<string, string> }
): SpawnResult {
  const [cmd, ...args] = argv;
  const env = { ...process.env, ...opts.env };
  env.PATH = [path.join(repoRoot, "node_modules", ".bin"), env.PATH]
    .filter(Boolean)
    .join(path.delimiter);
  const res = spawnSync(cmd, args, {
    cwd: opts.cwd,
    env,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    exitCode: res.status ?? (res.error ? 127 : 0),
    stdout: res.stdout ?? "",
    stderr: res.stderr ?? "",
  };
}
