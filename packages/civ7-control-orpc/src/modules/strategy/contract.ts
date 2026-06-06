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

const Civ7StrategyTargetCandidatesInputSchema = Type.Object(
  {
    playerId: Type.Optional(Type.Integer({ minimum: 0, maximum: 1024 })),
    origins: Type.Optional(Type.Array(Civ7ControlOrpcMapLocationSchema)),
    maxCandidates: Type.Optional(Type.Integer({ minimum: 1, maximum: 64 })),
    maxPlayers: Type.Optional(Type.Integer({ minimum: 1, maximum: 128 })),
    unitRadius: Type.Optional(Type.Integer({ minimum: 0, maximum: 16 })),
  },
  { additionalProperties: false },
);
export type Civ7StrategyTargetCandidatesInput = Static<
  typeof Civ7StrategyTargetCandidatesInputSchema
>;

const Civ7StrategyTargetCandidatesNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("inspect-candidate"),
      Type.Literal("read-visibility"),
      Type.Literal("validate-unit-action"),
      Type.Literal("observe"),
    ]),
    source: Type.Literal("strategy.targetCandidates"),
    label: Type.String(),
    parameters: Type.Object(
      {
        owner: Type.Optional(Type.Integer({ minimum: 0 })),
        target: Type.Optional(Civ7ControlOrpcMapLocationSchema),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

const Civ7StrategyTargetCandidateApproachSchema = Type.Object(
  {
    nearestOrigin: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()]),
    targetLocation: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()]),
    directGridDistance: Type.Union([Type.Number(), Type.Null()]),
    routeHint: Type.String(),
    routeKind: Type.String(),
    waterSampleCount: Type.Integer({ minimum: 0 }),
    landSampleCount: Type.Integer({ minimum: 0 }),
    notes: Type.Array(Type.String()),
  },
  { additionalProperties: false },
);

const Civ7StrategyTargetCandidateResultSchema = Type.Object(
  {
    owner: Type.Integer({ minimum: 0 }),
    relationship: Type.Literal("relationship-unproven"),
    relationshipProof: Type.Literal("none"),
    leaderName: Type.Union([Type.String(), Type.Null()]),
    civilizationName: Type.Union([Type.String(), Type.Null()]),
    isHuman: Type.Union([Type.Boolean(), Type.Null()]),
    cityCount: Type.Integer({ minimum: 0 }),
    unitCount: Type.Integer({ minimum: 0 }),
    nearestDistance: Type.Union([Type.Number(), Type.Null()]),
    nearbyUnitCount: Type.Integer({ minimum: 0 }),
    apparentStrength: Type.Number(),
    nearestCityLocation: Type.Union([
      Civ7ControlOrpcMapLocationSchema,
      Type.Null(),
    ]),
    approach: Civ7StrategyTargetCandidateApproachSchema,
    reasons: Type.Array(Type.String()),
  },
  { additionalProperties: false },
);

const Civ7StrategyTargetCandidatesResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0 }),
    localPlayerId: Type.Integer({ minimum: 0 }),
    origins: Type.Array(Civ7ControlOrpcMapLocationSchema),
    unitRadius: Type.Integer({ minimum: 0 }),
    hiddenInfoPolicy: Type.String(),
    relationshipLabelPolicy: Civ7StrategyRelationshipLabelPolicySchema,
    summary: Type.Object(
      {
        candidateCount: Type.Integer({ minimum: 0 }),
        nearestDistance: Type.Union([Type.Number(), Type.Null()]),
        observedOwnerCount: Type.Integer({ minimum: 0 }),
        apparentStrengthTotal: Type.Number(),
        nextStepCount: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false },
    ),
    candidates: Type.Array(Civ7StrategyTargetCandidateResultSchema),
    omitted: Type.Array(Type.Object(
      {
        path: Type.String(),
        reason: Type.String(),
      },
      { additionalProperties: false },
    )),
    notes: Type.Array(Type.String()),
    nextSteps: Type.Array(Civ7StrategyTargetCandidatesNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7StrategyTargetCandidatesResult = Static<
  typeof Civ7StrategyTargetCandidatesResultSchema
>;

const Civ7StrategyDestinationAnalysisInputSchema = Type.Object(
  {
    playerId: Type.Optional(Type.Integer({ minimum: 0, maximum: 1024 })),
    origin: Type.Optional(Civ7ControlOrpcMapLocationSchema),
    destination: Civ7ControlOrpcMapLocationSchema,
    corridorRadius: Type.Optional(Type.Integer({ minimum: 0, maximum: 8 })),
    destinationRadius: Type.Optional(Type.Integer({ minimum: 1, maximum: 16 })),
    maxPlayers: Type.Optional(Type.Integer({ minimum: 1, maximum: 128 })),
    maxUnits: Type.Optional(Type.Integer({ minimum: 1, maximum: 256 })),
    maxCities: Type.Optional(Type.Integer({ minimum: 1, maximum: 128 })),
  },
  { additionalProperties: false },
);
export type Civ7StrategyDestinationAnalysisInput = Static<
  typeof Civ7StrategyDestinationAnalysisInputSchema
>;

const Civ7StrategyDestinationAnalysisNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("inspect-destination"),
      Type.Literal("read-visibility"),
      Type.Literal("validate-unit-action"),
      Type.Literal("observe"),
    ]),
    source: Type.Literal("strategy.destinationAnalysis"),
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

