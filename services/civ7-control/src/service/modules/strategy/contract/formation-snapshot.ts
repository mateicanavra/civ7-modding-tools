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
const Civ7StrategyFormationSnapshotInputSchema = Type.Object(
  {
    playerId: Type.Optional(Type.Integer({ minimum: 0, maximum: 1024, description: "Player id." })),
    origin: Type.Optional(Civ7ControlOrpcMapLocationSchema),
    radius: Type.Optional(Type.Integer({ minimum: 1, maximum: 16, description: "Radius." })),
    screenRadius: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 6, description: "Screen radius." })
    ),
    contactRadius: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 8, description: "Contact radius." })
    ),
    maxUnits: Type.Optional(Type.Integer({ minimum: 1, maximum: 256, description: "Max units." })),
    maxCities: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 128, description: "Max cities." })
    ),
  },
  { additionalProperties: false }
);
const Civ7StrategyFormationSourceStatusSchema = Type.Object(
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
    battlefieldScan: Type.Literal("read", {
      description: "Battlefield scan.",
    }),
  },
  { additionalProperties: false }
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
    id: Type.Union([Civ7ControlOrpcComponentIdSchema, Type.Null()], {
      description: "Stable identifier.",
    }),
    owner: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()], {
      description: "Owner.",
    }),
    stance: Type.String({
      description: "Stance.",
    }),
    role: Type.String({
      description: "Role.",
    }),
    typeName: Type.Union([Type.String(), Type.Null()], {
      description: "Type name.",
    }),
    location: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()], {
      description: "Location.",
    }),
    distance: Type.Union([Type.Number(), Type.Null()], {
      description: "Distance.",
    }),
  },
  { additionalProperties: false }
);
const Civ7StrategyFormationNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
        Type.Literal("read-priorities"),
        Type.Literal("inspect-ready-unit"),
        Type.Literal("inspect-battlefield"),
        Type.Literal("inspect-civilian-route"),
        Type.Literal("validate-unit-action"),
      ],
      {
        description: "Semantic kind of this value.",
      }
    ),
    source: Type.Literal("strategy.formationSnapshot", {
      description: "Authority that supplied this value.",
    }),
    label: Type.String({
      description: "Human-readable label.",
    }),
    parameters: Type.Object(
      {
        origin: Type.Optional(Civ7ControlOrpcMapLocationSchema),
        civilian: Type.Optional(Civ7ControlOrpcMapLocationSchema),
        contact: Type.Optional(Civ7ControlOrpcMapLocationSchema),
      },
      { additionalProperties: false, description: "Parameters." }
    ),
  },
  { additionalProperties: false }
);
const Civ7StrategyFormationSnapshotResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0, description: "Player id." }),
    localPlayerId: Type.Integer({ minimum: 0, description: "Local player id." }),
    turn: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()], {
      description: "Turn.",
    }),
    turnDate: Type.Union([Type.String(), Type.Null()], {
      description: "Turn date.",
    }),
    blocker: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()], {
      description: "Blocker.",
    }),
    nextDecision: Type.Union([Type.String(), Type.Null()], {
      description: "Next decision.",
    }),
    origin: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()], {
      description: "Origin.",
    }),
    sourceStatus: Civ7StrategyFormationSourceStatusSchema,
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
            legalNoTargetOperationCount: Type.Integer({
              minimum: 0,
              description: "Legal no target operation count.",
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
    battlefield: Type.Object(
      {
        originCount: Type.Integer({ minimum: 0, description: "Origin count." }),
        unitCount: Type.Integer({ minimum: 0, description: "Unit count." }),
        pointOfInterestCount: Type.Integer({ minimum: 0, description: "Point of interest count." }),
        hiddenInfoPolicy: Type.String({
          description: "Hidden info policy.",
        }),
      },
      { additionalProperties: false, description: "Battlefield." }
    ),
    formation: Type.Object(
      {
        posture: Civ7StrategyFormationPostureSchema,
        relationshipLabelPolicy: Civ7StrategyRelationshipLabelPolicySchema,
        headline: Type.String({
          description: "Headline.",
        }),
        reasons: Type.Array(Type.String(), {
          description: "Reasons values.",
        }),
        civilians: Type.Array(Civ7StrategyFormationUnitSchema, {
          description: "Civilians values.",
        }),
        screens: Type.Array(Civ7StrategyFormationUnitSchema, {
          description: "Screens values.",
        }),
        otherOwnerContacts: Type.Array(Civ7StrategyFormationUnitSchema, {
          description: "Other owner contacts values.",
        }),
        nearbyContacts: Type.Array(Civ7StrategyFormationUnitSchema, {
          description: "Nearby contacts values.",
        }),
        nextSteps: Type.Array(Civ7StrategyFormationNextStepSchema, {
          description: "Next steps values.",
        }),
      },
      { additionalProperties: false, description: "Formation." }
    ),
    notes: Type.Array(Type.String(), {
      description: "Notes values.",
    }),
    nextSteps: Type.Array(Civ7StrategyFormationNextStepSchema, {
      description: "Next steps values.",
    }),
  },
  { additionalProperties: false }
);
const Civ7StrategyFormationSnapshotContract = base
  .input(standard(Civ7StrategyFormationSnapshotInputSchema))
  .output(standard(Civ7StrategyFormationSnapshotResultSchema))
  .meta({
    family: "strategy",
    procedureKey: "strategy.formationSnapshot",
    proofBoundary: "local-package-test",
    risk: "read-only",
  });
export const formationSnapshot = {
  formationSnapshot: Civ7StrategyFormationSnapshotContract,
};
