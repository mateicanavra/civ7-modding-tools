import fs from "node:fs";
import path from "node:path";
import type { TSchema } from "typebox";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

const NxRulePathCoverageSchema = Type.Array(
  Type.Union([
    Type.Object(
      {
        kind: Type.Literal("exact-path"),
        patterns: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),
      },
      { additionalProperties: false }
    ),
    Type.Object({ kind: Type.Literal("project-owner") }, { additionalProperties: false }),
    Type.Object({ kind: Type.Literal("workspace-gate") }, { additionalProperties: false }),
    Type.Object(
      {
        kind: Type.Literal("unresolved-metadata"),
        reason: Type.String({ minLength: 1 }),
      },
      { additionalProperties: false }
    ),
  ]),
  { minItems: 1 }
);

const NxGraphTargetSchema = Type.Object(
  {
    project: Type.String({ minLength: 1 }),
    target: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

const NxRuleRegistryRecordSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    ownerProject: Type.String({ minLength: 1 }),
    ownerTool: Type.String({ minLength: 1 }),
    pathCoverage: NxRulePathCoverageSchema,
    scanRoots: Type.Optional(Type.Array(Type.String({ minLength: 1 }), { minItems: 1 })),
    manifestPath: Type.Optional(Type.String({ minLength: 1 })),
    graphTarget: Type.Optional(NxGraphTargetSchema),
  },
  { additionalProperties: true }
);

const NxRuleRegistryDocumentSchema = Type.Object(
  {
    schemaVersion: Type.Literal(1),
    ownerRoots: Type.Record(Type.String({ minLength: 1 }), Type.String({ minLength: 1 }), {
      minProperties: 1,
    }),
    rules: Type.Array(NxRuleRegistryRecordSchema),
  },
  { additionalProperties: true }
);

const NxRuleRegistryIndexSchema = Type.Object(
  {
    schemaVersion: Type.Literal(1),
    ownerRoots: Type.Record(Type.String({ minLength: 1 }), Type.String({ minLength: 1 }), {
      minProperties: 1,
    }),
  },
  { additionalProperties: true }
);

export type NxRuleRegistryRecord = Static<typeof NxRuleRegistryRecordSchema>;
export type NxRuleRegistryDocument = Static<typeof NxRuleRegistryDocumentSchema>;

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
  const index = parseJsonFile<Static<typeof NxRuleRegistryIndexSchema>>(
    indexPath,
    NxRuleRegistryIndexSchema
  );
  const rules = fs
    .readdirSync(registryDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) =>
      parseJsonFile<NxRuleRegistryRecord>(
        path.join(registryDir, entry.name, "rule.json"),
        NxRuleRegistryRecordSchema
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
  const schemaIssues = [...Value.Errors(NxRuleRegistryDocumentSchema, value)].map((issue) => ({
    path: issue.instancePath ? `${sourcePath}${issue.instancePath}` : sourcePath,
    message: issue.message,
  }));
  if (schemaIssues.length > 0) {
    throw registryLoadError("Habitat rule registry is invalid", schemaIssues);
  }

  const document = Value.Parse(NxRuleRegistryDocumentSchema, value) as NxRuleRegistryDocument;
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
