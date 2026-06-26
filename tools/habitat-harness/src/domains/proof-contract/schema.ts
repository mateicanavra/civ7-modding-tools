import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import { VerifyCheckSummarySchema } from "../structural-check/index.js";

/** Result of choosing the Git base that `habitat verify` will use for affected targets. */
export const VerifyBaseResolutionSchema = Type.Union(
  [
    Type.Object(
      {
        kind: Type.Literal("resolved", { description: "Base resolution succeeded." }),
        base: Type.String({ minLength: 1, description: "Git revision used as the affected base." }),
        source: Type.Union([Type.Literal("flag"), Type.Literal("merge-base")], {
          description: "Whether the base came from --base or the repository merge-base.",
        }),
      },
      { additionalProperties: false, description: "Resolved verify base." }
    ),
    Type.Object(
      {
        kind: Type.Literal("refused", { description: "Base resolution failed." }),
        message: Type.String({
          minLength: 1,
          description: "Human-readable refusal message for the caller.",
        }),
      },
      { additionalProperties: false, description: "Verify base refusal." }
    ),
  ],
  { description: "Resolved or refused verify base selection." }
);
/** TypeBox-derived base-selection result consumed by the verify command. */
export type VerifyBaseResolution = Static<typeof VerifyBaseResolutionSchema>;

/** Metadata for the top-level verify command invocation that produced a receipt. */
export const VerifyCommandRecordSchema = Type.Object(
  {
    argv: Type.Array(Type.String(), { description: "Habitat verify argv recorded for handoff." }),
    cwd: Type.String({ minLength: 1, description: "Repository root where verify ran." }),
    env: Type.Record(Type.String(), Type.String(), {
      description: "Small allowlisted environment snapshot relevant to verify execution.",
    }),
    startedAt: Type.String({
      minLength: 1,
      description: "ISO timestamp captured at command start.",
    }),
    durationMs: Type.Number({ minimum: 0, description: "Elapsed verify command time." }),
    exitCode: Type.Integer({ description: "Exit code returned by the verify command." }),
  },
  { additionalProperties: false, description: "Verify command invocation record." }
);

/** Base field serialized into `habitat verify --json`. */
export const VerifyBaseSchema = Type.Object(
  {
    requested: Type.Union([Type.String(), Type.Null()], {
      description: "Explicit --base value when supplied.",
    }),
    resolved: Type.String({ minLength: 1, description: "Effective base used by affected checks." }),
    source: Type.Union([Type.Literal("flag"), Type.Literal("merge-base")], {
      description: "Where the effective base came from.",
    }),
  },
  { additionalProperties: false, description: "Verify receipt base summary." }
);

/** Selector state records whether the upstream Habitat check was narrowed before verify consumed it. */
export const VerifySelectorStateSchema = Type.Union(
  [
    Type.Object(
      { kind: Type.Literal("none", { description: "No check selectors were requested." }) },
      { additionalProperties: false, description: "Unfiltered check state." }
    ),
    Type.Object(
      {
        kind: Type.Literal("requested", {
          description: "At least one selector narrowed the check.",
        }),
        selectors: VerifyCheckSummarySchema.properties.requestedSelectors,
      },
      { additionalProperties: false, description: "Requested check selectors." }
    ),
    Type.Object(
      {
        kind: Type.Literal("unsupported", {
          description: "The selector state could not be consumed.",
        }),
        reason: Type.String({
          minLength: 1,
          description: "Reason selectors could not be consumed.",
        }),
      },
      { additionalProperties: false, description: "Unsupported selector state." }
    ),
  ],
  { description: "Check selector state embedded in the verify receipt." }
);

const VerifyHabitatCheckSummaryFieldsSchema = Type.Pick(VerifyCheckSummarySchema, [
  "reportSchemaVersion",
  "selectedRuleIds",
  "selectedRealRuleIds",
  "builtInRuleIds",
  "statusCounts",
  "advisoryCount",
  "failingCount",
  "refusedCount",
  "notApplicableCount",
]);

export const VerifyHabitatCheckSummarySchema = Type.Object(
  {
    ...VerifyHabitatCheckSummaryFieldsSchema.properties,
    consumption: Type.Union(
      [Type.Literal("allows-affected-execution"), Type.Literal("blocks-affected-execution")],
      {
        description: "Whether Habitat check results allowed the Nx affected step to run.",
      }
    ),
    selectorState: VerifySelectorStateSchema,
    skippedAffectedReason: Type.Optional(
      Type.String({ minLength: 1, description: "Reason affected execution was skipped." })
    ),
  },
  { additionalProperties: false, description: "Structural check summary consumed by verify." }
);

