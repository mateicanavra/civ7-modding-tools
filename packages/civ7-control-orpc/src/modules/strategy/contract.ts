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

const Civ7StrategyFrontSummaryInputSchema = Type.Object(
  {
    playerId: Type.Optional(Type.Integer({ minimum: 0, maximum: 1024 })),
    origins: Type.Optional(Type.Array(Civ7ControlOrpcMapLocationSchema)),
    target: Type.Optional(Civ7ControlOrpcMapLocationSchema),
    candidateLimit: Type.Optional(Type.Integer({ minimum: 1, maximum: 8 })),
    scanRadius: Type.Optional(Type.Integer({ minimum: 1, maximum: 32 })),
    corridorRadius: Type.Optional(Type.Integer({ minimum: 0, maximum: 8 })),
    destinationRadius: Type.Optional(Type.Integer({ minimum: 1, maximum: 16 })),
    maxPlayers: Type.Optional(Type.Integer({ minimum: 1, maximum: 128 })),
    maxUnits: Type.Optional(Type.Integer({ minimum: 1, maximum: 256 })),
    maxCities: Type.Optional(Type.Integer({ minimum: 1, maximum: 128 })),
  },
  { additionalProperties: false },
);
export type Civ7StrategyFrontSummaryInput = Static<
  typeof Civ7StrategyFrontSummaryInputSchema
>;

export const Civ7StrategyRelationshipClassificationSchema = Type.Union([
  Type.Literal("self"),
  Type.Literal("relationship-unproven"),
]);

export const Civ7StrategyRelationshipLabelPolicySchema = Type.Object(
  {
    relationshipSource: Type.Literal("not-classified"),
    relationshipProof: Type.Literal("none"),
    unprovenLabel: Type.Literal("relationship-unproven"),
    guidance: Type.String(),
  },
  { additionalProperties: false },
);

export const Civ7StrategyFrontSourceStatusSchema = Type.Object(
  {
    targetCandidates: Type.Literal("read"),
    battlefieldScan: Type.Literal("read"),
    destinationAnalysis: Type.Union([
      Type.Literal("read"),
      Type.Literal("skipped-no-target"),
    ]),
  },
  { additionalProperties: false },
);

export const Civ7StrategyFrontTargetCandidateSchema = Type.Object(
  {
    owner: Type.Integer({ minimum: 0 }),
    relationship: Type.Literal("relationship-unproven"),
    relationshipProof: Type.Literal("none"),
    nearestDistance: Type.Union([Type.Number(), Type.Null()]),
    cityCount: Type.Integer({ minimum: 0 }),
    unitCount: Type.Integer({ minimum: 0 }),
    nearbyUnitCount: Type.Integer({ minimum: 0 }),
    apparentStrength: Type.Number(),
    routeKind: Type.String(),
    routeHint: Type.String(),
    reasons: Type.Array(Type.String()),
  },
  { additionalProperties: false },
);

export const Civ7StrategyFrontPointOfInterestSchema = Type.Object(
  {
    kind: Type.String(),
    severity: Type.String(),
    location: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()]),
    summary: Type.String(),
    source: Type.Union([
      Type.Literal("battlefield"),
      Type.Literal("destination"),
    ]),
  },
  { additionalProperties: false },
);

const Civ7StrategyFrontPressureSchema = Type.Object(
  {
    kind: Type.String(),
    severity: Type.String(),
    summary: Type.String(),
    location: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()]),
    source: Type.Union([
      Type.Literal("battlefield"),
      Type.Literal("destination"),
    ]),
  },
  { additionalProperties: false },
);

export const Civ7StrategyObservedOwnerSchema = Type.Object(
  {
    owner: Type.Integer({ minimum: 0 }),
    relationship: Civ7StrategyRelationshipClassificationSchema,
    relationshipProof: Type.Union([Type.Literal("self"), Type.Literal("none")]),
    unitCount: Type.Integer({ minimum: 0 }),
    cityCount: Type.Integer({ minimum: 0 }),
    apparentStrength: Type.Number(),
    nearestDistance: Type.Union([Type.Number(), Type.Null()]),
  },
  { additionalProperties: false },
);

