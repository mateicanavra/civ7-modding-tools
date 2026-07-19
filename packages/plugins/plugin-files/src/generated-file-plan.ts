import { Buffer } from "node:buffer";
import { lstat, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

/** One generated file whose path is relative to the plan's output root. */
export type GeneratedFilePlanFile = Readonly<{
  relativePath: string;
  content: string | Uint8Array;
}>;

/** A directory whose direct files with one extension are replaced as a set. */
export type GeneratedFilePlanExclusiveSet = Readonly<{
  relativeDir: string;
  fileExtension: string;
}>;

/** Complete file intent for one output root, including any replacement sets. */
export type GeneratedFilePlan = Readonly<{
  exclusiveSets: readonly GeneratedFilePlanExclusiveSet[];
  files: readonly GeneratedFilePlanFile[];
}>;

/** A concrete difference between a generated file plan and its materialized files. */
export type GeneratedFilePlanIssue =
  | Readonly<{ kind: "missing"; relativePath: string }>
  | Readonly<{ kind: "content-mismatch"; relativePath: string }>
  | Readonly<{ kind: "unexpected"; relativePath: string }>;

/** Closed currentness result for a generated file plan without changing the filesystem. */
export type GeneratedFilePlanInspection =
  | Readonly<{ kind: "current" }>
  | Readonly<{
      kind: "stale";
      issues: readonly [GeneratedFilePlanIssue, ...GeneratedFilePlanIssue[]];
    }>;

type ResolvedGeneratedFilePlan = Readonly<{
  outputRoot: string;
  exclusiveSets: readonly Readonly<{
    relativeDir: string;
    dir: string;
    fileExtension: string;
  }>[];
  files: readonly Readonly<{
    relativePath: string;
    target: string;
    content: Uint8Array;
  }>[];
}>;

type ResolvedExclusiveSetEntry = Readonly<{
  relativePath: string;
  target: string;
  isRegularFile: boolean;
}>;

function isMissingPathError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "ENOENT"
  );
}

function resolvePlanPath(
  outputRoot: string,
  relativePath: string,
  label: "file" | "exclusive directory"
): Readonly<{ relativePath: string; target: string }> {
  if (relativePath.length === 0) {
    throw new Error(`Generated file plan ${label} path must not be empty.`);
  }
  if (isAbsolute(relativePath)) {
    throw new Error(`Generated file plan ${label} path must be relative: ${relativePath}`);
  }

  const target = resolve(outputRoot, relativePath);
  const rootRelative = relative(outputRoot, target);
  if (
    rootRelative.length === 0 ||
    rootRelative === ".." ||
    rootRelative.startsWith(`..${sep}`) ||
    isAbsolute(rootRelative)
  ) {
    throw new Error(`Generated file plan ${label} path escapes output root: ${relativePath}`);
  }
  return {
    relativePath: rootRelative.split(sep).join("/"),
    target,
  };
}

function admitFileExtension(fileExtension: string): string {
  if (
    fileExtension.length < 2 ||
    !fileExtension.startsWith(".") ||
    fileExtension.includes("/") ||
    fileExtension.includes("\\")
  ) {
    throw new Error(
      `Generated file plan exclusive-set extension must be a nonempty file extension: ${fileExtension}`
    );
  }
  return fileExtension;
}

function pathIsEqualOrBelow(path: string, possibleAncestor: string): boolean {
  const pathFromAncestor = relative(possibleAncestor, path);
  return (
    pathFromAncestor.length === 0 ||
    (pathFromAncestor !== ".." &&
      !pathFromAncestor.startsWith(`..${sep}`) &&
      !isAbsolute(pathFromAncestor))
  );
}

