import type { EngineAdapter, MapInfo } from "@civ7/adapter";
import type { ExtendedMapContext } from "@swooper/mapgen-core";

export type StandardRuntime = {
  logPrefix: string;
  mapInfo: MapInfo;
  playersLandmass1: number;
  playersLandmass2: number;
  storyEnabled: boolean;
};

export type StandardRuntimeInit = {
  logPrefix?: string;
  mapInfo?: MapInfo;
  storyEnabled?: boolean;
};

const runtimeByContext = new WeakMap<ExtendedMapContext, StandardRuntime>();

function resolveMapInfo(adapter: EngineAdapter): MapInfo {
  const mapInfo = adapter.lookupMapInfo(adapter.getMapSizeId());
  if (!mapInfo) {
    throw new Error("[Standard] MapInfo missing for map size id.");
  }
  return mapInfo;
}

function createRuntime(context: ExtendedMapContext): StandardRuntime {
  const { adapter } = context;
  const mapInfo = resolveMapInfo(adapter);
  const playersLandmass1 = mapInfo.PlayersLandmass1 ?? 4;
  const playersLandmass2 = mapInfo.PlayersLandmass2 ?? 4;

  return {
    logPrefix: "[standard]",
    mapInfo,
    playersLandmass1,
    playersLandmass2,
    storyEnabled: true,
  };
}

export function getStandardRuntime(context: ExtendedMapContext): StandardRuntime {
  const existing = runtimeByContext.get(context);
  if (existing) return existing;
  const runtime = createRuntime(context);
  runtimeByContext.set(context, runtime);
  return runtime;
}

export function initializeStandardRuntime(
  context: ExtendedMapContext,
  init: StandardRuntimeInit = {}
): StandardRuntime {
  const runtime = getStandardRuntime(context);
  if (init.logPrefix) runtime.logPrefix = init.logPrefix;
  if (init.storyEnabled !== undefined) runtime.storyEnabled = init.storyEnabled;
  if (init.mapInfo) {
    runtime.mapInfo = init.mapInfo;
    runtime.playersLandmass1 = init.mapInfo.PlayersLandmass1 ?? runtime.playersLandmass1;
    runtime.playersLandmass2 = init.mapInfo.PlayersLandmass2 ?? runtime.playersLandmass2;
  }
  return runtime;
}
