import path from "node:path";
import { Data, Effect } from "effect";
import type { TSchema } from "typebox";
import { Value } from "typebox/value";
import type {
  RuleRegistryDocument,
  RuleRegistryIndex,
  RuleRegistryRecord,
} from "../dto/registry.schema.ts";
import {
  RuleRegistryDocumentSchema,
  RuleRegistryIndexSchema,
  RuleRegistryRecordInputSchema,
} from "../dto/registry.schema.ts";

export type RuleRegistryIssueCode =
  | "registry-json-invalid"
  | "registry-schema-invalid"
  | "registry-duplicate-rule-id"
  | "registry-missing-referenced-file";

export interface RuleRegistryIssue {
  code: RuleRegistryIssueCode;
  path: string;
  message: string;
}

export type RuleRegistryParseResult =
  | { ok: true; document: RuleRegistryDocument }
  | { ok: false; issues: RuleRegistryIssue[] };

export interface RuleRegistryDirectoryEntry {
  readonly name: string;
  readonly kind: "directory" | "file" | "other";
}

export interface RuleRegistryFileSystem<R = never> {
  readonly isDirectory: (registryPath: string) => Effect.Effect<boolean, unknown, R>;
  readonly readDirectory: (
    registryPath: string
  ) => Effect.Effect<readonly RuleRegistryDirectoryEntry[], unknown, R>;
  readonly readText: (registryPath: string) => Effect.Effect<string, unknown, R>;
}

export interface RuleRegistrySyncFileSystem {
  readonly isDirectory: (registryPath: string) => boolean;
  readonly readDirectory: (registryPath: string) => readonly RuleRegistryDirectoryEntry[];
  readonly readText: (registryPath: string) => string;
}

export interface LoadedRuleRegistryDocument {
  readonly document: RuleRegistryDocument;
  readonly discoveredManifestPaths: readonly string[];
}

export class RuleRegistryLoadFailed extends Data.TaggedError("RuleRegistryLoadFailed")<{
  readonly issues: readonly RuleRegistryIssue[];
}> {
  override get message() {
    return renderRuleRegistryIssues("Habitat rule registry is invalid", this.issues);
  }
}

export function parseRuleRegistryText(
  text: string,
  sourcePath = "rules.json"
): RuleRegistryParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch (error) {
    return {
      ok: false,
      issues: [
        {
          code: "registry-json-invalid",
          path: sourcePath,
          message: error instanceof Error ? error.message : "Invalid JSON.",
        },
      ],
    };
  }

  return parseRuleRegistryDocument(parsed, sourcePath);
}

export function parseRuleRegistryDocument(
  value: unknown,
  sourcePath = "rules.json"
): RuleRegistryParseResult {
  const schemaIssues = [...Value.Errors(RuleRegistryDocumentSchema, value)].map((error) => ({
    code: "registry-schema-invalid" as const,
    path: error.instancePath ? `${sourcePath}${error.instancePath}` : sourcePath,
    message: error.message,
  }));
  if (schemaIssues.length > 0) return { ok: false, issues: schemaIssues };

  const document = value as RuleRegistryDocument;
  const duplicateIssues = duplicateRuleIdIssues(document.rules, sourcePath);
  if (duplicateIssues.length > 0) return { ok: false, issues: duplicateIssues };
  const semanticsIssues = ruleRunnerSemanticsIssues(document.rules, sourcePath);
  if (semanticsIssues.length > 0) return { ok: false, issues: semanticsIssues };

  return { ok: true, document };
}

export function loadRuleRegistryDocument(
  registryPath: string,
  fileSystem: RuleRegistrySyncFileSystem
): RuleRegistryDocument {
  return loadRuleRegistryDocumentWithDiscovery(registryPath, fileSystem).document;
}

export function loadRuleRegistryDocumentWithDiscovery(
  registryPath: string,
  fileSystem: RuleRegistrySyncFileSystem
): LoadedRuleRegistryDocument {
  return fileSystem.isDirectory(registryPath)
    ? loadRuleRegistryDirectorySyncWithDiscovery(registryPath, fileSystem)
    : {
        document: parseRuleRegistryTextOrThrow(fileSystem.readText(registryPath), registryPath),
        discoveredManifestPaths: [],
      };
}

