import { type TSchema, Type } from "typebox";

import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7TurnCompletionInputSchema = Type.Object({}, { additionalProperties: false });

const Civ7TurnCompletionCheckResultSchema = Type.Object(
  {
    available: Type.Boolean({
      description:
        "Whether fresh native evidence has a valid local-player id, a readable finite turn, readable hasSentTurnComplete false, and readable canEndTurn true.",
    }),
  },
  { additionalProperties: false }
);

const nextStepVariant = <
  const Kind extends "refresh-attention" | "do-not-repeat" | "inspect-turn-completion",
>(
  kind: Kind
) =>
  Type.Array(
    Type.Object(
      {
        kind: Type.Literal(kind, {
          description: "Recommended follow-up action for the turn-completion result.",
        }),
        source: Type.Literal("turn.complete.request", {
          description: "Procedure that supplied the recommendation.",
        }),
        label: Type.String({
          description: "Human-readable follow-up recommendation.",
        }),
      },
      { additionalProperties: false }
    ),
    {
      description: "The single evidence-based follow-up action for this status.",
      minItems: 1,
      maxItems: 1,
    }
  );

const inspectNextStep = nextStepVariant("inspect-turn-completion");
const noRepeatNextStep = nextStepVariant("do-not-repeat");
const refreshNextStep = nextStepVariant("refresh-attention");

const turnAdvancedPostcondition = Type.Object(
  {
    classification: Type.Literal("turn-advanced", {
      description: "The observed turn advanced after turn completion was dispatched.",
    }),
    reason: Type.String({
      description: "Evidence-based reason for the turn-completion classification.",
    }),
    outcome: Type.Literal("cleared", {
      description: "Semantic outcome of an observed turn advance.",
    }),
    confidence: Type.Literal("confirmed", {
      description: "Evidence strength after observing a different turn.",
    }),
    confirmed: Type.Literal(true, {
      description: "Whether the observed turn advance confirms completion.",
    }),
    noRepeatAfterUnverified: Type.Literal(false, {
      description: "A confirmed turn advance does not require an unverified no-repeat guard.",
    }),
  },
  { additionalProperties: false }
);

const turnCompleteSentPostcondition = Type.Object(
  {
    classification: Type.Literal("turn-complete-sent", {
      description:
        "The runtime acknowledged turn completion for the current turn without an observed turn advance.",
    }),
    reason: Type.String({
      description: "Evidence-based reason for the turn-completion classification.",
    }),
    outcome: Type.Literal("state-changed", {
      description: "Semantic outcome of a confirmed turn-completion acknowledgement.",
    }),
    confidence: Type.Literal("confirmed", {
      description: "Evidence strength after the runtime reports turn completion sent.",
    }),
    confirmed: Type.Literal(true, {
      description: "Whether the current-turn acknowledgement confirms completion dispatch.",
    }),
    noRepeatAfterUnverified: Type.Literal(true, {
      description:
        "The acknowledged request must not repeat while the current turn remains active.",
    }),
  },
  { additionalProperties: false }
);

const unverifiedPostconditionVariant = <
  const Classification extends "not-sent" | "no-state-change" | "missing-postcondition",
  const Outcome extends "not-sent" | "no-state-change" | "unknown",
>(
  classification: Classification,
  outcome: Outcome
) =>
  Type.Object(
    {
      classification: Type.Literal(classification, {
        description: "Unverified classification for the turn-completion request.",
      }),
      reason: Type.String({
        description: "Evidence-based reason for the turn-completion classification.",
      }),
      outcome: Type.Literal(outcome, {
        description: "Semantic outcome supported by the available turn evidence.",
      }),
      confidence: Type.Literal("unverified", {
        description: "Evidence strength when completion was not confirmed.",
      }),
      confirmed: Type.Literal(false, {
        description: "Whether the available evidence confirms turn completion.",
      }),
      noRepeatAfterUnverified: Type.Literal(true, {
        description: "An unverified request must not repeat until fresh evidence is read.",
      }),
    },
    { additionalProperties: false }
  );

const notSentPostcondition = unverifiedPostconditionVariant("not-sent", "not-sent");
const unchangedPostcondition = unverifiedPostconditionVariant("no-state-change", "no-state-change");
const missingPostcondition = unverifiedPostconditionVariant("missing-postcondition", "unknown");

const resultVariant = <
  const Status extends string,
  PostconditionSchema extends TSchema,
  NextStepsSchema extends TSchema,
>(
  status: Status,
  postconditionSchema: PostconditionSchema,
  nextStepsSchema: NextStepsSchema
) =>
  Type.Object(
    {
      status: Type.Literal(status, {
        description: "Service-level dispatch and verification status.",
      }),
      postcondition: postconditionSchema,
      nextSteps: nextStepsSchema,
    },
    { additionalProperties: false }
  );

const Civ7TurnCompletionResultSchema = Type.Union([
  resultVariant("not-sent", notSentPostcondition, inspectNextStep),
  resultVariant("dispatch-unknown", missingPostcondition, noRepeatNextStep),
  resultVariant("sent-confirmed", turnAdvancedPostcondition, refreshNextStep),
  resultVariant("sent-guarded", turnCompleteSentPostcondition, noRepeatNextStep),
  resultVariant(
    "sent-unverified",
    Type.Union([unchangedPostcondition, missingPostcondition]),
    noRepeatNextStep
  ),
]);

/** Public native availability and guarded-mutation contracts for turn completion. */
export const complete = {
  check: base
    .input(standard(Civ7TurnCompletionInputSchema))
    .output(standard(Civ7TurnCompletionCheckResultSchema))
    .meta({
      family: "turn",
      procedureKey: "turn.complete.check",
      proofBoundary: "local-package-test",
      risk: "read-only",
    }),
  request: base
    .input(standard(Civ7TurnCompletionInputSchema))
    .output(standard(Civ7TurnCompletionResultSchema))
    .meta({
      family: "turn",
      procedureKey: "turn.complete.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
};
