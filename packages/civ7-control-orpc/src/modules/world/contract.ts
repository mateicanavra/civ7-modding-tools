import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { Civ7ControlOrpcMapLocationSchema } from "../../model/primitives";
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

const Civ7WorldPlotFieldSchema = Type.Union([
  Type.Literal("terrain"),
  Type.Literal("biome"),
  Type.Literal("feature"),
  Type.Literal("resource"),
  Type.Literal("climate"),
  Type.Literal("hydrology"),
  Type.Literal("yields"),
  Type.Literal("owner"),
  Type.Literal("visibility"),
  Type.Literal("areaRegion"),
  Type.Literal("tags"),
  Type.Literal("city"),
  Type.Literal("units"),
]);
export type Civ7WorldPlotField = Static<typeof Civ7WorldPlotFieldSchema>;

const Civ7WorldHiddenInfoPolicySchema = Type.Union([
  Type.Literal("include-hidden"),
  Type.Literal("visibility-filtered"),
  Type.Literal("not-player-scoped"),
]);

const Civ7WorldProbeSchema = Type.Union([
  Type.Object(
    {
      ok: Type.Literal(true),
      value: Type.Unknown(),
    },
    { additionalProperties: false },
  ),
  Type.Object(
    {
      ok: Type.Literal(false),
      error: Type.String(),
    },
    { additionalProperties: false },
  ),
]);

const Civ7WorldPlotReadInputSchema = Type.Object(
  {
    location: Civ7ControlOrpcMapLocationSchema,
    playerId: Type.Optional(Type.Integer({ minimum: 0 })),
    fields: Type.Optional(Type.Array(Civ7WorldPlotFieldSchema)),
    includeHidden: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false },
);
export type Civ7WorldPlotReadInput = Static<
  typeof Civ7WorldPlotReadInputSchema
>;