function resolveGeneratedFilePlan(
  plan: GeneratedFilePlan,
  outputRootInput: string
): ResolvedGeneratedFilePlan {
  const outputRoot = resolve(outputRootInput);
  const targetPaths = new Set<string>();
  const admittedExclusiveSets: Array<Readonly<{ dir: string; fileExtension: string }>> = [];
  const exclusiveSets = plan.exclusiveSets.map((exclusiveSet) => {
    const resolvedDir = resolvePlanPath(
      outputRoot,
      exclusiveSet.relativeDir,
      "exclusive directory"
    );
    const fileExtension = admitFileExtension(exclusiveSet.fileExtension);
    for (const admitted of admittedExclusiveSets) {
      if (
        admitted.dir === resolvedDir.target &&
        (admitted.fileExtension.endsWith(fileExtension) ||
          fileExtension.endsWith(admitted.fileExtension))
      ) {
        throw new Error(
          `Generated file plan contains overlapping exclusive sets for ${resolvedDir.relativePath}: ${admitted.fileExtension} and ${fileExtension}`
        );
      }
    }
    admittedExclusiveSets.push({ dir: resolvedDir.target, fileExtension });
    return {
      relativeDir: resolvedDir.relativePath,
      dir: resolvedDir.target,
      fileExtension,
    };
  });
  const files = plan.files.map((file) => {
    const resolvedFile = resolvePlanPath(outputRoot, file.relativePath, "file");
    if (targetPaths.has(resolvedFile.target)) {
      throw new Error(
        `Generated file plan contains duplicate normalized target: ${resolvedFile.relativePath}`
      );
    }
    targetPaths.add(resolvedFile.target);
    return {
      relativePath: resolvedFile.relativePath,
      target: resolvedFile.target,
      content:
        typeof file.content === "string"
          ? Buffer.from(file.content, "utf8")
          : Uint8Array.from(file.content),
    };
  });

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    if (!file) continue;
    for (const other of files.slice(index + 1)) {
      if (
        pathIsEqualOrBelow(file.target, other.target) ||
        pathIsEqualOrBelow(other.target, file.target)
      ) {
        throw new Error(
          `Generated file plan file targets cannot contain one another: ${file.relativePath} and ${other.relativePath}`
        );
      }
    }
    for (const exclusiveSet of exclusiveSets) {
      if (pathIsEqualOrBelow(exclusiveSet.dir, file.target)) {
        throw new Error(
          `Generated file plan file target cannot contain an exclusive directory: ${file.relativePath} and ${exclusiveSet.relativeDir}`
        );
      }
    }
  }

  return { outputRoot, exclusiveSets, files };
}

async function assertOutputRootIsNotSymlink(outputRoot: string): Promise<void> {
  try {
    const stat = await lstat(outputRoot);
    if (stat.isSymbolicLink()) {
      throw new Error(`Generated file plan output root must not be a symlink: ${outputRoot}`);
    }
    if (!stat.isDirectory()) {
      throw new Error(`Generated file plan output root must be a directory: ${outputRoot}`);
    }
  } catch (error) {
    if (isMissingPathError(error)) return;
    throw error;
  }
}

async function assertExistingPathKind(
  target: string,
  relativePath: string,
  expected: "directory" | "regular file"
): Promise<void> {
  try {
    const stat = await lstat(target);
    const valid = expected === "directory" ? stat.isDirectory() : stat.isFile();
    if (!valid) {
      throw new Error(`Generated file plan ${relativePath} must be a ${expected}.`);
    }
  } catch (error) {
    if (isMissingPathError(error)) return;
    throw error;
  }
}

async function assertNoSymlinkedPathComponent(
  outputRoot: string,
  relativePath: string
): Promise<void> {
  let current = outputRoot;
  for (const segment of relativePath.split("/")) {
    if (!segment) continue;
    current = resolve(current, segment);
    try {
      if ((await lstat(current)).isSymbolicLink()) {
        throw new Error(`Generated file plan path traverses symlink: ${relativePath}`);
      }
    } catch (error) {
      if (isMissingPathError(error)) return;
      throw error;
    }
  }
}

async function preflightResolvedPlan(plan: ResolvedGeneratedFilePlan): Promise<void> {
  await assertOutputRootIsNotSymlink(plan.outputRoot);
  for (const exclusiveSet of plan.exclusiveSets) {
    await assertNoSymlinkedPathComponent(plan.outputRoot, exclusiveSet.relativeDir);
    await assertExistingPathKind(exclusiveSet.dir, exclusiveSet.relativeDir, "directory");
  }
  for (const file of plan.files) {
    await assertNoSymlinkedPathComponent(plan.outputRoot, file.relativePath);
    await assertExistingPathKind(file.target, file.relativePath, "regular file");
  }
}

