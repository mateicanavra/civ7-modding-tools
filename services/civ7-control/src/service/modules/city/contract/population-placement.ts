import { type TSchema, Type } from "typebox";

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
        maximum: 1_000_000,
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

const workerPlacementSummarySchema = Type.Object(
  {
    mode: Type.Literal("assign-worker", {
      description: "Identifies a worker-assignment placement.",
    }),
    playerId: Type.Integer({
      minimum: 0,
      description: "Live local player that owns the worker assignment.",
    }),
    cityId: Type.Union([Civ7ControlOrpcComponentIdSchema, Type.Null()], {
      description: "Resolved candidate city, or null when the runtime could not identify one.",
    }),
    location: Type.Integer({
      minimum: 0,
      maximum: 1_000_000,
      description: "Engine plot index selected for the worker.",
    }),
  },
  { additionalProperties: false }
);

const cityExpansionSummarySchema = Type.Object(
  {
    mode: Type.Literal("expand-city", {
      description: "Identifies a city-expansion placement.",
    }),
    cityId: Civ7ControlOrpcComponentIdSchema,
    destination: Civ7ControlOrpcMapLocationSchema,
  },
  { additionalProperties: false }
);

const Civ7CityPopulationPlacementSummarySchema = Type.Union(
  [workerPlacementSummarySchema, cityExpansionSummarySchema],
  { description: "Resolved identity of a worker assignment or city expansion." }
);

const Civ7CityPopulationPlacementCheckResultSchema = Type.Object(
  {
    placement: Civ7CityPopulationPlacementSummarySchema,
    available: Type.Boolean({
      description: "Whether the exact placement is currently accepted by the runtime validator.",
    }),
  },
  { additionalProperties: false }
);

const nextStepVariant = <
  const Kind extends "refresh-attention" | "do-not-repeat" | "inspect-population-placement",
>(
  kind: Kind
) =>
  Type.Array(
    Type.Object(
      {
        kind: Type.Literal(kind, {
          description: "Recommended follow-up action for the placement result.",
        }),
        source: Type.Literal("city.population.place.request", {
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

const inspectPopulationNextStep = nextStepVariant("inspect-population-placement");
const doNotRepeatNextStep = nextStepVariant("do-not-repeat");
const refreshAttentionNextStep = nextStepVariant("refresh-attention");

const confirmedPostconditionVariant = <
  const Classification extends "worker-assignment-confirmed" | "city-expansion-confirmed",
  const Outcome extends "worker-assigned" | "city-expanded",
>(
  classification: Classification,
  outcome: Outcome
) =>
  Type.Object(
    {
      classification: Type.Literal(classification, {
        description: "Confirmed target-specific placement transition.",
      }),
      reason: Type.String({
        description: "Evidence-based reason for the placement classification.",
      }),
      outcome: Type.Literal(outcome, {
        description: "Confirmed semantic placement outcome.",
      }),
      confidence: Type.Literal("confirmed", {
        description: "Evidence confidence for the placement outcome.",
      }),
      confirmed: Type.Literal(true, {
        description: "Whether target-specific evidence confirms the placement.",
      }),
      noRepeatAfterUnverified: Type.Literal(false, {
        description: "Whether callers must avoid repeating an unverified request.",
      }),
    },
    {
      additionalProperties: false,
      description: "Confirmed target-specific population placement transition.",
    }
  );

const unverifiedPostconditionVariant = <
  const Classification extends "not-sent" | "no-target-state-change" | "missing-postcondition",
  const Outcome extends "not-sent" | "no-target-state-change" | "unknown",
>(
  classification: Classification,
  outcome: Outcome
) =>
  Type.Object(
    {
      classification: Type.Literal(classification, {
        description: "Unverified placement transition classification.",
      }),
      reason: Type.String({
        description: "Evidence-based reason for the placement classification.",
      }),
      outcome: Type.Literal(outcome, {
        description: "Unverified semantic placement outcome.",
      }),
      confidence: Type.Literal("unverified", {
        description: "Evidence confidence for the placement outcome.",
      }),
      confirmed: Type.Literal(false, {
        description: "Whether target-specific evidence confirms the placement.",
      }),
      noRepeatAfterUnverified: Type.Literal(true, {
        description: "Whether callers must avoid repeating an unverified request.",
      }),
    },
    {
      additionalProperties: false,
      description: "Unverified population placement transition.",
    }
  );

const notSentPostcondition = unverifiedPostconditionVariant("not-sent", "not-sent");
const workerAssignedPostcondition = confirmedPostconditionVariant(
  "worker-assignment-confirmed",
  "worker-assigned"
);
const cityExpandedPostcondition = confirmedPostconditionVariant(
  "city-expansion-confirmed",
  "city-expanded"
);
const unchangedPostcondition = unverifiedPostconditionVariant(
  "no-target-state-change",
  "no-target-state-change"
);
const missingPostcondition = unverifiedPostconditionVariant("missing-postcondition", "unknown");

const resultVariant = <
  const Status extends string,
  PlacementSchema extends TSchema,
  PostconditionSchema extends TSchema,
  NextStepsSchema extends TSchema,
>(
  status: Status,
  placementSchema: PlacementSchema,
  postconditionSchema: PostconditionSchema,
  nextStepsSchema: NextStepsSchema
) =>
  Type.Object(
    {
      placement: placementSchema,
      status: Type.Literal(status, {
        description: "Service-level dispatch and verification status for the placement request.",
      }),
      postcondition: postconditionSchema,
      nextSteps: nextStepsSchema,
    },
    { additionalProperties: false }
  );

const Civ7CityPopulationPlacementResultSchema = Type.Union([
  resultVariant(
    "not-sent",
    Civ7CityPopulationPlacementSummarySchema,
    notSentPostcondition,
    inspectPopulationNextStep
  ),
  resultVariant(
    "dispatch-unknown",
    Civ7CityPopulationPlacementSummarySchema,
    missingPostcondition,
    doNotRepeatNextStep
  ),
  resultVariant(
    "sent-confirmed",
    workerPlacementSummarySchema,
    workerAssignedPostcondition,
    refreshAttentionNextStep
  ),
  resultVariant(
    "sent-confirmed",
    cityExpansionSummarySchema,
    cityExpandedPostcondition,
    refreshAttentionNextStep
  ),
  resultVariant(
    "sent-unverified",
    Civ7CityPopulationPlacementSummarySchema,
    Type.Union([unchangedPostcondition, missingPostcondition]),
    doNotRepeatNextStep
  ),
]);

/** Public availability and guarded-mutation contracts for population placement. */
export const populationPlacement = {
  check: base
    .input(standard(Civ7CityPopulationPlacementInputSchema))
    .output(standard(Civ7CityPopulationPlacementCheckResultSchema))
    .meta({
      family: "city",
      procedureKey: "city.population.place.check",
      proofBoundary: "local-package-test",
      risk: "read-only",
    }),
  request: base
    .input(standard(Civ7CityPopulationPlacementInputSchema))
    .output(standard(Civ7CityPopulationPlacementResultSchema))
    .meta({
      family: "city",
      procedureKey: "city.population.place.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
};
