import { type TSchema, Type } from "typebox";

import { Civ7ControlOrpcComponentIdSchema } from "#civ7-control-service/model/dto/primitives";
import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7CityProductionChoiceArgsSchema = Type.Union([
  Type.Object(
    {
      UnitType: Type.Integer({
        description: "Engine unit type selected for production.",
      }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ProjectType: Type.Integer({
        description: "Engine project type selected for production.",
      }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ConstructibleType: Type.Integer({
        description:
          "Engine constructible type selected for automatic plot resolution by runtime validation.",
      }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ConstructibleType: Type.Integer({
        description: "Engine constructible type selected for plot placement.",
      }),
      X: Type.Integer({
        description: "Map X coordinate for the constructible placement.",
      }),
      Y: Type.Integer({
        description: "Map Y coordinate for the constructible placement.",
      }),
    },
    { additionalProperties: false }
  ),
]);

const Civ7CityProductionChoiceInputSchema = Type.Object(
  {
    cityId: Civ7ControlOrpcComponentIdSchema,
    args: Civ7CityProductionChoiceArgsSchema,
  },
  { additionalProperties: false }
);

const Civ7CityProductionChoiceCheckResultSchema = Type.Object(
  {
    cityId: Civ7ControlOrpcComponentIdSchema,
    args: Civ7CityProductionChoiceArgsSchema,
    available: Type.Boolean({
      description: "Whether the production choice is currently accepted by the runtime validator.",
    }),
  },
  { additionalProperties: false }
);

const nextStepVariant = <
  const Kind extends "refresh-attention" | "do-not-repeat" | "inspect-production",
>(
  kind: Kind
) => {
  return Type.Array(
    Type.Object(
      {
        kind: Type.Literal(kind, {
          description: "Recommended follow-up action for the production result.",
        }),
        source: Type.Literal("city.production.choice.request", {
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
};

const inspectProductionNextStep = nextStepVariant("inspect-production");
const doNotRepeatNextStep = nextStepVariant("do-not-repeat");
const refreshAttentionNextStep = nextStepVariant("refresh-attention");

const confirmedPostconditionVariant = <
  const Classification extends string,
  const Outcome extends string,
>(
  classification: Classification,
  outcome: Outcome
) => {
  return Type.Object(
    {
      classification: Type.Literal(classification, {
        description: "Confirmed classification of the observed production transition.",
      }),
      reason: Type.String({
        description: "Reason for the reported production outcome.",
      }),
      outcome: Type.Literal(outcome, {
        description: "Confirmed semantic outcome of the production request.",
      }),
      confidence: Type.Literal("confirmed", {
        description: "Evidence confidence for the production outcome.",
      }),
      confirmed: Type.Literal(true, {
        description: "Whether the production outcome is confirmed.",
      }),
      noRepeatAfterUnverified: Type.Literal(false, {
        description: "Whether callers must avoid repeating an unverified request.",
      }),
    },
    { additionalProperties: false }
  );
};

const unverifiedPostconditionVariant = <
  const Classification extends string,
  const Outcome extends string,
>(
  classification: Classification,
  outcome: Outcome
) => {
  return Type.Object(
    {
      classification: Type.Literal(classification, {
        description: "Unverified classification of the observed production transition.",
      }),
      reason: Type.String({
        description: "Reason for the reported production outcome.",
      }),
      outcome: Type.Literal(outcome, {
        description: "Unverified semantic outcome of the production request.",
      }),
      confidence: Type.Literal("unverified", {
        description: "Evidence confidence for the production outcome.",
      }),
      confirmed: Type.Literal(false, {
        description: "Whether the production outcome is confirmed.",
      }),
      noRepeatAfterUnverified: Type.Literal(true, {
        description: "Whether callers must avoid repeating an unverified request.",
      }),
    },
    { additionalProperties: false }
  );
};

const notSentPostcondition = unverifiedPostconditionVariant("not-sent", "not-sent");
const clearedPostcondition = confirmedPostconditionVariant("production-choice-cleared", "cleared");
const changedPostcondition = confirmedPostconditionVariant(
  "production-state-changed",
  "state-changed"
);
const changedBlockedPostcondition = unverifiedPostconditionVariant(
  "production-state-changed-blocker-still-live",
  "still-blocked"
);
const validationChangedPostcondition = unverifiedPostconditionVariant(
  "validation-changed",
  "validation-changed"
);
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
) => {
  return Type.Object(
    {
      cityId: Civ7ControlOrpcComponentIdSchema,
      args: Civ7CityProductionChoiceArgsSchema,
      status: Type.Literal(status, {
        description: "Service-level dispatch and verification status for the production request.",
      }),
      postcondition: postconditionSchema,
      nextSteps: nextStepsSchema,
    },
    { additionalProperties: false }
  );
};

const Civ7CityProductionChoiceResultSchema = Type.Union([
  resultVariant("not-sent", notSentPostcondition, inspectProductionNextStep),
  resultVariant("dispatch-unknown", missingPostcondition, doNotRepeatNextStep),
  resultVariant(
    "sent-confirmed",
    Type.Union([clearedPostcondition, changedPostcondition]),
    refreshAttentionNextStep
  ),
  resultVariant(
    "sent-unverified",
    Type.Union([
      changedBlockedPostcondition,
      validationChangedPostcondition,
      unchangedPostcondition,
      missingPostcondition,
    ]),
    doNotRepeatNextStep
  ),
]);

export const productionChoice = {
  check: base
    .input(standard(Civ7CityProductionChoiceInputSchema))
    .output(standard(Civ7CityProductionChoiceCheckResultSchema))
    .meta({
      family: "city",
      procedureKey: "city.production.choice.check",
      proofBoundary: "local-package-test",
      risk: "read-only",
    }),
  request: base
    .input(standard(Civ7CityProductionChoiceInputSchema))
    .output(standard(Civ7CityProductionChoiceResultSchema))
    .meta({
      family: "city",
      procedureKey: "city.production.choice.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
};
