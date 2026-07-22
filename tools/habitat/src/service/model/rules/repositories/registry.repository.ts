import path from "node:path";
import type { FileSystem } from "@effect/platform";
import type { FileReadFailed } from "@habitat/cli/resources/errors/index";
import type {
  HabitatDirectoryEntry,
  HabitatFileSystemReadPort,
} from "@habitat/cli/resources/platform/index";
import { Data, Effect, Either, Match, Record as R, Schema } from "effect";
import { type Static, type TSchema } from "typebox";
import { Value } from "typebox/value";
import type {
  RuleRegistryDocument,
  RuleRegistryRecord,
  RuleRegistryRecordInput,
} from "../dto/registry.schema.ts";
import {
  RuleRegistryDocumentSchema,
  RuleRegistryIndexSchema,
  RuleRegistryRecordInputSchema,
  RuleRegistryRecordSchema,
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

export type RuleRegistryDirectoryEntry = HabitatDirectoryEntry;

export type RuleRegistryFileSystem = Pick<
  HabitatFileSystemReadPort,
  "isDirectory" | "readDirectory" | "readText"
>;

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

const decodeJsonText = Schema.decodeUnknownEither(Schema.parseJson());

export function parseRuleRegistryText(
  text: string,
  sourcePath = "rules.json"
): RuleRegistryParseResult {
  return Either.match(parseJsonText(text), {
    onLeft: (message) => invalidJsonParseResult(sourcePath, message),
    onRight: (parsed) => parseRuleRegistryDocument(parsed, sourcePath),
  });
}

function parseJsonText(text: string) {
  return decodeJsonText(text).pipe(Either.mapLeft(renderJsonError));
}

function invalidJsonParseResult(sourcePath: string, message: string): RuleRegistryParseResult {
  return {
    ok: false,
    issues: [{ code: "registry-json-invalid", path: sourcePath, message }],
  };
}

function renderJsonError(error: unknown): string {
  return Match.value(error).pipe(
    Match.when(Match.instanceOf(Error), (cause) => cause.message),
    Match.orElse(() => "Invalid JSON.")
  );
}

export function parseRuleRegistryDocument(
  value: unknown,
  sourcePath = "rules.json"
): RuleRegistryParseResult {
  const schemaIssues = [...Value.Errors(RuleRegistryDocumentSchema, value)].map((error) => ({
    code: "registry-schema-invalid" as const,
    path: schemaIssuePath(sourcePath, error.instancePath),
    message: error.message,
  }));
  return Match.value(schemaIssues.length).pipe(
    Match.when(0, () =>
      validateRuleRegistryDocument(Value.Parse(RuleRegistryDocumentSchema, value), sourcePath)
    ),
    Match.orElse(() => ({ ok: false as const, issues: schemaIssues }))
  );
}

function validateRuleRegistryDocument(
  document: RuleRegistryDocument,
  sourcePath: string
): RuleRegistryParseResult {
  const duplicateIssues = duplicateRuleIdIssues(document.rules, sourcePath);
  return Match.value(duplicateIssues.length).pipe(
    Match.when(0, () => validateRuleRegistrySemantics(document, sourcePath)),
    Match.orElse(() => ({ ok: false as const, issues: duplicateIssues }))
  );
}

function validateRuleRegistrySemantics(
  document: RuleRegistryDocument,
  sourcePath: string
): RuleRegistryParseResult {
  const semanticsIssues = ruleRunnerSemanticsIssues(document.rules, sourcePath);
  return Match.value(semanticsIssues.length).pipe(
    Match.when(0, () => ({ ok: true as const, document })),
    Match.orElse(() => ({ ok: false as const, issues: semanticsIssues }))
  );
}

function schemaIssuePath(sourcePath: string, instancePath: string): string {
  return Match.value(instancePath).pipe(
    Match.when("", () => sourcePath),
    Match.orElse((suffix) => `${sourcePath}${suffix}`)
  );
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
  return Match.value(fileSystem.isDirectory(registryPath)).pipe(
    Match.when(true, () => loadRuleRegistryDirectorySyncWithDiscovery(registryPath, fileSystem)),
    Match.when(false, () => ({
      document: parseRuleRegistryTextOrThrow(fileSystem.readText(registryPath), registryPath),
      discoveredManifestPaths: [],
    })),
    Match.exhaustive
  );
}

export const loadRuleRegistryDocumentEffect = Effect.fn("habitat.rules.loadRegistry")(function* (
  registryPath: string,
  fileSystem: RuleRegistryFileSystem
) {
  const isDirectory = yield* fileSystem.isDirectory(registryPath);
  return yield* Match.value(isDirectory).pipe(
    Match.when(true, () => loadRuleRegistryDirectoryEffect(registryPath, fileSystem)),
    Match.when(false, () => loadRuleRegistryFileEffect(registryPath, fileSystem)),
    Match.exhaustive
  );
});

const loadRuleRegistryFileEffect = Effect.fn("habitat.rules.loadRegistryFile")(function* (
  registryPath: string,
  fileSystem: RuleRegistryFileSystem
) {
  const result = parseRuleRegistryText(yield* fileSystem.readText(registryPath), registryPath);
  return yield* ruleRegistryDocumentFromParseResult(result);
});

const loadRuleRegistryDirectoryEffect = Effect.fn("habitat.rules.loadRegistryDirectory")(function* (
  registryDir: string,
  fileSystem: RuleRegistryFileSystem
) {
  const indexPath = yield* ruleRegistryIndexPath(registryDir, fileSystem);
  const parsedIndex = yield* parseRegistryJsonEffect(
    indexPath,
    RuleRegistryIndexSchema,
    fileSystem
  );
  const index = Value.Parse(RuleRegistryIndexSchema, parsedIndex);
  const rulePaths = yield* ruleFilePaths(registryDir, fileSystem);
  const rules = yield* Effect.all(
    rulePaths.map((rulePath) => parseRuleManifestJsonEffect(rulePath, fileSystem))
  );
  const result = parseRuleRegistryDocument(
    {
      schemaVersion: index.schemaVersion,
      ownerRoots: index.ownerRoots,
      rules,
    },
    indexPath
  );
  return yield* ruleRegistryDocumentFromParseResult(result);
});

function ruleRegistryDocumentFromParseResult(result: RuleRegistryParseResult) {
  return Match.value(result).pipe(
    Match.when({ ok: true }, ({ document }) => Effect.succeed(document)),
    Match.when({ ok: false }, ({ issues }) => Effect.fail(new RuleRegistryLoadFailed({ issues }))),
    Match.exhaustive
  );
}

function loadRuleRegistryDirectorySyncWithDiscovery(
  registryDir: string,
  fileSystem: RuleRegistrySyncFileSystem
): LoadedRuleRegistryDocument {
  const indexPath = ruleRegistryIndexPathSync(registryDir, fileSystem);
  const index = parseRegistryJsonSync(indexPath, RuleRegistryIndexSchema, fileSystem);
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
  return Match.value(result).pipe(
    Match.when({ ok: true }, ({ document }) => ({
      document,
      discoveredManifestPaths: rulePaths.map(toRepoRelativeManifestPath).sort(),
    })),
    Match.when({ ok: false }, ({ issues }) => {
      throw new RuleRegistryLoadFailed({ issues });
    }),
    Match.exhaustive
  );
}

function parseRuleManifestJsonSync(
  filePath: string,
  fileSystem: RuleRegistrySyncFileSystem
): RuleRegistryRecord {
  const parsed = parseRegistryJsonSync(filePath, RuleRegistryRecordInputSchema, fileSystem);
  const record = Value.Parse(
    RuleRegistryRecordSchema,
    ruleRecordWithManifestPath(parsed, filePath)
  );
  const semanticIssues = gritPatternPathIssues(record, filePath);
  refuseRuleRegistryIssues(semanticIssues);
  const issues = referencedFileIssues(record, filePath, fileSystem);
  refuseRuleRegistryIssues(issues);
  return record;
}

function parseRegistryJsonSync<TSchemaType extends TSchema>(
  filePath: string,
  schema: TSchemaType,
  fileSystem: RuleRegistrySyncFileSystem
): Static<TSchemaType> {
  const parsed = Either.getOrThrowWith(
    Either.try({ try: () => fileSystem.readText(filePath), catch: renderJsonError }).pipe(
      Either.flatMap(parseJsonText)
    ),
    (message) => new RuleRegistryLoadFailed({ issues: [invalidJsonIssue(filePath, message)] })
  );
  const issues = [...Value.Errors(schema, parsed)];
  refuseRuleRegistryIssues(issues.map((issue) => schemaIssue(filePath, issue)));
  return Value.Parse(schema, parsed);
}

const parseRuleManifestJsonEffect = Effect.fn("habitat.rules.parseManifest")(function* (
  filePath: string,
  fileSystem: RuleRegistryFileSystem
) {
  const parsedRecord = yield* parseRegistryJsonEffect(
    filePath,
    RuleRegistryRecordInputSchema,
    fileSystem
  );
  const parsed = Value.Parse(RuleRegistryRecordInputSchema, parsedRecord);
  const record = Value.Parse(
    RuleRegistryRecordSchema,
    ruleRecordWithManifestPath(parsed, filePath)
  );
  const semanticIssues = gritPatternPathIssues(record, filePath);
  yield* refuseRuleRegistryIssuesEffect(semanticIssues);
  const issues = yield* referencedFileIssuesEffect(record, filePath, fileSystem);
  yield* refuseRuleRegistryIssuesEffect(issues);
  return record;
});

function parseRuleRegistryTextOrThrow(text: string, sourcePath: string): RuleRegistryDocument {
  const result = parseRuleRegistryText(text, sourcePath);
  return Match.value(result).pipe(
    Match.when({ ok: true }, ({ document }) => document),
    Match.when({ ok: false }, ({ issues }) => {
      throw new RuleRegistryLoadFailed({ issues });
    }),
    Match.exhaustive
  );
}

const parseRegistryJsonEffect = Effect.fn("habitat.rules.parseRegistryJson")(function* (
  filePath: string,
  schema: TSchema,
  fileSystem: RuleRegistryFileSystem
) {
  const text = yield* fileSystem.readText(filePath);
  const parsed = yield* Either.match(parseJsonText(text), {
    onRight: Effect.succeed,
    onLeft: (message) =>
      Effect.fail(new RuleRegistryLoadFailed({ issues: [invalidJsonIssue(filePath, message)] })),
  });
  const issues = [...Value.Errors(schema, parsed)];
  yield* refuseRuleRegistryIssuesEffect(issues.map((issue) => schemaIssue(filePath, issue)));
  return Value.Parse(schema, parsed);
});

function ruleRecordWithManifestPath(record: RuleRegistryRecordInput, filePath: string): unknown {
  const setManifestPath = R.set<string, "manifestFilePath", string>(
    "manifestFilePath",
    toRepoRelativeManifestPath(filePath)
  );
  return setManifestPath(record);
}

const ruleFilePaths = Effect.fn("habitat.rules.ruleFilePaths")(function* (
  registryDir: string,
  fileSystem: RuleRegistryFileSystem
) {
  const candidates = (yield* findFiles(registryDir, fileSystem, isRuleRecordCandidatePath)).sort();
  const issues = staleRuleRecordIssues(candidates);
  yield* refuseRuleRegistryIssuesEffect(issues);
  return candidates;
});

const ruleRegistryIndexPath = Effect.fn("habitat.rules.registryIndexPath")(function* (
  registryDir: string,
  fileSystem: RuleRegistryFileSystem
) {
  const directIndex = path.join(registryDir, "index.json");
  const directIndexProbe = yield* Effect.either(fileSystem.readText(directIndex));
  return yield* Either.match(directIndexProbe, {
    onRight: () => Effect.succeed(directIndex),
    onLeft: () => Effect.fail(missingRegistryIndexError(registryDir)),
  });
});

function missingRegistryIndexError(registryDir: string): RuleRegistryLoadFailed {
  return new RuleRegistryLoadFailed({
    issues: [
      {
        code: "registry-schema-invalid",
        path: registryDir,
        message: "Missing rule-pack index.json.",
      },
    ],
  });
}

function invalidJsonIssue(filePath: string, message: string): RuleRegistryIssue {
  return { code: "registry-json-invalid", path: filePath, message };
}

function schemaIssue(
  filePath: string,
  issue: { readonly instancePath: string; readonly message: string }
): RuleRegistryIssue {
  return {
    code: "registry-schema-invalid",
    path: schemaIssuePath(filePath, issue.instancePath),
    message: issue.message,
  };
}

function refuseRuleRegistryIssues(issues: readonly RuleRegistryIssue[]): void {
  return Either.getOrThrowWith(
    Match.value(issues.length).pipe(
      Match.when(0, () => Either.right(undefined)),
      Match.orElse(() => Either.left(new RuleRegistryLoadFailed({ issues })))
    ),
    (error) => error
  );
}

const refuseRuleRegistryIssuesEffect = Effect.fn("habitat.rules.refuseRegistryIssues")(function* (
  issues: readonly RuleRegistryIssue[]
) {
  return yield* Effect.if(issues.length === 0, {
    onTrue: () => Effect.void,
    onFalse: () => Effect.fail(new RuleRegistryLoadFailed({ issues })),
  });
});

function ruleRegistryIndexPathSync(
  registryDir: string,
  fileSystem: RuleRegistrySyncFileSystem
): string {
  const directIndex = path.join(registryDir, "index.json");
  const indexProbe = Either.try({
    try: () => fileSystem.readText(directIndex),
    catch: () => missingRegistryIndexError(registryDir),
  });
  return Either.getOrThrowWith(
    Either.map(indexProbe, () => directIndex),
    (error) => error
  );
}

function ruleFilePathsSync(registryDir: string, fileSystem: RuleRegistrySyncFileSystem): string[] {
  const candidates = findFilesSync(registryDir, fileSystem, isRuleRecordCandidatePath).sort();
  const issues = staleRuleRecordIssues(candidates);
  refuseRuleRegistryIssues(issues);
  return candidates;
}

function isRuleRecordCandidatePath(filePath: string): boolean {
  const fileName = filePath.split("/").at(-1);
  return fileName === "rule.json" || Boolean(fileName?.endsWith(".rule.json"));
}

function staleRuleRecordIssues(paths: readonly string[]): RuleRegistryIssue[] {
  return paths.flatMap((rulePath) => [
    ...issueWhen(rulePath.endsWith(".rule.json"), {
      code: "registry-schema-invalid",
      path: rulePath,
      message: "Rule manifest files must be named rule.json.",
    }),
    ...issueWhen(usesStaleCategoryOperationPath(rulePath), {
      code: "registry-schema-invalid",
      path: rulePath,
      message:
        "Rule packets must not use category/operation-kind path nesting; use .habitat/blueprints/<blueprint>/<packet>, _blueprints/<candidate>/<packet>, or rules/<packet>.",
    }),
  ]);
}

function usesStaleCategoryOperationPath(rulePath: string): boolean {
  const segments = rulePath.split("/");
  const blueprintIndex = segments.lastIndexOf("blueprints");
  return Match.value(blueprintIndex < 0).pipe(
    Match.when(true, () => false),
    Match.when(false, () => usesStaleBlueprintSegments(segments, blueprintIndex)),
    Match.exhaustive
  );
}

function usesStaleBlueprintSegments(segments: readonly string[], blueprintIndex: number): boolean {
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

const findFiles = Effect.fn("habitat.rules.findFiles")(function* (
  root: string,
  fileSystem: RuleRegistryFileSystem,
  predicate: (filePath: string) => boolean
): Effect.fn.Return<string[], FileReadFailed, FileSystem.FileSystem> {
  const entries = yield* fileSystem.readDirectory(root);
  const groups = yield* Effect.all(
    entries.map((entry) => findEntryFilesEffect(root, entry, fileSystem, predicate))
  );
  return groups.flat();
});

const findEntryFilesEffect = Effect.fn("habitat.rules.findEntryFiles")(function* (
  root: string,
  entry: RuleRegistryDirectoryEntry,
  fileSystem: RuleRegistryFileSystem,
  predicate: (filePath: string) => boolean
): Effect.fn.Return<string[], FileReadFailed, FileSystem.FileSystem> {
  const absolute = path.join(root, entry.name);
  return yield* Match.value(entry.kind).pipe(
    Match.when("directory", () => findFiles(absolute, fileSystem, predicate)),
    Match.when("file", () => Effect.succeed(fileMatch(absolute, predicate))),
    Match.when("other", () => Effect.succeed([])),
    Match.exhaustive
  );
});

function fileMatch(absolute: string, predicate: (filePath: string) => boolean): string[] {
  return Match.value(predicate(toPosixPath(absolute))).pipe(
    Match.when(true, () => [absolute]),
    Match.when(false, () => []),
    Match.exhaustive
  );
}

function findFilesSync(
  root: string,
  fileSystem: RuleRegistrySyncFileSystem,
  predicate: (filePath: string) => boolean
): string[] {
  return fileSystem
    .readDirectory(root)
    .flatMap((entry) => findEntryFilesSync(root, entry, fileSystem, predicate));
}

function findEntryFilesSync(
  root: string,
  entry: RuleRegistryDirectoryEntry,
  fileSystem: RuleRegistrySyncFileSystem,
  predicate: (filePath: string) => boolean
): string[] {
  const absolute = path.join(root, entry.name);
  return Match.value(entry.kind).pipe(
    Match.when("directory", () => findFilesSync(absolute, fileSystem, predicate)),
    Match.when("file", () => fileMatch(absolute, predicate)),
    Match.when("other", () => []),
    Match.exhaustive
  );
}

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join("/");
}

function toRepoRelativeManifestPath(filePath: string): string {
  const normalized = toPosixPath(filePath);
  const habitatIndex = normalized.lastIndexOf("/.habitat/");
  return Match.value(habitatIndex >= 0).pipe(
    Match.when(true, () => normalized.slice(habitatIndex + 1)),
    Match.when(false, () => normalized),
    Match.exhaustive
  );
}

function referencedFilePaths(rule: RuleRegistryRecord): string[] {
  return [...runnerReferencedFilePaths(rule), ...supportReferencedFilePaths(rule)];
}

function runnerReferencedFilePaths(rule: RuleRegistryRecord): string[] {
  return Match.value(rule.runner).pipe(
    Match.when({ name: "grit" }, gritRunnerReferencedFilePaths),
    Match.when({ name: "habitat", mode: "structure" }, (runner) => [runner.files.structure]),
    Match.when({ name: "habitat", mode: "script" }, (runner) => [runner.files.script]),
    Match.orElse(() => [])
  );
}

function gritRunnerReferencedFilePaths(
  runner: Extract<RuleRegistryRecord["runner"], { readonly name: "grit" }>
): string[] {
  const fixPaths = Match.value(runner.fix).pipe(
    Match.when(Match.undefined, () => []),
    Match.orElse((fix) => [fix.pattern])
  );
  return [runner.files.pattern, ...fixPaths];
}

function supportReferencedFilePaths(rule: RuleRegistryRecord): string[] {
  return [rule.supportFiles?.baseline, rule.supportFiles?.ruleIntroductionManifest].filter(
    (candidate): candidate is string => candidate !== undefined
  );
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
  return Either.isRight(Either.try(() => fileSystem.readText(filePath)));
}

const referencedFileIssuesEffect = Effect.fn("habitat.rules.referencedFileIssues")(function* (
  rule: RuleRegistryRecord,
  manifestPath: string,
  fileSystem: RuleRegistryFileSystem
) {
  const repoRoot = repoRootForManifestPath(manifestPath);
  const issues = yield* Effect.forEach(referencedFilePaths(rule), (repoPath) =>
    referencedFileIssueEffect(rule, manifestPath, repoRoot, repoPath, fileSystem)
  );
  return issues.flat();
});

const referencedFileIssueEffect = Effect.fn("habitat.rules.referencedFileIssue")(function* (
  rule: RuleRegistryRecord,
  manifestPath: string,
  repoRoot: string,
  repoPath: string,
  fileSystem: RuleRegistryFileSystem
) {
  const result = yield* fileSystem.readText(path.join(repoRoot, repoPath)).pipe(Effect.either);
  return Either.match(result, {
    onRight: () => [],
    onLeft: () => [
      {
        code: "registry-missing-referenced-file" as const,
        path: manifestPath,
        message: `${rule.id}: referenced runner or support file does not exist: ${repoPath}.`,
      },
    ],
  });
});

function repoRootForManifestPath(manifestPath: string): string {
  const normalized = toPosixPath(manifestPath);
  const habitatIndex = normalized.lastIndexOf("/.habitat/");
  return Match.value(habitatIndex >= 0).pipe(
    Match.when(true, () => normalized.slice(0, habitatIndex)),
    Match.when(false, () => repoRootWithoutHabitatAncestor(manifestPath, normalized)),
    Match.exhaustive
  );
}

function repoRootWithoutHabitatAncestor(manifestPath: string, normalized: string): string {
  return Match.value(normalized.startsWith(".habitat/")).pipe(
    Match.when(true, () => "."),
    Match.when(false, () => path.dirname(manifestPath)),
    Match.exhaustive
  );
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
      message: `Duplicate Habitat rule id: "${id}" in ${paths.join(", ")}.`,
    }));
}

