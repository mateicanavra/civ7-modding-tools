import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import { ApplyAdmissionSchema } from "../../domains/pattern-governance/index.js";
import { TransactionPathDecisionSchema } from "../protected-zones/index.js";
import { NonEmptyStringSchema } from "./primitives.js";

export const WorktreeObservationSchema = Type.Object(
  {
    kind: Type.Literal("worktree-observation"),
    dirty: Type.Boolean(),
    dirtyPathCount: Type.Number({ minimum: 0 }),
    statusDigest: NonEmptyStringSchema,
    branch: Type.Optional(NonEmptyStringSchema),
    head: Type.Optional(NonEmptyStringSchema),
  },
  { additionalProperties: false }
);

const TransactionIntentFieldsSchema = Type.Object(
  {
    worktree: WorktreeObservationSchema,
    admission: ApplyAdmissionSchema,
  },
  { additionalProperties: false }
);

export const DryRunIntentSchema = Type.Interface(
  [TransactionIntentFieldsSchema],
  { kind: Type.Literal("dry-run-intent") },
  { additionalProperties: false }
);

export const LiveWriteIntentSchema = Type.Interface(
  [TransactionIntentFieldsSchema],
  {
    kind: Type.Literal("live-write-intent"),
    pathDecision: Type.Optional(TransactionPathDecisionSchema),
  },
  { additionalProperties: false }
);

export const PatternApplyRequestSchema = Type.Union([DryRunIntentSchema, LiveWriteIntentSchema]);

export type WorktreeObservation = Static<typeof WorktreeObservationSchema>;
export type DryRunIntent = Static<typeof DryRunIntentSchema>;
export type LiveWriteIntent = Static<typeof LiveWriteIntentSchema>;
export type PatternApplyRequest = Static<typeof PatternApplyRequestSchema>;

export function parseWorktreeObservation(value: unknown): WorktreeObservation {
  return Value.Parse(WorktreeObservationSchema, value);
}

export function parsePatternApplyRequest(value: unknown): PatternApplyRequest {
  return Value.Parse(PatternApplyRequestSchema, value);
}
