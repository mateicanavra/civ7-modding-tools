import { existsSync, mkdirSync, rmdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { InjectedProbeOutcome } from "../diagnostic-catalog/index.js";
import { repoRoot } from "../paths.js";
import { normalizeProbePath } from "./input.js";
import { probeAdapterFailed, probeCleanupFailed } from "./outcome.js";

export interface InjectedProbeFile {
  relative: string;
  createdDirs: readonly string[];
}

export type InjectedProbeFileCreation =
  | { ok: true; file: InjectedProbeFile }
  | { ok: false; outcome: InjectedProbeOutcome };

export function createProbeFile(probePath: string, body: string): InjectedProbeFileCreation {
  try {
    const relative = normalizeProbePath(probePath);
    const absolute = path.join(repoRoot, relative);
    const createdDirs = ensureProbeParentDirs(path.dirname(absolute));
    writeFileSync(absolute, body);
    return { ok: true, file: { relative, createdDirs } };
  } catch (error) {
    return {
      ok: false,
      outcome: probeAdapterFailed(
        "GritAdapterInternalContractViolation",
        `Failed to create injected probe ${probePath}: ${String(error)}.`
      ),
    };
  }
}

export function cleanupProbeFiles(
  files: readonly InjectedProbeFile[]
): InjectedProbeOutcome | null {
  try {
    for (const file of files) {
      rmSync(path.join(repoRoot, file.relative), { force: true });
    }
    const createdDirs = [...new Set(files.flatMap((file) => file.createdDirs))].sort(
      (left, right) => right.length - left.length
    );
    for (const dir of createdDirs) {
      try {
        rmdirSync(dir);
      } catch (error) {
        if (!isIgnorableDirectoryCleanupError(error)) throw error;
      }
    }
    return null;
  } catch (error) {
    return probeCleanupFailed(
      "not-restored",
      undefined,
      `Injected diagnostic probe cleanup failed: ${String(error)}.`
    );
  }
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
