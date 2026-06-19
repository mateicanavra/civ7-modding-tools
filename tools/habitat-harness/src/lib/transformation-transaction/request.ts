import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import { ApplyAdmissionProjectionSchema } from "../../rules/pattern-governance/index.js";
import { TransactionPathAuthorityProjectionSchema } from "../protected-zone-authority/index.js";
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
    admission: ApplyAdmissionProjectionSchema,
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
    pathAuthority: Type.Optional(TransactionPathAuthorityProjectionSchema),
  },
  { additionalProperties: false }
);

export const TransformationTransactionRequestSchema = Type.Union([
  DryRunIntentSchema,
  LiveWriteIntentSchema,
]);

export type WorktreeObservation = Static<typeof WorktreeObservationSchema>;
export type DryRunIntent = Static<typeof DryRunIntentSchema>;
export type LiveWriteIntent = Static<typeof LiveWriteIntentSchema>;
export type TransformationTransactionRequest = Static<typeof TransformationTransactionRequestSchema>;

export function parseWorktreeObservation(value: unknown): WorktreeObservation {
  return Value.Parse(WorktreeObservationSchema, value);
}

export function parseTransformationTransactionRequest(
  value: unknown
): TransformationTransactionRequest {
  return Value.Parse(TransformationTransactionRequestSchema, value);
}
