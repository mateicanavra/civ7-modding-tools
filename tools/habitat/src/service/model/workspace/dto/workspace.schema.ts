import { type Static, Type } from "typebox";

export const ProjectNameSchema = Type.String({ minLength: 1 });
export const ProjectRootSchema = Type.String({ minLength: 1 });
export const TargetNameSchema = Type.String({ minLength: 1 });

export const WorkspaceProjectSchema = Type.Object(
  {
    name: ProjectNameSchema,
    root: ProjectRootSchema,
    sourceRoot: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
    tags: Type.Array(Type.String()),
    targets: Type.Array(Type.Object({ name: TargetNameSchema }, { additionalProperties: false })),
  },
  { additionalProperties: false }
);

export const WorkspaceGraphSnapshotSchema = Type.Object(
  {
    projects: Type.Array(WorkspaceProjectSchema),
  },
  { additionalProperties: false }
);

export const WorkspaceGraphTargetNamesSchema = Type.Object(
  {
    aggregateCheck: TargetNameSchema,
    biomeCheck: TargetNameSchema,
    biomeCi: TargetNameSchema,
    biomeFormat: TargetNameSchema,
    boundaries: TargetNameSchema,
    check: TargetNameSchema,
    generatedCheck: TargetNameSchema,
    sourceCheck: TargetNameSchema,
    lint: TargetNameSchema,
    rulePrefix: TargetNameSchema,
  },
  { additionalProperties: false }
);

export const WorkspaceGraphTargetNameOptionsSchema = Type.Partial(
  Type.Object(
    {
      aggregateCheckTargetName: TargetNameSchema,
      biomeCheckTargetName: TargetNameSchema,
      biomeCiTargetName: TargetNameSchema,
      biomeFormatTargetName: TargetNameSchema,
      boundariesTargetName: TargetNameSchema,
      checkTargetName: TargetNameSchema,
      generatedCheckTargetName: TargetNameSchema,
      sourceCheckTargetName: TargetNameSchema,
      lintTargetName: TargetNameSchema,
      ruleTargetPrefix: TargetNameSchema,
    },
    { additionalProperties: false }
  )
);

export const RuleGraphTargetNamesSchema = Type.Pick(WorkspaceGraphTargetNamesSchema, [
  "boundaries",
  "biomeCi",
  "generatedCheck",
  "sourceCheck",
]);

export const TargetDependencyDeclarationSchema = Type.Cyclic(
  {
    TargetDependencyDeclaration: Type.Union([
      Type.Object(
        {
          kind: Type.Literal("same-project-target-dependency"),
          target: TargetNameSchema,
        },
        { additionalProperties: false }
      ),
      Type.Object(
        {
          kind: Type.Literal("explicit-project-target-dependency"),
          project: ProjectNameSchema,
          target: TargetNameSchema,
        },
        { additionalProperties: false }
      ),
      Type.Object(
        {
          kind: Type.Literal("aggregate-workspace-dependency"),
          target: TargetNameSchema,
          dependencies: Type.Array(Type.Ref("TargetDependencyDeclaration"), { minItems: 1 }),
        },
        { additionalProperties: false }
      ),
      Type.Object(
        {
          kind: Type.Literal("multi-dependency-target-relationship"),
          target: TargetNameSchema,
          dependencies: Type.Array(Type.Ref("TargetDependencyDeclaration"), { minItems: 1 }),
        },
        { additionalProperties: false }
      ),
    ]),
  },
  "TargetDependencyDeclaration"
);

export const ResolvedTargetDependencySchema = Type.Object(
  {
    kind: Type.Literal("resolved-target-dependency"),
    declaration: TargetDependencyDeclarationSchema,
    project: ProjectNameSchema,
    target: TargetNameSchema,
  },
  { additionalProperties: false }
);

export const UnresolvedTargetDependencySchema = Type.Object(
  {
    kind: Type.Literal("unresolved-target-dependency"),
    reason: Type.Union([Type.Literal("missing-project"), Type.Literal("missing-target")]),
    declaration: TargetDependencyDeclarationSchema,
    project: ProjectNameSchema,
    target: TargetNameSchema,
  },
  { additionalProperties: false }
);