function ruleRunnerSemanticsIssues(
  rules: readonly RuleRegistryRecord[],
  sourcePath: string
): RuleRegistryIssue[] {
  return rules.flatMap((rule, index) => ruleSemanticsIssues(rule, `${sourcePath}/rules/${index}`));
}

function ruleSemanticsIssues(rule: RuleRegistryRecord, rulePath: string): RuleRegistryIssue[] {
  return [
    ...gritRunnerSemanticsIssues(rule, rulePath),
    ...nxRunnerSemanticsIssues(rule, rulePath),
    ...fileLayerRunnerSemanticsIssues(rule, rulePath),
  ];
}

function gritPatternPathIssues(rule: RuleRegistryRecord, sourcePath: string): RuleRegistryIssue[] {
  return Match.value(rule.runner).pipe(
    Match.when({ name: "grit" }, (runner) =>
      gritPatternPathFacts(runner).flatMap((fact) =>
        gritPatternPathFactIssues(rule, sourcePath, fact)
      )
    ),
    Match.orElse(() => [])
  );
}

function gritPatternPathFactIssues(
  rule: RuleRegistryRecord,
  sourcePath: string,
  fact: GritPatternPathFact
): RuleRegistryIssue[] {
  const segments = fact.patternPath.split("/");
  const invalid =
    fact.patternPath.includes("\\") ||
    path.isAbsolute(fact.patternPath) ||
    !fact.patternPath.startsWith(".habitat/") ||
    fact.patternPath.includes("//") ||
    segments.some((segment) => segment === "" || segment === "." || segment === "..") ||
    path.posix.normalize(fact.patternPath) !== fact.patternPath;
  return issueWhen(
    invalid,
    runnerIssue(
      `${sourcePath}/runner/${fact.fieldPath}`,
      rule.id,
      `${fact.field} must be a normalized relative .habitat/... file path.`
    )
  );
}

