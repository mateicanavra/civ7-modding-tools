import { Type, type Static } from "typebox";

const ArtifactRefSchema = Type.Object(
  {
    id: Type.String(),
    name: Type.String(),
  },
  { additionalProperties: false },
);

const EndpointSchema = Type.Object(
  {
    stageId: Type.String(),
    stepId: Type.String(),
    fullStepId: Type.String(),
  },
  { additionalProperties: false },
);

const StepSchema = Type.Object(
  {
    id: Type.String(),
    stageId: Type.String(),
    stepId: Type.String(),
    fullStepId: Type.String(),
    order: Type.Integer({ minimum: 0 }),
    orderInStage: Type.Integer({ minimum: 0 }),
    phase: Type.String(),
    artifactRequires: Type.Array(ArtifactRefSchema),
    artifactProvides: Type.Array(ArtifactRefSchema),
    tagRequires: Type.Array(Type.String()),
    tagProvides: Type.Array(Type.String()),
  },
  { additionalProperties: false },
);

const StageSchema = Type.Object(
  {
    id: Type.String(),
    stageId: Type.String(),
    order: Type.Integer({ minimum: 0 }),
    phases: Type.Array(Type.String()),
    steps: Type.Array(StepSchema),
    artifactRequires: Type.Array(ArtifactRefSchema),
    artifactProvides: Type.Array(ArtifactRefSchema),
    inboundArtifactEdgeCount: Type.Integer({ minimum: 0 }),
    outboundArtifactEdgeCount: Type.Integer({ minimum: 0 }),
    internalArtifactEdgeCount: Type.Integer({ minimum: 0 }),
    diagnosticCount: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false },
);

const PhaseSchema = Type.Object(
  {
    id: Type.String(),
    order: Type.Integer({ minimum: 0 }),
    stageIds: Type.Array(Type.String()),
    stepCount: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false },
);

const EdgeSchema = Type.Object(
  {
    id: Type.String(),
    artifact: ArtifactRefSchema,
    from: EndpointSchema,
    to: EndpointSchema,
    internal: Type.Boolean(),
  },
  { additionalProperties: false },
);

const DiagnosticSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("artifact-provider-missing"),
      artifact: ArtifactRefSchema,
      consumer: EndpointSchema,
    },
    { additionalProperties: false },
  ),
  Type.Object(
    {
      kind: Type.Literal("artifact-provider-duplicate"),
      artifact: ArtifactRefSchema,
      providers: Type.Array(EndpointSchema),
      consumer: Type.Optional(EndpointSchema),
    },
    { additionalProperties: false },
  ),
  Type.Object(
    {
      kind: Type.Literal("artifact-consumer-missing"),
      artifact: ArtifactRefSchema,
      provider: EndpointSchema,
    },
    { additionalProperties: false },
  ),
]);

export const RecipeDagGetInputSchema = Type.Object(
  {
    recipeId: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false },
);
export type RecipeDagGetInput = Static<typeof RecipeDagGetInputSchema>;

export const RecipeDagResultSchema = Type.Object(
  {
    recipeId: Type.String(),
    recipeKey: Type.String(),
    namespace: Type.Optional(Type.String()),
    title: Type.String(),
    phases: Type.Array(PhaseSchema),
    stages: Type.Array(StageSchema),
    edges: Type.Array(EdgeSchema),
    diagnostics: Type.Array(DiagnosticSchema),
  },
  { additionalProperties: false },
);
export type RecipeDagResult = Static<typeof RecipeDagResultSchema>;
