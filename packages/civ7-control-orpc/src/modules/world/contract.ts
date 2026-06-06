import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { toStandardSchema } from "../../typebox-standard-schema";

const NullableNumberSchema = Type.Union([Type.Number(), Type.Null()]);
const NullableIntegerSchema = Type.Union([Type.Integer(), Type.Null()]);

const Civ7WorldCurrentInputSchema = Type.Object(
  {},
  { additionalProperties: false },
);
export type Civ7WorldCurrentInput = Static<typeof Civ7WorldCurrentInputSchema>;

const Civ7WorldCurrentSourceStatusSchema = Type.Union([
  Type.Literal("read"),
  Type.Literal("skipped-not-playable"),
  Type.Literal("skipped-unavailable"),
]);

const Civ7WorldCurrentTurnSchema = Type.Object(
  {
    current: NullableNumberSchema,
    date: Type.Union([Type.String(), Type.Null()]),
    age: NullableNumberSchema,
    maxTurns: NullableNumberSchema,
    hash: NullableNumberSchema,
  },
  { additionalProperties: false },
);

const Civ7WorldCurrentLocalPlayerSchema = Type.Object(
  {
    playerId: NullableIntegerSchema,
    observerId: NullableIntegerSchema,
  },
  { additionalProperties: false },
);

const Civ7WorldCurrentMapSchema = Type.Object(
  {
    width: NullableNumberSchema,
    height: NullableNumberSchema,
    plotCount: NullableNumberSchema,
    mapSize: NullableNumberSchema,
    randomSeed: NullableNumberSchema,
  },
  { additionalProperties: false },
);

const Civ7WorldCurrentPlayersSchema = Type.Object(
  {
    maxPlayers: NullableNumberSchema,
    alivePlayerIds: Type.Array(Type.Integer({ minimum: 0 })),
    aliveHumanIds: Type.Array(Type.Integer({ minimum: 0 })),
    aliveHumanCount: NullableNumberSchema,
  },
  { additionalProperties: false },
);

const Civ7WorldCurrentNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("read-attention"),
      Type.Literal("restore-readiness"),
      Type.Literal("enter-game"),
      Type.Literal("inspect-world"),
    ]),
    source: Type.Literal("world.current"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

const Civ7WorldCurrentResultSchema = Type.Object(
  {
    playable: Type.Boolean(),
    readiness: Type.String(),
    sourceStatus: Type.Object(
      {
        playableStatus: Type.Literal("read"),
        game: Civ7WorldCurrentSourceStatusSchema,
        map: Civ7WorldCurrentSourceStatusSchema,
        players: Civ7WorldCurrentSourceStatusSchema,
      },
      { additionalProperties: false },
    ),
    turn: Civ7WorldCurrentTurnSchema,
    localPlayer: Civ7WorldCurrentLocalPlayerSchema,
    map: Civ7WorldCurrentMapSchema,
    players: Civ7WorldCurrentPlayersSchema,
    summary: Type.Object(
      {
        hasMapDimensions: Type.Boolean(),
        alivePlayerCount: NullableIntegerSchema,
        nextStepCount: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false },
    ),
    nextSteps: Type.Array(Civ7WorldCurrentNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7WorldCurrentResult = Static<
  typeof Civ7WorldCurrentResultSchema
>;

const Civ7WorldCurrentInputStandardSchema = toStandardSchema(
  Civ7WorldCurrentInputSchema,
);
const Civ7WorldCurrentResultStandardSchema = toStandardSchema(
  Civ7WorldCurrentResultSchema,
);

export type Civ7WorldCurrentContract = ContractProcedure<
  typeof Civ7WorldCurrentInputStandardSchema,
  typeof Civ7WorldCurrentResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7WorldCurrentContract: Civ7WorldCurrentContract =
  civ7ControlOrpcContractBase
    .input(Civ7WorldCurrentInputStandardSchema)
    .output(Civ7WorldCurrentResultStandardSchema)
    .meta({
      family: "world",
      procedureKey: "world.current",
      proofBoundary: "local-package-test",
      risk: "read-only",
    });

export type Civ7WorldContract = Readonly<{
  current: Civ7WorldCurrentContract;
}>;

export const Civ7WorldContract: Civ7WorldContract = {
  current: Civ7WorldCurrentContract,
};
