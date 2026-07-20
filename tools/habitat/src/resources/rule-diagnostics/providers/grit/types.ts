import { type Static, Type } from "typebox";

const NonBlankPathSchema = Type.String({ minLength: 1, pattern: "\\S" });

export const GritPositionSchema = Type.Object(
  {
    line: Type.Integer({ minimum: 1 }),
    col: Type.Integer({ minimum: 1 }),
    offset: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false }
);

export const GritResultExtraSchema = Type.Object(
  {
    message: Type.Union([Type.String(), Type.Null()]),
    severity: Type.Literal("error"),
  },
  { additionalProperties: false }
);

export const GritResultSchema = Type.Object(
  {
    check_id: Type.String({ pattern: "^(?:[^#]*#)*[^/#]+(?:/[^#]*)?$" }),
    local_name: Type.String({ minLength: 1 }),
    path: NonBlankPathSchema,
    start: GritPositionSchema,
    end: GritPositionSchema,
    extra: GritResultExtraSchema,
  },
  { additionalProperties: false }
);

export const GritReportSchema = Type.Object(
  {
    paths: Type.Array(NonBlankPathSchema),
    results: Type.Array(GritResultSchema),
  },
  { additionalProperties: false }
);

const CompactPositionSchema = Type.Object(
  {
    line: Type.Integer({ minimum: 1 }),
    column: Type.Integer({ minimum: 1 }),
  },
  { additionalProperties: false }
);

const CompactRangeSchema = Type.Object(
  {
    start: CompactPositionSchema,
    end: CompactPositionSchema,
    startByte: Type.Integer({ minimum: 0 }),
    endByte: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false }
);

const CompactMatchReasonSchema = Type.Union([
  Type.Null(),
  Type.Object(
    {
      metadataJson: Type.Union([Type.String(), Type.Null()]),
      source: Type.Union([
        Type.Literal("AGENT"),
        Type.Literal("GRITQL"),
        Type.Literal("STDLIB"),
        Type.Literal("UNKNOWN"),
      ]),
      name: Type.Union([Type.String(), Type.Null()]),
      title: Type.Union([Type.String(), Type.Null()]),
      explanation: Type.Union([Type.String(), Type.Null()]),
      level: Type.Union([
        Type.Literal("none"),
        Type.Literal("info"),
        Type.Literal("warn"),
        Type.Literal("error"),
        Type.Null(),
      ]),
    },
    { additionalProperties: false }
  ),
]);

const CompactVariableSchema = Type.Object(
  {
    name: Type.String(),
    scopedName: Type.String(),
    ranges: Type.Array(CompactRangeSchema),
  },
  { additionalProperties: false }
);

const CompactMessageSchema = Type.Object(
  {
    message: Type.String(),
    range: Type.Array(CompactRangeSchema),
    variableRuntimeId: Type.String(),
  },
  { additionalProperties: false }
);

const CompactFileSchema = Type.Object(
  { sourceFile: Type.String() },
  { additionalProperties: false }
);

const CompactMatchSchema = Type.Object(
  {
    sourceFile: NonBlankPathSchema,
    ranges: Type.Array(CompactRangeSchema),
    reason: CompactMatchReasonSchema,
  },
  { additionalProperties: false }
);

export const GritCompactPatternInfoEventSchema = Type.Object(
  {
    __typename: Type.Literal("PatternInfo"),
    messages: Type.Array(CompactMessageSchema),
    variables: Type.Array(CompactVariableSchema),
    sourceFile: Type.String(),
    parsedPattern: Type.String(),
    valid: Type.Boolean(),
    usesAi: Type.Boolean(),
  },
  { additionalProperties: false }
);

export const GritCompactAllDoneEventSchema = Type.Object(
  {
    __typename: Type.Literal("AllDone"),
    processed: Type.Integer({ minimum: 0 }),
    found: Type.Integer({ minimum: 0 }),
    reason: Type.Union([
      Type.Literal("noInputPaths"),
      Type.Literal("allMatchesFound"),
      Type.Literal("maxResultsReached"),
      Type.Literal("aborted"),
    ]),
  },
  { additionalProperties: false }
);

export const GritCompactMatchEventSchema = Type.Interface(
  [CompactMatchSchema],
  { __typename: Type.Literal("Match") },
  { additionalProperties: false }
);

export const GritCompactInputFileEventSchema = Type.Object(
  {
    __typename: Type.Literal("InputFile"),
    sourceFile: NonBlankPathSchema,
    syntaxTree: Type.String(),
  },
  { additionalProperties: false }
);

export const GritCompactRewriteEventSchema = Type.Object(
  {
    __typename: Type.Literal("Rewrite"),
    original: CompactMatchSchema,
    rewritten: CompactFileSchema,
  },
  { additionalProperties: false }
);

export const GritCompactCreateFileEventSchema = Type.Object(
  {
    __typename: Type.Literal("CreateFile"),
    rewritten: CompactFileSchema,
    reason: CompactMatchReasonSchema,
  },
  { additionalProperties: false }
);

export const GritCompactRemoveFileEventSchema = Type.Object(
  {
    __typename: Type.Literal("RemoveFile"),
    original: CompactMatchSchema,
  },
  { additionalProperties: false }
);

export const GritCompactAnalysisLogEventSchema = Type.Object(
  {
    __typename: Type.Literal("AnalysisLog"),
    level: Type.Integer({ minimum: 0 }),
    message: Type.String(),
    position: CompactPositionSchema,
    file: Type.String(),
    engineId: Type.String(),
    range: Type.Union([CompactRangeSchema, Type.Null()]),
    syntaxTree: Type.Union([Type.String(), Type.Null()]),
    source: Type.Union([Type.String(), Type.Null()]),
  },
  { additionalProperties: false }
);

export const GritCompactEventSchema = Type.Union([
  GritCompactPatternInfoEventSchema,
  GritCompactAllDoneEventSchema,
  GritCompactMatchEventSchema,
  GritCompactInputFileEventSchema,
  GritCompactRewriteEventSchema,
  GritCompactCreateFileEventSchema,
  GritCompactRemoveFileEventSchema,
  GritCompactAnalysisLogEventSchema,
]);

export type GritPosition = Static<typeof GritPositionSchema>;
export type GritResult = Static<typeof GritResultSchema>;
export type GritReport = Static<typeof GritReportSchema>;
export type GritCompactEvent = Static<typeof GritCompactEventSchema>;
export type GritCompactAllDoneEvent = Static<typeof GritCompactAllDoneEventSchema>;

export interface GritDiagnosticOptions {
  readonly repoRoot?: string;
}

export function quoteGritYamlScalar(value: string): string {
  return JSON.stringify(value);
}

export function parseGritJsonText(value: string): unknown {
  return JSON.parse(value);
}