const Civ7StrategyDestinationPointOfInterestSchema = Type.Object(
  {
    kind: Type.String(),
    severity: Type.String(),
    location: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()]),
    summary: Type.String(),
  },
  { additionalProperties: false },
);

const Civ7StrategyDestinationAnalysisResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0 }),
    localPlayerId: Type.Integer({ minimum: 0 }),
    origin: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()]),
    destination: Civ7ControlOrpcMapLocationSchema,
    corridorRadius: Type.Integer({ minimum: 0 }),
    destinationRadius: Type.Integer({ minimum: 1 }),
    hiddenInfoPolicy: Type.String(),
    relationshipLabelPolicy: Civ7StrategyRelationshipLabelPolicySchema,
    summary: Type.Object(
      {
        pointOfInterestCount: Type.Integer({ minimum: 0 }),
        corridorUnitCount: Type.Integer({ minimum: 0 }),
        destinationUnitCount: Type.Integer({ minimum: 0 }),
        destinationCityCount: Type.Integer({ minimum: 0 }),
        apparentOtherStrength: Type.Number(),
        nextStepCount: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false },
    ),
    corridor: Type.Object(
      {
        routeHint: Type.String(),
        directGridDistance: Type.Union([Type.Number(), Type.Null()]),
        sampleCount: Type.Integer({ minimum: 0 }),
        unitCount: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false },
    ),
    destinationPressure: Type.Object(
      {
        unitCount: Type.Integer({ minimum: 0 }),
        cityCount: Type.Integer({ minimum: 0 }),
        apparentOtherStrength: Type.Number(),
      },
      { additionalProperties: false },
    ),
    pointsOfInterest: Type.Array(Civ7StrategyDestinationPointOfInterestSchema),
    omitted: Type.Array(Type.Object(
      {
        path: Type.String(),
        reason: Type.String(),
      },
      { additionalProperties: false },
    )),
    notes: Type.Array(Type.String()),
    nextSteps: Type.Array(Civ7StrategyDestinationAnalysisNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7StrategyDestinationAnalysisResult = Static<
  typeof Civ7StrategyDestinationAnalysisResultSchema
>;

const Civ7StrategyBattlefieldScanInputSchema = Type.Object(
  {
    playerId: Type.Optional(Type.Integer({ minimum: 0, maximum: 1024 })),
    origins: Type.Optional(Type.Array(Civ7ControlOrpcMapLocationSchema)),
    radius: Type.Optional(Type.Integer({ minimum: 1, maximum: 32 })),
    maxPlayers: Type.Optional(Type.Integer({ minimum: 1, maximum: 128 })),
    maxUnits: Type.Optional(Type.Integer({ minimum: 1, maximum: 256 })),
    maxCities: Type.Optional(Type.Integer({ minimum: 1, maximum: 128 })),
  },
  { additionalProperties: false },
);
export type Civ7StrategyBattlefieldScanInput = Static<
  typeof Civ7StrategyBattlefieldScanInputSchema
>;

const Civ7StrategyBattlefieldNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("inspect-battlefield-point"),
      Type.Literal("read-visibility"),
      Type.Literal("validate-unit-action"),
      Type.Literal("observe"),
    ]),
    source: Type.Literal("strategy.battlefieldScan"),
    label: Type.String(),
    parameters: Type.Object(
      {
        origin: Type.Optional(Civ7ControlOrpcMapLocationSchema),
        location: Type.Optional(Civ7ControlOrpcMapLocationSchema),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

const Civ7StrategyBattlefieldOwnerSchema = Type.Object(
  {
    owner: Type.Integer({ minimum: 0 }),
    relationship: Civ7StrategyRelationshipClassificationSchema,
    relationshipProof: Type.Union([Type.Literal("self"), Type.Literal("none")]),
    unitCount: Type.Integer({ minimum: 0 }),
    cityCount: Type.Integer({ minimum: 0 }),
    apparentStrength: Type.Number(),
    nearestDistance: Type.Union([Type.Number(), Type.Null()]),
    roles: Type.Record(Type.String(), Type.Integer({ minimum: 0 })),
  },
  { additionalProperties: false },
);

const Civ7StrategyBattlefieldPointOfInterestSchema = Type.Object(
  {
    kind: Type.String(),
    severity: Type.String(),
    location: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()]),
    summary: Type.String(),
  },
  { additionalProperties: false },
);

const Civ7StrategyBattlefieldScanResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0 }),
    localPlayerId: Type.Integer({ minimum: 0 }),
    origins: Type.Array(Civ7ControlOrpcMapLocationSchema),
    radius: Type.Integer({ minimum: 1 }),
    hiddenInfoPolicy: Type.String(),
    relationshipLabelPolicy: Civ7StrategyRelationshipLabelPolicySchema,
    summary: Type.Object(
      {
        unitCount: Type.Integer({ minimum: 0 }),
        cityCount: Type.Integer({ minimum: 0 }),
        observedOwnerCount: Type.Integer({ minimum: 0 }),
        pointOfInterestCount: Type.Integer({ minimum: 0 }),
        apparentStrengthTotal: Type.Number(),
        nextStepCount: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false },
    ),
    owners: Type.Array(Civ7StrategyBattlefieldOwnerSchema),
    pointsOfInterest: Type.Array(Civ7StrategyBattlefieldPointOfInterestSchema),
    omitted: Type.Array(Type.Object(
      {
        path: Type.String(),
        reason: Type.String(),
      },
      { additionalProperties: false },
    )),
    notes: Type.Array(Type.String()),
    nextSteps: Type.Array(Civ7StrategyBattlefieldNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7StrategyBattlefieldScanResult = Static<
  typeof Civ7StrategyBattlefieldScanResultSchema
>;

const Civ7StrategyFrontSummaryInputStandardSchema = toStandardSchema(
  Civ7StrategyFrontSummaryInputSchema,
);
const Civ7StrategyFrontSummaryResultStandardSchema = toStandardSchema(
  Civ7StrategyFrontSummaryResultSchema,
);
const Civ7StrategyTargetCandidatesInputStandardSchema = toStandardSchema(
  Civ7StrategyTargetCandidatesInputSchema,
);
const Civ7StrategyTargetCandidatesResultStandardSchema = toStandardSchema(
  Civ7StrategyTargetCandidatesResultSchema,
);
const Civ7StrategyDestinationAnalysisInputStandardSchema = toStandardSchema(
  Civ7StrategyDestinationAnalysisInputSchema,
);
const Civ7StrategyDestinationAnalysisResultStandardSchema = toStandardSchema(
  Civ7StrategyDestinationAnalysisResultSchema,
);
const Civ7StrategyBattlefieldScanInputStandardSchema = toStandardSchema(
  Civ7StrategyBattlefieldScanInputSchema,
);
const Civ7StrategyBattlefieldScanResultStandardSchema = toStandardSchema(
  Civ7StrategyBattlefieldScanResultSchema,
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

const Civ7StrategyFormationSnapshotInputSchema = Type.Object(
  {
    playerId: Type.Optional(Type.Integer({ minimum: 0, maximum: 1024 })),
    origin: Type.Optional(Civ7ControlOrpcMapLocationSchema),
    radius: Type.Optional(Type.Integer({ minimum: 1, maximum: 16 })),
    screenRadius: Type.Optional(Type.Integer({ minimum: 1, maximum: 6 })),
    contactRadius: Type.Optional(Type.Integer({ minimum: 1, maximum: 8 })),
    maxUnits: Type.Optional(Type.Integer({ minimum: 1, maximum: 256 })),
    maxCities: Type.Optional(Type.Integer({ minimum: 1, maximum: 128 })),
  },
  { additionalProperties: false },
);
export type Civ7StrategyFormationSnapshotInput = Static<
  typeof Civ7StrategyFormationSnapshotInputSchema
>;

const Civ7StrategyFormationSourceStatusSchema = Type.Object(
  {
    notifications: Type.Literal("read"),
    readyUnit: Type.Union([
      Type.Literal("read"),
      Type.Literal("skipped-explicit-origin"),
      Type.Literal("skipped-no-ready-unit"),
    ]),
    battlefieldScan: Type.Literal("read"),
  },
  { additionalProperties: false },
);

const Civ7StrategyFormationPostureSchema = Type.Union([
  Type.Literal("screen-civilian"),
  Type.Literal("hold-ready-unit"),
  Type.Literal("stabilize-front"),
  Type.Literal("advance-with-validation"),
  Type.Literal("inspect-ready-unit"),
]);

const Civ7StrategyFormationUnitSchema = Type.Object(
  {
    id: Type.Union([Civ7ControlOrpcComponentIdSchema, Type.Null()]),
    owner: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()]),
    stance: Type.String(),
    role: Type.String(),
    typeName: Type.Union([Type.String(), Type.Null()]),
    location: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()]),
    distance: Type.Union([Type.Number(), Type.Null()]),
  },
  { additionalProperties: false },
);

