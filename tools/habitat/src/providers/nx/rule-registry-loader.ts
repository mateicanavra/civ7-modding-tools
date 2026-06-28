import fs from "node:fs";
import path from "node:path";
import {
  type RuleRegistryDocumentV1,
  RuleRegistryDocumentV1Schema,
  type RuleRegistryIndexV1,
  RuleRegistryIndexV1Schema,
  RuleRegistryRecordInputV1Schema,
  type RuleRegistryRecordV1,
} from "@habitat/cli/service/model/rules/dto/registry.schema";
import {
  enrichPacketRuleRecord,
  isPacketRulePath,
  isStalePrefixedPacketRolePath,
  packetLocationFromArtifactPath,
} from "@habitat/cli/service/model/rules/policy/packet-derivation.policy";
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
  const indexPath = findRuleRegistryIndexPath(registryDir);
  const index = parseJsonFile<RuleRegistryIndexV1>(indexPath, RuleRegistryIndexV1Schema);
  const rules = findRuleRecordPaths(registryDir)
    .map(parseRuleRecordFile)
    .sort((left, right) => left.id.localeCompare(right.id));

  return parseRuleRegistryDocument(
    {
      schemaVersion: index.schemaVersion,
      ownerRoots: index.ownerRoots,
      rules,
    },
    indexPath
  );
}

function findRuleRegistryIndexPath(registryDir: string): string {
  const directIndex = path.join(registryDir, "index.json");
  if (fs.existsSync(directIndex)) return directIndex;

  throw registryLoadError("Habitat rule registry is invalid", [
    {
      path: registryDir,
      message: "Missing rule-pack index.json.",
    },
  ]);
}

function findRuleRecordPaths(registryDir: string): string[] {
  const candidates = findFiles(registryDir, isRuleRecordCandidatePath).sort();
  const issues = staleRuleRecordIssues(candidates);
  if (issues.length > 0) {
    throw registryLoadError("Habitat rule registry is invalid", issues);
  }
  return candidates.filter(isPacketRulePath);
}

function findFiles(root: string, predicate: (filePath: string) => boolean): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) {
      out.push(...findFiles(absolute, predicate));
      continue;
    }
    if (entry.isFile() && predicate(absolute.split(path.sep).join("/"))) out.push(absolute);
  }
  return out;
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

function parseRuleRecordFile(filePath: string): NxRuleRegistryRecord {
  const parsed = parseJsonFile<unknown>(filePath, RuleRegistryRecordInputV1Schema);
  try {
    return enrichPacketRuleRecord(filePath, parsed, packetRoleFilenames(filePath));
  } catch (error) {
    throw registryLoadError("Habitat rule registry is invalid", [
      {
        path: filePath,
        message: error instanceof Error ? error.message : "Invalid packet rule metadata.",
      },
    ]);
  }
}

function packetRoleFilenames(filePath: string): readonly string[] {
  return fs
    .readdirSync(path.dirname(filePath), { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
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

function isRuleRecordCandidatePath(filePath: string): boolean {
  const fileName = filePath.split("/").at(-1);
  return fileName === "rule.json" || filePath.endsWith(".rule.json");
}

function staleRuleRecordIssues(paths: readonly string[]): RuleRegistryIssue[] {
  const issues: RuleRegistryIssue[] = [];
  const canonicalByPacket = new Map<string, string>();
  for (const rulePath of paths) {
    if (!isPacketRulePath(rulePath)) {
      issues.push({
        path: rulePath,
        message: isStalePrefixedPacketRolePath(rulePath)
          ? "Packet rule files must be named rule.json; prefixed rule filenames are stale."
          : "Rule file must be named rule.json inside a Habitat packet directory.",
      });
      continue;
    }
    const location = packetLocationFromArtifactPath(rulePath);
    if (!location) continue;
    const existing = canonicalByPacket.get(location.packetDir);
    if (existing) {
      issues.push({
        path: rulePath,
        message: `Duplicate packet rule files: ${existing} and ${rulePath}.`,
      });
      continue;
    }
    canonicalByPacket.set(location.packetDir, rulePath);
  }
  return issues;
}

function registryLoadError(heading: string, issues: readonly RuleRegistryIssue[]): Error {
  return new Error(
    `${heading}:\n${issues.map((issue) => `- ${issue.path}: ${issue.message}`).join("\n")}`
  );
}
