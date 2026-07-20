import { type Static, Type } from "typebox";

const NonEmptyStringSchema = Type.String({ minLength: 1 });
const EmptyWriteSetSchema = Type.Array(NonEmptyStringSchema, {
  maxItems: 0,
  description: "No files may be written for a refused scaffold request.",
});

export const SupportedProjectKindSchema = Type.Union([Type.Literal("plugin")]);

export type SupportedProjectKind = Static<typeof SupportedProjectKindSchema>;

export const ScaffoldingRequestClassSchema = Type.Union([
  Type.Literal("supported-project-scaffold"),
  Type.Literal("unsupported-project-kind"),
  Type.Literal("unsupported-product-authoring"),
  Type.Literal("pattern-candidate-draft"),
]);

export type ScaffoldingRequestClass = Static<typeof ScaffoldingRequestClassSchema>;

export const ScaffoldingRefusalReasonSchema = Type.Union([
  Type.Literal("unsupported-project-kind"),
  Type.Literal("unsupported-product-authoring"),
  Type.Literal("candidate-collision"),
  Type.Literal("root-mismatch"),
  Type.Literal("package-name-mismatch"),
  Type.Literal("non-empty-root"),
  Type.Literal("package-name-collision"),
  Type.Literal("upstream-prerequisite-unavailable"),
]);

export type ScaffoldingRefusalReason = Static<typeof ScaffoldingRefusalReasonSchema>;

export const ScaffoldRefusalSchema = Type.Object(
  {
    kind: Type.Literal("scaffold-refusal"),
    blockedAction: NonEmptyStringSchema,
    requestClass: ScaffoldingRequestClassSchema,
    reason: ScaffoldingRefusalReasonSchema,
    recovery: NonEmptyStringSchema,
    retryCondition: NonEmptyStringSchema,
    writeSet: EmptyWriteSetSchema,
  },
  { additionalProperties: false }
);

export type ScaffoldRefusal = Static<typeof ScaffoldRefusalSchema>;

export const ProjectScaffoldInputSchema = Type.Object(
  {
    name: NonEmptyStringSchema,
    kind: NonEmptyStringSchema,
    packageName: Type.Optional(NonEmptyStringSchema),
    directory: Type.Optional(NonEmptyStringSchema),
  },
  { additionalProperties: true }
);

export type ProjectScaffoldInput = Static<typeof ProjectScaffoldInputSchema>;

export const ProjectScaffoldRequestSchema = Type.Object(
  {
    kind: Type.Literal("supported-project-scaffold"),
    projectKind: SupportedProjectKindSchema,
    name: NonEmptyStringSchema,
    root: NonEmptyStringSchema,
    packageName: NonEmptyStringSchema,
    tag: NonEmptyStringSchema,
  },
  { additionalProperties: false }
);

export type ProjectScaffoldRequest = Static<typeof ProjectScaffoldRequestSchema>;

export const WriteProjectScaffoldDecisionSchema = Type.Object(
  {
    kind: Type.Literal("write-project-scaffold"),
    request: ProjectScaffoldRequestSchema,
    writeSet: Type.Array(NonEmptyStringSchema, { minItems: 1 }),
  },
  { additionalProperties: false }
);

export type WriteProjectScaffoldDecision = Static<typeof WriteProjectScaffoldDecisionSchema>;

export const RefuseScaffoldDecisionSchema = Type.Object(
  {
    kind: Type.Literal("refuse-scaffold"),
    refusal: ScaffoldRefusalSchema,
  },
  { additionalProperties: false }
);

export type RefuseScaffoldDecision = Static<typeof RefuseScaffoldDecisionSchema>;

export const ProjectScaffoldDecisionSchema = Type.Union([
  WriteProjectScaffoldDecisionSchema,
  RefuseScaffoldDecisionSchema,
]);

export type ProjectScaffoldDecision = Static<typeof ProjectScaffoldDecisionSchema>;

export const NormalizedPatternScaffoldOptionsSchema = Type.Object(
  {
    ruleId: NonEmptyStringSchema,
    patternName: NonEmptyStringSchema,
    lifecycle: Type.Literal("candidate"),
    identifier: NonEmptyStringSchema,
    ownerProject: NonEmptyStringSchema,
    openspecChangeId: Type.Optional(NonEmptyStringSchema),
  },
  { additionalProperties: false }
);

export type NormalizedPatternScaffoldOptions = Static<
  typeof NormalizedPatternScaffoldOptionsSchema
>;
