import { Type } from "typebox";
import {
  Civ7ControlOrpcComponentIdSchema,
  Civ7ControlOrpcMapLocationSchema,
} from "#civ7-control-service/model/dto/primitives";
import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

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
const Civ7StrategyCivilianRouteTriageInputSchema = Type.Object(
  {
    playerId: Type.Optional(Type.Integer({ minimum: 0, maximum: 1024, description: "Player id." })),
    origin: Type.Optional(Civ7ControlOrpcMapLocationSchema),
    destination: Type.Optional(Civ7ControlOrpcMapLocationSchema),
    settlementCount: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 12, description: "Settlement count." })
    ),
    scanRadius: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 16, description: "Scan radius." })
    ),
    corridorRadius: Type.Optional(
      Type.Integer({ minimum: 0, maximum: 8, description: "Corridor radius." })
    ),
    destinationRadius: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 16, description: "Destination radius." })
    ),
    maxUnits: Type.Optional(Type.Integer({ minimum: 1, maximum: 256, description: "Max units." })),
    maxCities: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 128, description: "Max cities." })
    ),
  },
  { additionalProperties: false }
);
const Civ7StrategyCivilianRouteTriageSourceStatusSchema = Type.Object(
  {
    notifications: Type.Literal("read", {
      description: "Notifications.",
    }),
    readyUnit: Type.Union(
      [
        Type.Literal("read"),
        Type.Literal("skipped-explicit-origin"),
        Type.Literal("skipped-no-ready-unit"),
      ],
      {
        description: "Ready unit.",
      }
    ),
    settlementRecommendations: Type.Literal("read", {
      description: "Settlement recommendations.",
    }),
    battlefieldScan: Type.Literal("read", {
      description: "Battlefield scan.",
    }),
    destinationAnalysis: Type.Union(
      [Type.Literal("read"), Type.Literal("skipped-no-origin-or-destination")],
      {
        description: "Destination analysis.",
      }
    ),
  },
  { additionalProperties: false }
);
const Civ7StrategyCivilianRouteNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
        Type.Literal("read-priorities"),
        Type.Literal("inspect-battlefield"),
        Type.Literal("inspect-settlement"),
        Type.Literal("inspect-destination"),
        Type.Literal("inspect-front"),
        Type.Literal("inspect-ready-unit"),
        Type.Literal("validate-unit-action"),
      ],
      {
        description: "Semantic kind of this value.",
      }
    ),
    source: Type.Literal("strategy.civilianRouteTriage", {
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
const Civ7StrategyCivilianRouteTriageStatusSchema = Type.Union([
  Type.Literal("proceed-with-validation"),
  Type.Literal("hold-or-screen"),
  Type.Literal("reroute-or-stage"),
  Type.Literal("inspect-candidate"),
]);
const Civ7StrategyCivilianRouteTriageResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0, description: "Player id." }),
    localPlayerId: Type.Integer({ minimum: 0, description: "Local player id." }),
    origin: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()], {
      description: "Origin.",
    }),
    destination: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()], {
      description: "Destination.",
    }),
    sourceStatus: Civ7StrategyCivilianRouteTriageSourceStatusSchema,
    relationshipLabelPolicy: Civ7StrategyRelationshipLabelPolicySchema,
    readyUnit: Type.Union(
      [
        Type.Object(
          {
            unitId: Type.Union([Civ7ControlOrpcComponentIdSchema, Type.Null()], {
              description: "Unit id.",
            }),
            typeName: Type.Union([Type.String(), Type.Null()], {
              description: "Type name.",
            }),
            location: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()], {
              description: "Location.",
            }),
            legalOperationCount: Type.Integer({
              minimum: 0,
              description: "Legal operation count.",
            }),
          },
          { additionalProperties: false }
        ),
        Type.Null(),
      ],
      {
        description: "Ready unit.",
      }
    ),
    settlement: Type.Object(
      {
        originCount: Type.Integer({ minimum: 0, description: "Origin count." }),
        recommendationCount: Type.Integer({ minimum: 0, description: "Recommendation count." }),
        firstSuggestion: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()], {
          description: "First suggestion.",
        }),
      },
      { additionalProperties: false, description: "Settlement." }
    ),
    battlefield: Type.Object(
      {
        pointOfInterestCount: Type.Integer({ minimum: 0, description: "Point of interest count." }),
        observedOwnerCount: Type.Integer({ minimum: 0, description: "Observed owner count." }),
        hiddenInfoPolicy: Type.String({
          description: "Hidden info policy.",
        }),
      },
      { additionalProperties: false, description: "Battlefield." }
    ),
    destinationAnalysis: Type.Union(
      [
        Type.Object(
          {
            pointOfInterestCount: Type.Integer({
              minimum: 0,
              description: "Point of interest count.",
            }),
            destinationUnitCount: Type.Integer({
              minimum: 0,
              description: "Destination unit count.",
            }),
            destinationCityCount: Type.Integer({
              minimum: 0,
              description: "Destination city count.",
            }),
            apparentOtherStrength: Type.Number({
              description: "Apparent other strength.",
            }),
          },
          { additionalProperties: false }
        ),
        Type.Null(),
      ],
      {
        description: "Destination analysis.",
      }
    ),
    triage: Type.Object(
      {
        status: Civ7StrategyCivilianRouteTriageStatusSchema,
        summary: Type.String({
          description: "Summary.",
        }),
        reasons: Type.Array(Type.String(), {
          description: "Reasons values.",
        }),
        nextSteps: Type.Array(Civ7StrategyCivilianRouteNextStepSchema, {
          description: "Next steps values.",
        }),
      },
      { additionalProperties: false, description: "Triage." }
    ),
    notes: Type.Array(Type.String(), {
      description: "Notes values.",
    }),
    nextSteps: Type.Array(Civ7StrategyCivilianRouteNextStepSchema, {
      description: "Next steps values.",
    }),
  },
  { additionalProperties: false }
);
const Civ7StrategyCivilianRouteTriageContract = base
  .input(standard(Civ7StrategyCivilianRouteTriageInputSchema))
  .output(standard(Civ7StrategyCivilianRouteTriageResultSchema))
  .meta({
    family: "strategy",
    procedureKey: "strategy.civilianRouteTriage",
    proofBoundary: "local-package-test",
    risk: "read-only",
  });
export const civilianRouteTriage = {
  civilianRouteTriage: Civ7StrategyCivilianRouteTriageContract,
};
