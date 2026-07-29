import { type TSchema, Type } from "typebox";

import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7GovernmentCelebrationChoiceInputSchema = Type.Object(
  {
    goldenAgeType: Type.Integer({
      description: "Engine golden-age type selected for the celebration.",
    }),
  },
  { additionalProperties: false }
);

const Civ7GovernmentCelebrationChoiceCheckResultSchema = Type.Object(
  {
    goldenAgeType: Type.Integer({
      description: "Engine golden-age type checked for selection.",
    }),
    available: Type.Boolean({
      description: "Whether fresh runtime evidence admits the exact celebration selection.",
    }),
  },
  { additionalProperties: false }
);

const nextStepVariant = <
  const Kind extends "refresh-attention" | "do-not-repeat" | "inspect-celebration-choice",
>(
  kind: Kind
) =>
  Type.Array(
    Type.Object(
      {
        kind: Type.Literal(kind, {
          description: "Recommended follow-up action for the celebration result.",
        }),
        source: Type.Literal("government.celebration.choice.request", {
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

const inspectNextStep = nextStepVariant("inspect-celebration-choice");
const noRepeatNextStep = nextStepVariant("do-not-repeat");
const refreshNextStep = nextStepVariant("refresh-attention");

const confirmedPostcondition = Type.Object(
  {
    classification: Type.Literal("celebration-selected", {
      description: "Classification proving the requested golden age became active.",
    }),
    reason: Type.String({
      description: "Evidence-based reason for the celebration classification.",
    }),
    outcome: Type.Literal("selected", {
      description: "Semantic outcome of a confirmed celebration selection.",
    }),
    confidence: Type.Literal("confirmed", {
      description: "Evidence strength after active-golden-age readback confirms the target.",
    }),
    confirmed: Type.Literal(true, {
      description: "Whether runtime readback confirmed the requested celebration.",
    }),
    noRepeatAfterUnverified: Type.Literal(false, {
      description: "Whether callers must avoid a repeat while evidence remains unverified.",
    }),
  },
  { additionalProperties: false }
);

const unverifiedPostconditionVariant = <
  const Classification extends
    | "not-sent"
    | "celebration-selected-blocker-still-live"
    | "no-target-state-change"
    | "missing-postcondition",
  const Outcome extends "not-sent" | "still-blocked" | "no-target-state-change" | "unknown",
>(
  classification: Classification,
  outcome: Outcome
) =>
  Type.Object(
    {
      classification: Type.Literal(classification, {
        description: "Unverified classification for the celebration request.",
      }),
      reason: Type.String({
        description: "Evidence-based reason for the celebration classification.",
      }),
      outcome: Type.Literal(outcome, {
        description: "Semantic outcome supported by the available celebration evidence.",
      }),
      confidence: Type.Literal("unverified", {
        description: "Evidence strength when runtime readback did not confirm the target.",
      }),
      confirmed: Type.Literal(false, {
        description: "Whether runtime readback confirmed the requested celebration.",
      }),
      noRepeatAfterUnverified: Type.Literal(true, {
        description: "Whether callers must avoid a repeat until fresh evidence is observed.",
      }),
    },
    { additionalProperties: false }
  );

const notSentPostcondition = unverifiedPostconditionVariant("not-sent", "not-sent");
const selectedBlockedPostcondition = unverifiedPostconditionVariant(
  "celebration-selected-blocker-still-live",
  "still-blocked"
);
const unchangedPostcondition = unverifiedPostconditionVariant(
  "no-target-state-change",
  "no-target-state-change"
);
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
      goldenAgeType: Type.Integer({
        description: "Engine golden-age type targeted by the request.",
      }),
      status: Type.Literal(status, {
        description: "Service-level dispatch and verification status for the celebration request.",
      }),
      postcondition: postconditionSchema,
      nextSteps: nextStepsSchema,
    },
    { additionalProperties: false }
  );

const Civ7GovernmentCelebrationChoiceResultSchema = Type.Union([
  resultVariant("not-sent", notSentPostcondition, inspectNextStep),
  resultVariant("dispatch-unknown", missingPostcondition, noRepeatNextStep),
  resultVariant("sent-confirmed", confirmedPostcondition, refreshNextStep),
  resultVariant(
    "sent-unverified",
    Type.Union([selectedBlockedPostcondition, unchangedPostcondition, missingPostcondition]),
    noRepeatNextStep
  ),
]);

/** Public availability and guarded-mutation contracts for celebration selection. */
export const celebrationChoice = {
  check: base
    .input(standard(Civ7GovernmentCelebrationChoiceInputSchema))
    .output(standard(Civ7GovernmentCelebrationChoiceCheckResultSchema))
    .meta({
      family: "government",
      procedureKey: "government.celebration.choice.check",
      proofBoundary: "local-package-test",
      risk: "read-only",
    }),
  request: base
    .input(standard(Civ7GovernmentCelebrationChoiceInputSchema))
    .output(standard(Civ7GovernmentCelebrationChoiceResultSchema))
    .meta({
      family: "government",
      procedureKey: "government.celebration.choice.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
};
