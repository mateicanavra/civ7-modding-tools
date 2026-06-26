import fs from "node:fs";
import path from "node:path";
import {
  type RuleRegistryDocumentV1,
  RuleRegistryDocumentV1Schema,
  type RuleRegistryIndexV1,
  RuleRegistryIndexV1Schema,
  type RuleRegistryRecordV1,
  RuleRegistryRecordV1Schema,
} from "@internal/habitat-harness/service/model/rules/dto/registry.schema";
import type { TSchema } from "typebox";
import { Value } from "typebox/value";

export type NxRuleRegistryRecord = RuleRegistryRecordV1;
export type NxRuleRegistryDocument = RuleRegistryDocumentV1;

interface RuleRegistryIssue {
  readonly path: string;
  readonly message: string;
}

export function loadRuleRegistryDocumentForNxPlugin(registryPath: string): NxRuleRegistryDocument {
  return fs.statSync(registryPath).isDirectory()
    ? loadRuleRegistryDirectory(registryPath)
    : parseRuleRegistryDocument(readJsonFile(registryPath), registryPath);
}

function loadRuleRegistryDirectory(registryDir: string): NxRuleRegistryDocument {
  const indexPath = path.join(registryDir, "index.json");
  const index = parseJsonFile<RuleRegistryIndexV1>(indexPath, RuleRegistryIndexV1Schema);
  const rules = fs
    .readdirSync(registryDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) =>
      parseJsonFile<NxRuleRegistryRecord>(
        path.join(registryDir, entry.name, "rule.json"),
        RuleRegistryRecordV1Schema
      )
    )
    .sort((left, right) => left.id.localeCompare(right.id));

  return parseRuleRegistryDocument(
    {
      schemaVersion: index.schemaVersion,
      ownerRoots: index.ownerRoots,
      rules,
    },
    registryDir
  );
}

function parseJsonFile<T>(filePath: string, schema: TSchema): T {
  const parsed = readJsonFile(filePath);
  const issues = [...Value.Errors(schema, parsed)];
  if (issues.length > 0) {
    throw registryLoadError(
      "Habitat rule registry is invalid",
      issues.map((issue) => ({
        path: issue.instancePath ? `${filePath}${issue.instancePath}` : filePath,
        message: issue.message,
      }))
    );
  }
  return Value.Parse(schema, parsed) as T;
}

function readJsonFile(filePath: string): unknown {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown;
  } catch (error) {
    throw registryLoadError("Habitat rule registry JSON is invalid", [
      {
        path: filePath,
        message: error instanceof Error ? error.message : "Invalid JSON.",
      },
    ]);
  }
}

function parseRuleRegistryDocument(value: unknown, sourcePath: string): NxRuleRegistryDocument {
  const schemaIssues = [...Value.Errors(RuleRegistryDocumentV1Schema, value)].map((issue) => ({
    path: issue.instancePath ? `${sourcePath}${issue.instancePath}` : sourcePath,
    message: issue.message,
  }));
  if (schemaIssues.length > 0) {
    throw registryLoadError("Habitat rule registry is invalid", schemaIssues);
  }

  const document = Value.Parse(RuleRegistryDocumentV1Schema, value) as NxRuleRegistryDocument;
  const duplicateIssues = duplicateRuleIdIssues(document.rules, sourcePath);
  if (duplicateIssues.length > 0) {
    throw registryLoadError("Habitat rule registry is invalid", duplicateIssues);
  }
  return document;
}

function duplicateRuleIdIssues(
  rules: readonly NxRuleRegistryRecord[],
  sourcePath: string
): RuleRegistryIssue[] {
  const seen = new Set<string>();
  const duplicateIds = new Set<string>();
  for (const rule of rules) {
    if (seen.has(rule.id)) duplicateIds.add(rule.id);
    seen.add(rule.id);
  }
  return [...duplicateIds].sort().map((id) => ({
    path: sourcePath,
    message: `Duplicate Habitat rule id: ${JSON.stringify(id)}.`,
  }));
}

function registryLoadError(heading: string, issues: readonly RuleRegistryIssue[]): Error {
  return new Error(
    `${heading}:\n${issues.map((issue) => `- ${issue.path}: ${issue.message}`).join("\n")}`
  );
}