export function loadRuleRegistryDocumentEffect<R>(
  registryPath: string,
  fileSystem: RuleRegistryFileSystem<R>
) {
  return Effect.gen(function* () {
    if (yield* fileSystem.isDirectory(registryPath)) {
      return yield* loadRuleRegistryDirectory(registryPath, fileSystem);
    }

    const result = parseRuleRegistryText(yield* fileSystem.readText(registryPath), registryPath);
    if (result.ok) return result.document;
    return yield* Effect.fail(new RuleRegistryLoadFailed({ issues: result.issues }));
  });
}

function loadRuleRegistryDirectory<R>(
  registryDir: string,
  fileSystem: RuleRegistryFileSystem<R>
): Effect.Effect<RuleRegistryDocument, RuleRegistryLoadFailed | unknown, R> {
  return Effect.gen(function* () {
    const indexPath = yield* ruleRegistryIndexPath(registryDir, fileSystem);
    const index = yield* parseRegistryJson<RuleRegistryIndex, R>(
      indexPath,
      RuleRegistryIndexSchema,
      fileSystem
    );
    const rulePaths = yield* ruleFilePaths(registryDir, fileSystem);
    const rules = yield* Effect.all(
      rulePaths.map((rulePath) => parseRuleManifestJson<R>(rulePath, fileSystem))
    );
    const result = parseRuleRegistryDocument(
      {
        schemaVersion: index.schemaVersion,
        ownerRoots: index.ownerRoots,
        rules,
      },
      indexPath
    );
    if (result.ok) return result.document;
    return yield* Effect.fail(new RuleRegistryLoadFailed({ issues: result.issues }));
  });
}

function loadRuleRegistryDirectorySyncWithDiscovery(
  registryDir: string,
  fileSystem: RuleRegistrySyncFileSystem
): LoadedRuleRegistryDocument {
  const indexPath = ruleRegistryIndexPathSync(registryDir, fileSystem);
  const index = parseRegistryJsonSync<RuleRegistryIndex>(
    indexPath,
    RuleRegistryIndexSchema,
    fileSystem
  );
  const rulePaths = ruleFilePathsSync(registryDir, fileSystem);
  const rules = rulePaths
    .map((rulePath) => parseRuleManifestJsonSync(rulePath, fileSystem))
    .sort((left, right) => left.id.localeCompare(right.id));
  const result = parseRuleRegistryDocument(
    {
      schemaVersion: index.schemaVersion,
      ownerRoots: index.ownerRoots,
      rules,
    },
    indexPath
  );
  if (result.ok) {
    return {
      document: result.document,
      discoveredManifestPaths: rulePaths.map(toRepoRelativeManifestPath).sort(),
    };
  }
  throw new RuleRegistryLoadFailed({ issues: result.issues });
}

function parseRuleManifestJsonSync(
  filePath: string,
  fileSystem: RuleRegistrySyncFileSystem
): RuleRegistryRecord {
  const parsed = parseRegistryJsonSync<RuleRegistryRecord>(
    filePath,
    RuleRegistryRecordInputSchema,
    fileSystem
  );
  const record = { ...parsed, manifestFilePath: toRepoRelativeManifestPath(filePath) };
  const semanticIssues = gritPatternPathIssues(record, filePath);
  if (semanticIssues.length > 0) throw new RuleRegistryLoadFailed({ issues: semanticIssues });
  const issues = referencedFileIssues(record, filePath, fileSystem);
  if (issues.length > 0) throw new RuleRegistryLoadFailed({ issues });
  return record;
}

