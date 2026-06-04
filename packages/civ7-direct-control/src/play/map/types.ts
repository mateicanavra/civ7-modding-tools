import { Type, type Static } from "typebox";

import type {
  Civ7DirectControlOptions,
  Civ7TunerState,
  Civ7TunerStateSelection,
} from "../../session/types.js";
import type { Civ7RuntimeProbe } from "../../runtime/probe.js";
import { Civ7RuntimeProbeSchema } from "../../runtime/probe.js";

export const Civ7MapLocationSchema = Type.Object({
  x: Type.Integer({ minimum: 0, maximum: 1_000_000 }),
  y: Type.Integer({ minimum: 0, maximum: 1_000_000 }),
}, { additionalProperties: false });
export type Civ7MapLocation = Readonly<Static<typeof Civ7MapLocationSchema>>;

export type Civ7MapBounds = Readonly<Civ7MapLocation & {
  width: number;
  height: number;
}>;

export type Civ7HiddenInfoPolicy = "include-hidden" | "visibility-filtered" | "not-player-scoped";

export const Civ7HiddenInfoPolicySchema = Type.Union([
  Type.Literal("include-hidden"),
  Type.Literal("visibility-filtered"),
  Type.Literal("not-player-scoped"),
]);

export const Civ7MapSummaryInputSchema = Type.Object({
  includeAreaRegionCounts: Type.Optional(Type.Boolean()),
  maxIds: Type.Optional(Type.Integer({ minimum: 0, maximum: 1_000_000 })),
}, { additionalProperties: false });

export type Civ7MapSummaryInput = Readonly<Static<typeof Civ7MapSummaryInputSchema>>;

export type Civ7MapSummaryOptions = Civ7DirectControlOptions & Readonly<{
  state?: Civ7TunerStateSelection;
}> & Civ7MapSummaryInput;

const civ7TunerStateSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
}, { additionalProperties: false });

export const Civ7MapSummaryResultSchema = Type.Object({
  host: Type.String(),
  port: Type.Number(),
  state: civ7TunerStateSchema,
  map: Type.Object({
    width: Civ7RuntimeProbeSchema(Type.Number()),
    height: Civ7RuntimeProbeSchema(Type.Number()),
    plotCount: Civ7RuntimeProbeSchema(Type.Number()),
    mapSize: Civ7RuntimeProbeSchema(Type.Union([Type.Number(), Type.String()])),
    randomSeed: Civ7RuntimeProbeSchema(Type.Number()),
  }, { additionalProperties: false }),
  game: Type.Object({
    turn: Civ7RuntimeProbeSchema(Type.Number()),
    age: Civ7RuntimeProbeSchema(Type.Number()),
    maxTurns: Civ7RuntimeProbeSchema(Type.Number()),
    turnDate: Civ7RuntimeProbeSchema(Type.String()),
    hash: Civ7RuntimeProbeSchema(Type.Number()),
  }, { additionalProperties: false }),
  areas: Type.Optional(Type.Object({
    areaIds: Civ7RuntimeProbeSchema(Type.Array(Type.Number())),
    regionIds: Civ7RuntimeProbeSchema(Type.Array(Type.Number())),
    truncated: Type.Boolean(),
  }, { additionalProperties: false })),
}, { additionalProperties: false });

export type Civ7MapSummaryResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  map: Readonly<{
    width: Civ7RuntimeProbe<number>;
    height: Civ7RuntimeProbe<number>;
    plotCount: Civ7RuntimeProbe<number>;
    mapSize: Civ7RuntimeProbe<number | string>;
    randomSeed: Civ7RuntimeProbe<number>;
  }>;
  game: Readonly<{
    turn: Civ7RuntimeProbe<number>;
    age: Civ7RuntimeProbe<number>;
    maxTurns: Civ7RuntimeProbe<number>;
    turnDate: Civ7RuntimeProbe<string>;
    hash: Civ7RuntimeProbe<number>;
  }>;
  areas?: Readonly<{
    areaIds: Civ7RuntimeProbe<ReadonlyArray<number>>;
    regionIds: Civ7RuntimeProbe<ReadonlyArray<number>>;
    truncated: boolean;
  }>;
}>;

export type Civ7PlotSnapshotField =
  | "terrain"
  | "biome"
  | "feature"
  | "resource"
  | "climate"
  | "hydrology"
  | "yields"
  | "owner"
  | "visibility"
  | "areaRegion"
  | "tags"
  | "city"
  | "units";

