import { Type } from "typebox";

import {
  Civ7ControlOrpcComponentIdSchema,
  Civ7ControlOrpcMapLocationSchema,
} from "#civ7-control-service/model/dto/primitives";
import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7CityPopulationPlacementInputSchema = Type.Union([
  Type.Object(
    {
      mode: Type.Literal("assign-worker", {
        description: "Selects assignment of an available population worker.",
      }),
      location: Type.Integer({
        minimum: 0,
        description: "Engine plot index where the worker should be assigned.",
      }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      mode: Type.Literal("expand-city", {
        description: "Selects acquisition of a plot for city expansion.",
      }),
      cityId: Civ7ControlOrpcComponentIdSchema,
      destination: Civ7ControlOrpcMapLocationSchema,
    },
    { additionalProperties: false }
  ),
]);

const Civ7CityPopulationPlacementProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("still-blocked"),
  Type.Literal("no-state-change"),
  Type.Literal("not-sent"),
  Type.Literal("unknown"),
]);

const Civ7CityPopulationPlacementPostconditionClassificationSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("population-ready-cleared"),
  Type.Literal("placement-state-changed"),
  Type.Literal("validation-changed"),
  Type.Literal("no-state-change"),
  Type.Literal("missing-postcondition"),
]);

const Civ7CityPopulationPlacementRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-guarded"),
  Type.Literal("sent-unverified"),
]);

const Civ7CityPopulationPlacementSummarySchema = Type.Union([
  Type.Object(
    {
      mode: Type.Literal("assign-worker", {
        description: "Identifies an assign-worker placement.",
      }),
      playerId: Type.Integer({
        minimum: 0,
        description: "Local player that owns the population placement.",
      }),
      location: Type.Integer({
        minimum: 0,
        description: "Engine plot index selected for the worker.",
      }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      mode: Type.Literal("expand-city", {
        description: "Identifies an expand-city placement.",
      }),
      cityId: Civ7ControlOrpcComponentIdSchema,
      destination: Civ7ControlOrpcMapLocationSchema,
    },
    { additionalProperties: false }
  ),
]);

const Civ7CityPopulationPlacementValidationSummarySchema = Type.Object(
  {
    beforeValid: Type.Boolean({
      description: "Whether the placement validated before the request.",
    }),
    afterValid: Type.Boolean({
      description: "Whether the placement still validates after the request.",
    }),
  },
  { additionalProperties: false }
);

const Civ7CityPopulationPlacementPostconditionSummarySchema = Type.Object(
  {
    classification: Civ7CityPopulationPlacementPostconditionClassificationSchema,
    reason: Type.String({
      description: "Evidence-based reason for the postcondition classification.",
    }),
    outcome: Civ7CityPopulationPlacementProofOutcomeSchema,
    confidence: Type.Union([Type.Literal("confirmed"), Type.Literal("unverified")], {
      description: "Confidence established by postcondition evidence.",
    }),
    confirmed: Type.Boolean({
      description: "Whether postcondition evidence confirms the placement outcome.",
    }),
    noRepeatAfterUnverified: Type.Boolean({
      description: "Whether an unverified send must not be repeated without fresh evidence.",
    }),
    readyCleared: Type.Union([Type.Boolean(), Type.Null()], {
      description: "Whether population readiness cleared, or null when unreadable.",
    }),
    placementStateChanged: Type.Union([Type.Boolean(), Type.Null()], {
      description: "Whether placement state changed, or null when unreadable.",
    }),
  },
  { additionalProperties: false }
);

const Civ7CityPopulationPlacementNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
        Type.Literal("refresh-attention"),
        Type.Literal("do-not-repeat"),
        Type.Literal("inspect-population-placement"),
      ],
      {
        description: "Recommended follow-up action for the placement result.",
      }
    ),
    source: Type.Literal("city.population.place.request", {
      description: "Procedure that supplied the recommendation.",
    }),
    label: Type.String({
      description: "Human-readable follow-up recommendation.",
    }),
  },
  { additionalProperties: false }
);

const Civ7CityPopulationPlacementResultSchema = Type.Object(
  {
    placement: Civ7CityPopulationPlacementSummarySchema,
    sent: Type.Boolean({
      description: "Whether the placement request was sent to the game runtime.",
    }),
    status: Civ7CityPopulationPlacementRequestStatusSchema,
    validation: Civ7CityPopulationPlacementValidationSummarySchema,
    postcondition: Civ7CityPopulationPlacementPostconditionSummarySchema,
    nextSteps: Type.Array(Civ7CityPopulationPlacementNextStepSchema, {
      description: "Evidence-based follow-up actions.",
    }),
  },
  { additionalProperties: false }
);

export const populationPlaceRequest = base
  .input(standard(Civ7CityPopulationPlacementInputSchema))
  .output(standard(Civ7CityPopulationPlacementResultSchema))
  .meta({
    family: "city",
    procedureKey: "city.population.place.request",
    proofBoundary: "local-package-test",
    risk: "mutation",
  });
