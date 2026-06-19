import { existsSync, mkdirSync, rmdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Effect } from "effect";
import type { InjectedProbeOutcome } from "../diagnostic-catalog/index.js";
import { repoRoot } from "../paths.js";
import { normalizeProbePath } from "./input.js";
import { probeAdapterFailed } from "./outcome.js";

export function acquireProbeFile(probePath: string, body: string) {
  return Effect.acquireRelease(
    Effect.try({
      try: () => {
        const relative = normalizeProbePath(probePath);
        const absolute = path.join(repoRoot, relative);
        const createdDirs = ensureProbeParentDirs(path.dirname(absolute));
        writeFileSync(absolute, body);
        return { relative, createdDirs };
      },
      catch: (error): InjectedProbeOutcome =>
        probeAdapterFailed(
          "GritAdapterInternalContractViolation",
          `Failed to create injected probe ${probePath}: ${String(error)}.`
        ),
    }),
    ({ relative, createdDirs }) =>
      Effect.sync(() => {
        rmSync(path.join(repoRoot, relative), { force: true });
        for (const dir of createdDirs) {
          try {
            rmdirSync(dir);
          } catch (error) {
            if (!isIgnorableDirectoryCleanupError(error)) throw error;
          }
        }
      })
  );
}

function ensureProbeParentDirs(parentDir: string): string[] {
  const createdDirs: string[] = [];
  let current = parentDir;
  while (!existsSync(current)) {
    createdDirs.push(current);
    const next = path.dirname(current);
    if (next === current) break;
    current = next;
  }
  mkdirSync(parentDir, { recursive: true });
  return createdDirs;
}

function isIgnorableDirectoryCleanupError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error.code === "ENOENT" || error.code === "ENOTEMPTY")
  );
}
