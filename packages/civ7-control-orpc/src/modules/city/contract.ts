import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import {
  Civ7ControlOrpcComponentIdSchema,
  Civ7ControlOrpcMapLocationSchema,
} from "../../model/primitives";
import { toStandardSchema } from "../../typebox-standard-schema";

const Civ7CityProductionChoiceArgsSchema = Type.Unsafe<
  Readonly<Record<string, number>>
>({
  type: "object",
  additionalProperties: false,
  properties: {
    UnitType: { type: "integer" },
    ConstructibleType: { type: "integer" },
    ProjectType: { type: "integer" },
    X: { type: "integer" },
    Y: { type: "integer" },
  },
  oneOf: [
    {
      required: ["UnitType"],
      not: {
        anyOf: [
          { required: ["ConstructibleType"] },
          { required: ["ProjectType"] },
          { required: ["X"] },
          { required: ["Y"] },
        ],
      },
    },
    {
      required: ["ProjectType"],
      not: {
        anyOf: [
          { required: ["UnitType"] },
          { required: ["ConstructibleType"] },
          { required: ["X"] },
          { required: ["Y"] },
        ],
      },
    },
    {
      required: ["ConstructibleType"],
      not: {
        anyOf: [
          { required: ["UnitType"] },
          { required: ["ProjectType"] },
          { required: ["X"] },
          { required: ["Y"] },
        ],
      },
    },
    {
      required: ["ConstructibleType", "X", "Y"],
      not: {
        anyOf: [
          { required: ["UnitType"] },
          { required: ["ProjectType"] },
        ],
      },
    },
  ],
});

export const Civ7CityProductionChoiceInputSchema = Type.Object(
  {
    cityId: Civ7ControlOrpcComponentIdSchema,
    args: Civ7CityProductionChoiceArgsSchema,
  },
  { additionalProperties: false },
);
export type Civ7CityProductionChoiceInput = Static<
  typeof Civ7CityProductionChoiceInputSchema
>;

export const Civ7CityProductionChoiceInputStandardSchema = toStandardSchema(
  Civ7CityProductionChoiceInputSchema,
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
      cityId: Civ7ControlOrpcComponentIdSchema,
      destination: Civ7ControlOrpcMapLocationSchema,
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

export const Civ7CityTownFocusChangeInputSchema = Type.Object(
  {
    cityId: Civ7ControlOrpcComponentIdSchema,
    growthType: Type.Integer(),
    projectType: Type.Integer(),
    city: Type.Optional(Type.Integer()),
  },
  { additionalProperties: false },
);
export type Civ7CityTownFocusChangeInput = Static<
  typeof Civ7CityTownFocusChangeInputSchema
>;

export const Civ7CityTownFocusReviewInputSchema = Type.Object(
  {
    cityId: Civ7ControlOrpcComponentIdSchema,
  },
  { additionalProperties: false },
);
export type Civ7CityTownFocusReviewInput = Static<
  typeof Civ7CityTownFocusReviewInputSchema
>;

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
      cityId: Civ7ControlOrpcComponentIdSchema,
      destination: Civ7ControlOrpcMapLocationSchema,
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

export const Civ7CityProductionChoicePostconditionClassificationSchema =
  Type.Union([
    Type.Literal("not-sent"),
    Type.Literal("production-choice-cleared"),
    Type.Literal("production-state-changed"),
    Type.Literal("production-state-changed-blocker-still-live"),
    Type.Literal("validation-changed"),
    Type.Literal("no-state-change"),
  ]);

export const Civ7CityProductionChoicePostconditionSummarySchema = Type.Object(
  {
    classification: Type.Union([
      Civ7CityProductionChoicePostconditionClassificationSchema,
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
    cityId: Civ7ControlOrpcComponentIdSchema,
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

const Civ7CityTownFocusPostconditionClassificationSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("pending-runtime-proof"),
  Type.Literal("missing-postcondition"),
]);

const Civ7CityTownFocusProofOutcomeSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("unknown"),
]);

const Civ7CityTownFocusRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-unverified"),
]);

