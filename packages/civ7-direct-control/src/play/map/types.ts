import { Type, type Static } from "typebox";

import type {
  Civ7DirectControlOptions,
  Civ7TunerState,
  Civ7TunerStateSelection,
} from "../../session/types.js";
import type { Civ7RuntimeProbe } from "../../runtime/probe.js";

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

export type Civ7MapSummaryOptions = Civ7DirectControlOptions & Readonly<{
  state?: Civ7TunerStateSelection;
  includeAreaRegionCounts?: boolean;
  maxIds?: number;
}>;

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

export type Civ7PlotSnapshotInput = Readonly<Civ7MapLocation & {
  playerId?: number;
  fields?: ReadonlyArray<Civ7PlotSnapshotField>;
  includeHidden?: boolean;
}>;

export type Civ7PlotSnapshot = Readonly<{
  location: Readonly<Civ7MapLocation & {
    index: Civ7RuntimeProbe<number>;
  }>;
  revealedState?: Civ7RuntimeProbe<number | string>;
  visible?: Civ7RuntimeProbe<boolean>;
  hiddenInfoPolicy: Civ7HiddenInfoPolicy;
  facts: Readonly<Record<string, Civ7RuntimeProbe<unknown>>>;
}>;

export type Civ7PlotSnapshotResult = Civ7PlotSnapshot & Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
}>;

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
