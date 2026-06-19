import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

const commonRuleFields = {
  id: Type.String({ minLength: 1 }),
  ownerProject: Type.String({ minLength: 1 }),
  lane: Type.Union([Type.Literal("enforced"), Type.Literal("advisory")]),
  scope: Type.String({ minLength: 1 }),
  forbids: Type.String({ minLength: 1 }),
  why: Type.String({ minLength: 1 }),
  detect: Type.Array(Type.String(), { minItems: 1 }),
  remediate: Type.Union([Type.String(), Type.Null()]),
  message: Type.String({ minLength: 1 }),
  exceptionPath: Type.String({ minLength: 1 }),
};

const CommandRuleFields = {
  ...commonRuleFields,
  ownerTool: Type.Union([
    Type.Literal("habitat-native"),
    Type.Literal("wrapped-script"),
    Type.Literal("biome"),
    Type.Literal("nx-boundaries"),
  ]),
};

export const CommandRuleRegistryRecordV1Schema = Type.Object(CommandRuleFields, {
  additionalProperties: false,
});

export const WrappedTestRuleRegistryRecordV1Schema = Type.Object(
  {
    ...commonRuleFields,
    ownerTool: Type.Literal("wrapped-test"),
    nxTarget: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

export const GritCheckRuleRegistryRecordV1Schema = Type.Object(
  {
    ...commonRuleFields,
    ownerTool: Type.Literal("grit-check"),
    gritPattern: Type.String({ minLength: 1 }),
    hookScope: Type.Optional(Type.Literal("pre-commit")),
    manifestPath: Type.Optional(Type.String({ minLength: 1 })),
  },
  { additionalProperties: false }
);

export const GeneratedZoneFileLayerRuleRegistryRecordV1Schema = Type.Object(
  {
    ...commonRuleFields,
    ownerTool: Type.Literal("file-layer"),
    generatedZone: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

export const ForbiddenFileNameFileLayerRuleRegistryRecordV1Schema = Type.Object(
  {
    ...commonRuleFields,
    ownerTool: Type.Literal("file-layer"),
    forbiddenFileNames: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),
  },
  { additionalProperties: false }
);

export const RuleRegistryRecordV1Schema = Type.Union([
  CommandRuleRegistryRecordV1Schema,
  WrappedTestRuleRegistryRecordV1Schema,
  GritCheckRuleRegistryRecordV1Schema,
  GeneratedZoneFileLayerRuleRegistryRecordV1Schema,
  ForbiddenFileNameFileLayerRuleRegistryRecordV1Schema,
]);
export type RuleRegistryRecordV1 = Static<typeof RuleRegistryRecordV1Schema>;

export const RuleRegistryDocumentV1Schema = Type.Object(
  {
    $comment: Type.Optional(Type.String()),
    schemaVersion: Type.Literal(1),
    rules: Type.Array(RuleRegistryRecordV1Schema),
  },
  { additionalProperties: false }
);
export type RuleRegistryDocumentV1 = Static<typeof RuleRegistryDocumentV1Schema>;

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

export function parseRuleRegistryText(text: string, sourcePath = "rules.json"): RuleRegistryParseResult {
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

export const activeRuleRegistryDocument = loadRuleRegistryDocument();

export interface RuleSelectorFacts {
  ruleId: string;
  ownerProject: string;
  ownerTool: RuleRegistryRecordV1["ownerTool"];
}

export interface RuleReportFacts extends RuleSelectorFacts {
  lane: RuleRegistryRecordV1["lane"];
  detect: string[];
  message: string;
  remediate: string | null;
}

export interface RuleExecutionFacts extends RuleReportFacts {
  exceptionPath: string;
  generatedZone?: string;
  forbiddenFileNames?: string[];
  gritPattern?: string;
  hookScope?: "pre-commit";
}

export interface RuleBaselineFacts {
  ruleId: string;
  exceptionPath: string;
}

export interface RuleGritFacts extends RuleReportFacts {
  gritPattern: string;
  hookScope?: "pre-commit";
  scope: string;
  manifestPath?: string;
}

export interface RuleLocalFeedbackFacts {
  ruleId: string;
  ownerTool: RuleRegistryRecordV1["ownerTool"];
  preCommitEligible: boolean;
}

export interface RuleGeneratedZoneFacts extends RuleReportFacts {
  generatedZone?: string;
  forbiddenFileNames?: string[];
}

export interface RuleRoutingFacts extends RuleSelectorFacts {
  scopeText: string;
}

export function ruleSelectorFacts(
  records: readonly Pick<RuleRegistryRecordV1, "id" | "ownerProject" | "ownerTool">[] =
    activeRuleRegistryDocument.rules
): RuleSelectorFacts[] {
  return records.map((rule) => ({
    ruleId: rule.id,
    ownerProject: rule.ownerProject,
    ownerTool: rule.ownerTool,
  }));
}

export function ruleReportFacts(
  records: readonly RuleRegistryRecordV1[] = activeRuleRegistryDocument.rules
): RuleReportFacts[] {
  return records.map((rule) => ({
    ...selectorProjection(rule),
    lane: rule.lane,
    detect: [...rule.detect],
    message: rule.message,
    remediate: rule.remediate,
  }));
}

export function ruleExecutionFacts(
  records: readonly RuleRegistryRecordV1[] = activeRuleRegistryDocument.rules
): RuleExecutionFacts[] {
  return records.map((rule) => ({
    ...reportProjection(rule),
    exceptionPath: rule.exceptionPath,
    ...("generatedZone" in rule ? { generatedZone: rule.generatedZone } : {}),
    ...("forbiddenFileNames" in rule
      ? { forbiddenFileNames: [...rule.forbiddenFileNames] }
      : {}),
    ...("gritPattern" in rule ? { gritPattern: rule.gritPattern } : {}),
    ...("hookScope" in rule && rule.hookScope ? { hookScope: rule.hookScope } : {}),
  }));
}

export function ruleBaselineFacts(
  records: readonly RuleRegistryRecordV1[] = activeRuleRegistryDocument.rules
): RuleBaselineFacts[] {
  return records.map((rule) => ({ ruleId: rule.id, exceptionPath: rule.exceptionPath }));
}

export function ruleGritFacts(
  records: readonly RuleRegistryRecordV1[] = activeRuleRegistryDocument.rules
): RuleGritFacts[] {
  return records
    .filter((rule): rule is Extract<RuleRegistryRecordV1, { ownerTool: "grit-check" }> => {
      return rule.ownerTool === "grit-check";
    })
    .map((rule) => ({
      ...reportProjection(rule),
      gritPattern: rule.gritPattern,
      scope: rule.scope,
      ...("hookScope" in rule && rule.hookScope ? { hookScope: rule.hookScope } : {}),
      ...("manifestPath" in rule && rule.manifestPath ? { manifestPath: rule.manifestPath } : {}),
    }));
}

export function ruleLocalFeedbackFacts(
  records: readonly RuleRegistryRecordV1[] = activeRuleRegistryDocument.rules
): RuleLocalFeedbackFacts[] {
  return records.map((rule) => ({
    ruleId: rule.id,
    ownerTool: rule.ownerTool,
    preCommitEligible: "hookScope" in rule && rule.hookScope === "pre-commit",
  }));
}

export function ruleGeneratedZoneFacts(
  records: readonly RuleRegistryRecordV1[] = activeRuleRegistryDocument.rules
): RuleGeneratedZoneFacts[] {
  return records
    .filter((rule): rule is Extract<RuleRegistryRecordV1, { ownerTool: "file-layer" }> => {
      return rule.ownerTool === "file-layer";
    })
    .map((rule) => ({
      ...reportProjection(rule),
      ...("generatedZone" in rule ? { generatedZone: rule.generatedZone } : {}),
      ...("forbiddenFileNames" in rule
        ? { forbiddenFileNames: [...rule.forbiddenFileNames] }
        : {}),
    }));
}

export function ruleRoutingFacts(
  records: readonly RuleRegistryRecordV1[] = activeRuleRegistryDocument.rules
): RuleRoutingFacts[] {
  return records.map((rule) => ({
    ...selectorProjection(rule),
    scopeText: rule.scope,
  }));
}

export function defaultRuleRegistryPath(): string {
  return path.join(path.dirname(fileURLToPath(import.meta.url)), "rules.json");
}

function selectorProjection(rule: RuleRegistryRecordV1): RuleSelectorFacts {
  return {
    ruleId: rule.id,
    ownerProject: rule.ownerProject,
    ownerTool: rule.ownerTool,
  };
}

function reportProjection(rule: RuleRegistryRecordV1): RuleReportFacts {
  return {
    ...selectorProjection(rule),
    lane: rule.lane,
    detect: [...rule.detect],
    message: rule.message,
    remediate: rule.remediate,
  };
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