const Civ7WorldPlotSnapshotSchema = Type.Object(
  {
    location: Type.Object(
      {
        x: Type.Integer({ minimum: 0, maximum: 1_000_000 }),
        y: Type.Integer({ minimum: 0, maximum: 1_000_000 }),
        index: NullableNumberSchema,
      },
      { additionalProperties: false },
    ),
    visibility: Type.Object(
      {
        revealedState: Type.Optional(Civ7WorldProbeSchema),
        visible: Type.Optional(Civ7WorldProbeSchema),
      },
      { additionalProperties: false },
    ),
    hiddenInfoPolicy: Civ7WorldHiddenInfoPolicySchema,
    facts: Type.Record(Type.String(), Civ7WorldProbeSchema),
    summary: Type.Object(
      {
        factCount: Type.Integer({ minimum: 0 }),
        probeErrorCount: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);
export type Civ7WorldPlotSnapshot = Static<typeof Civ7WorldPlotSnapshotSchema>;

const Civ7WorldPlotReadResultSchema = Type.Object(
  {
    sourceStatus: Type.Object(
      {
        plot: Type.Union([
          Type.Literal("read"),
          Type.Literal("read-with-probe-errors"),
          Type.Literal("invalid-location"),
        ]),
      },
      { additionalProperties: false },
    ),
    plot: Civ7WorldPlotSnapshotSchema,
  },
  { additionalProperties: false },
);
export type Civ7WorldPlotReadResult = Static<
  typeof Civ7WorldPlotReadResultSchema
>;

const Civ7WorldMapBoundsSchema = Type.Object(
  {
    x: Type.Integer({ minimum: 0, maximum: 1_000_000 }),
    y: Type.Integer({ minimum: 0, maximum: 1_000_000 }),
    width: Type.Integer({ minimum: 1, maximum: 10_000 }),
    height: Type.Integer({ minimum: 1, maximum: 10_000 }),
  },
  { additionalProperties: false },
);

const Civ7WorldGridReadInputSchema = Type.Object(
  {
    bounds: Civ7WorldMapBoundsSchema,
    fields: Type.Array(Civ7WorldPlotFieldSchema),
    playerId: Type.Optional(Type.Integer({ minimum: 0 })),
    includeHidden: Type.Optional(Type.Boolean()),
    maxPlots: Type.Optional(Type.Integer({ minimum: 1, maximum: 10_000 })),
  },
  { additionalProperties: false },
);
export type Civ7WorldGridReadInput = Static<
  typeof Civ7WorldGridReadInputSchema
>;

const Civ7WorldGridReadResultSchema = Type.Object(
  {
    sourceStatus: Type.Object(
      {
        grid: Type.Union([
          Type.Literal("read"),
          Type.Literal("read-with-omissions"),
          Type.Literal("read-with-probe-errors"),
        ]),
        map: Type.Union([
          Type.Literal("read"),
          Type.Literal("skipped-unavailable"),
        ]),
      },
      { additionalProperties: false },
    ),
    bounds: Civ7WorldMapBoundsSchema,
    fields: Type.Array(Civ7WorldPlotFieldSchema),
    plotCount: Type.Integer({ minimum: 0 }),
    omitted: Type.Integer({ minimum: 0 }),
    hiddenInfoPolicy: Civ7WorldHiddenInfoPolicySchema,
    map: Type.Object(
      {
        width: NullableNumberSchema,
        height: NullableNumberSchema,
      },
      { additionalProperties: false },
    ),
    plots: Type.Array(Civ7WorldPlotSnapshotSchema),
    summary: Type.Object(
      {
        returnedPlotCount: Type.Integer({ minimum: 0 }),
        probeErrorCount: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);
export type Civ7WorldGridReadResult = Static<
  typeof Civ7WorldGridReadResultSchema
>;

const Civ7WorldPlotReadInputStandardSchema = toStandardSchema(
  Civ7WorldPlotReadInputSchema,
);
const Civ7WorldPlotReadResultStandardSchema = toStandardSchema(
  Civ7WorldPlotReadResultSchema,
);
const Civ7WorldGridReadInputStandardSchema = toStandardSchema(
  Civ7WorldGridReadInputSchema,
);
const Civ7WorldGridReadResultStandardSchema = toStandardSchema(
  Civ7WorldGridReadResultSchema,
);

export type Civ7WorldCurrentContract = ContractProcedure<
  typeof Civ7WorldCurrentInputStandardSchema,
  typeof Civ7WorldCurrentResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export type Civ7WorldPlotReadContract = ContractProcedure<
  typeof Civ7WorldPlotReadInputStandardSchema,
  typeof Civ7WorldPlotReadResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export type Civ7WorldGridReadContract = ContractProcedure<
  typeof Civ7WorldGridReadInputStandardSchema,
  typeof Civ7WorldGridReadResultStandardSchema,
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

export const Civ7WorldPlotReadContract: Civ7WorldPlotReadContract =
  civ7ControlOrpcContractBase
    .input(Civ7WorldPlotReadInputStandardSchema)
    .output(Civ7WorldPlotReadResultStandardSchema)
    .meta({
      family: "world",
      procedureKey: "world.plot.read",
      proofBoundary: "local-package-test",
      risk: "read-only",
    });

export const Civ7WorldGridReadContract: Civ7WorldGridReadContract =
  civ7ControlOrpcContractBase
    .input(Civ7WorldGridReadInputStandardSchema)
    .output(Civ7WorldGridReadResultStandardSchema)
    .meta({
      family: "world",
      procedureKey: "world.grid.read",
      proofBoundary: "local-package-test",
      risk: "read-only",
    });

export type Civ7WorldContract = Readonly<{
  current: Civ7WorldCurrentContract;
  plot: Civ7WorldPlotReadContract;
  grid: Civ7WorldGridReadContract;
}>;

export const Civ7WorldContract: Civ7WorldContract = {
  current: Civ7WorldCurrentContract,
  plot: Civ7WorldPlotReadContract,
  grid: Civ7WorldGridReadContract,
};
