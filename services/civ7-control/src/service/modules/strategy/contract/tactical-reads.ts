import { Type } from "typebox";
import {
  Civ7ControlOrpcComponentIdSchema,
  Civ7ControlOrpcMapLocationSchema,
} from "#civ7-control-service/model/dto/primitives";
import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

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
const Civ7StrategyTargetCandidatesInputSchema = Type.Object(
  {
    playerId: Type.Optional(Type.Integer({ minimum: 0, maximum: 1024, description: "Player id." })),
    origins: Type.Optional(
      Type.Array(Civ7ControlOrpcMapLocationSchema, {
        description: "Origins.",
      })
    ),
    maxCandidates: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 64, description: "Max candidates." })
    ),
    maxPlayers: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 128, description: "Max players." })
    ),
    unitRadius: Type.Optional(
      Type.Integer({ minimum: 0, maximum: 16, description: "Unit radius." })
    ),
  },
  { additionalProperties: false }
);
const Civ7StrategyTargetCandidatesNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
        Type.Literal("inspect-candidate"),
        Type.Literal("read-visibility"),
        Type.Literal("validate-unit-action"),
        Type.Literal("observe"),
      ],
      {
        description: "Semantic kind of this value.",
      }
    ),
    source: Type.Literal("strategy.targetCandidates", {
      description: "Authority that supplied this value.",
    }),
    label: Type.String({
      description: "Human-readable label.",
    }),
    parameters: Type.Object(
      {
        owner: Type.Optional(Type.Integer({ minimum: 0, description: "Owner." })),
        target: Type.Optional(Civ7ControlOrpcMapLocationSchema),
      },
      { additionalProperties: false, description: "Parameters." }
    ),
  },
  { additionalProperties: false }
);
const Civ7StrategyTargetCandidateApproachSchema = Type.Object(
  {
    nearestOrigin: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()], {
      description: "Nearest origin.",
    }),
    targetLocation: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()], {
      description: "Target location.",
    }),
    directGridDistance: Type.Union([Type.Number(), Type.Null()], {
      description: "Direct grid distance.",
    }),
    routeHint: Type.String({
      description: "Route hint.",
    }),
    routeKind: Type.String({
      description: "Route kind.",
    }),
    waterSampleCount: Type.Integer({ minimum: 0, description: "Water sample count." }),
    landSampleCount: Type.Integer({ minimum: 0, description: "Land sample count." }),
    notes: Type.Array(Type.String(), {
      description: "Notes values.",
    }),
  },
  { additionalProperties: false }
);
const Civ7StrategyTargetCandidateResultSchema = Type.Object(
  {
    owner: Type.Integer({ minimum: 0, description: "Owner." }),
    relationship: Type.Literal("relationship-unproven", {
      description: "Relationship.",
    }),
    relationshipProof: Type.Literal("none", {
      description: "Relationship proof.",
    }),
    leaderName: Type.Union([Type.String(), Type.Null()], {
      description: "Leader name.",
    }),
    civilizationName: Type.Union([Type.String(), Type.Null()], {
      description: "Civilization name.",
    }),
    isHuman: Type.Union([Type.Boolean(), Type.Null()], {
      description: "Is human.",
    }),
    cityCount: Type.Integer({ minimum: 0, description: "City count." }),
    unitCount: Type.Integer({ minimum: 0, description: "Unit count." }),
    nearestDistance: Type.Union([Type.Number(), Type.Null()], {
      description: "Nearest distance.",
    }),
    nearbyUnitCount: Type.Integer({ minimum: 0, description: "Nearby unit count." }),
    apparentStrength: Type.Number({
      description: "Apparent strength.",
    }),
    nearestCityLocation: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()], {
      description: "Nearest city location.",
    }),
    approach: Civ7StrategyTargetCandidateApproachSchema,
    reasons: Type.Array(Type.String(), {
      description: "Reasons values.",
    }),
  },
  { additionalProperties: false }
);
const Civ7StrategyTargetCandidatesResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0, description: "Player id." }),
    localPlayerId: Type.Integer({ minimum: 0, description: "Local player id." }),
    origins: Type.Array(Civ7ControlOrpcMapLocationSchema, {
      description: "Origins values.",
    }),
    unitRadius: Type.Integer({ minimum: 0, description: "Unit radius." }),
    hiddenInfoPolicy: Type.String({
      description: "Hidden info policy.",
    }),
    relationshipLabelPolicy: Civ7StrategyRelationshipLabelPolicySchema,
    summary: Type.Object(
      {
        candidateCount: Type.Integer({ minimum: 0, description: "Candidate count." }),
        nearestDistance: Type.Union([Type.Number(), Type.Null()], {
          description: "Nearest distance.",
        }),
        observedOwnerCount: Type.Integer({ minimum: 0, description: "Observed owner count." }),
        apparentStrengthTotal: Type.Number({
          description: "Apparent strength total.",
        }),
        nextStepCount: Type.Integer({ minimum: 0, description: "Next step count." }),
      },
      { additionalProperties: false, description: "Summary." }
    ),
    candidates: Type.Array(Civ7StrategyTargetCandidateResultSchema, {
      description: "Candidates values.",
    }),
    omitted: Type.Array(
      Type.Object(
        {
          path: Type.String({
            description: "Path.",
          }),
          reason: Type.String({
            description: "Reason for the reported outcome.",
          }),
        },
        { additionalProperties: false }
      ),
      {
        description: "Omitted values.",
      }
    ),
    notes: Type.Array(Type.String(), {
      description: "Notes values.",
    }),
    nextSteps: Type.Array(Civ7StrategyTargetCandidatesNextStepSchema, {
      description: "Next steps values.",
    }),
  },
  { additionalProperties: false }
);
const Civ7StrategyDestinationAnalysisInputSchema = Type.Object(
  {
    playerId: Type.Optional(Type.Integer({ minimum: 0, maximum: 1024, description: "Player id." })),
    origin: Type.Optional(Civ7ControlOrpcMapLocationSchema),
    destination: Civ7ControlOrpcMapLocationSchema,
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
const Civ7StrategyDestinationAnalysisNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
        Type.Literal("inspect-destination"),
        Type.Literal("read-visibility"),
        Type.Literal("validate-unit-action"),
        Type.Literal("observe"),
      ],
      {
        description: "Semantic kind of this value.",
      }
    ),
    source: Type.Literal("strategy.destinationAnalysis", {
      description: "Authority that supplied this value.",
    }),
    label: Type.String({
      description: "Human-readable label.",
    }),
    parameters: Type.Object(
      {
        origin: Type.Optional(Civ7ControlOrpcMapLocationSchema),
        destination: Type.Optional(Civ7ControlOrpcMapLocationSchema),
      },
      { additionalProperties: false, description: "Parameters." }
    ),
  },
  { additionalProperties: false }
);
const Civ7StrategyDestinationPointOfInterestSchema = Type.Object(
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
  },
  { additionalProperties: false }
);
const Civ7StrategyDestinationAnalysisResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0, description: "Player id." }),
    localPlayerId: Type.Integer({ minimum: 0, description: "Local player id." }),
    origin: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()], {
      description: "Origin.",
    }),
    destination: Civ7ControlOrpcMapLocationSchema,
    corridorRadius: Type.Integer({ minimum: 0, description: "Corridor radius." }),
    destinationRadius: Type.Integer({ minimum: 1, description: "Destination radius." }),
    hiddenInfoPolicy: Type.String({
      description: "Hidden info policy.",
    }),
    relationshipLabelPolicy: Civ7StrategyRelationshipLabelPolicySchema,
    summary: Type.Object(
      {
        pointOfInterestCount: Type.Integer({ minimum: 0, description: "Point of interest count." }),
        corridorUnitCount: Type.Integer({ minimum: 0, description: "Corridor unit count." }),
        destinationUnitCount: Type.Integer({ minimum: 0, description: "Destination unit count." }),
        destinationCityCount: Type.Integer({ minimum: 0, description: "Destination city count." }),
        apparentOtherStrength: Type.Number({
          description: "Apparent other strength.",
        }),
        nextStepCount: Type.Integer({ minimum: 0, description: "Next step count." }),
      },
      { additionalProperties: false, description: "Summary." }
    ),
    corridor: Type.Object(
      {
        routeHint: Type.String({
          description: "Route hint.",
        }),
        directGridDistance: Type.Union([Type.Number(), Type.Null()], {
          description: "Direct grid distance.",
        }),
        sampleCount: Type.Integer({ minimum: 0, description: "Sample count." }),
        unitCount: Type.Integer({ minimum: 0, description: "Unit count." }),
      },
      { additionalProperties: false, description: "Corridor." }
    ),
    destinationPressure: Type.Object(
      {
        unitCount: Type.Integer({ minimum: 0, description: "Unit count." }),
        cityCount: Type.Integer({ minimum: 0, description: "City count." }),
        apparentOtherStrength: Type.Number({
          description: "Apparent other strength.",
        }),
      },
      { additionalProperties: false, description: "Destination pressure." }
    ),
    pointsOfInterest: Type.Array(Civ7StrategyDestinationPointOfInterestSchema, {
      description: "Points of interest values.",
    }),
    omitted: Type.Array(
      Type.Object(
        {
          path: Type.String({
            description: "Path.",
          }),
          reason: Type.String({
            description: "Reason for the reported outcome.",
          }),
        },
        { additionalProperties: false }
      ),
      {
        description: "Omitted values.",
      }
    ),
    notes: Type.Array(Type.String(), {
      description: "Notes values.",
    }),
    nextSteps: Type.Array(Civ7StrategyDestinationAnalysisNextStepSchema, {
      description: "Next steps values.",
    }),
  },
  { additionalProperties: false }
);
const Civ7StrategyBattlefieldScanInputSchema = Type.Object(
  {
    playerId: Type.Optional(Type.Integer({ minimum: 0, maximum: 1024, description: "Player id." })),
    origins: Type.Optional(
      Type.Array(Civ7ControlOrpcMapLocationSchema, {
        description: "Origins.",
      })
    ),
    radius: Type.Optional(Type.Integer({ minimum: 1, maximum: 32, description: "Radius." })),
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
const Civ7StrategyBattlefieldNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
        Type.Literal("inspect-battlefield-point"),
        Type.Literal("read-visibility"),
        Type.Literal("validate-unit-action"),
        Type.Literal("observe"),
      ],
      {
        description: "Semantic kind of this value.",
      }
    ),
    source: Type.Literal("strategy.battlefieldScan", {
      description: "Authority that supplied this value.",
    }),
    label: Type.String({
      description: "Human-readable label.",
    }),
    parameters: Type.Object(
      {
        origin: Type.Optional(Civ7ControlOrpcMapLocationSchema),
        location: Type.Optional(Civ7ControlOrpcMapLocationSchema),
      },
      { additionalProperties: false, description: "Parameters." }
    ),
  },
  { additionalProperties: false }
);
const Civ7StrategyBattlefieldOwnerSchema = Type.Object(
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
    roles: Type.Record(Type.String(), Type.Integer({ minimum: 0 }), {
      description: "Roles.",
    }),
  },
  { additionalProperties: false }
);
const Civ7StrategyBattlefieldPointOfInterestSchema = Type.Object(
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
  },
  { additionalProperties: false }
);
const Civ7StrategyBattlefieldScanResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0, description: "Player id." }),
    localPlayerId: Type.Integer({ minimum: 0, description: "Local player id." }),
    origins: Type.Array(Civ7ControlOrpcMapLocationSchema, {
      description: "Origins values.",
    }),
    radius: Type.Integer({ minimum: 1, description: "Radius." }),
    hiddenInfoPolicy: Type.String({
      description: "Hidden info policy.",
    }),
    relationshipLabelPolicy: Civ7StrategyRelationshipLabelPolicySchema,
    summary: Type.Object(
      {
        unitCount: Type.Integer({ minimum: 0, description: "Unit count." }),
        cityCount: Type.Integer({ minimum: 0, description: "City count." }),
        observedOwnerCount: Type.Integer({ minimum: 0, description: "Observed owner count." }),
        pointOfInterestCount: Type.Integer({ minimum: 0, description: "Point of interest count." }),
        apparentStrengthTotal: Type.Number({
          description: "Apparent strength total.",
        }),
        nextStepCount: Type.Integer({ minimum: 0, description: "Next step count." }),
      },
      { additionalProperties: false, description: "Summary." }
    ),
    owners: Type.Array(Civ7StrategyBattlefieldOwnerSchema, {
      description: "Owners values.",
    }),
    pointsOfInterest: Type.Array(Civ7StrategyBattlefieldPointOfInterestSchema, {
      description: "Points of interest values.",
    }),
    omitted: Type.Array(
      Type.Object(
        {
          path: Type.String({
            description: "Path.",
          }),
          reason: Type.String({
            description: "Reason for the reported outcome.",
          }),
        },
        { additionalProperties: false }
      ),
      {
        description: "Omitted values.",
      }
    ),
    notes: Type.Array(Type.String(), {
      description: "Notes values.",
    }),
    nextSteps: Type.Array(Civ7StrategyBattlefieldNextStepSchema, {
      description: "Next steps values.",
    }),
  },
  { additionalProperties: false }
);
const Civ7StrategyTargetCandidatesContract = base
  .input(standard(Civ7StrategyTargetCandidatesInputSchema))
  .output(standard(Civ7StrategyTargetCandidatesResultSchema))
  .meta({
    family: "strategy",
    procedureKey: "strategy.targetCandidates",
    proofBoundary: "local-package-test",
    risk: "read-only",
  });
const Civ7StrategyDestinationAnalysisContract = base
  .input(standard(Civ7StrategyDestinationAnalysisInputSchema))
  .output(standard(Civ7StrategyDestinationAnalysisResultSchema))
  .meta({
    family: "strategy",
    procedureKey: "strategy.destinationAnalysis",
    proofBoundary: "local-package-test",
    risk: "read-only",
  });
const Civ7StrategyBattlefieldScanContract = base
  .input(standard(Civ7StrategyBattlefieldScanInputSchema))
  .output(standard(Civ7StrategyBattlefieldScanResultSchema))
  .meta({
    family: "strategy",
    procedureKey: "strategy.battlefieldScan",
    proofBoundary: "local-package-test",
    risk: "read-only",
  });
export const tacticalReads = {
  battlefieldScan: Civ7StrategyBattlefieldScanContract,
  destinationAnalysis: Civ7StrategyDestinationAnalysisContract,
  targetCandidates: Civ7StrategyTargetCandidatesContract,
};