const Civ7CityTownFocusValidationSummarySchema = Type.Object(
  {
    beforeValid: Type.Boolean(),
    afterValid: Type.Boolean(),
  },
  { additionalProperties: false },
);

const Civ7CityTownFocusPostconditionSummarySchema = Type.Object(
  {
    classification: Civ7CityTownFocusPostconditionClassificationSchema,
    reason: Type.String(),
    outcome: Civ7CityTownFocusProofOutcomeSchema,
    confidence: Type.Union([
      Type.Literal("unverified"),
      Type.Literal("pending-runtime-proof"),
    ]),
    confirmed: Type.Boolean(),
    noRepeatAfterUnverified: Type.Boolean(),
  },
  { additionalProperties: false },
);

const Civ7CityTownFocusChangeNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-town-focus"),
    ]),
    source: Type.Literal("city.townFocus.change.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

const Civ7CityTownFocusReviewNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-town-focus"),
    ]),
    source: Type.Literal("city.townFocus.review.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

const Civ7CityTownFocusResultBaseSchema = {
  cityId: Civ7ControlOrpcComponentIdSchema,
  sent: Type.Boolean(),
  status: Civ7CityTownFocusRequestStatusSchema,
  validation: Civ7CityTownFocusValidationSummarySchema,
  postcondition: Civ7CityTownFocusPostconditionSummarySchema,
} as const;

export const Civ7CityTownFocusChangeResultSchema = Type.Object(
  {
    ...Civ7CityTownFocusResultBaseSchema,
    growthType: Type.Integer(),
    projectType: Type.Integer(),
    city: Type.Integer(),
    nextSteps: Type.Array(Civ7CityTownFocusChangeNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7CityTownFocusChangeResult = Static<
  typeof Civ7CityTownFocusChangeResultSchema
>;

export const Civ7CityTownFocusReviewResultSchema = Type.Object(
  {
    ...Civ7CityTownFocusResultBaseSchema,
    nextSteps: Type.Array(Civ7CityTownFocusReviewNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7CityTownFocusReviewResult = Static<
  typeof Civ7CityTownFocusReviewResultSchema
>;

const Civ7CityTownFocusChangeInputStandardSchema = toStandardSchema(
  Civ7CityTownFocusChangeInputSchema,
);

const Civ7CityTownFocusReviewInputStandardSchema = toStandardSchema(
  Civ7CityTownFocusReviewInputSchema,
);

const Civ7CityTownFocusChangeResultStandardSchema = toStandardSchema(
  Civ7CityTownFocusChangeResultSchema,
);

const Civ7CityTownFocusReviewResultStandardSchema = toStandardSchema(
  Civ7CityTownFocusReviewResultSchema,
);

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

type Civ7CityTownFocusChangeContract = ContractProcedure<
  typeof Civ7CityTownFocusChangeInputStandardSchema,
  typeof Civ7CityTownFocusChangeResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

const Civ7CityTownFocusChangeContract: Civ7CityTownFocusChangeContract =
  civ7ControlOrpcContractBase
    .input(Civ7CityTownFocusChangeInputStandardSchema)
    .output(Civ7CityTownFocusChangeResultStandardSchema)
    .meta({
      family: "city",
      procedureKey: "city.townFocus.change.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

type Civ7CityTownFocusReviewContract = ContractProcedure<
  typeof Civ7CityTownFocusReviewInputStandardSchema,
  typeof Civ7CityTownFocusReviewResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

const Civ7CityTownFocusReviewContract: Civ7CityTownFocusReviewContract =
  civ7ControlOrpcContractBase
    .input(Civ7CityTownFocusReviewInputStandardSchema)
    .output(Civ7CityTownFocusReviewResultStandardSchema)
    .meta({
      family: "city",
      procedureKey: "city.townFocus.review.request",
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
  townFocus: Readonly<{
    change: Readonly<{
      request: Civ7CityTownFocusChangeContract;
    }>;
    review: Readonly<{
      request: Civ7CityTownFocusReviewContract;
    }>;
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
  townFocus: {
    change: {
      request: Civ7CityTownFocusChangeContract,
    },
    review: {
      request: Civ7CityTownFocusReviewContract,
    },
  },
};
