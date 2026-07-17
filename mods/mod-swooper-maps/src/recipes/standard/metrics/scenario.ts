import {
  type Civ7StandardMapSizePreset,
  getCiv7StandardMapSizePreset,
  type MapInfo,
} from "@civ7/adapter";
import { stableStringify } from "@swooper/mapgen-core";

import type { StandardMapConfigEnvelope } from "../../../maps/configs/canonical.js";

type StandardMapMetricScenarioBase = Readonly<{
  id: string;
  config: StandardMapConfigEnvelope;
  seed: number;
}>;

/** A real Civ7 map-size selection suitable for product targets and cohorts. */
export type StandardPresetMetricScenario = StandardMapMetricScenarioBase &
  Readonly<{
    kind: "civ7-preset";
    preset: Civ7StandardMapSizePreset;
  }>;

/** An explicit custom-size run reserved for focused measurement fixtures. */
export type StandardCustomMetricScenario = StandardMapMetricScenarioBase &
  Readonly<{
    kind: "custom";
    dimensions: Readonly<{ width: number; height: number }>;
    mapInfo: MapInfo;
    mapSizeId: string | number;
    playerCount: number;
  }>;

/** One fully specified Standard run whose completed map product will be measured. */
export type StandardMapMetricScenario = StandardPresetMetricScenario | StandardCustomMetricScenario;

/**
 * Admits a stable Standard metrics scenario without inventing custom map dimensions or defaults.
 * The caller chooses every product identity axis; capture only executes the declared scenario.
 */
export function defineStandardMapMetricScenario(
  scenario: StandardMapMetricScenario
): StandardMapMetricScenario {
  if (scenario.id.trim().length === 0 || scenario.id !== scenario.id.trim()) {
    throw new Error("A Standard metric scenario requires a trimmed, nonempty ID.");
  }
  if (!Number.isSafeInteger(scenario.seed)) {
    throw new Error(`Standard metric scenario ${scenario.id} requires an integer seed.`);
  }
  const dimensions =
    scenario.kind === "civ7-preset" ? scenario.preset.dimensions : scenario.dimensions;
  const mapInfo = scenario.kind === "civ7-preset" ? scenario.preset.mapInfo : scenario.mapInfo;
  const { width, height } = dimensions;
  if (!Number.isSafeInteger(width) || width <= 0 || !Number.isSafeInteger(height) || height <= 0) {
    throw new Error(`Standard metric scenario ${scenario.id} requires positive map dimensions.`);
  }
  if (mapInfo.GridWidth !== width || mapInfo.GridHeight !== height) {
    throw new Error(
      `Standard metric scenario ${scenario.id} has map metadata inconsistent with its dimensions.`
    );
  }
  if (scenario.kind === "custom") {
    assertCustomSelection(scenario);
    return Object.freeze({
      ...scenario,
      dimensions: Object.freeze({ ...scenario.dimensions }),
      mapInfo: Object.freeze({ ...scenario.mapInfo }),
    });
  }
  const canonicalPreset = getCiv7StandardMapSizePreset(scenario.preset.id);
  if (
    !canonicalPreset ||
    stableStringify(canonicalPreset) !== stableStringify(scenario.preset)
  ) {
    throw new Error(
      `Standard metric scenario ${scenario.id} requires the canonical Civ7 preset for ${scenario.preset.id}.`
    );
  }
  return Object.freeze({
    ...scenario,
    preset: Object.freeze({
      ...canonicalPreset,
      dimensions: Object.freeze({ ...canonicalPreset.dimensions }),
      latitudeBounds: Object.freeze({ ...canonicalPreset.latitudeBounds }),
      mapInfo: Object.freeze({ ...canonicalPreset.mapInfo }),
    }),
  });
}

function assertCustomSelection(scenario: StandardCustomMetricScenario): void {
  if (!Number.isSafeInteger(scenario.playerCount) || scenario.playerCount <= 0) {
    throw new Error(`Custom metric scenario ${scenario.id} requires a positive player count.`);
  }
  if (
    (typeof scenario.mapSizeId !== "string" && typeof scenario.mapSizeId !== "number") ||
    String(scenario.mapSizeId).trim().length === 0 ||
    (typeof scenario.mapSizeId === "number" && !Number.isFinite(scenario.mapSizeId))
  ) {
    throw new Error(`Custom metric scenario ${scenario.id} requires a stable map-size ID.`);
  }
  const landmassOne = scenario.mapInfo.PlayersLandmass1;
  const landmassTwo = scenario.mapInfo.PlayersLandmass2;
  if (
    !Number.isSafeInteger(landmassOne) ||
    (landmassOne ?? -1) < 0 ||
    !Number.isSafeInteger(landmassTwo) ||
    (landmassTwo ?? -1) < 0 ||
    (landmassOne ?? 0) + (landmassTwo ?? 0) < scenario.playerCount
  ) {
    throw new Error(
      `Custom metric scenario ${scenario.id} requires landmass capacity for every player.`
    );
  }
  if (
    !Number.isSafeInteger(scenario.mapInfo.StartSectorRows) ||
    (scenario.mapInfo.StartSectorRows ?? 0) <= 0 ||
    !Number.isSafeInteger(scenario.mapInfo.StartSectorCols) ||
    (scenario.mapInfo.StartSectorCols ?? 0) <= 0
  ) {
    throw new Error(`Custom metric scenario ${scenario.id} requires positive start-sector axes.`);
  }
}
