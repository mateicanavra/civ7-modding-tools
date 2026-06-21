import { ApplyAdmissionSchema } from "@internal/habitat-harness/service/modules/fix/patterns/index";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import { NonEmptyStringSchema } from "./primitives.js";
import { TransactionRefusalSchema } from "./refusal.js";
import { PatternApplyRequestSchema } from "./request.js";

const DryRunCommandResultSchema = Type.Object(
  {
    commandId: NonEmptyStringSchema,
    exitCode: Type.Number(),
    interrupted: Type.Boolean(),
    stdout: Type.String(),
    stderr: Type.String(),
  },
  { additionalProperties: false }
);

export const PatternApplyRefusedOutcomeSchema = Type.Object(
  {
    kind: Type.Literal("refused"),
    refusal: TransactionRefusalSchema,
  },
  { additionalProperties: false }
);

export const PatternApplyDryRunCompletedOutcomeSchema = Type.Object(
  {
    kind: Type.Literal("dry-run-completed"),
    admission: ApplyAdmissionSchema,
    commandResults: Type.Array(DryRunCommandResultSchema),
  },
  { additionalProperties: false }
);

export const PatternApplyOutcomeSchema = Type.Union([
  PatternApplyRefusedOutcomeSchema,
  PatternApplyDryRunCompletedOutcomeSchema,
]);

export const PatternApplyRecordSchema = Type.Object(
  {
    schemaVersion: Type.Literal(1),
    request: PatternApplyRequestSchema,
    outcome: PatternApplyOutcomeSchema,
  },
  { additionalProperties: false }
);

export type PatternApplyRefusedOutcome = Static<typeof PatternApplyRefusedOutcomeSchema>;
export type PatternApplyDryRunCompletedOutcome = Static<
  typeof PatternApplyDryRunCompletedOutcomeSchema
>;
export type PatternApplyOutcome = Static<typeof PatternApplyOutcomeSchema>;
export type PatternApplyRecord = Static<typeof PatternApplyRecordSchema>;

export function parsePatternApplyRecord(value: unknown): PatternApplyRecord {
  return Value.Parse(PatternApplyRecordSchema, value);
}