function parseRegistryJsonSync<T>(
  filePath: string,
  schema: TSchema,
  fileSystem: RuleRegistrySyncFileSystem
): T {
  let parsed: unknown;
  try {
    parsed = JSON.parse(fileSystem.readText(filePath)) as unknown;
  } catch (error) {
    throw new RuleRegistryLoadFailed({
      issues: [
        {
          code: "registry-json-invalid",
          path: filePath,
          message: error instanceof Error ? error.message : "Invalid JSON.",
        },
      ],
    });
  }
  const issues = [...Value.Errors(schema, parsed)];
  if (issues.length > 0) {
    throw new RuleRegistryLoadFailed({
      issues: issues.map((issue) => ({
        code: "registry-schema-invalid" as const,
        path: issue.instancePath ? `${filePath}${issue.instancePath}` : filePath,
        message: issue.message,
      })),
    });
  }
  return Value.Parse(schema, parsed) as T;
}

function parseRuleManifestJson<R = never>(
  filePath: string,
  fileSystem: RuleRegistryFileSystem<R>
): Effect.Effect<RuleRegistryRecord, RuleRegistryLoadFailed | unknown, R> {
  return Effect.gen(function* () {
    const parsed = yield* parseRegistryJson<RuleRegistryRecord, R>(
      filePath,
      RuleRegistryRecordInputSchema,
      fileSystem
    );
    const record = { ...parsed, manifestFilePath: toRepoRelativeManifestPath(filePath) };
    const semanticIssues = gritPatternPathIssues(record, filePath);
    if (semanticIssues.length > 0) {
      return yield* Effect.fail(new RuleRegistryLoadFailed({ issues: semanticIssues }));
    }
    const issues = yield* referencedFileIssuesEffect(record, filePath, fileSystem);
    if (issues.length > 0) {
      return yield* Effect.fail(new RuleRegistryLoadFailed({ issues }));
    }
    return record;
  });
}

function parseRuleRegistryTextOrThrow(text: string, sourcePath: string): RuleRegistryDocument {
  const result = parseRuleRegistryText(text, sourcePath);
  if (result.ok) return result.document;
  throw new RuleRegistryLoadFailed({ issues: result.issues });
}

function parseRegistryJson<T, R = never>(
  filePath: string,
  schema: TSchema,
  fileSystem: RuleRegistryFileSystem<R>
): Effect.Effect<T, RuleRegistryLoadFailed | unknown, R> {
  return Effect.gen(function* () {
    let parsed: unknown;
    try {
      parsed = JSON.parse(yield* fileSystem.readText(filePath)) as unknown;
    } catch (error) {
      return yield* Effect.fail(
        new RuleRegistryLoadFailed({
          issues: [
            {
              code: "registry-json-invalid",
              path: filePath,
              message: error instanceof Error ? error.message : "Invalid JSON.",
            },
          ],
        })
      );
    }
    const issues = [...Value.Errors(schema, parsed)];
    if (issues.length > 0) {
      return yield* Effect.fail(
        new RuleRegistryLoadFailed({
          issues: issues.map((issue) => ({
            code: "registry-schema-invalid" as const,
            path: issue.instancePath ? `${filePath}${issue.instancePath}` : filePath,
            message: issue.message,
          })),
        })
      );
    }
    return Value.Parse(schema, parsed) as T;
  });
}

function ruleFilePaths<R>(
  registryDir: string,
  fileSystem: RuleRegistryFileSystem<R>
): Effect.Effect<string[], unknown, R> {
  return Effect.gen(function* () {
    const candidates = (yield* findFiles(
      registryDir,
      fileSystem,
      isRuleRecordCandidatePath
    )).sort();
    const issues = staleRuleRecordIssues(candidates);
    if (issues.length > 0) {
      return yield* Effect.fail(new RuleRegistryLoadFailed({ issues }));
    }
    return candidates;
  });
}

function ruleRegistryIndexPath<R>(
  registryDir: string,
  fileSystem: RuleRegistryFileSystem<R>
): Effect.Effect<string, RuleRegistryLoadFailed | unknown, R> {
  return Effect.gen(function* () {
    const directIndex = path.join(registryDir, "index.json");
    const directIndexProbe = yield* Effect.either(fileSystem.readText(directIndex));
    if (directIndexProbe._tag === "Right") {
      return directIndex;
    }

    return yield* Effect.fail(
      new RuleRegistryLoadFailed({
        issues: [
          {
            code: "registry-schema-invalid",
            path: registryDir,
            message: "Missing rule-pack index.json.",
          },
        ],
      })
    );
  });
}

