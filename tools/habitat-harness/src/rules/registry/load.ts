import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import type { TSchema } from "typebox";
import { Value } from "typebox/value";
import { ruleRegistryRepoPath } from "../../lib/artifact-paths.ts";
import { repoRoot } from "../../lib/paths.ts";
import {
  RuleRegistryDocumentV1Schema,
  RuleRegistryIndexV1Schema,
  RuleRegistryRecordV1Schema,
} from "./schema.ts";
import type {
  RuleRegistryDocumentV1,
  RuleRegistryIndexV1,
  RuleRegistryRecordV1,
} from "./schema.ts";

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
  if (statSync(registryPath).isDirectory()) return loadRuleRegistryDirectory(registryPath);

  const result = parseRuleRegistryText(readFileSync(registryPath, "utf8"), registryPath);
  if (!result.ok) {
    throw new Error(
      `Habitat rule registry is invalid:\n${result.issues
        .map((issue) => `- ${issue.path}: ${issue.message}`)
        .join("\n")}`
    );
  }
  return result.document;
}

export function defaultRuleRegistryPath(): string {
  return path.join(repoRoot, ruleRegistryRepoPath);
}

function loadRuleRegistryDirectory(registryDir: string): RuleRegistryDocumentV1 {
  const indexPath = path.join(registryDir, "index.json");
  const index = parseRegistryJson<RuleRegistryIndexV1>(
    indexPath,
    RuleRegistryIndexV1Schema,
    "Habitat rule registry index is invalid"
  );
  const rules = ruleFilePaths(registryDir).map((rulePath) =>
    parseRegistryJson<RuleRegistryRecordV1>(
      rulePath,
      RuleRegistryRecordV1Schema,
      "Habitat rule file is invalid"
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
  if (!result.ok) {
    throw new Error(
      `Habitat rule registry is invalid:\n${result.issues
        .map((issue) => `- ${issue.path}: ${issue.message}`)
        .join("\n")}`
    );
  }
  return result.document;
}

function parseRegistryJson<T>(filePath: string, schema: TSchema, heading: string): T {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
  } catch (error) {
    throw new Error(
      `${heading}:\n- ${filePath}: ${error instanceof Error ? error.message : "Invalid JSON."}`
    );
  }
  const issues = [...Value.Errors(schema, parsed)];
  if (issues.length > 0) {
    throw new Error(
      `${heading}:\n${issues
        .map((issue) => `- ${issue.instancePath ? `${filePath}${issue.instancePath}` : filePath}: ${issue.message}`)
        .join("\n")}`
    );
  }
  return Value.Parse(schema, parsed) as T;
}

function ruleFilePaths(registryDir: string): string[] {
  return readdirSync(registryDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(registryDir, entry.name, "rule.json"))
    .sort();
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
