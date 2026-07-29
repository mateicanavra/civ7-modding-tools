import { Type } from "typebox";
import { Civ7ControlOrpcMapLocationSchema } from "#civ7-control-service/model/dto/primitives";
import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const NullableNumberSchema = Type.Union([Type.Number(), Type.Null()]);
const NullableIntegerSchema = Type.Union([Type.Integer(), Type.Null()]);
const Civ7WorldCurrentInputSchema = Type.Object({}, { additionalProperties: false });
const Civ7WorldCurrentSourceStatusSchema = Type.Union([
  Type.Literal("read"),
  Type.Literal("skipped-not-playable"),
  Type.Literal("skipped-unavailable"),
]);
const Civ7WorldCurrentTurnSchema = Type.Object(
  {
    current: NullableNumberSchema,
    date: Type.Union([Type.String(), Type.Null()], {
      description: "Date.",
    }),
    age: NullableNumberSchema,
    maxTurns: NullableNumberSchema,
    hash: NullableNumberSchema,
  },
  { additionalProperties: false }
);
const Civ7WorldCurrentLocalPlayerSchema = Type.Object(
  {
    playerId: NullableIntegerSchema,
    observerId: NullableIntegerSchema,
  },
  { additionalProperties: false }
);
const Civ7WorldCurrentMapSchema = Type.Object(
  {
    width: NullableNumberSchema,
    height: NullableNumberSchema,
    plotCount: NullableNumberSchema,
    mapSize: NullableNumberSchema,
    randomSeed: NullableNumberSchema,
  },
  { additionalProperties: false }
);
const Civ7WorldCurrentPlayersSchema = Type.Object(
  {
    maxPlayers: NullableNumberSchema,
    alivePlayerIds: Type.Array(Type.Integer({ minimum: 0 }), {
      description: "Alive player ids values.",
    }),
    aliveHumanIds: Type.Array(Type.Integer({ minimum: 0 }), {
      description: "Alive human ids values.",
    }),
    aliveHumanCount: NullableNumberSchema,
  },
  { additionalProperties: false }
);
const Civ7WorldCurrentNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
        Type.Literal("read-attention"),
        Type.Literal("restore-readiness"),
        Type.Literal("enter-game"),
        Type.Literal("inspect-world"),
      ],
      {
        description: "Semantic kind of this value.",
      }
    ),
    source: Type.Literal("world.current", {
      description: "Authority that supplied this value.",
    }),
    label: Type.String({
      description: "Human-readable label.",
    }),
  },
  { additionalProperties: false }
);
const Civ7WorldCurrentResultSchema = Type.Object(
  {
    playable: Type.Boolean({
      description: "Whether playable.",
    }),
    readiness: Type.String({
      description: "Readiness.",
    }),
    sourceStatus: Type.Object(
      {
        playableStatus: Type.Literal("read", {
          description: "Playable status.",
        }),
        game: Civ7WorldCurrentSourceStatusSchema,
        map: Civ7WorldCurrentSourceStatusSchema,
        players: Civ7WorldCurrentSourceStatusSchema,
      },
      { additionalProperties: false, description: "Source status." }
    ),
    turn: Civ7WorldCurrentTurnSchema,
    localPlayer: Civ7WorldCurrentLocalPlayerSchema,
    map: Civ7WorldCurrentMapSchema,
    players: Civ7WorldCurrentPlayersSchema,
    summary: Type.Object(
      {
        hasMapDimensions: Type.Boolean({
          description: "Whether has map dimensions.",
        }),
        alivePlayerCount: NullableIntegerSchema,
        nextStepCount: Type.Integer({ minimum: 0, description: "Next step count." }),
      },
      { additionalProperties: false, description: "Summary." }
    ),
    nextSteps: Type.Array(Civ7WorldCurrentNextStepSchema, {
      description: "Next steps values.",
    }),
  },
  { additionalProperties: false }
);
const Civ7WorldCurrentContract = base
  .input(standard(Civ7WorldCurrentInputSchema))
  .output(standard(Civ7WorldCurrentResultSchema))
  .meta({
    family: "world",
    procedureKey: "world.current",
    proofBoundary: "local-package-test",
    risk: "read-only",
  });
export const current = {
  current: Civ7WorldCurrentContract,
};
