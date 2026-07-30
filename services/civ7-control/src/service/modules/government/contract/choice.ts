import { type TSchema, Type } from "typebox";

import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7GovernmentChoiceInputSchema = Type.Object(
  {
    governmentType: Type.Integer({
      description: "Engine government type selected by the player.",
    }),
  },
  { additionalProperties: false }
);

const Civ7GovernmentChoiceCheckResultSchema = Type.Object(
  {
    governmentType: Type.Integer({
      description: "Engine government type checked for selection.",
    }),
    available: Type.Boolean({
      description:
        "Whether fresh runtime evidence admits the exact government selection with the fixed Activate policy.",
    }),
  },
  { additionalProperties: false }
);

const nextStepVariant = <
  const Kind extends "refresh-attention" | "do-not-repeat" | "inspect-government-choice",
>(
  kind: Kind
) =>
  Type.Array(
    Type.Object(
      {
        kind: Type.Literal(kind, {
          description: "Recommended follow-up action for the government result.",
        }),
        source: Type.Literal("government.choice.request", {
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

const inspectNextStep = nextStepVariant("inspect-government-choice");
const noRepeatNextStep = nextStepVariant("do-not-repeat");
const refreshNextStep = nextStepVariant("refresh-attention");

const confirmedPostcondition = Type.Object(
  {
    classification: Type.Literal("government-selected", {
      description: "Classification proving the requested government became current.",
    }),
    reason: Type.String({
      description: "Evidence-based reason for the government classification.",
    }),
    outcome: Type.Literal("selected", {
      description: "Semantic outcome of a confirmed government selection.",
    }),
    confidence: Type.Literal("confirmed", {
      description: "Evidence strength after current-government readback confirms the target.",
    }),
    confirmed: Type.Literal(true, {
      description: "Whether runtime readback confirmed the requested government.",
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
    | "government-selected-blocker-still-live"
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
        description: "Unverified classification for the government request.",
      }),
      reason: Type.String({
        description: "Evidence-based reason for the government classification.",
      }),
      outcome: Type.Literal(outcome, {
        description: "Semantic outcome supported by the available government evidence.",
      }),
      confidence: Type.Literal("unverified", {
        description: "Evidence strength when runtime readback did not confirm the target.",
      }),
      confirmed: Type.Literal(false, {
        description: "Whether runtime readback confirmed the requested government.",
      }),
      noRepeatAfterUnverified: Type.Literal(true, {
        description: "Whether callers must avoid a repeat until fresh evidence is observed.",
      }),
    },
    { additionalProperties: false }
  );

const notSentPostcondition = unverifiedPostconditionVariant("not-sent", "not-sent");
const selectedBlockedPostcondition = unverifiedPostconditionVariant(
  "government-selected-blocker-still-live",
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
      governmentType: Type.Integer({
        description: "Engine government type targeted by the request.",
      }),
      status: Type.Literal(status, {
        description: "Service-level dispatch and verification status for the government request.",
      }),
      postcondition: postconditionSchema,
      nextSteps: nextStepsSchema,
    },
    { additionalProperties: false }
  );

const Civ7GovernmentChoiceResultSchema = Type.Union([
  resultVariant("not-sent", notSentPostcondition, inspectNextStep),
  resultVariant("dispatch-unknown", missingPostcondition, noRepeatNextStep),
  resultVariant("sent-confirmed", confirmedPostcondition, refreshNextStep),
  resultVariant(
    "sent-unverified",
    Type.Union([selectedBlockedPostcondition, unchangedPostcondition, missingPostcondition]),
    noRepeatNextStep
  ),
]);

/** Public availability and guarded-mutation contracts for government selection. */
export const choice = {
  check: base
    .input(standard(Civ7GovernmentChoiceInputSchema))
    .output(standard(Civ7GovernmentChoiceCheckResultSchema))
    .meta({
      family: "government",
      procedureKey: "government.choice.check",
      proofBoundary: "local-package-test",
      risk: "read-only",
    }),
  request: base
    .input(standard(Civ7GovernmentChoiceInputSchema))
    .output(standard(Civ7GovernmentChoiceResultSchema))
    .meta({
      family: "government",
      procedureKey: "government.choice.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
};
