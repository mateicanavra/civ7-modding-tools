import { Type } from "typebox";
import { Civ7ControlOrpcComponentIdSchema } from "#civ7-control-service/model/dto/primitives";
import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7TurnCompletionInputSchema = Type.Object({}, { additionalProperties: false });
const Civ7TurnCompletionRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-guarded"),
  Type.Literal("sent-unverified"),
]);
const Civ7TurnCompletionPostconditionClassificationSchema = Type.Union([
  Type.Literal("turn-advanced"),
  Type.Literal("turn-complete-sent"),
  Type.Literal("already-complete"),
  Type.Literal("turn-completion-blocked"),
  Type.Literal("no-state-change"),
  Type.Literal("missing-postcondition"),
  Type.Literal("pending-runtime-proof"),
]);
const Civ7TurnCompletionProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("not-sent"),
  Type.Literal("no-state-change"),
  Type.Literal("unknown"),
]);
const Civ7TurnCompletionProbeSummarySchema = Type.Object(
  {
    turn: Type.Union([Type.Number(), Type.Null()], {
      description: "Turn.",
    }),
    turnDate: Type.Union([Type.String(), Type.Null()], {
      description: "Turn date.",
    }),
    hasSentTurnComplete: Type.Union([Type.Boolean(), Type.Null()], {
      description: "Has sent turn complete.",
    }),
    canEndTurn: Type.Union([Type.Boolean(), Type.Null()], {
      description: "Can end turn.",
    }),
    blocker: Type.Union([Type.Number(), Type.String(), Type.Null()], {
      description: "Blocker.",
    }),
    firstReadyUnitId: Type.Union([Civ7ControlOrpcComponentIdSchema, Type.Null()], {
      description: "First ready unit id.",
    }),
  },
  { additionalProperties: false }
);
const Civ7TurnCompletionPostconditionSummarySchema = Type.Object(
  {
    classification: Civ7TurnCompletionPostconditionClassificationSchema,
    reason: Type.String({
      description: "Reason for the reported outcome.",
    }),
    outcome: Civ7TurnCompletionProofOutcomeSchema,
    confidence: Type.Union(
      [
        Type.Literal("confirmed"),
        Type.Literal("unverified"),
        Type.Literal("pending-runtime-proof"),
      ],
      {
        description: "Confidence.",
      }
    ),
    confirmed: Type.Boolean({
      description: "Whether confirmed.",
    }),
    noRepeatAfterUnverified: Type.Boolean({
      description: "Whether no repeat after unverified.",
    }),
  },
  { additionalProperties: false }
);
const Civ7TurnCompletionNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
        Type.Literal("refresh-attention"),
        Type.Literal("do-not-repeat"),
        Type.Literal("inspect-turn-completion"),
      ],
      {
        description: "Semantic kind of this value.",
      }
    ),
    source: Type.Literal("turn.complete.request", {
      description: "Authority that supplied this value.",
    }),
    label: Type.String({
      description: "Human-readable label.",
    }),
  },
  { additionalProperties: false }
);
const Civ7TurnCompletionResultSchema = Type.Object(
  {
    sent: Type.Boolean({
      description: "Whether sent.",
    }),
    status: Civ7TurnCompletionRequestStatusSchema,
    before: Civ7TurnCompletionProbeSummarySchema,
    after: Type.Union([Civ7TurnCompletionProbeSummarySchema, Type.Null()], {
      description: "After.",
    }),
    postcondition: Civ7TurnCompletionPostconditionSummarySchema,
    nextSteps: Type.Array(Civ7TurnCompletionNextStepSchema, {
      description: "Next steps values.",
    }),
  },
  { additionalProperties: false }
);
const Civ7TurnCompletionContract = base
  .input(standard(Civ7TurnCompletionInputSchema))
  .output(standard(Civ7TurnCompletionResultSchema))
  .meta({
    family: "turn",
    procedureKey: "turn.complete.request",
    proofBoundary: "local-package-test",
    risk: "mutation",
  });
export const completeRequest = {
  complete: {
    request: Civ7TurnCompletionContract,
  },
};
