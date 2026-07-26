import { beforeAll, describe, expect, it } from "bun:test";
import type { StepFacetSinks } from "@swooper/mapgen-core";
import type { VizProjection } from "@swooper/mapgen-viz";

import { PLACEMENT_VIZ_GROUP } from "../../../../src/recipes/standard/stages/placement/viz.js";
import { runStandardRecipeTestMap } from "../fixtures/standard-recipe.js";

/**
 * Every visualization-bearing placement step emits decision-substance evidence
 * for its authored contribution to the completed product.
 *
 * assign-advanced-starts and place-discoveries are the recorded exceptions:
 * advanced-starts' only product is two engine-side effect booleans (fertility
 * recalc + advanced start regions), and place-discoveries defers to Civ7's
 * official discovery generator in the live engine (no headless per-plot plan or
 * readback to visualize) — both verified in-game, not in Studio.
 */
const EXPECTED_KEYS_BY_STEP: Record<string, readonly string[]> = {
  "plan-natural-wonders": ["placement.wonders.plannedSites"],
  "plot-landmass-regions": ["placement.landmassRegions.regionSlot"],
  "place-natural-wonders": ["placement.wonders.outcome"],
  "prepare-placement-surface": [
    "map.placement.surface.maintenanceBoundary",
    "map.placement.surface.lakeDrift",
    "map.placement.surface.terrainValidationDrift",
  ],
  "select-resource-sites": [
    "placement.resources.intents",
    "placement.resources.eligibleTypeCount",
    "placement.resources.legalTypeCount",
    "placement.resources.habitat.aquatic",
    "placement.resources.habitat.cultivated",
    "placement.resources.habitat.terrestrial",
    "placement.resources.habitat.geological",
  ],
  "assign-starts": [
    "placement.starts.viabilityScore",
    "placement.starts.viabilityTier",
    "placement.starts.component.freshwater",
    "placement.starts.component.fertility",
    "placement.starts.component.expansion",
    "placement.starts.component.climate",
    "placement.starts.component.resource",
    "placement.starts.component.roughness",
    "placement.starts.seatRung",
    "placement.starts.startPosition",
  ],
  "adjust-resources": ["placement.resources.supportAdjustment", "placement.starts.supportRadius"],
  "place-resources": ["placement.resources.outcome"],
  "observe-placement-parity": ["map.placement.engine.landMask", "map.placement.engine.waterDrift"],
};

describe("Standard placement visualization", () => {
  const keysByStep = new Map<string, Set<string>>();
  const capturedProjections: VizProjection[] = [];
  const captureViz: NonNullable<StepFacetSinks["viz"]> = (stepProjections, context) => {
    const stepKeys = keysByStep.get(context.stepId) ?? new Set<string>();
    for (const projection of stepProjections) {
      capturedProjections.push(projection);
      stepKeys.add(projection.dataTypeKey);
    }
    keysByStep.set(context.stepId, stepKeys);
  };

  beforeAll(() => {
    runStandardRecipeTestMap({
      mapInfo: {
        PlayersLandmass1: 4,
        PlayersLandmass2: 4,
        StartSectorRows: 4,
        StartSectorCols: 4,
      },
      execution: { facets: { viz: captureViz } },
    });
  }, 30_000);

  it("every placement step emits its expected decision-substance layers", () => {
    const missingByStep: Record<string, string[]> = {};
    for (const [stepId, keys] of Object.entries(EXPECTED_KEYS_BY_STEP)) {
      const emittedKeys = [...keysByStep].find(([executionStepId]) =>
        executionStepId.endsWith(`.placement.${stepId}`)
      )?.[1];
      const missing = keys.filter((key) => !emittedKeys?.has(key));
      if (missing.length) missingByStep[stepId] = missing;
    }
    expect(missingByStep).toEqual({});
  });

  it("every placement layer carries valid meta (label + shared group)", () => {
    const invalid: string[] = [];
    const placementKeys = new Set(Object.values(EXPECTED_KEYS_BY_STEP).flat());
    for (const projection of capturedProjections) {
      if (!placementKeys.has(projection.dataTypeKey)) continue;
      const identity = projection.variantKey
        ? `${projection.dataTypeKey}/${projection.variantKey}`
        : projection.dataTypeKey;
      if (!projection.meta) {
        invalid.push(`${identity}: missing meta`);
        continue;
      }
      if (typeof projection.meta.label !== "string" || !projection.meta.label.trim()) {
        invalid.push(`${identity}: missing label`);
      }
      if (projection.meta.group !== PLACEMENT_VIZ_GROUP) {
        invalid.push(
          `${identity}: group ${String(projection.meta.group)} != ${PLACEMENT_VIZ_GROUP}`
        );
      }
    }
    expect(invalid).toEqual([]);
  });

  it("categorical placement layers declare a transparent zero category where zero means none", () => {
    const zeroTransparentKeys = [
      "placement.landmassRegions.regionSlot",
      "placement.starts.startPosition",
      "placement.starts.supportRadius",
      "map.placement.surface.lakeDrift",
      "map.placement.surface.terrainValidationDrift",
      "map.placement.engine.waterDrift",
    ];
    const missing: string[] = [];
    const opaque: string[] = [];
    for (const key of zeroTransparentKeys) {
      const grid = capturedProjections.find(
        (projection) => projection.kind === "grid" && projection.dataTypeKey === key
      );
      const zeroCategory = grid?.meta?.categories?.find((category) => category.value === 0);
      if (!zeroCategory) {
        missing.push(key);
        continue;
      }
      if ((zeroCategory.color?.[3] ?? 255) !== 0) opaque.push(key);
    }
    expect({ missing, opaque }).toEqual({ missing: [], opaque: [] });
  });

  it("preserves each exact placement maintenance boundary as typed grid-field evidence", () => {
    const boundaries = capturedProjections.filter(
      (projection) =>
        projection.dataTypeKey === "map.placement.surface.maintenanceBoundary" &&
        projection.kind === "gridFields"
    );

    expect(boundaries.map(({ variantKey }) => variantKey).sort()).toEqual([
      "after-maintenance",
      "after-validate",
      "before-validate",
    ]);
    for (const boundary of boundaries) {
      if (boundary.kind !== "gridFields") {
        throw new Error("Placement maintenance evidence must remain a grid-fields projection.");
      }
      expect(Object.keys(boundary.fields).sort()).toEqual([
        "areaId",
        "lakeMask",
        "terrain",
        "waterMask",
      ]);
    }
  });
});