async function readDirectoryOrEmpty(dir: string) {
  try {
    return await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (isMissingPathError(error)) return [];
    throw error;
  }
}

async function listExclusiveSetEntries(
  plan: ResolvedGeneratedFilePlan
): Promise<readonly ResolvedExclusiveSetEntry[]> {
  const entries: ResolvedExclusiveSetEntry[] = [];
  for (const exclusiveSet of plan.exclusiveSets) {
    for (const entry of await readDirectoryOrEmpty(exclusiveSet.dir)) {
      if (!entry.name.endsWith(exclusiveSet.fileExtension)) continue;
      const target = resolve(exclusiveSet.dir, entry.name);
      entries.push({
        relativePath: relative(plan.outputRoot, target).split(sep).join("/"),
        target,
        isRegularFile: entry.isFile(),
      });
    }
  }
  return entries;
}

async function fileContentMatches(
  target: string,
  content: Uint8Array
): Promise<boolean | "missing"> {
  try {
    const actual = await readFile(target);
    if (actual.length !== content.length) return false;
    return actual.every((value, index) => value === content[index]);
  } catch (error) {
    if (isMissingPathError(error)) return "missing";
    throw error;
  }
}

function compareIssues(left: GeneratedFilePlanIssue, right: GeneratedFilePlanIssue): number {
  if (left.relativePath < right.relativePath) return -1;
  if (left.relativePath > right.relativePath) return 1;
  if (left.kind < right.kind) return -1;
  if (left.kind > right.kind) return 1;
  return 0;
}

/**
 * Compares a complete generated file plan with disk without modifying either.
 * Planned files must match exactly, and exclusive sets reject extra direct
 * files with their admitted extension while preserving other entries.
 */
export async function inspectGeneratedFilePlan(
  plan: GeneratedFilePlan,
  options: Readonly<{ outputRoot: string }>
): Promise<GeneratedFilePlanInspection> {
  const resolvedPlan = resolveGeneratedFilePlan(plan, options.outputRoot);
  await preflightResolvedPlan(resolvedPlan);

  const issues: GeneratedFilePlanIssue[] = [];
  const plannedTargets = new Set(resolvedPlan.files.map((file) => file.target));
  for (const file of resolvedPlan.files) {
    const matches = await fileContentMatches(file.target, file.content);
    if (matches === "missing") {
      issues.push({ kind: "missing", relativePath: file.relativePath });
    } else if (!matches) {
      issues.push({ kind: "content-mismatch", relativePath: file.relativePath });
    }
  }

  for (const entry of await listExclusiveSetEntries(resolvedPlan)) {
    if (!plannedTargets.has(entry.target)) {
      issues.push({ kind: "unexpected", relativePath: entry.relativePath });
    }
  }

  issues.sort(compareIssues);
  const firstIssue = issues[0];
  if (!firstIssue) return { kind: "current" };
  return { kind: "stale", issues: [firstIssue, ...issues.slice(1)] };
}

/**
 * Applies a complete generated file plan below one output root. All paths and
 * existing symlink components are admitted before cleanup; exclusive sets
 * remove only matching direct files, then every planned file is written.
 */
export async function applyGeneratedFilePlan(
  plan: GeneratedFilePlan,
  options: Readonly<{ outputRoot: string }>
): Promise<void> {
  const resolvedPlan = resolveGeneratedFilePlan(plan, options.outputRoot);
  await preflightResolvedPlan(resolvedPlan);
  const exclusiveSetEntries = await listExclusiveSetEntries(resolvedPlan);
  for (const entry of exclusiveSetEntries) {
    if (!entry.isRegularFile) {
      throw new Error(
        `Generated file plan exclusive-set entry must be a regular file: ${entry.relativePath}`
      );
    }
  }

  for (const entry of exclusiveSetEntries) {
    await rm(entry.target, { force: true });
  }

  for (const file of resolvedPlan.files) {
    await mkdir(dirname(file.target), { recursive: true });
    await assertNoSymlinkedPathComponent(resolvedPlan.outputRoot, file.relativePath);
    await writeFile(file.target, file.content);
  }
}