const Civ7StrategyFormationNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("read-priorities"),
      Type.Literal("inspect-ready-unit"),
      Type.Literal("inspect-battlefield"),
      Type.Literal("inspect-civilian-route"),
      Type.Literal("validate-unit-action"),
    ]),
    source: Type.Literal("strategy.formationSnapshot"),
    label: Type.String(),
    parameters: Type.Object(
      {
        origin: Type.Optional(Civ7ControlOrpcMapLocationSchema),
        civilian: Type.Optional(Civ7ControlOrpcMapLocationSchema),
        contact: Type.Optional(Civ7ControlOrpcMapLocationSchema),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

const Civ7StrategyFormationSnapshotResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0 }),
    localPlayerId: Type.Integer({ minimum: 0 }),
    turn: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()]),
    turnDate: Type.Union([Type.String(), Type.Null()]),
    blocker: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()]),
    nextDecision: Type.Union([Type.String(), Type.Null()]),
    origin: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()]),
    sourceStatus: Civ7StrategyFormationSourceStatusSchema,
    readyUnit: Type.Union([
      Type.Object(
        {
          unitId: Type.Union([Civ7ControlOrpcComponentIdSchema, Type.Null()]),
          typeName: Type.Union([Type.String(), Type.Null()]),
          location: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()]),
          legalNoTargetOperationCount: Type.Integer({ minimum: 0 }),
        },
        { additionalProperties: false },
      ),
      Type.Null(),
    ]),
    battlefield: Type.Object(
      {
        originCount: Type.Integer({ minimum: 0 }),
        unitCount: Type.Integer({ minimum: 0 }),
        pointOfInterestCount: Type.Integer({ minimum: 0 }),
        hiddenInfoPolicy: Type.String(),
      },
      { additionalProperties: false },
    ),
    formation: Type.Object(
      {
        posture: Civ7StrategyFormationPostureSchema,
        relationshipLabelPolicy: Civ7StrategyRelationshipLabelPolicySchema,
        headline: Type.String(),
        reasons: Type.Array(Type.String()),
        civilians: Type.Array(Civ7StrategyFormationUnitSchema),
        screens: Type.Array(Civ7StrategyFormationUnitSchema),
        otherOwnerContacts: Type.Array(Civ7StrategyFormationUnitSchema),
        nearbyContacts: Type.Array(Civ7StrategyFormationUnitSchema),
        nextSteps: Type.Array(Civ7StrategyFormationNextStepSchema),
      },
      { additionalProperties: false },
    ),
    notes: Type.Array(Type.String()),
    nextSteps: Type.Array(Civ7StrategyFormationNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7StrategyFormationSnapshotResult = Static<
  typeof Civ7StrategyFormationSnapshotResultSchema
>;

const Civ7StrategyFormationSnapshotInputStandardSchema = toStandardSchema(
  Civ7StrategyFormationSnapshotInputSchema,
);
const Civ7StrategyFormationSnapshotResultStandardSchema = toStandardSchema(
  Civ7StrategyFormationSnapshotResultSchema,
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

export type Civ7StrategyTargetCandidatesContract = ContractProcedure<
  typeof Civ7StrategyTargetCandidatesInputStandardSchema,
  typeof Civ7StrategyTargetCandidatesResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7StrategyTargetCandidatesContract:
  Civ7StrategyTargetCandidatesContract =
    civ7ControlOrpcContractBase
      .input(Civ7StrategyTargetCandidatesInputStandardSchema)
      .output(Civ7StrategyTargetCandidatesResultStandardSchema)
      .meta({
        family: "strategy",
        procedureKey: "strategy.targetCandidates",
        proofBoundary: "local-package-test",
        risk: "read-only",
      });

export type Civ7StrategyDestinationAnalysisContract = ContractProcedure<
  typeof Civ7StrategyDestinationAnalysisInputStandardSchema,
  typeof Civ7StrategyDestinationAnalysisResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7StrategyDestinationAnalysisContract:
  Civ7StrategyDestinationAnalysisContract =
    civ7ControlOrpcContractBase
      .input(Civ7StrategyDestinationAnalysisInputStandardSchema)
      .output(Civ7StrategyDestinationAnalysisResultStandardSchema)
      .meta({
        family: "strategy",
        procedureKey: "strategy.destinationAnalysis",
        proofBoundary: "local-package-test",
        risk: "read-only",
      });

export type Civ7StrategyBattlefieldScanContract = ContractProcedure<
  typeof Civ7StrategyBattlefieldScanInputStandardSchema,
  typeof Civ7StrategyBattlefieldScanResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7StrategyBattlefieldScanContract:
  Civ7StrategyBattlefieldScanContract =
    civ7ControlOrpcContractBase
      .input(Civ7StrategyBattlefieldScanInputStandardSchema)
      .output(Civ7StrategyBattlefieldScanResultStandardSchema)
      .meta({
        family: "strategy",
        procedureKey: "strategy.battlefieldScan",
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

export type Civ7StrategyFormationSnapshotContract = ContractProcedure<
  typeof Civ7StrategyFormationSnapshotInputStandardSchema,
  typeof Civ7StrategyFormationSnapshotResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7StrategyFormationSnapshotContract:
  Civ7StrategyFormationSnapshotContract =
    civ7ControlOrpcContractBase
      .input(Civ7StrategyFormationSnapshotInputStandardSchema)
      .output(Civ7StrategyFormationSnapshotResultStandardSchema)
      .meta({
        family: "strategy",
        procedureKey: "strategy.formationSnapshot",
        proofBoundary: "local-package-test",
        risk: "read-only",
      });

export type Civ7StrategyContract = Readonly<{
  battlefieldScan: Civ7StrategyBattlefieldScanContract;
  civilianRouteTriage: Civ7StrategyCivilianRouteTriageContract;
  destinationAnalysis: Civ7StrategyDestinationAnalysisContract;
  formationSnapshot: Civ7StrategyFormationSnapshotContract;
  frontSummary: Civ7StrategyFrontSummaryContract;
  targetCandidates: Civ7StrategyTargetCandidatesContract;
}>;

export const Civ7StrategyContract: Civ7StrategyContract = {
  battlefieldScan: Civ7StrategyBattlefieldScanContract,
  civilianRouteTriage: Civ7StrategyCivilianRouteTriageContract,
  destinationAnalysis: Civ7StrategyDestinationAnalysisContract,
  formationSnapshot: Civ7StrategyFormationSnapshotContract,
  frontSummary: Civ7StrategyFrontSummaryContract,
  targetCandidates: Civ7StrategyTargetCandidatesContract,
};
