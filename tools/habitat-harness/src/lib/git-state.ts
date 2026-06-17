import { createHash } from "node:crypto";
import { repoRoot } from "./paths.js";
import { run } from "./spawn.js";

export interface HabitatGitState {
  branch: string | null;
  head: string | null;
  dirty: boolean;
  statusShort: string;
  statusDigest: string;
}

export interface HabitatCommandGitState {
  before: HabitatGitState;
  after: HabitatGitState;
}

export function readGitState(cwd = repoRoot): HabitatGitState {
  const branch = gitValue(["git", "branch", "--show-current"], cwd);
  const head = gitValue(["git", "rev-parse", "HEAD"], cwd);
  const status = run(["git", "status", "--short"], { cwd });
  const statusShort = status.exitCode === 0 ? status.stdout : `${status.stdout}${status.stderr}`;
  return {
    branch: branch || null,
    head: head || null,
    dirty: statusShort.trim().length > 0,
    statusShort,
    statusDigest: createHash("sha256").update(statusShort).digest("hex"),
  };
}

export function unknownGitState(): HabitatCommandGitState {
  const unknown: HabitatGitState = {
    branch: null,
    head: null,
    dirty: false,
    statusShort: "",
    statusDigest: createHash("sha256").update("").digest("hex"),
  };
  return { before: unknown, after: unknown };
}

function gitValue(argv: string[], cwd: string): string {
  const result = run(argv, { cwd });
  return result.exitCode === 0 ? result.stdout.trim() : "";
}
