import type { Civ7MapInfo, Civ7StandardMapSizePreset } from "@civ7/map-policy";

import type { StandardMapConfigEnvelope } from "../../../maps/configs/canonical.js";

type StandardMapMetricScenarioBase = Readonly<{
  id: string;
  config: StandardMapConfigEnvelope;
  mapSeed: number;
  gameSeed: number;
  aliveMajorPlayerIds: readonly number[];
}>;

/** A real Civ7 map-size selection suitable for product targets and cohorts. */
export type StandardPresetMetricScenario = StandardMapMetricScenarioBase &
  Readonly<{
    kind: "civ7-preset";
    preset: Civ7StandardMapSizePreset;
  }>;

/** An explicit custom-size run reserved for focused measurement fixtures. */
type StandardCustomMetricScenario = StandardMapMetricScenarioBase &
  Readonly<{
    kind: "custom";
    dimensions: Readonly<{ width: number; height: number }>;
    mapInfo: Civ7MapInfo;
    mapSizeId: string | number;
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
  if (scenario.kind === "custom") {
    assertCustomSelection(scenario);
    return Object.freeze({
      ...scenario,
      aliveMajorPlayerIds: Object.freeze([...scenario.aliveMajorPlayerIds]),
      dimensions: Object.freeze({ ...scenario.dimensions }),
      mapInfo: Object.freeze({ ...scenario.mapInfo }),
    });
  }
  return Object.freeze({
    ...scenario,
    aliveMajorPlayerIds: Object.freeze([...scenario.aliveMajorPlayerIds]),
    preset: Object.freeze({
      ...scenario.preset,
      dimensions: Object.freeze({ ...scenario.preset.dimensions }),
      rowLatitudeEndpoints: Object.freeze({ ...scenario.preset.rowLatitudeEndpoints }),
      mapInfo: Object.freeze({ ...scenario.preset.mapInfo }),
    }),
  });
}

function assertCustomSelection(scenario: StandardCustomMetricScenario): void {
  if (
    (typeof scenario.mapSizeId !== "string" && typeof scenario.mapSizeId !== "number") ||
    (typeof scenario.mapSizeId === "string" &&
      (scenario.mapSizeId.length === 0 || scenario.mapSizeId.trim() !== scenario.mapSizeId)) ||
    (typeof scenario.mapSizeId === "number" && !Number.isSafeInteger(scenario.mapSizeId))
  ) {
    throw new Error(`Custom metric scenario ${scenario.id} requires a stable map-size ID.`);
  }
}
