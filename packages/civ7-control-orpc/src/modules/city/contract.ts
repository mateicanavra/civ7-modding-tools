import {
  Civ7CitySummaryInputSchema,
  Civ7CitySummaryResultSchema,
  Civ7ComponentIdSchema,
  Civ7MapLocationSchema,
  Civ7ProductionChoiceInputSchema,
  Civ7ProductionPostconditionClassificationSchema,
  Civ7ReadyCityViewInputSchema,
  Civ7ReadyCityViewResultSchema,
} from "@civ7/direct-control";
import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { toStandardSchema } from "../../typebox-standard-schema";

export const Civ7CitySummaryInputStandardSchema = toStandardSchema(
  Civ7CitySummaryInputSchema,
);
export const Civ7CitySummaryResultStandardSchema = toStandardSchema(
  Civ7CitySummaryResultSchema,
);
export const Civ7CityReadyViewInputStandardSchema = toStandardSchema(
  Civ7ReadyCityViewInputSchema,
);
export const Civ7CityReadyViewResultStandardSchema = toStandardSchema(
  Civ7ReadyCityViewResultSchema,
);
export const Civ7CityProductionChoiceInputStandardSchema = toStandardSchema(
  Civ7ProductionChoiceInputSchema,
);

export const Civ7CityPopulationPlacementInputSchema = Type.Union([
  Type.Object(
    {
      mode: Type.Literal("assign-worker"),
      playerId: Type.Integer({ minimum: 0 }),
      location: Type.Integer({ minimum: 0 }),
    },
    { additionalProperties: false },
  ),
  Type.Object(
    {
      mode: Type.Literal("expand-city"),
      cityId: Civ7ComponentIdSchema,
      destination: Civ7MapLocationSchema,
    },
    { additionalProperties: false },
  ),
]);
export type Civ7CityPopulationPlacementInput = Static<
  typeof Civ7CityPopulationPlacementInputSchema
>;

export const Civ7CityPopulationPlacementInputStandardSchema = toStandardSchema(
  Civ7CityPopulationPlacementInputSchema,
);

export const Civ7CityPopulationPlacementModeSchema = Type.Union([
  Type.Literal("assign-worker"),
  Type.Literal("expand-city"),
]);

export const Civ7CityPopulationPlacementProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("still-blocked"),
  Type.Literal("no-state-change"),
  Type.Literal("not-sent"),
  Type.Literal("unknown"),
]);

export const Civ7CityPopulationPlacementPostconditionClassificationSchema =
  Type.Union([
    Type.Literal("not-sent"),
    Type.Literal("population-ready-cleared"),
    Type.Literal("placement-state-changed"),
    Type.Literal("validation-changed"),
    Type.Literal("no-state-change"),
    Type.Literal("missing-postcondition"),
  ]);

export const Civ7CityPopulationPlacementRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-guarded"),
  Type.Literal("sent-unverified"),
]);

export const Civ7CityPopulationPlacementSummarySchema = Type.Union([
  Type.Object(
    {
      mode: Type.Literal("assign-worker"),
      playerId: Type.Integer({ minimum: 0 }),
      location: Type.Integer({ minimum: 0 }),
    },
    { additionalProperties: false },
  ),
  Type.Object(
    {
      mode: Type.Literal("expand-city"),
      cityId: Civ7ComponentIdSchema,
      destination: Civ7MapLocationSchema,
    },
    { additionalProperties: false },
  ),
]);

export const Civ7CityPopulationPlacementValidationSummarySchema = Type.Object(
  {
    beforeValid: Type.Boolean(),
    afterValid: Type.Boolean(),
  },
  { additionalProperties: false },
);

export const Civ7CityPopulationPlacementPostconditionSummarySchema =
  Type.Object(
    {
      classification: Civ7CityPopulationPlacementPostconditionClassificationSchema,
      reason: Type.String(),
      outcome: Civ7CityPopulationPlacementProofOutcomeSchema,
      confidence: Type.Union([
        Type.Literal("confirmed"),
        Type.Literal("unverified"),
      ]),
      confirmed: Type.Boolean(),
      noRepeatAfterUnverified: Type.Boolean(),
      readyCleared: Type.Union([Type.Boolean(), Type.Null()]),
      placementStateChanged: Type.Union([Type.Boolean(), Type.Null()]),
    },
    { additionalProperties: false },
  );

export const Civ7CityPopulationPlacementNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("refresh-attention"),
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-population-placement"),
    ]),
    source: Type.Literal("city.population.place.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

export const Civ7CityPopulationPlacementResultSchema = Type.Object(
  {
    placement: Civ7CityPopulationPlacementSummarySchema,
    sent: Type.Boolean(),
    status: Civ7CityPopulationPlacementRequestStatusSchema,
    validation: Civ7CityPopulationPlacementValidationSummarySchema,
    postcondition: Civ7CityPopulationPlacementPostconditionSummarySchema,
    nextSteps: Type.Array(Civ7CityPopulationPlacementNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7CityPopulationPlacementResult = Static<
  typeof Civ7CityPopulationPlacementResultSchema
>;

export const Civ7CityPopulationPlacementResultStandardSchema =
  toStandardSchema(Civ7CityPopulationPlacementResultSchema);

export const Civ7CityProductionChoiceProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("still-blocked"),
  Type.Literal("no-state-change"),
  Type.Literal("not-sent"),
]);

export const Civ7CityProductionChoiceRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-unverified"),
]);