export const Civ7StrategyFrontSummaryNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("inspect-target-candidate"),
      Type.Literal("inspect-battlefield-point"),
      Type.Literal("read-visibility"),
      Type.Literal("validate-unit-action"),
      Type.Literal("observe"),
    ]),
    source: Type.Literal("strategy.frontSummary"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

const Civ7StrategyFrontSummaryResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0 }),
    localPlayerId: Type.Integer({ minimum: 0 }),
    origins: Type.Array(Civ7ControlOrpcMapLocationSchema),
    target: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()]),
    sourceStatus: Civ7StrategyFrontSourceStatusSchema,
    relationshipLabelPolicy: Civ7StrategyRelationshipLabelPolicySchema,
    summary: Type.Object(
      {
        targetCandidateCount: Type.Integer({ minimum: 0 }),
        pointOfInterestCount: Type.Integer({ minimum: 0 }),
        observedOwnerCount: Type.Integer({ minimum: 0 }),
        nextStepCount: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false },
    ),
    front: Type.Object(
      {
        posture: Type.String(),
        headline: Type.String(),
        risks: Type.Array(Type.String()),
        nextInspections: Type.Array(Civ7StrategyFrontSummaryNextStepSchema),
        pressure: Type.Array(Civ7StrategyFrontPressureSchema),
      },
      { additionalProperties: false },
    ),
    targetCandidates: Type.Array(Civ7StrategyFrontTargetCandidateSchema),
    pointsOfInterest: Type.Array(Civ7StrategyFrontPointOfInterestSchema),
    observedOwners: Type.Array(Civ7StrategyObservedOwnerSchema),
    notes: Type.Array(Type.String()),
    nextSteps: Type.Array(Civ7StrategyFrontSummaryNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7StrategyFrontSummaryResult = Static<
  typeof Civ7StrategyFrontSummaryResultSchema
>;

const Civ7StrategyFrontSummaryInputStandardSchema = toStandardSchema(
  Civ7StrategyFrontSummaryInputSchema,
);
const Civ7StrategyFrontSummaryResultStandardSchema = toStandardSchema(
  Civ7StrategyFrontSummaryResultSchema,
);

const Civ7StrategyCivilianRouteTriageInputSchema = Type.Object(
  {
    playerId: Type.Optional(Type.Integer({ minimum: 0, maximum: 1024 })),
    origin: Type.Optional(Civ7ControlOrpcMapLocationSchema),
    destination: Type.Optional(Civ7ControlOrpcMapLocationSchema),
    settlementCount: Type.Optional(Type.Integer({ minimum: 1, maximum: 12 })),
    scanRadius: Type.Optional(Type.Integer({ minimum: 1, maximum: 16 })),
    corridorRadius: Type.Optional(Type.Integer({ minimum: 0, maximum: 8 })),
    destinationRadius: Type.Optional(Type.Integer({ minimum: 1, maximum: 16 })),
    maxUnits: Type.Optional(Type.Integer({ minimum: 1, maximum: 256 })),
    maxCities: Type.Optional(Type.Integer({ minimum: 1, maximum: 128 })),
  },
  { additionalProperties: false },
);
export type Civ7StrategyCivilianRouteTriageInput = Static<
  typeof Civ7StrategyCivilianRouteTriageInputSchema
>;

const Civ7StrategyCivilianRouteTriageSourceStatusSchema = Type.Object(
  {
    notifications: Type.Literal("read"),
    readyUnit: Type.Union([
      Type.Literal("read"),
      Type.Literal("skipped-explicit-origin"),
      Type.Literal("skipped-no-ready-unit"),
    ]),
    settlementRecommendations: Type.Literal("read"),
    battlefieldScan: Type.Literal("read"),
    destinationAnalysis: Type.Union([
      Type.Literal("read"),
      Type.Literal("skipped-no-origin-or-destination"),
    ]),
  },
  { additionalProperties: false },
);

const Civ7StrategyCivilianRouteNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("read-priorities"),
      Type.Literal("inspect-battlefield"),
      Type.Literal("inspect-settlement"),
      Type.Literal("inspect-destination"),
      Type.Literal("inspect-front"),
      Type.Literal("inspect-ready-unit"),
      Type.Literal("validate-unit-action"),
    ]),
    source: Type.Literal("strategy.civilianRouteTriage"),
    label: Type.String(),
    parameters: Type.Object(
      {
        origin: Type.Optional(Civ7ControlOrpcMapLocationSchema),
        destination: Type.Optional(Civ7ControlOrpcMapLocationSchema),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

const Civ7StrategyCivilianRouteTriageStatusSchema = Type.Union([
  Type.Literal("proceed-with-validation"),
  Type.Literal("hold-or-screen"),
  Type.Literal("reroute-or-stage"),
  Type.Literal("inspect-candidate"),
]);

const Civ7StrategyCivilianRouteTriageResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0 }),
    localPlayerId: Type.Integer({ minimum: 0 }),
    origin: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()]),
    destination: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()]),
    sourceStatus: Civ7StrategyCivilianRouteTriageSourceStatusSchema,
    relationshipLabelPolicy: Civ7StrategyRelationshipLabelPolicySchema,
    readyUnit: Type.Union([
      Type.Object(
        {
          unitId: Type.Union([Civ7ControlOrpcComponentIdSchema, Type.Null()]),
          typeName: Type.Union([Type.String(), Type.Null()]),
          location: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()]),
          legalOperationCount: Type.Integer({ minimum: 0 }),
        },
        { additionalProperties: false },
      ),
      Type.Null(),
    ]),
    settlement: Type.Object(
      {
        originCount: Type.Integer({ minimum: 0 }),
        recommendationCount: Type.Integer({ minimum: 0 }),
        firstSuggestion: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()]),
      },
      { additionalProperties: false },
    ),
    battlefield: Type.Object(
      {
        pointOfInterestCount: Type.Integer({ minimum: 0 }),
        observedOwnerCount: Type.Integer({ minimum: 0 }),
        hiddenInfoPolicy: Type.String(),
      },
      { additionalProperties: false },
    ),
    destinationAnalysis: Type.Union([
      Type.Object(
        {
          pointOfInterestCount: Type.Integer({ minimum: 0 }),
          destinationUnitCount: Type.Integer({ minimum: 0 }),
          destinationCityCount: Type.Integer({ minimum: 0 }),
          apparentOtherStrength: Type.Number(),
        },
        { additionalProperties: false },
      ),
      Type.Null(),
    ]),
    triage: Type.Object(
      {
        status: Civ7StrategyCivilianRouteTriageStatusSchema,
        summary: Type.String(),
        reasons: Type.Array(Type.String()),
        nextSteps: Type.Array(Civ7StrategyCivilianRouteNextStepSchema),
      },
      { additionalProperties: false },
    ),
    notes: Type.Array(Type.String()),
    nextSteps: Type.Array(Civ7StrategyCivilianRouteNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7StrategyCivilianRouteTriageResult = Static<
  typeof Civ7StrategyCivilianRouteTriageResultSchema
>;

const Civ7StrategyCivilianRouteTriageInputStandardSchema = toStandardSchema(
  Civ7StrategyCivilianRouteTriageInputSchema,
);
const Civ7StrategyCivilianRouteTriageResultStandardSchema = toStandardSchema(
  Civ7StrategyCivilianRouteTriageResultSchema,
);

export type Civ7StrategyFrontSummaryContract = ContractProcedure<
  typeof Civ7StrategyFrontSummaryInputStandardSchema,
  typeof Civ7StrategyFrontSummaryResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7StrategyFrontSummaryContract: Civ7StrategyFrontSummaryContract =
  civ7ControlOrpcContractBase
    .input(Civ7StrategyFrontSummaryInputStandardSchema)
    .output(Civ7StrategyFrontSummaryResultStandardSchema)
    .meta({
      family: "strategy",
      procedureKey: "strategy.frontSummary",
      proofBoundary: "local-package-test",
      risk: "read-only",
    });

export type Civ7StrategyCivilianRouteTriageContract = ContractProcedure<
  typeof Civ7StrategyCivilianRouteTriageInputStandardSchema,
  typeof Civ7StrategyCivilianRouteTriageResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7StrategyCivilianRouteTriageContract:
  Civ7StrategyCivilianRouteTriageContract =
    civ7ControlOrpcContractBase
      .input(Civ7StrategyCivilianRouteTriageInputStandardSchema)
      .output(Civ7StrategyCivilianRouteTriageResultStandardSchema)
      .meta({
        family: "strategy",
        procedureKey: "strategy.civilianRouteTriage",
        proofBoundary: "local-package-test",
        risk: "read-only",
      });

export type Civ7StrategyContract = Readonly<{
  civilianRouteTriage: Civ7StrategyCivilianRouteTriageContract;
  frontSummary: Civ7StrategyFrontSummaryContract;
}>;

export const Civ7StrategyContract: Civ7StrategyContract = {
  civilianRouteTriage: Civ7StrategyCivilianRouteTriageContract,
  frontSummary: Civ7StrategyFrontSummaryContract,
};
