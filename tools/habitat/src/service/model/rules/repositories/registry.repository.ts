import path from "node:path";
import { Data, Effect } from "effect";
import type { TSchema } from "typebox";
import { Value } from "typebox/value";
import type {
  RuleRegistryDocumentV1,
  RuleRegistryIndexV1,
  RuleRegistryRecordV1,
} from "../dto/registry.schema.ts";
import {
  RuleRegistryDocumentV1Schema,
  RuleRegistryIndexV1Schema,
  RuleRegistryRecordV1Schema,
} from "../dto/registry.schema.ts";

export type RuleRegistryIssueCode =
  | "registry-json-invalid"
  | "registry-schema-invalid"
  | "registry-duplicate-rule-id";

export interface RuleRegistryIssue {
  code: RuleRegistryIssueCode;
  path: string;
  message: string;
}

export type RuleRegistryParseResult =
  | { ok: true; document: RuleRegistryDocumentV1 }
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
  const schemaIssues = [...Value.Errors(RuleRegistryDocumentV1Schema, value)].map((error) => ({
    code: "registry-schema-invalid" as const,
    path: error.instancePath ? `${sourcePath}${error.instancePath}` : sourcePath,
    message: error.message,
  }));
  if (schemaIssues.length > 0) return { ok: false, issues: schemaIssues };

  const document = value as RuleRegistryDocumentV1;
  const duplicateIssues = duplicateRuleIdIssues(document.rules, sourcePath);
  if (duplicateIssues.length > 0) return { ok: false, issues: duplicateIssues };

  return { ok: true, document };
}

export function loadRuleRegistryDocument(
  registryPath: string,
  fileSystem: RuleRegistrySyncFileSystem
): RuleRegistryDocumentV1 {
  return fileSystem.isDirectory(registryPath)
    ? loadRuleRegistryDirectorySync(registryPath, fileSystem)
    : parseRuleRegistryTextOrThrow(fileSystem.readText(registryPath), registryPath);
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
): Effect.Effect<RuleRegistryDocumentV1, RuleRegistryLoadFailed | unknown, R> {
  return Effect.gen(function* () {
    const indexPath = yield* ruleRegistryIndexPath(registryDir, fileSystem);
    const index = yield* parseRegistryJson<RuleRegistryIndexV1, R>(
      indexPath,
      RuleRegistryIndexV1Schema,
      fileSystem
    );
    const rulePaths = yield* ruleFilePaths(registryDir, fileSystem);
    const rules = yield* Effect.all(
      rulePaths.map((rulePath) =>
        parseRegistryJson<RuleRegistryRecordV1, R>(rulePath, RuleRegistryRecordV1Schema, fileSystem)
      )
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

function loadRuleRegistryDirectorySync(
  registryDir: string,
  fileSystem: RuleRegistrySyncFileSystem
): RuleRegistryDocumentV1 {
  const indexPath = ruleRegistryIndexPathSync(registryDir, fileSystem);
  const index = parseRegistryJsonSync<RuleRegistryIndexV1>(
    indexPath,
    RuleRegistryIndexV1Schema,
    fileSystem
  );
  const rules = ruleFilePathsSync(registryDir, fileSystem)
    .map((rulePath) =>
      parseRegistryJsonSync<RuleRegistryRecordV1>(rulePath, RuleRegistryRecordV1Schema, fileSystem)
    )
    .sort((left, right) => left.id.localeCompare(right.id));
  const result = parseRuleRegistryDocument(
    {
      schemaVersion: index.schemaVersion,
      ownerRoots: index.ownerRoots,
      rules,
    },
    indexPath
  );
  if (result.ok) return result.document;
  throw new RuleRegistryLoadFailed({ issues: result.issues });
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

function parseRuleRegistryTextOrThrow(text: string, sourcePath: string): RuleRegistryDocumentV1 {
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
    return (yield* findFiles(registryDir, fileSystem, (filePath) =>
      filePath.endsWith(".rule.json")
    )).sort();
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
  return findFilesSync(registryDir, fileSystem, (filePath) =>
    filePath.endsWith(".rule.json")
  ).sort();
}

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

function renderRuleRegistryIssues(heading: string, issues: readonly RuleRegistryIssue[]): string {
  return `${heading}:\n${issues.map((issue) => `- ${issue.path}: ${issue.message}`).join("\n")}`;
}

function duplicateRuleIdIssues(
  rules: readonly RuleRegistryRecordV1[],
  sourcePath: string
): RuleRegistryIssue[] {
  const seen = new Set<string>();
  const duplicateIds = new Set<string>();
  for (const rule of rules) {
    if (seen.has(rule.id)) duplicateIds.add(rule.id);
    seen.add(rule.id);
  }
  return [...duplicateIds].sort().map((id) => ({
    code: "registry-duplicate-rule-id",
    path: sourcePath,
    message: `Duplicate Habitat rule id: ${JSON.stringify(id)}.`,
  }));
}