function gritRunnerSemanticsIssues(
  rule: RuleRegistryRecord,
  rulePath: string
): RuleRegistryIssue[] {
  return Match.value(rule.runner).pipe(
    Match.when({ name: "grit" }, (runner) => [
      ...issueWhen(
        !Array.isArray(rule.scanRoots),
        runnerIssue(rulePath, rule.id, "grit runner records must declare scanRoots.")
      ),
      ...issueWhen(
        rule.patternName !== undefined && rule.patternName !== runner.patternName,
        runnerIssue(
          rulePath,
          rule.id,
          "patternName must match the derived grit runner patternName."
        )
      ),
      ...issueWhen(
        runner.fix !== undefined &&
          rule.pathCoverage.some((coverage) => coverage.kind !== "exact-path"),
        runnerIssue(rulePath, rule.id, "fix preview admission requires exact-path coverage only.")
      ),
      ...gritPatternPathIssues(rule, rulePath),
    ]),
    Match.orElse(() => nonGritRunnerSemanticsIssues(rule, rulePath))
  );
}

function nonGritRunnerSemanticsIssues(
  rule: RuleRegistryRecord,
  rulePath: string
): RuleRegistryIssue[] {
  return [
    ...issueWhen(
      rule.scanRoots !== undefined,
      runnerIssue(rulePath, rule.id, "scanRoots are only valid for grit runner records.")
    ),
    ...issueWhen(
      rule.patternName !== undefined,
      runnerIssue(rulePath, rule.id, "patternName is only valid for grit runner records.")
    ),
    ...issueWhen(
      rule.hookCheck !== undefined,
      runnerIssue(rulePath, rule.id, "hookCheck is only valid for grit runner records.")
    ),
  ];
}