export const TargetDependencyResolutionSchema = Type.Union([
  ResolvedTargetDependencySchema,
  UnresolvedTargetDependencySchema,
]);

export const GraphRefusalReasonSchema = Type.Union([
  Type.Literal("missing-project"),
  Type.Literal("missing-target"),
  Type.Literal("unresolved-alias-dependency"),
  Type.Literal("malformed-graph-json"),
  Type.Literal("nx-read-failure"),
  Type.Literal("nx-daemon-failure"),
]);

export const GraphRefusalStateSchema = Type.Object(
  {
    kind: Type.Literal("graph-refusal"),
    reason: GraphRefusalReasonSchema,
    message: Type.String({ minLength: 1 }),
    target: Type.Optional(TargetNameSchema),
    project: Type.Optional(ProjectNameSchema),
  },
  { additionalProperties: false }
);

export const WorkspaceTargetStateSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("available-project-target"),
      project: ProjectNameSchema,
      projectRoot: ProjectRootSchema,
      target: TargetNameSchema,
      command: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("unavailable-project-target"),
      project: ProjectNameSchema,
      projectRoot: ProjectRootSchema,
      target: TargetNameSchema,
      reason: Type.Literal("missing-target"),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("alias-target"),
      project: ProjectNameSchema,
      projectRoot: ProjectRootSchema,
      target: TargetNameSchema,
      dependency: ResolvedTargetDependencySchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("aggregate-workspace-target"),
      target: TargetNameSchema,
      command: Type.String({ minLength: 1 }),
      dependencies: Type.Array(ResolvedTargetDependencySchema),
    },
    { additionalProperties: false }
  ),
  GraphRefusalStateSchema,
]);

export const AggregateWorkspaceTargetDeclarationSchema = Type.Object(
  {
    command: Type.String({ minLength: 1 }),
    declaration: TargetDependencyDeclarationSchema,
  },
  { additionalProperties: false }
);

export const WorkspaceGraphReadStateSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("graph-ready"),
      snapshot: WorkspaceGraphSnapshotSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("malformed-graph-json"),
      message: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("nx-read-failure"),
      message: Type.String({ minLength: 1 }),
      exitCode: Type.Optional(Type.Union([Type.Integer(), Type.Null()])),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("nx-daemon-failure"),
      message: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  ),
]);

export const VerifyTargetPlanSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("verify-target-plan"),
      targets: Type.Array(TargetNameSchema, { minItems: 1 }),
      states: Type.Array(WorkspaceTargetStateSchema),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("verify-target-plan-refused"),
      refusal: GraphRefusalStateSchema,
      targets: Type.Array(TargetNameSchema),
    },
    { additionalProperties: false }
  ),
]);

export type WorkspaceProject = Static<typeof WorkspaceProjectSchema>;
export type WorkspaceGraphSnapshot = Static<typeof WorkspaceGraphSnapshotSchema>;
export type WorkspaceGraphTargetNames = Static<typeof WorkspaceGraphTargetNamesSchema>;
export type WorkspaceGraphTargetNameOptions = Static<typeof WorkspaceGraphTargetNameOptionsSchema>;
export type RuleGraphTargetNames = Static<typeof RuleGraphTargetNamesSchema>;
export type TargetDependencyDeclaration = Static<typeof TargetDependencyDeclarationSchema>;
export type ResolvedTargetDependency = Static<typeof ResolvedTargetDependencySchema>;
export type UnresolvedTargetDependency = Static<typeof UnresolvedTargetDependencySchema>;
export type TargetDependencyResolution = Static<typeof TargetDependencyResolutionSchema>;
export type GraphRefusalReason = Static<typeof GraphRefusalReasonSchema>;
export type GraphRefusalState = Static<typeof GraphRefusalStateSchema>;
export type WorkspaceTargetState = Static<typeof WorkspaceTargetStateSchema>;
export type AggregateWorkspaceTargetDeclaration = Static<
  typeof AggregateWorkspaceTargetDeclarationSchema
>;
export type WorkspaceGraphReadState = Static<typeof WorkspaceGraphReadStateSchema>;
export type VerifyTargetPlan = Static<typeof VerifyTargetPlanSchema>;
