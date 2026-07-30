import type { Civ7MapSurfaceObservationResult, Civ7PlotSnapshot } from "@civ7/direct-control";
import { CIV7_BROWSER_TABLES_V0, RIVER_TYPE_MINOR } from "@civ7/map-policy";
import type { StandardLiveParityCapture } from "./types.js";

/** Typed Direct Control observation required by the Standard live projection. */
export type StandardLiveObservation = Pick<
  Civ7MapSurfaceObservationResult,
  "identity" | "surface" | "nativeRiverObjects"
>;

/**
 * Projects one wire/map/turn-stable Direct Control observation into the live
 * surfaces and river evidence consumed by Standard product parity.
 */
export function projectStandardLiveParityCapture(
  observation: StandardLiveObservation
): StandardLiveParityCapture {
  const { width, height, plotCount, plotsByIndex } = observation.surface;
  const expectedPlotCount = width * height;
  if (plotCount !== expectedPlotCount || plotsByIndex.length !== expectedPlotCount) {
    throw new Error(
      `Standard live parity requires a complete ${width}x${height} observation shape.`
    );
  }

  const terrain = emptyGrid(width, height);
  const biome = emptyGrid(width, height);
  const feature = emptyGrid(width, height);
  const resource = emptyGrid(width, height);
  const terrainNavigableRiver = emptyGrid(width, height);
  const riverType = emptyGrid(width, height);
  const river = emptyGrid(width, height);
  const navigableRiver = emptyGrid(width, height);
  const minorRiver = emptyGrid(width, height);
  const navigableRiverTerrain = CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_NAVIGABLE_RIVER;

  for (let index = 0; index < plotsByIndex.length; index += 1) {
    const plot = plotsByIndex[index];
    const terrainValue = numericFact(plot, "terrain");
    terrain.values[index] = terrainValue;
    biome.values[index] = numericFact(plot, "biome");
    feature.values[index] = numericFact(plot, "feature");
    resource.values[index] = numericFact(plot, "resource");
    terrainNavigableRiver.values[index] =
      terrainValue === null ? null : terrainValue === navigableRiverTerrain ? 1 : 0;
    const riverTypeValue = numericFact(plot, "riverType");
    riverType.values[index] = riverTypeValue;
    river.values[index] = booleanFact(plot, "river");
    navigableRiver.values[index] = booleanFact(plot, "navigableRiver");
    minorRiver.values[index] =
      riverTypeValue === null ? null : riverTypeValue === RIVER_TYPE_MINOR ? 1 : 0;
  }

  const nativeObjects = observation.nativeRiverObjects;
  return {
    source: "live-civ7",
    identity: {
      wireConnectionEpoch: observation.identity.wire.connectionEpoch,
      mapSeed: observation.identity.map.randomSeed,
      turn: observation.identity.game.turn,
    },
    surface: {
      dimensions: { width, height },
      grids: { terrain, biome, feature, resource },
    },
    fullGrid: {
      plotCount,
      observedPlotCount: observation.surface.observedPlotCount,
      missingPlotIndices: observation.surface.missingPlotIndices,
      identityStable: true,
    },
    hydrology: {
      rivers: {
        terrainNavigableRiver,
        riverType,
        river,
        navigableRiver,
        minorRiver,
        nativeObjects:
          nativeObjects.exists && nativeObjects.numRivers.ok
            ? {
                status: "present",
                count: Math.max(0, Math.trunc(nativeObjects.numRivers.value)),
                sampleCount: nativeObjects.samples.length,
              }
            : {
                status: "unavailable",
                blockedBy: [
                  ...(nativeObjects.exists ? [] : ["live-observation.native-river-objects.exists"]),
                  ...(nativeObjects.numRivers.ok
                    ? []
                    : ["live-observation.native-river-objects.num-rivers"]),
                ],
              },
      },
    },
  };
}

type MutableParityGrid = {
  width: number;
  height: number;
  values: Array<number | null>;
};

function emptyGrid(width: number, height: number): MutableParityGrid {
  return {
    width,
    height,
    values: new Array<number | null>(width * height).fill(null),
  };
}

function numericFact(plot: Civ7PlotSnapshot | null, key: string): number | null {
  const probe = plot?.facts[key];
  if (!probe?.ok || typeof probe.value !== "number" || !Number.isFinite(probe.value)) {
    return null;
  }
  return Math.trunc(probe.value);
}

function booleanFact(plot: Civ7PlotSnapshot | null, key: string): number | null {
  const probe = plot?.facts[key];
  return probe?.ok && typeof probe.value === "boolean" ? (probe.value ? 1 : 0) : null;
}
