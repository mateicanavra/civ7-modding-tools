import path from "node:path";
import { fileURLToPath } from "node:url";
import { baselinesRepoPath, habitatArtifactsRoot, ruleRegistryRepoPath } from "./artifact-paths.ts";

/** Repo root, resolved from this file's location (tools/habitat-harness/src/substrate/lib/). */
export const repoRoot = path.resolve(fileURLToPath(new URL("../../../../..", import.meta.url)));

export const harnessRoot = path.join(repoRoot, "tools", "habitat-harness");
export const habitatArtifactsDir = path.join(repoRoot, habitatArtifactsRoot);
export const ruleRegistryPath = path.join(repoRoot, ruleRegistryRepoPath);
export const baselinesDir = path.join(repoRoot, baselinesRepoPath);

export function toRepoRelative(p: string): string {
  return path.relative(repoRoot, path.resolve(repoRoot, p)).split(path.sep).join("/");
}