function nxRunnerSemanticsIssues(rule: RuleRegistryRecord, rulePath: string): RuleRegistryIssue[] {
  return Match.value(rule.runner).pipe(
    Match.when({ name: "nx" }, (runner) =>
      issueWhen(
        rule.graphTarget === undefined ||
          rule.graphTarget.project !== runner.target.project ||
          rule.graphTarget.target !== runner.target.target,
        runnerIssue(rulePath, rule.id, "nx runner records must mirror graphTarget.")
      )
    ),
    Match.orElse(() =>
      issueWhen(
        rule.graphTarget !== undefined,
        runnerIssue(rulePath, rule.id, "graphTarget is only valid for nx runner records.")
      )
    )
  );
}

function fileLayerRunnerSemanticsIssues(
  rule: RuleRegistryRecord,
  rulePath: string
): RuleRegistryIssue[] {
  const facetCount = [rule.generatedZone, rule.forbiddenFileNames, rule.hostSurfaceGuard].filter(
    Boolean
  ).length;
  return Match.value(rule.runner).pipe(
    Match.when({ name: "habitat", mode: "file-layer" }, () =>
      issueWhen(
        facetCount !== 1,
        runnerIssue(
          rulePath,
          rule.id,
          "file-layer runner records must declare exactly one guard facet."
        )
      )
    ),
    Match.orElse(() =>
      issueWhen(
        facetCount > 0,
        runnerIssue(
          rulePath,
          rule.id,
          "file-layer guard facets are only valid for file-layer runner records."
        )
      )
    )
  );
}

interface GritPatternPathFact {
  readonly field: string;
  readonly fieldPath: string;
  readonly patternPath: string;
}

function gritPatternPathFacts(
  runner: Extract<RuleRegistryRecord["runner"], { readonly name: "grit" }>
): GritPatternPathFact[] {
  return [
    { field: "pattern", fieldPath: "files/pattern", patternPath: runner.files.pattern },
    ...Match.value(runner.fix).pipe(
      Match.when(Match.undefined, () => []),
      Match.orElse((fix) => [
        { field: "fix.pattern", fieldPath: "fix/pattern", patternPath: fix.pattern },
      ])
    ),
  ];
}

function issueWhen(condition: boolean, issue: RuleRegistryIssue): RuleRegistryIssue[] {
  return Match.value(condition).pipe(
    Match.when(true, () => [issue]),
    Match.when(false, () => []),
    Match.exhaustive
  );
}

function runnerIssue(path: string, ruleId: string, message: string): RuleRegistryIssue {
  return {
    code: "registry-schema-invalid",
    path,
    message: `${ruleId}: ${message}`,
  };
}
