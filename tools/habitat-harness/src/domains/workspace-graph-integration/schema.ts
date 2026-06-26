import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import { GraphRefusalStateSchema } from "../../providers/nx/schema.js";

const RecoveryInstructionSchema = Type.String({ minLength: 1 });

const OwnerSchema = Type.Object(
  {
    project: Type.String({ minLength: 1 }),
    projectRoot: Type.String({ minLength: 1 }),
    tags: Type.Array(Type.String()),
  },
  { additionalProperties: false }
);

const RuleCoverageKindSchema = Type.Union([
  Type.Literal("exact-path"),
  Type.Literal("project-owner"),
  Type.Literal("workspace-gate"),
  Type.Literal("unresolved-metadata"),
]);

const RuleRoutingSchema = Type.Object(
  {
    ruleId: Type.String({ minLength: 1 }),
    ownerTool: Type.String({ minLength: 1 }),
    ownerProject: Type.String({ minLength: 1 }),
    coverageKind: RuleCoverageKindSchema,
    reason: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

const ProjectClassifiedTargetSchema = Type.Object(
  {
    command: Type.String({ minLength: 1 }),
    owner: Type.Literal("project"),
    project: Type.String({ minLength: 1 }),
    target: Type.String({ minLength: 1 }),
    source: Type.Object(
      {
        kind: Type.Literal("nx-project-graph"),
        project: Type.String({ minLength: 1 }),
        target: Type.String({ minLength: 1 }),
      },
      { additionalProperties: false }
    ),
  },
  { additionalProperties: false }
);

const WorkspaceClassifiedTargetSchema = Type.Object(
  {
    command: Type.String({ minLength: 1 }),
    owner: Type.Literal("workspace"),
    project: Type.Null(),
    target: Type.String({ minLength: 1 }),
    source: Type.Object(
      {
        kind: Type.Literal("workspace-graph"),
        target: Type.String({ minLength: 1 }),
        reason: Type.String({ minLength: 1 }),
      },
      { additionalProperties: false }
    ),
  },
  { additionalProperties: false }
);

const ClassifiedTargetSchema = Type.Union([
  ProjectClassifiedTargetSchema,
  WorkspaceClassifiedTargetSchema,
]);

const UnavailableClassifiedTargetSchema = Type.Object(
  {
    owner: Type.Literal("project"),
    project: Type.String({ minLength: 1 }),
    target: Type.String({ minLength: 1 }),
    reason: Type.Literal("missing-nx-target"),
  },
  { additionalProperties: false }
);

const CommonResultFields = {
  schemaVersion: Type.Literal(1),
  input: Type.String({ minLength: 1 }),
  recoveryInstructions: Type.Array(RecoveryInstructionSchema),
};

export const ProjectPathClassificationSchema = Type.Object(
  {
    ...CommonResultFields,
    state: Type.Literal("project-path"),
    path: Type.String({ minLength: 1 }),
    owner: OwnerSchema,
    ruleRouting: Type.Array(RuleRoutingSchema),
    runnableTargets: Type.Array(ClassifiedTargetSchema),
    unavailableTargets: Type.Array(UnavailableClassifiedTargetSchema),
  },
  { additionalProperties: false }
);

export const WorkspacePathClassificationSchema = Type.Object(
  {
    ...CommonResultFields,
    state: Type.Literal("workspace-path"),
    path: Type.String({ minLength: 1 }),
    workspaceOwner: Type.Literal("workspace"),
    ruleRouting: Type.Array(RuleRoutingSchema),
    runnableTargets: Type.Array(WorkspaceClassifiedTargetSchema),
  },
  { additionalProperties: false }
);

export const UnresolvedOwnerClassificationSchema = Type.Object(
  {
    ...CommonResultFields,
    state: Type.Literal("unresolved-owner"),
    path: Type.String({ minLength: 1 }),
    reason: Type.Literal("no-project-or-workspace-owner"),
  },
  { additionalProperties: false }
);

export const GraphRefusalClassificationSchema = Type.Object(
  {
    ...CommonResultFields,
    state: Type.Literal("graph-refusal"),
    refusal: GraphRefusalStateSchema,
  },
  { additionalProperties: false }
);

export const PathClassificationSchema = Type.Union([
  ProjectPathClassificationSchema,
  WorkspacePathClassificationSchema,
  UnresolvedOwnerClassificationSchema,
  GraphRefusalClassificationSchema,
]);

export const ClassifyDiffResultSchema = Type.Object(
  {
    ...CommonResultFields,
    state: Type.Literal("diff"),
    paths: Type.Array(PathClassificationSchema, { minItems: 1 }),
  },
  { additionalProperties: false }
);

export const MalformedOrPathlessDiffResultSchema = Type.Object(
  {
    ...CommonResultFields,
    state: Type.Literal("malformed-or-pathless-diff"),
    reason: Type.Literal("no-classifiable-diff-paths"),
  },
  { additionalProperties: false }
);

export const ClassifyResultSchema = Type.Union([
  ProjectPathClassificationSchema,
  WorkspacePathClassificationSchema,
  ClassifyDiffResultSchema,
  MalformedOrPathlessDiffResultSchema,
  UnresolvedOwnerClassificationSchema,
  GraphRefusalClassificationSchema,
]);

export type RuleCoverageKind = Static<typeof RuleCoverageKindSchema>;
export type RuleRouting = Static<typeof RuleRoutingSchema>;
export type ClassifiedTargetSource = Static<typeof ClassifiedTargetSchema>["source"];
export type ClassifiedTarget = Static<typeof ClassifiedTargetSchema>;
export type UnavailableClassifiedTarget = Static<typeof UnavailableClassifiedTargetSchema>;
export type ProjectPathClassification = Static<typeof ProjectPathClassificationSchema>;
export type WorkspacePathClassification = Static<typeof WorkspacePathClassificationSchema>;
export type UnresolvedOwnerClassification = Static<typeof UnresolvedOwnerClassificationSchema>;
export type GraphRefusalClassification = Static<typeof GraphRefusalClassificationSchema>;
export type PathClassification = Static<typeof PathClassificationSchema>;
export type ClassifyDiffResult = Static<typeof ClassifyDiffResultSchema>;
export type MalformedOrPathlessDiffResult = Static<typeof MalformedOrPathlessDiffResultSchema>;
export type ClassifyResult = Static<typeof ClassifyResultSchema>;

export function parseClassifyResult(value: unknown): ClassifyResult {
  return Value.Parse(ClassifyResultSchema, value);
}

export function parsePathClassification(value: unknown): PathClassification {
  return Value.Parse(PathClassificationSchema, value);
}

export function validateClassifyResult(value: unknown): string[] {
  return [...Value.Errors(ClassifyResultSchema, value)].map((error) => error.message);
}

export function stringifyClassifyResult(result: ClassifyResult): string {
  const issues = validateClassifyResult(result);
  if (issues.length > 0) {
    throw new Error(
      `habitat internal error: classify result violates its own schema:\n${issues.join("\n")}`
    );
  }
  return JSON.stringify(result, null, 2);
}