/** Workspace target-plan state reduced to the fields that the verify receipt owns. */
export const VerifyTargetPlanConsumptionSchema = Type.Union(
  [
    Type.Object(
      {
        kind: Type.Literal("target-plan-ready", {
          description: "Workspace graph produced targets.",
        }),
        targets: Type.Array(Type.String({ minLength: 1 }), {
          minItems: 1,
          description: "Nx targets verify will request through affected execution.",
        }),
      },
      { additionalProperties: false, description: "Runnable verify target plan." }
    ),
    Type.Object(
      {
        kind: Type.Literal("target-plan-refused", {
          description: "Workspace graph refused planning.",
        }),
        targets: Type.Array(Type.String({ minLength: 1 }), {
          description: "Requested target names associated with the refusal.",
        }),
        reason: Type.String({ minLength: 1, description: "Machine-readable refusal reason." }),
        message: Type.String({ minLength: 1, description: "Human-readable refusal message." }),
      },
      { additionalProperties: false, description: "Refused verify target plan." }
    ),
  ],
  { description: "Target-plan state embedded in the verify receipt." }
);

/** Task-local cache observation extracted only from what Nx printed. */
export const VerifyNxCacheTaskSchema = Type.Object(
  {
    taskId: Type.String({ minLength: 1, description: "Nx task id, usually project:target." }),
    project: Type.String({ minLength: 1, description: "Nx project name." }),
    target: Type.String({ minLength: 1, description: "Nx target name." }),
    cacheState: Type.Union([Type.Literal("cache-hit"), Type.Literal("not-observed")], {
      description: "Whether the output line explicitly indicated a cache hit.",
    }),
  },
  { additionalProperties: false, description: "Nx task cache observation." }
);

const VerifyNxAffectedCompletedFieldsSchema = {
  argv: Type.Array(Type.String()),
  targets: Type.Array(Type.String({ minLength: 1 })),
  projects: Type.Array(Type.String()),
  cacheStateByTask: Type.Array(VerifyNxCacheTaskSchema),
  exitCode: Type.Integer(),
  stdoutLength: Type.Number({ minimum: 0 }),
  stderrLength: Type.Number({ minimum: 0 }),
  stdoutPreview: Type.String(),
  stderrPreview: Type.String(),
  stdoutTruncated: Type.Boolean(),
  stderrTruncated: Type.Boolean(),
};

/** Nx affected execution state with bounded stream metadata and explicit skipped states. */
export const VerifyNxAffectedSchema = Type.Union(
  [
    Type.Object(
      {
        kind: Type.Literal("executed", { description: "Nx affected ran and exited 0." }),
        ...VerifyNxAffectedCompletedFieldsSchema,
      },
      { additionalProperties: false, description: "Successful Nx affected execution." }
    ),
    Type.Object(
      {
        kind: Type.Literal("failed", { description: "Nx affected ran and exited non-zero." }),
        ...VerifyNxAffectedCompletedFieldsSchema,
      },
      { additionalProperties: false, description: "Failed Nx affected execution." }
    ),
    Type.Object(
      {
        kind: Type.Literal("skipped", { description: "Nx affected did not run." }),
        skipReason: Type.Union(
          [
            Type.Literal("habitat-check-failed"),
            Type.Literal("workspace-graph-refused"),
            Type.Literal("receipt-only"),
          ],
          {
            description: "Upstream condition that blocked affected execution.",
          }
        ),
        argv: Type.Array(Type.String(), {
          description: "Affected command argv that would have run.",
        }),
        targets: Type.Array(Type.String({ minLength: 1 }), {
          description: "Targets associated with the skipped affected step.",
        }),
        projects: Type.Array(Type.String(), {
          maxItems: 0,
          description: "Skipped affected execution has no observed projects.",
        }),
        cacheStateByTask: Type.Array(VerifyNxCacheTaskSchema, {
          maxItems: 0,
          description: "Skipped affected execution has no observed task cache state.",
        }),
        exitCode: Type.Null({ description: "No Nx exit code exists when skipped." }),
        stdoutLength: Type.Literal(0, { description: "No stdout body exists when skipped." }),
        stderrLength: Type.Literal(0, { description: "No stderr body exists when skipped." }),
        stdoutPreview: Type.Literal("", { description: "No stdout preview exists when skipped." }),
        stderrPreview: Type.Literal("", { description: "No stderr preview exists when skipped." }),
        stdoutTruncated: Type.Literal(false, {
          description: "No stdout truncation occurs when skipped.",
        }),
        stderrTruncated: Type.Literal(false, {
          description: "No stderr truncation occurs when skipped.",
        }),
      },
      { additionalProperties: false, description: "Skipped Nx affected execution." }
    ),
  ],
  { description: "Nx affected step embedded in the verify receipt." }
);

