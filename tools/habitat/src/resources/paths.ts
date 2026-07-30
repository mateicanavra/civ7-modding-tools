import fs from "node:fs";
import path from "node:path";
import { baselinesRepoPath, habitatAuthorityRoot } from "./authority-paths.ts";

/** Consumer workspace root for direct CLI execution. Nx supplies the same root explicitly. */
export const repoRoot = findHabitatWorkspaceRoot(process.cwd());

export const harnessRoot = path.join(repoRoot, "tools", "habitat-harness");
export const habitatAuthorityDir = path.join(repoRoot, habitatAuthorityRoot);
export const ruleRegistryPath = path.join(repoRoot, habitatAuthorityRoot);
export const baselinesDir = path.join(repoRoot, baselinesRepoPath);

export function toRepoRelative(p: string): string {
  return path.relative(repoRoot, path.resolve(repoRoot, p)).split(path.sep).join("/");
}

function findHabitatWorkspaceRoot(startDirectory: string): string {
  let current = path.resolve(startDirectory);
  while (true) {
    if (fs.existsSync(path.join(current, habitatAuthorityRoot))) return current;
    const parent = path.dirname(current);
    if (parent === current) return path.resolve(startDirectory);
    current = parent;
  }
}