export const Civ7CityProductionChoicePostconditionSummarySchema = Type.Object(
  {
    classification: Type.Union([
      Civ7ProductionPostconditionClassificationSchema,
      Type.Literal("missing-postcondition"),
    ]),
    reason: Type.String(),
    outcome: Civ7CityProductionChoiceProofOutcomeSchema,
    confidence: Type.Union([
      Type.Literal("confirmed"),
      Type.Literal("unverified"),
    ]),
    confirmed: Type.Boolean(),
    noRepeatAfterUnverified: Type.Boolean(),
    productionStateChanged: Type.Union([Type.Boolean(), Type.Null()]),
    blockerStillLive: Type.Union([Type.Boolean(), Type.Null()]),
  },
  { additionalProperties: false },
);

export const Civ7CityProductionChoiceValidationSummarySchema = Type.Object(
  {
    beforeValid: Type.Boolean(),
    afterValid: Type.Boolean(),
  },
  { additionalProperties: false },
);

export const Civ7CityProductionChoiceNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("refresh-attention"),
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-production"),
    ]),
    source: Type.Literal("city.production.choice.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

export const Civ7CityProductionChoiceResultSchema = Type.Object(
  {
    cityId: Civ7ComponentIdSchema,
    args: Type.Record(Type.String(), Type.Number()),
    sent: Type.Boolean(),
    status: Civ7CityProductionChoiceRequestStatusSchema,
    validation: Civ7CityProductionChoiceValidationSummarySchema,
    postcondition: Civ7CityProductionChoicePostconditionSummarySchema,
    nextSteps: Type.Array(Civ7CityProductionChoiceNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7CityProductionChoiceResult = Static<
  typeof Civ7CityProductionChoiceResultSchema
>;

export const Civ7CityProductionChoiceResultStandardSchema = toStandardSchema(
  Civ7CityProductionChoiceResultSchema,
);

export type Civ7CitySummaryContract = ContractProcedure<
  typeof Civ7CitySummaryInputStandardSchema,
  typeof Civ7CitySummaryResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7CitySummaryContract: Civ7CitySummaryContract =
  civ7ControlOrpcContractBase
    .input(Civ7CitySummaryInputStandardSchema)
    .output(Civ7CitySummaryResultStandardSchema)
    .meta({
      family: "city",
      procedureKey: "city.summary.read",
      proofBoundary: "local-package-test",
      risk: "read-only",
    });

export type Civ7CityReadyViewContract = ContractProcedure<
  typeof Civ7CityReadyViewInputStandardSchema,
  typeof Civ7CityReadyViewResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7CityReadyViewContract: Civ7CityReadyViewContract =
  civ7ControlOrpcContractBase
    .input(Civ7CityReadyViewInputStandardSchema)
    .output(Civ7CityReadyViewResultStandardSchema)
    .meta({
      family: "city",
      procedureKey: "city.ready.view",
      proofBoundary: "local-package-test",
      risk: "read-only",
    });

export type Civ7CityPopulationPlacementContract = ContractProcedure<
  typeof Civ7CityPopulationPlacementInputStandardSchema,
  typeof Civ7CityPopulationPlacementResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7CityPopulationPlacementContract:
  Civ7CityPopulationPlacementContract = civ7ControlOrpcContractBase
    .input(Civ7CityPopulationPlacementInputStandardSchema)
    .output(Civ7CityPopulationPlacementResultStandardSchema)
    .meta({
      family: "city",
      procedureKey: "city.population.place.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

export type Civ7CityProductionChoiceContract = ContractProcedure<
  typeof Civ7CityProductionChoiceInputStandardSchema,
  typeof Civ7CityProductionChoiceResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7CityProductionChoiceContract: Civ7CityProductionChoiceContract =
  civ7ControlOrpcContractBase
    .input(Civ7CityProductionChoiceInputStandardSchema)
    .output(Civ7CityProductionChoiceResultStandardSchema)
    .meta({
      family: "city",
      procedureKey: "city.production.choice.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

export type Civ7CityContract = Readonly<{
  population: Readonly<{
    place: Readonly<{
      request: Civ7CityPopulationPlacementContract;
    }>;
  }>;
  production: Readonly<{
    choice: Readonly<{
      request: Civ7CityProductionChoiceContract;
    }>;
  }>;
  ready: Readonly<{
    view: Civ7CityReadyViewContract;
  }>;
  summary: Readonly<{
    read: Civ7CitySummaryContract;
  }>;
}>;

export const Civ7CityContract: Civ7CityContract = {
  population: {
    place: {
      request: Civ7CityPopulationPlacementContract,
    },
  },
  production: {
    choice: {
      request: Civ7CityProductionChoiceContract,
    },
  },
  ready: {
    view: Civ7CityReadyViewContract,
  },
  summary: {
    read: Civ7CitySummaryContract,
  },
};