export const Civ7PlotSnapshotFieldSchema = Type.Union([
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

export const Civ7PlotSnapshotInputSchema = Type.Object({
  x: Type.Integer({ minimum: 0, maximum: 1_000_000 }),
  y: Type.Integer({ minimum: 0, maximum: 1_000_000 }),
  playerId: Type.Optional(Type.Number()),
  fields: Type.Optional(Type.Array(Civ7PlotSnapshotFieldSchema)),
  includeHidden: Type.Optional(Type.Boolean()),
}, { additionalProperties: false });

export type Civ7PlotSnapshotInput = Readonly<Static<typeof Civ7PlotSnapshotInputSchema>>;

export const Civ7PlotSnapshotSchema = Type.Object({
  location: Type.Object({
    x: Type.Integer({ minimum: 0, maximum: 1_000_000 }),
    y: Type.Integer({ minimum: 0, maximum: 1_000_000 }),
    index: Civ7RuntimeProbeSchema(Type.Number()),
  }, { additionalProperties: false }),
  revealedState: Type.Optional(Civ7RuntimeProbeSchema(Type.Union([Type.Number(), Type.String()]))),
  visible: Type.Optional(Civ7RuntimeProbeSchema(Type.Boolean())),
  hiddenInfoPolicy: Civ7HiddenInfoPolicySchema,
  facts: Type.Record(Type.String(), Civ7RuntimeProbeSchema(Type.Unknown())),
}, { additionalProperties: false });

export const Civ7PlotSnapshotResultSchema = Type.Object({
  host: Type.String(),
  port: Type.Number(),
  state: civ7TunerStateSchema,
  location: Type.Object({
    x: Type.Integer({ minimum: 0, maximum: 1_000_000 }),
    y: Type.Integer({ minimum: 0, maximum: 1_000_000 }),
    index: Civ7RuntimeProbeSchema(Type.Number()),
  }, { additionalProperties: false }),
  revealedState: Type.Optional(Civ7RuntimeProbeSchema(Type.Union([Type.Number(), Type.String()]))),
  visible: Type.Optional(Civ7RuntimeProbeSchema(Type.Boolean())),
  hiddenInfoPolicy: Civ7HiddenInfoPolicySchema,
  facts: Type.Record(Type.String(), Civ7RuntimeProbeSchema(Type.Unknown())),
}, { additionalProperties: false });

export type Civ7PlotSnapshot = Readonly<Static<typeof Civ7PlotSnapshotSchema>>;

export type Civ7PlotSnapshotResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
}> & Civ7PlotSnapshot;

export type Civ7MapGridInput = Readonly<{
  bounds?: Civ7MapBounds;
  locations?: ReadonlyArray<Civ7MapLocation>;
  fields: ReadonlyArray<Civ7PlotSnapshotField>;
  playerId?: number;
  includeHidden?: boolean;
  maxPlots?: number;
}>;

export type Civ7MapGridResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  bounds?: Civ7MapBounds;
  fields: ReadonlyArray<Civ7PlotSnapshotField>;
  plotCount: number;
  omitted: number;
  hiddenInfoPolicy: Civ7HiddenInfoPolicy;
  plots: ReadonlyArray<Civ7PlotSnapshot>;
}>;

export type Civ7MapGridReadChunk = Readonly<{
  bounds: Civ7MapBounds;
  plotCount: number;
  omitted: number;
}>;

export type Civ7FullMapGridIdentityCheck = Readonly<{
  stable: boolean;
  checked: ReadonlyArray<string>;
}>;

export type Civ7FullMapGridInput = Readonly<{
  bounds?: Civ7MapBounds;
  fields: ReadonlyArray<Civ7PlotSnapshotField>;
  playerId?: number;
  includeHidden?: boolean;
  maxPlotsPerRead?: number;
}>;

export type Civ7FullMapGridResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  bounds: Civ7MapBounds;
  fields: ReadonlyArray<Civ7PlotSnapshotField>;
  plotCount: number;
  omitted: number;
  hiddenInfoPolicy: Civ7HiddenInfoPolicy;
  map: Readonly<{ width: number; height: number }>;
  summary: Civ7MapSummaryResult;
  postReadSummary: Civ7MapSummaryResult;
  identityCheck: Civ7FullMapGridIdentityCheck;
  chunks: ReadonlyArray<Civ7MapGridReadChunk>;
  plots: ReadonlyArray<Civ7PlotSnapshot>;
}>;
