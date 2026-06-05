import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { Civ7ControlOrpcMapLocationSchema } from "../../model/primitives";
import { toStandardSchema } from "../../typebox-standard-schema";

export const Civ7StrategyFrontSummaryInputSchema = Type.Object(
  {
    playerId: Type.Optional(Type.Integer({ minimum: 0, maximum: 1024 })),
    origins: Type.Optional(Type.Array(Civ7ControlOrpcMapLocationSchema)),
    candidateLimit: Type.Optional(Type.Integer({ minimum: 1, maximum: 8 })),
    scanRadius: Type.Optional(Type.Integer({ minimum: 1, maximum: 32 })),
    maxPlayers: Type.Optional(Type.Integer({ minimum: 1, maximum: 128 })),
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

export const Civ7StrategyFrontSummaryResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0 }),
    localPlayerId: Type.Integer({ minimum: 0 }),
    origins: Type.Array(Civ7ControlOrpcMapLocationSchema),
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

export const Civ7StrategyFrontSummaryInputStandardSchema = toStandardSchema(
  Civ7StrategyFrontSummaryInputSchema,
);
export const Civ7StrategyFrontSummaryResultStandardSchema = toStandardSchema(
  Civ7StrategyFrontSummaryResultSchema,
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

export type Civ7StrategyContract = Readonly<{
  frontSummary: Civ7StrategyFrontSummaryContract;
}>;

export const Civ7StrategyContract: Civ7StrategyContract = {
  frontSummary: Civ7StrategyFrontSummaryContract,
};
