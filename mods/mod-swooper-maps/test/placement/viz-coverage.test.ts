import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext, type VizDumper, type VizLayerMeta } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import standardRecipe from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { PLACEMENT_VIZ_GROUP } from "../../src/recipes/standard/stages/placement/viz.js";
import { standardConfig } from "../support/standard-config.js";

/**
 * E4.2 coverage guard (placement-realignment S7): every placement step emits
 * at least one decision-substance layer, keyed here per step so coverage
 * cannot silently drift (the cheap version of the emitted-key registry
 * stretch goal — see the S7 OpenSpec decision log).
 *
 * assign-advanced-starts and place-discoveries are the recorded exceptions:
 * advanced-starts' only product is two engine-side effect booleans (fertility
 * recalc + advanced start regions), and place-discoveries defers to Civ7's
 * official discovery generator in the live engine (no headless per-plot plan or
 * readback to visualize) — both verified in-game, not in Studio.
 */
const EXPECTED_KEYS_BY_STEP: Record<string, readonly string[]> = {
  "derive-placement-inputs": ["placement.wonders.plannedSites"],
  "plot-landmass-regions": ["placement.landmassRegions.regionSlot"],
  "place-natural-wonders": ["placement.wonders.outcome"],
  "prepare-placement-surface": [
    "map.placement.surface.lakeDrift",
    "map.placement.surface.terrainValidationDrift",
  ],
  "plan-resources": [
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
  placement: ["map.placement.engine.landMask", "map.placement.engine.waterDrift"],
};

/**
 * Overlay suggestion pairs published in
 * apps/mapgen-studio/src/recipes/overlaySuggestions.ts. Suggestions whose
 * dataTypeKeys are never emitted fail silently in Studio (the cited drift
 * mechanism), so the emitted-key side is pinned here.
 */
const OVERLAY_SUGGESTION_KEYS = [
  "placement.starts.viabilityScore",
  "placement.starts.viabilityTier",
  "placement.starts.startPosition",
  "placement.starts.seatRung",
  "placement.resources.habitat.terrestrial",
  "placement.resources.habitat.aquatic",
  "placement.resources.habitat.cultivated",
  "placement.resources.habitat.geological",
  "placement.resources.eligibleTypeCount",
  "placement.resources.intents",
  "placement.starts.supportRadius",
  "placement.resources.supportAdjustment",
] as const;

describe("placement per-step viz coverage (E4.2/E4.3)", () => {
  const width = 32;
  const height = 20;
  const seed = 1337;
  const mapInfo = {
    GridWidth: width,
    GridHeight: height,
    MinLatitude: -60,
    MaxLatitude: 60,
    PlayersLandmass1: 4,
    PlayersLandmass2: 4,
    StartSectorRows: 4,
    StartSectorCols: 4,
  };
  const env = {
    seed,
    dimensions: { width, height },
    latitudeBounds: {
      topLatitude: mapInfo.MaxLatitude,
      bottomLatitude: mapInfo.MinLatitude,
    },
  };

  const adapter = createMockAdapter({
    width,
    height,
    mapInfo,
    mapSizeId: 1,
    rng: createLabelRng(seed),
  });
  const context = createExtendedMapContext({ width, height }, adapter, env);

  const metaByKey = new Map<string, VizLayerMeta | undefined>();
  const record = (layer: { dataTypeKey: string; meta?: VizLayerMeta }): void => {
    if (!metaByKey.has(layer.dataTypeKey) || layer.meta) {
      metaByKey.set(layer.dataTypeKey, layer.meta);
    }
  };
  const viz: VizDumper = {
    outputRoot: "<test>",
    dumpGrid: (_trace, layer) => record(layer),
    dumpPoints: (_trace, layer) => record(layer),
    dumpSegments: (_trace, layer) => record(layer),
    dumpGridFields: (_trace, layer) => record(layer),
  };
  context.viz = viz;
  initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]" });
  standardRecipe.run(context, env, standardConfig, { log: () => {} });

  it("every placement step emits its expected decision-substance layers", () => {
    const missingByStep: Record<string, string[]> = {};
    for (const [stepId, keys] of Object.entries(EXPECTED_KEYS_BY_STEP)) {
      const missing = keys.filter((key) => !metaByKey.has(key));
      if (missing.length) missingByStep[stepId] = missing;
    }
    expect(missingByStep).toEqual({});
  });

  it("every placement layer carries valid meta (label + shared group)", () => {
    const invalid: string[] = [];
    for (const keys of Object.values(EXPECTED_KEYS_BY_STEP)) {
      for (const key of keys) {
        const meta = metaByKey.get(key);
        if (!meta) {
          invalid.push(`${key}: missing meta`);
          continue;
        }
        if (typeof meta.label !== "string" || !meta.label.trim()) {
          invalid.push(`${key}: missing label`);
        }
        if (meta.group !== PLACEMENT_VIZ_GROUP) {
          invalid.push(`${key}: group ${String(meta.group)} != ${PLACEMENT_VIZ_GROUP}`);
        }
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
    const opaque: string[] = [];
    for (const key of zeroTransparentKeys) {
      const meta = metaByKey.get(key);
      const zeroCategory = meta?.categories?.find((category) => category.value === 0);
      if (!zeroCategory) continue; // points variants may omit the zero category
      if ((zeroCategory.color?.[3] ?? 255) !== 0) opaque.push(key);
    }
    expect(opaque).toEqual([]);
  });

  it("emits every dataTypeKey referenced by the studio placement overlay suggestions", () => {
    const missing = OVERLAY_SUGGESTION_KEYS.filter((key) => !metaByKey.has(key));
    expect(missing).toEqual([]);
  });

  it("does not emit the removed sectorId layer", () => {
    expect(metaByKey.has("placement.starts.sectorId")).toBe(false);
  });
});
