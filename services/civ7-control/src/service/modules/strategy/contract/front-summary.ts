import { Type } from "typebox";
import {
  Civ7ControlOrpcComponentIdSchema,
  Civ7ControlOrpcMapLocationSchema,
} from "#civ7-control-service/model/dto/primitives";
import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7StrategyFrontSummaryInputSchema = Type.Object(
  {
    playerId: Type.Optional(Type.Integer({ minimum: 0, maximum: 1024, description: "Player id." })),
    origins: Type.Optional(
      Type.Array(Civ7ControlOrpcMapLocationSchema, {
        description: "Origins.",
      })
    ),
    target: Type.Optional(Civ7ControlOrpcMapLocationSchema),
    candidateLimit: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 8, description: "Candidate limit." })
    ),
    scanRadius: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 32, description: "Scan radius." })
    ),
    corridorRadius: Type.Optional(
      Type.Integer({ minimum: 0, maximum: 8, description: "Corridor radius." })
    ),
    destinationRadius: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 16, description: "Destination radius." })
    ),
    maxPlayers: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 128, description: "Max players." })
    ),
    maxUnits: Type.Optional(Type.Integer({ minimum: 1, maximum: 256, description: "Max units." })),
    maxCities: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 128, description: "Max cities." })
    ),
  },
  { additionalProperties: false }
);
const Civ7StrategyRelationshipClassificationSchema = Type.Union([
  Type.Literal("self"),
  Type.Literal("relationship-unproven"),
]);
const Civ7StrategyRelationshipLabelPolicySchema = Type.Object(
  {
    relationshipSource: Type.Literal("not-classified", {
      description: "Relationship source.",
    }),
    relationshipProof: Type.Literal("none", {
      description: "Relationship proof.",
    }),
    unprovenLabel: Type.Literal("relationship-unproven", {
      description: "Unproven label.",
    }),
    guidance: Type.String({
      description: "Guidance.",
    }),
  },
  { additionalProperties: false }
);
const Civ7StrategyFrontSourceStatusSchema = Type.Object(
  {
    targetCandidates: Type.Literal("read", {
      description: "Target candidates.",
    }),
    battlefieldScan: Type.Literal("read", {
      description: "Battlefield scan.",
    }),
    destinationAnalysis: Type.Union([Type.Literal("read"), Type.Literal("skipped-no-target")], {
      description: "Destination analysis.",
    }),
  },
  { additionalProperties: false }
);
const Civ7StrategyFrontTargetCandidateSchema = Type.Object(
  {
    owner: Type.Integer({ minimum: 0, description: "Owner." }),
    relationship: Type.Literal("relationship-unproven", {
      description: "Relationship.",
    }),
    relationshipProof: Type.Literal("none", {
      description: "Relationship proof.",
    }),
    nearestDistance: Type.Union([Type.Number(), Type.Null()], {
      description: "Nearest distance.",
    }),
    cityCount: Type.Integer({ minimum: 0, description: "City count." }),
    unitCount: Type.Integer({ minimum: 0, description: "Unit count." }),
    nearbyUnitCount: Type.Integer({ minimum: 0, description: "Nearby unit count." }),
    apparentStrength: Type.Number({
      description: "Apparent strength.",
    }),
    routeKind: Type.String({
      description: "Route kind.",
    }),
    routeHint: Type.String({
      description: "Route hint.",
    }),
    reasons: Type.Array(Type.String(), {
      description: "Reasons values.",
    }),
  },
  { additionalProperties: false }
);
const Civ7StrategyFrontPointOfInterestSchema = Type.Object(
  {
    kind: Type.String({
      description: "Semantic kind of this value.",
    }),
    severity: Type.String({
      description: "Severity.",
    }),
    location: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()], {
      description: "Location.",
    }),
    summary: Type.String({
      description: "Summary.",
    }),
    source: Type.Union([Type.Literal("battlefield"), Type.Literal("destination")], {
      description: "Authority that supplied this value.",
    }),
  },
  { additionalProperties: false }
);
const Civ7StrategyFrontPressureSchema = Type.Object(
  {
    kind: Type.String({
      description: "Semantic kind of this value.",
    }),
    severity: Type.String({
      description: "Severity.",
    }),
    summary: Type.String({
      description: "Summary.",
    }),
    location: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()], {
      description: "Location.",
    }),
    source: Type.Union([Type.Literal("battlefield"), Type.Literal("destination")], {
      description: "Authority that supplied this value.",
    }),
  },
  { additionalProperties: false }
);
const Civ7StrategyObservedOwnerSchema = Type.Object(
  {
    owner: Type.Integer({ minimum: 0, description: "Owner." }),
    relationship: Civ7StrategyRelationshipClassificationSchema,
    relationshipProof: Type.Union([Type.Literal("self"), Type.Literal("none")], {
      description: "Relationship proof.",
    }),
    unitCount: Type.Integer({ minimum: 0, description: "Unit count." }),
    cityCount: Type.Integer({ minimum: 0, description: "City count." }),
    apparentStrength: Type.Number({
      description: "Apparent strength.",
    }),
    nearestDistance: Type.Union([Type.Number(), Type.Null()], {
      description: "Nearest distance.",
    }),
  },
  { additionalProperties: false }
);
const Civ7StrategyFrontSummaryNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
        Type.Literal("inspect-target-candidate"),
        Type.Literal("inspect-battlefield-point"),
        Type.Literal("read-visibility"),
        Type.Literal("validate-unit-action"),
        Type.Literal("observe"),
      ],
      {
        description: "Semantic kind of this value.",
      }
    ),
    source: Type.Literal("strategy.frontSummary", {
      description: "Authority that supplied this value.",
    }),
    label: Type.String({
      description: "Human-readable label.",
    }),
  },
  { additionalProperties: false }
);
const Civ7StrategyFrontSummaryResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0, description: "Player id." }),
    localPlayerId: Type.Integer({ minimum: 0, description: "Local player id." }),
    origins: Type.Array(Civ7ControlOrpcMapLocationSchema, {
      description: "Origins values.",
    }),
    target: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()], {
      description: "Target.",
    }),
    sourceStatus: Civ7StrategyFrontSourceStatusSchema,
    relationshipLabelPolicy: Civ7StrategyRelationshipLabelPolicySchema,
    summary: Type.Object(
      {
        targetCandidateCount: Type.Integer({ minimum: 0, description: "Target candidate count." }),
        pointOfInterestCount: Type.Integer({ minimum: 0, description: "Point of interest count." }),
        observedOwnerCount: Type.Integer({ minimum: 0, description: "Observed owner count." }),
        nextStepCount: Type.Integer({ minimum: 0, description: "Next step count." }),
      },
      { additionalProperties: false, description: "Summary." }
    ),
    front: Type.Object(
      {
        posture: Type.String({
          description: "Posture.",
        }),
        headline: Type.String({
          description: "Headline.",
        }),
        risks: Type.Array(Type.String(), {
          description: "Risks values.",
        }),
        nextInspections: Type.Array(Civ7StrategyFrontSummaryNextStepSchema, {
          description: "Next inspections values.",
        }),
        pressure: Type.Array(Civ7StrategyFrontPressureSchema, {
          description: "Pressure values.",
        }),
      },
      { additionalProperties: false, description: "Front." }
    ),
    targetCandidates: Type.Array(Civ7StrategyFrontTargetCandidateSchema, {
      description: "Target candidates values.",
    }),
    pointsOfInterest: Type.Array(Civ7StrategyFrontPointOfInterestSchema, {
      description: "Points of interest values.",
    }),
    observedOwners: Type.Array(Civ7StrategyObservedOwnerSchema, {
      description: "Observed owners values.",
    }),
    notes: Type.Array(Type.String(), {
      description: "Notes values.",
    }),
    nextSteps: Type.Array(Civ7StrategyFrontSummaryNextStepSchema, {
      description: "Next steps values.",
    }),
  },
  { additionalProperties: false }
);
const Civ7StrategyFrontSummaryContract = base
  .input(standard(Civ7StrategyFrontSummaryInputSchema))
  .output(standard(Civ7StrategyFrontSummaryResultSchema))
  .meta({
    family: "strategy",
    procedureKey: "strategy.frontSummary",
    proofBoundary: "local-package-test",
    risk: "read-only",
  });
export const frontSummary = {
  frontSummary: Civ7StrategyFrontSummaryContract,
};