function ruleRegistryIndexPathSync(
  registryDir: string,
  fileSystem: RuleRegistrySyncFileSystem
): string {
  const directIndex = path.join(registryDir, "index.json");
  try {
    fileSystem.readText(directIndex);
    return directIndex;
  } catch {
    throw new RuleRegistryLoadFailed({
      issues: [
        {
          code: "registry-schema-invalid",
          path: registryDir,
          message: "Missing rule-pack index.json.",
        },
      ],
    });
  }
}

function ruleFilePathsSync(registryDir: string, fileSystem: RuleRegistrySyncFileSystem): string[] {
  const candidates = findFilesSync(registryDir, fileSystem, isRuleRecordCandidatePath).sort();
  const issues = staleRuleRecordIssues(candidates);
  if (issues.length > 0) throw new RuleRegistryLoadFailed({ issues });
  return candidates;
}

function isRuleRecordCandidatePath(filePath: string): boolean {
  const fileName = filePath.split("/").at(-1);
  return fileName === "rule.json" || Boolean(fileName?.endsWith(".rule.json"));
}

function staleRuleRecordIssues(paths: readonly string[]): RuleRegistryIssue[] {
  return paths.flatMap((rulePath) => {
    const issues: RuleRegistryIssue[] = [];
    if (rulePath.endsWith(".rule.json")) {
      issues.push({
        code: "registry-schema-invalid",
        path: rulePath,
        message: "Rule manifest files must be named rule.json.",
      });
    }
    if (usesStaleCategoryOperationPath(rulePath)) {
      issues.push({
        code: "registry-schema-invalid",
        path: rulePath,
        message:
          "Rule packets must not use category/operation-kind path nesting; use .habitat/blueprints/<blueprint>/<packet>, _blueprints/<candidate>/<packet>, or rules/<packet>.",
      });
    }
    return issues;
  });
}

function usesStaleCategoryOperationPath(rulePath: string): boolean {
  const segments = rulePath.split("/");
  const blueprintIndex = segments.lastIndexOf("blueprints");
  if (blueprintIndex < 0) return false;
  const category = segments[blueprintIndex + 2];
  const operationKind = segments[blueprintIndex + 3];
  const packet = segments[blueprintIndex + 4];
  const fileName = segments[blueprintIndex + 5];
  return (
    category !== undefined &&
    operationKind !== undefined &&
    packet !== undefined &&
    fileName === "rule.json" &&
    staleCategories.has(category) &&
    staleOperationKinds.has(operationKind)
  );
}

const staleCategories = new Set([
  "boundary",
  "structure",
  "contract",
  "execution",
  "artifact",
  "output",
  "quality",
  "policy",
]);

const staleOperationKinds = new Set(["check", "fix", "generate", "migrate", "triage"]);

function findFiles<R>(
  root: string,
  fileSystem: RuleRegistryFileSystem<R>,
  predicate: (filePath: string) => boolean
): Effect.Effect<string[], unknown, R> {
  return Effect.gen(function* () {
    const entries = yield* fileSystem.readDirectory(root);
    const groups = yield* Effect.all(
      entries.map((entry) => {
        const absolute = path.join(root, entry.name);
        if (entry.kind === "directory") return findFiles(absolute, fileSystem, predicate);
        return Effect.succeed(
          entry.kind === "file" && predicate(toPosixPath(absolute)) ? [absolute] : []
        );
      })
    );
    return groups.flat();
  });
}

