import path from "node:path";
import { ruleRegistryRepoPath } from "@internal/habitat-harness/resources/artifact-paths";
import { repoRoot } from "@internal/habitat-harness/resources/paths";
import {
  isDirectory,
  isDirectorySync,
  readDirectory,
  readDirectorySync,
  readText,
  readTextSync,
} from "@internal/habitat-harness/resources/platform/filesystem";
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
  registryPath = defaultRuleRegistryPath()
): RuleRegistryDocumentV1 {
  return isDirectorySync(registryPath)
    ? loadRuleRegistryDirectorySync(registryPath)
    : parseRuleRegistryTextOrThrow(readTextSync(registryPath), registryPath);
}

export function loadRuleRegistryDocumentEffect(registryPath = defaultRuleRegistryPath()) {
  return Effect.gen(function* () {
    if (yield* isDirectory(registryPath)) return yield* loadRuleRegistryDirectory(registryPath);

    const result = parseRuleRegistryText(yield* readText(registryPath), registryPath);
    if (result.ok) return result.document;
    return yield* Effect.fail(new RuleRegistryLoadFailed({ issues: result.issues }));
  });
}

export function defaultRuleRegistryPath(): string {
  return path.join(repoRoot, ruleRegistryRepoPath);
}

function loadRuleRegistryDirectory(registryDir: string) {
  const indexPath = path.join(registryDir, "index.json");
  return Effect.gen(function* () {
    const index = yield* parseRegistryJson<RuleRegistryIndexV1>(
      indexPath,
      RuleRegistryIndexV1Schema
    );
    const rulePaths = yield* ruleFilePaths(registryDir);
    const rules = yield* Effect.all(
      rulePaths.map((rulePath) =>
        parseRegistryJson<RuleRegistryRecordV1>(rulePath, RuleRegistryRecordV1Schema)
      )
    );
    const result = parseRuleRegistryDocument(
      {
        schemaVersion: index.schemaVersion,
        ownerRoots: index.ownerRoots,
        rules,
      },
      registryDir
    );
    if (result.ok) return result.document;
    return yield* Effect.fail(new RuleRegistryLoadFailed({ issues: result.issues }));
  });
}

function loadRuleRegistryDirectorySync(registryDir: string): RuleRegistryDocumentV1 {
  const indexPath = path.join(registryDir, "index.json");
  const index = parseRegistryJsonSync<RuleRegistryIndexV1>(indexPath, RuleRegistryIndexV1Schema);
  const rules = readDirectorySync(registryDir)
    .filter((entry) => entry.kind === "directory")
    .map((entry) =>
      parseRegistryJsonSync<RuleRegistryRecordV1>(
        path.join(registryDir, entry.name, "rule.json"),
        RuleRegistryRecordV1Schema
      )
    )
    .sort((left, right) => left.id.localeCompare(right.id));
  const result = parseRuleRegistryDocument(
    {
      schemaVersion: index.schemaVersion,
      ownerRoots: index.ownerRoots,
      rules,
    },
    registryDir
  );
  if (result.ok) return result.document;
  throw new RuleRegistryLoadFailed({ issues: result.issues });
}

function parseRegistryJsonSync<T>(filePath: string, schema: TSchema): T {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readTextSync(filePath)) as unknown;
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

function parseRegistryJson<T>(filePath: string, schema: TSchema) {
  return Effect.gen(function* () {
    let parsed: unknown;
    try {
      parsed = JSON.parse(yield* readText(filePath)) as unknown;
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

function ruleFilePaths(registryDir: string) {
  return Effect.gen(function* () {
    const entries = yield* readDirectory(registryDir);
    return entries
      .filter((entry) => entry.kind === "directory")
      .map((entry) => path.join(registryDir, entry.name, "rule.json"))
      .sort();
  });
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

export const activeRuleRegistryDocument = loadRuleRegistryDocument();
