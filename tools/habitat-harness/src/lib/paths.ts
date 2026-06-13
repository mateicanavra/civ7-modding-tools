import { fileURLToPath } from "node:url";
import path from "node:path";

/** Repo root, resolved from this file's location (tools/habitat-harness/src/lib/). */
export const repoRoot = path.resolve(fileURLToPath(new URL("../../../..", import.meta.url)));

export const harnessRoot = path.join(repoRoot, "tools", "habitat-harness");
export const baselinesDir = path.join(harnessRoot, "baselines");

export function toRepoRelative(p: string): string {
  return path.relative(repoRoot, path.resolve(repoRoot, p)).split(path.sep).join("/");
}