function findFilesSync(
  root: string,
  fileSystem: RuleRegistrySyncFileSystem,
  predicate: (filePath: string) => boolean
): string[] {
  return fileSystem.readDirectory(root).flatMap((entry) => {
    const absolute = path.join(root, entry.name);
    if (entry.kind === "directory") return findFilesSync(absolute, fileSystem, predicate);
    return entry.kind === "file" && predicate(toPosixPath(absolute)) ? [absolute] : [];
  });
}

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join("/");
}

function toRepoRelativeManifestPath(filePath: string): string {
  const normalized = toPosixPath(filePath);
  const habitatIndex = normalized.lastIndexOf("/.habitat/");
  if (habitatIndex >= 0) return normalized.slice(habitatIndex + 1);
  if (normalized.startsWith(".habitat/")) return normalized;
  return normalized;
}

function referencedFilePaths(rule: RuleRegistryRecord): string[] {
  const paths: string[] = [];
  switch (rule.runner.name) {
    case "grit":
      paths.push(rule.runner.files.pattern);
      if (rule.runner.fix) paths.push(rule.runner.fix.pattern);
      break;
    case "habitat":
      if (rule.runner.mode === "structure") paths.push(rule.runner.files.structure);
      if (rule.runner.mode === "script") paths.push(rule.runner.files.script);
      break;
    case "nx":
      break;
  }
  if (rule.supportFiles?.baseline) paths.push(rule.supportFiles.baseline);
  if (rule.supportFiles?.ruleIntroductionManifest) {
    paths.push(rule.supportFiles.ruleIntroductionManifest);
  }
  return paths;
}

function referencedFileIssues(
  rule: RuleRegistryRecord,
  manifestPath: string,
  fileSystem: RuleRegistrySyncFileSystem
): RuleRegistryIssue[] {
  const repoRoot = repoRootForManifestPath(manifestPath);
  return referencedFilePaths(rule)
    .filter((repoPath) => !syncFileExists(path.join(repoRoot, repoPath), fileSystem))
    .map((repoPath) => ({
      code: "registry-missing-referenced-file" as const,
      path: manifestPath,
      message: `${rule.id}: referenced runner or support file does not exist: ${repoPath}.`,
    }));
}

function syncFileExists(filePath: string, fileSystem: RuleRegistrySyncFileSystem): boolean {
  try {
    fileSystem.readText(filePath);
    return true;
  } catch {
    return false;
  }
}

function referencedFileIssuesEffect<R>(
  rule: RuleRegistryRecord,
  manifestPath: string,
  fileSystem: RuleRegistryFileSystem<R>
): Effect.Effect<RuleRegistryIssue[], unknown, R> {
  return Effect.gen(function* () {
    const repoRoot = repoRootForManifestPath(manifestPath);
    const issues: RuleRegistryIssue[] = [];
    for (const repoPath of referencedFilePaths(rule)) {
      const absolute = path.join(repoRoot, repoPath);
      const result = yield* fileSystem.readText(absolute).pipe(Effect.either);
      if (result._tag === "Left") {
        issues.push({
          code: "registry-missing-referenced-file",
          path: manifestPath,
          message: `${rule.id}: referenced runner or support file does not exist: ${repoPath}.`,
        });
      }
    }
    return issues;
  });
}

function repoRootForManifestPath(manifestPath: string): string {
  const normalized = toPosixPath(manifestPath);
  const habitatIndex = normalized.lastIndexOf("/.habitat/");
  if (habitatIndex >= 0) return normalized.slice(0, habitatIndex);
  if (normalized.startsWith(".habitat/")) return ".";
  return path.dirname(manifestPath);
}

function renderRuleRegistryIssues(heading: string, issues: readonly RuleRegistryIssue[]): string {
  return `${heading}:\n${issues.map((issue) => `- ${issue.path}: ${issue.message}`).join("\n")}`;
}

function duplicateRuleIdIssues(
  rules: readonly RuleRegistryRecord[],
  sourcePath: string
): RuleRegistryIssue[] {
  const pathsById = new Map<string, string[]>();
  for (const rule of rules) {
    const manifestPath = rule.manifestFilePath ?? sourcePath;
    pathsById.set(rule.id, [...(pathsById.get(rule.id) ?? []), manifestPath]);
  }
  return [...pathsById.entries()]
    .filter(([, paths]) => paths.length > 1)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([id, paths]) => ({
      code: "registry-duplicate-rule-id",
      path: sourcePath,
      message: `Duplicate Habitat rule id: ${JSON.stringify(id)} in ${paths.join(", ")}.`,
    }));
}

