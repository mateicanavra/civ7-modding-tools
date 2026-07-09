import { lstat, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

import type { SwooperMapArtifactFilePlan } from "./file-plan.js";

function resolvePlanPath(outputRoot: string, relativePath: string): string {
  if (isAbsolute(relativePath)) {
    throw new Error(`Swooper artifact plan path must be relative: ${relativePath}`);
  }
  const resolved = resolve(outputRoot, relativePath);
  const rootRelative = relative(outputRoot, resolved);
  if (rootRelative === ".." || rootRelative.startsWith(`..${sep}`) || isAbsolute(rootRelative)) {
    throw new Error(`Swooper artifact plan path escapes output root: ${relativePath}`);
  }
  return resolved;
}

function resolveSwooperMapArtifactFilePlan(
  plan: SwooperMapArtifactFilePlan,
  outputRoot: string
): Readonly<{
  exclusiveSets: readonly Readonly<{
    relativeDir: string;
    dir: string;
    fileExtension: ".ts";
  }>[];
  files: readonly Readonly<{
    relativePath: string;
    target: string;
    content: string | Uint8Array;
  }>[];
}> {
  return {
    exclusiveSets: plan.exclusiveSets.map((exclusiveSet) => ({
      relativeDir: exclusiveSet.relativeDir,
      dir: resolvePlanPath(outputRoot, exclusiveSet.relativeDir),
      fileExtension: exclusiveSet.fileExtension,
    })),
    files: plan.files.map((file) => ({
      relativePath: file.relativePath,
      target: resolvePlanPath(outputRoot, file.relativePath),
      content: file.content.kind === "text" ? file.content.text : file.content.bytes,
    })),
  };
}

async function assertNoSymlinkedPlanPathComponent(
  outputRoot: string,
  relativePath: string
): Promise<void> {
  const resolved = resolvePlanPath(outputRoot, relativePath);
  const rootRelative = relative(outputRoot, resolved);
  let current = outputRoot;
  for (const segment of rootRelative.split(sep)) {
    if (!segment) continue;
    current = resolve(current, segment);
    try {
      if ((await lstat(current)).isSymbolicLink()) {
        throw new Error(`Swooper artifact plan path traverses symlink: ${relativePath}`);
      }
    } catch (error) {
      if (isMissingPathError(error)) return;
      throw error;
    }
  }
}

function isMissingPathError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "ENOENT"
  );
}

async function assertOutputRootIsNotSymlink(outputRoot: string): Promise<void> {
  try {
    if ((await lstat(outputRoot)).isSymbolicLink()) {
      throw new Error(`Swooper artifact output root must not be a symlink: ${outputRoot}`);
    }
  } catch (error) {
    if (isMissingPathError(error)) return;
    throw error;
  }
}

/**
 * Applies a complete Swooper artifact file plan under one output root. The
 * writer resolves and validates every target before deleting stale generated
 * entrypoints, so a malformed plan cannot partially clean the output tree.
 */
export async function writeSwooperMapArtifactFilePlan(
  plan: SwooperMapArtifactFilePlan,
  options: Readonly<{ outputRoot: string }>
): Promise<void> {
  await assertOutputRootIsNotSymlink(options.outputRoot);
  const resolvedPlan = resolveSwooperMapArtifactFilePlan(plan, options.outputRoot);
  for (const exclusiveSet of resolvedPlan.exclusiveSets) {
    await assertNoSymlinkedPlanPathComponent(options.outputRoot, exclusiveSet.relativeDir);
  }
  for (const file of resolvedPlan.files) {
    await assertNoSymlinkedPlanPathComponent(options.outputRoot, file.relativePath);
  }

  for (const exclusiveSet of resolvedPlan.exclusiveSets) {
    for (const entry of await readdir(exclusiveSet.dir, { withFileTypes: true }).catch(() => [])) {
      if (entry.isFile() && entry.name.endsWith(exclusiveSet.fileExtension)) {
        await rm(resolve(exclusiveSet.dir, entry.name), { force: true });
      }
    }
  }

  for (const file of resolvedPlan.files) {
    await mkdir(dirname(file.target), { recursive: true });
    await assertNoSymlinkedPlanPathComponent(options.outputRoot, file.relativePath);
    await writeFile(file.target, file.content);
  }
}
