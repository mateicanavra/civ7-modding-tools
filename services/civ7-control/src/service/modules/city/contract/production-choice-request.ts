import { Type } from "typebox";

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
        description: "Engine constructible type selected without a placement plot.",
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

const Civ7CityProductionChoiceProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("still-blocked"),
  Type.Literal("no-state-change"),
  Type.Literal("not-sent"),
]);

const Civ7CityProductionChoiceRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-unverified"),
]);

const Civ7CityProductionChoicePostconditionClassificationSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("production-choice-cleared"),
  Type.Literal("production-state-changed"),
  Type.Literal("production-state-changed-blocker-still-live"),
  Type.Literal("validation-changed"),
  Type.Literal("no-state-change"),
]);

const Civ7CityProductionChoicePostconditionSummarySchema = Type.Object(
  {
    classification: Type.Union(
      [
        Civ7CityProductionChoicePostconditionClassificationSchema,
        Type.Literal("missing-postcondition"),
      ],
      {
        description: "Classification derived from production postcondition evidence.",
      }
    ),
    reason: Type.String({
      description: "Evidence-based reason for the postcondition classification.",
    }),
    outcome: Civ7CityProductionChoiceProofOutcomeSchema,
    confidence: Type.Union([Type.Literal("confirmed"), Type.Literal("unverified")], {
      description: "Confidence established by postcondition evidence.",
    }),
    confirmed: Type.Boolean({
      description: "Whether postcondition evidence confirms the production outcome.",
    }),
    noRepeatAfterUnverified: Type.Boolean({
      description: "Whether an unverified send must not be repeated without fresh evidence.",
    }),
    productionStateChanged: Type.Union([Type.Boolean(), Type.Null()], {
      description: "Whether production state changed, or null when unreadable.",
    }),
    blockerStillLive: Type.Union([Type.Boolean(), Type.Null()], {
      description: "Whether the production blocker remains live, or null when unreadable.",
    }),
  },
  { additionalProperties: false }
);

const Civ7CityProductionChoiceValidationSummarySchema = Type.Object(
  {
    beforeValid: Type.Boolean({
      description: "Whether the production choice validated before the request.",
    }),
    afterValid: Type.Boolean({
      description: "Whether the production choice still validates after the request.",
    }),
  },
  { additionalProperties: false }
);

const Civ7CityProductionChoiceNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
        Type.Literal("refresh-attention"),
        Type.Literal("do-not-repeat"),
        Type.Literal("inspect-production"),
      ],
      {
        description: "Recommended follow-up action for the production result.",
      }
    ),
    source: Type.Literal("city.production.choice.request", {
      description: "Procedure that supplied the recommendation.",
    }),
    label: Type.String({
      description: "Human-readable follow-up recommendation.",
    }),
  },
  { additionalProperties: false }
);

const Civ7CityProductionChoiceResultSchema = Type.Object(
  {
    cityId: Civ7ControlOrpcComponentIdSchema,
    args: Type.Record(Type.String(), Type.Number(), {
      description: "Engine production arguments that were requested.",
    }),
    sent: Type.Boolean({
      description: "Whether the production request was sent to the game runtime.",
    }),
    status: Civ7CityProductionChoiceRequestStatusSchema,
    validation: Civ7CityProductionChoiceValidationSummarySchema,
    postcondition: Civ7CityProductionChoicePostconditionSummarySchema,
    nextSteps: Type.Array(Civ7CityProductionChoiceNextStepSchema, {
      description: "Evidence-based follow-up actions.",
    }),
  },
  { additionalProperties: false }
);

export const productionChoiceRequest = base
  .input(standard(Civ7CityProductionChoiceInputSchema))
  .output(standard(Civ7CityProductionChoiceResultSchema))
  .meta({
    family: "city",
    procedureKey: "city.production.choice.request",
    proofBoundary: "local-package-test",
    risk: "mutation",
  });