function ruleRunnerSemanticsIssues(
  rules: readonly RuleRegistryRecord[],
  sourcePath: string
): RuleRegistryIssue[] {
  const issues: RuleRegistryIssue[] = [];
  rules.forEach((rule, index) => {
    const path = `${sourcePath}/rules/${index}`;
    if (rule.runner.name === "grit") {
      if (!Array.isArray(rule.scanRoots)) {
        issues.push(runnerIssue(path, rule.id, "grit runner records must declare scanRoots."));
      }
      if (rule.patternName && rule.patternName !== rule.runner.patternName) {
        issues.push(
          runnerIssue(path, rule.id, "patternName must match the derived grit runner patternName.")
        );
      }
      issues.push(...gritPatternPathIssues(rule, path));
    } else {
      if (rule.scanRoots) {
        issues.push(
          runnerIssue(path, rule.id, "scanRoots are only valid for grit runner records.")
        );
      }
      if (rule.patternName) {
        issues.push(
          runnerIssue(path, rule.id, "patternName is only valid for grit runner records.")
        );
      }
      if (rule.hookCheck) {
        issues.push(runnerIssue(path, rule.id, "hookCheck is only valid for grit runner records."));
      }
    }

    if (rule.runner.name === "nx") {
      if (
        !rule.graphTarget ||
        rule.graphTarget.project !== rule.runner.target.project ||
        rule.graphTarget.target !== rule.runner.target.target
      ) {
        issues.push(runnerIssue(path, rule.id, "nx runner records must mirror graphTarget."));
      }
    } else if (rule.graphTarget) {
      issues.push(runnerIssue(path, rule.id, "graphTarget is only valid for nx runner records."));
    }

    const fileLayerFacetCount = [
      rule.generatedZone,
      rule.forbiddenFileNames,
      rule.hostSurfaceGuard,
    ].filter(Boolean).length;
    if (rule.runner.name === "habitat" && rule.runner.mode === "file-layer") {
      if (fileLayerFacetCount !== 1) {
        issues.push(
          runnerIssue(
            path,
            rule.id,
            "file-layer runner records must declare exactly one guard facet."
          )
        );
      }
    } else if (fileLayerFacetCount > 0) {
      issues.push(
        runnerIssue(
          path,
          rule.id,
          "file-layer guard facets are only valid for file-layer runner records."
        )
      );
    }
  });
  return issues;
}

function gritPatternPathIssues(rule: RuleRegistryRecord, sourcePath: string): RuleRegistryIssue[] {
  if (rule.runner.name !== "grit") return [];
  return [
    ["pattern", "files/pattern", rule.runner.files.pattern] as const,
    ...(rule.runner.fix
      ? ([["fix.pattern", "fix/pattern", rule.runner.fix.pattern]] as const)
      : []),
  ].flatMap(([field, fieldPath, patternPath]) => {
    const segments = patternPath.split("/");
    const invalid =
      patternPath.includes("\\") ||
      path.isAbsolute(patternPath) ||
      !patternPath.startsWith(".habitat/") ||
      patternPath.includes("//") ||
      segments.some((segment) => segment === "" || segment === "." || segment === "..") ||
      path.posix.normalize(patternPath) !== patternPath;
    return invalid
      ? [
          runnerIssue(
            `${sourcePath}/runner/${fieldPath}`,
            rule.id,
            `${field} must be a normalized relative .habitat/... file path.`
          ),
        ]
      : [];
  });
}

function runnerIssue(path: string, ruleId: string, message: string): RuleRegistryIssue {
  return {
    code: "registry-schema-invalid",
    path,
    message: `${ruleId}: ${message}`,
  };
}