/** Bounded `git status --short --branch` command output used by the post-state field. */
export const VerifyPostStateCommandSchema = Type.Object(
  {
    argv: Type.Array(Type.String(), { description: "Git status argv." }),
    cwd: Type.String({ minLength: 1, description: "Repository root where git status ran." }),
    exitCode: Type.Integer({ description: "Git status exit code." }),
    stdoutLength: Type.Number({ minimum: 0, description: "Full stdout byte length." }),
    stderrLength: Type.Number({ minimum: 0, description: "Full stderr byte length." }),
    stdoutPreview: Type.String({ description: "Bounded stdout preview." }),
    stderrPreview: Type.String({ description: "Bounded stderr preview." }),
    stdoutTruncated: Type.Boolean({ description: "Whether stdoutPreview is truncated." }),
    stderrTruncated: Type.Boolean({ description: "Whether stderrPreview is truncated." }),
  },
  { additionalProperties: false, description: "Git status command observation." }
);

/** Worktree post-state observed after verify has assembled its command result. */
export const VerifyPostStateSchema = Type.Union(
  [
    Type.Object(
      {
        kind: Type.Literal("observed-clean", {
          description: "Git status succeeded with no output.",
        }),
        gitStatus: VerifyPostStateCommandSchema,
      },
      { additionalProperties: false, description: "Clean worktree observation." }
    ),
    Type.Object(
      {
        kind: Type.Literal("observed-dirty", { description: "Git status succeeded with output." }),
        gitStatus: VerifyPostStateCommandSchema,
      },
      { additionalProperties: false, description: "Dirty worktree observation." }
    ),
    Type.Object(
      {
        kind: Type.Literal("unavailable", { description: "Git status could not be observed." }),
        gitStatus: VerifyPostStateCommandSchema,
      },
      { additionalProperties: false, description: "Unavailable worktree observation." }
    ),
  ],
  { description: "Verify post-state observation." }
);

/** Top-level verify receipt outcome for humans and agents consuming `habitat verify --json`. */
export const VerifyReceiptOutcomeSchema = Type.Union(
  [
    Type.Literal("succeeded"),
    Type.Literal("failed"),
    Type.Literal("blocked"),
    Type.Literal("planned"),
  ],
  { description: "Verify receipt outcome." }
);

/** Versioned `habitat verify --json` receipt. */
export const VerifyReceiptSchema = Type.Object(
  {
    schemaVersion: Type.Literal(1, { description: "Verify receipt schema version." }),
    outcome: VerifyReceiptOutcomeSchema,
    command: VerifyCommandRecordSchema,
    base: VerifyBaseSchema,
    habitatCheck: VerifyHabitatCheckSummarySchema,
    targetPlan: VerifyTargetPlanConsumptionSchema,
    nxAffected: VerifyNxAffectedSchema,
    postState: VerifyPostStateSchema,
  },
  { additionalProperties: false, description: "Habitat verify handoff receipt." }
);
/** TypeBox-derived JSON receipt emitted by `habitat verify --json`. */
export type VerifyReceipt = Static<typeof VerifyReceiptSchema>;

/** Returns TypeBox validation messages for a candidate verify receipt value. */
export function validateVerifyReceipt(value: unknown): string[] {
  return [...Value.Errors(VerifyReceiptSchema, value)].map((error) =>
    error.instancePath ? `${error.instancePath}: ${error.message}` : String(error.message)
  );
}

/** Type guard backed directly by the TypeBox verify receipt schema. */
export function isVerifyReceipt(value: unknown): value is VerifyReceipt {
  return Value.Check(VerifyReceiptSchema, value);
}

/** Validates and serializes a verify receipt for command JSON output. */
export function stringifyVerifyReceipt(receipt: VerifyReceipt): string {
  const schemaErrors = validateVerifyReceipt(receipt);
  if (schemaErrors.length > 0) {
    throw new Error(
      `habitat internal error: verify receipt violates its own schema:\n${schemaErrors.join("\n")}`
    );
  }
  return JSON.stringify(receipt, null, 2);
}
