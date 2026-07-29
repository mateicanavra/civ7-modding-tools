import { type TSchema, Type } from "typebox";

import { base } from "../../../base";
import { Civ7ControlOrpcComponentIdSchema } from "../../../model/dto/primitives";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7NarrativeChoiceInputSchema = Type.Object(
  {
    targetType: Type.String({
      minLength: 1,
      description: "Exact narrative direction selected for the target story.",
    }),
    target: Civ7ControlOrpcComponentIdSchema,
  },
  {
    additionalProperties: false,
    description:
      "Exact narrative target and direction; the runtime supplies the local player and Activate action.",
  }
);

const Civ7NarrativeChoiceCheckResultSchema = Type.Object(
  {
    targetType: Type.String({
      description: "Exact narrative direction checked with the native player-operation validator.",
    }),
    target: Civ7ControlOrpcComponentIdSchema,
    available: Type.Boolean({
      description:
        "Whether fresh native canStart evidence admits the exact narrative target and direction.",
    }),
  },
  { additionalProperties: false }
);

const nextStepVariant = <
  const Kind extends "refresh-attention" | "do-not-repeat" | "inspect-narrative-choice",
>(
  kind: Kind
) =>
  Type.Array(
    Type.Object(
      {
        kind: Type.Literal(kind, {
          description: "Recommended follow-up action for the narrative result.",
        }),
        source: Type.Literal("narrative.choice.request", {
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

const inspectNextStep = nextStepVariant("inspect-narrative-choice");
const noRepeatNextStep = nextStepVariant("do-not-repeat");
const refreshNextStep = nextStepVariant("refresh-attention");

const confirmedPostcondition = Type.Object(
  {
    classification: Type.Literal("narrative-blocker-cleared", {
      description:
        "The exact pre-send narrative blocker no longer occupies the blocking notification slot.",
    }),
    reason: Type.String({
      description: "Evidence-based reason for the narrative classification.",
    }),
    outcome: Type.Literal("cleared", {
      description: "Semantic outcome of a confirmed narrative request.",
    }),
    confidence: Type.Literal("confirmed", {
      description: "Evidence strength after exact blocker clearance is observed.",
    }),
    confirmed: Type.Literal(true, {
      description: "Whether runtime evidence confirmed consumption of the narrative blocker.",
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
    | "narrative-blocker-still-live"
    | "narrative-runtime-state-changed"
    | "no-target-state-change"
    | "missing-postcondition",
  const Outcome extends
    | "not-sent"
    | "still-blocked"
    | "state-changed"
    | "no-target-state-change"
    | "unknown",
>(
  classification: Classification,
  outcome: Outcome
) =>
  Type.Object(
    {
      classification: Type.Literal(classification, {
        description: "Unverified classification for the narrative request.",
      }),
      reason: Type.String({
        description: "Evidence-based reason for the narrative classification.",
      }),
      outcome: Type.Literal(outcome, {
        description: "Semantic outcome supported by the available narrative evidence.",
      }),
      confidence: Type.Literal("unverified", {
        description: "Evidence strength when runtime state did not confirm blocker clearance.",
      }),
      confirmed: Type.Literal(false, {
        description: "Whether runtime evidence confirmed consumption of the narrative blocker.",
      }),
      noRepeatAfterUnverified: Type.Literal(true, {
        description: "Whether callers must avoid a repeat until fresh evidence is observed.",
      }),
    },
    { additionalProperties: false }
  );

const notSentPostcondition = unverifiedPostconditionVariant("not-sent", "not-sent");
const stillBlockedPostcondition = unverifiedPostconditionVariant(
  "narrative-blocker-still-live",
  "still-blocked"
);
const runtimeChangedPostcondition = unverifiedPostconditionVariant(
  "narrative-runtime-state-changed",
  "state-changed"
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
      targetType: Type.String({
        description: "Exact narrative direction targeted by the request.",
      }),
      target: Civ7ControlOrpcComponentIdSchema,
      status: Type.Literal(status, {
        description: "Service-level dispatch and verification status for the narrative request.",
      }),
      postcondition: postconditionSchema,
      nextSteps: nextStepsSchema,
    },
    { additionalProperties: false }
  );

const Civ7NarrativeChoiceResultSchema = Type.Union([
  resultVariant("not-sent", notSentPostcondition, inspectNextStep),
  resultVariant("dispatch-unknown", missingPostcondition, noRepeatNextStep),
  resultVariant("sent-confirmed", confirmedPostcondition, refreshNextStep),
  resultVariant(
    "sent-unverified",
    Type.Union([
      stillBlockedPostcondition,
      runtimeChangedPostcondition,
      unchangedPostcondition,
      missingPostcondition,
    ]),
    noRepeatNextStep
  ),
]);

/** Public native availability and guarded-mutation contracts for narrative direction choices. */
export const choice = {
  check: base
    .input(standard(Civ7NarrativeChoiceInputSchema))
    .output(standard(Civ7NarrativeChoiceCheckResultSchema))
    .meta({
      family: "narrative",
      procedureKey: "narrative.choice.check",
      proofBoundary: "local-package-test",
      risk: "read-only",
    }),
  request: base
    .input(standard(Civ7NarrativeChoiceInputSchema))
    .output(standard(Civ7NarrativeChoiceResultSchema))
    .meta({
      family: "narrative",
      procedureKey: "narrative.choice.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
};
