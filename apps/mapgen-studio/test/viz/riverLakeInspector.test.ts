import { createMockAdapter, getCiv7StandardMapSizePreset } from "@civ7/adapter";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import standardRecipe from "mod-swooper-maps/recipes/standard";
import { standardMapConfigs } from "mod-swooper-maps/recipes/standard-map-configs";
import { describe, expect, it } from "vitest";
import type { BrowserRunEvent } from "../../src/browser-runner/protocol";
import { createWorkerTraceSink } from "../../src/browser-runner/worker-trace-sink";
import { createWorkerVizFacetSink } from "../../src/browser-runner/worker-viz-facet-sink";
import type { VizLayerEntryV2 } from "../../src/features/viz/model";
import { buildRiverLakeFloodplainInspectorSummary } from "../../src/features/viz/riverLakeInspector";
import { studioStandardRecipeConfig } from "./standardRecipeConfig";

const tinyMapSize = getCiv7StandardMapSizePreset("MAPSIZE_TINY");
const { width: TINY_WIDTH, height: TINY_HEIGHT } = tinyMapSize.dimensions;
const TINY_CELL_COUNT = TINY_WIDTH * TINY_HEIGHT;

function gridLayer(args: {
  stageId: string;
  stepId: string;
  stepIndex?: number;
  dataTypeKey: string;
  role?: string;
  visibility?: "default" | "debug" | "hidden";
  values?: readonly number[];
}): VizLayerEntryV2 {
  const {
    stageId,
    stepId,
    stepIndex = 0,
    dataTypeKey,
    role,
    visibility = "default",
    values,
  } = args;
  const buffer = values
    ? Uint8Array.from({ length: TINY_CELL_COUNT }, (_, index) => values[index] ?? 0).buffer
    : null;
  return {
    kind: "grid",
    layerKey: `${stepId}::${dataTypeKey}::tile.hexOddQ::${role ? `grid:${role}` : "grid"}`,
    dataTypeKey,
    stageId,
    stepId,
    stepIndex,
    spaceId: "tile.hexOddQ",
    dims: tinyMapSize.dimensions,
    field: {
      format: "u8",
      data: buffer ? { kind: "inline", buffer } : { kind: "path", path: `${dataTypeKey}.u8` },
    },
    bounds: [0, 0, TINY_WIDTH, TINY_HEIGHT],
    meta: {
      label: dataTypeKey,
      visibility,
      ...(role === undefined ? {} : { role }),
    },
  };
}

describe("buildRiverLakeFloodplainInspectorSummary", () => {
  it("separates projection, terrain readback, metadata, lakes, and rendered acceptance", () => {
    const hydroStep = "mod-swooper-maps.standard.hydrology-hydrography.rivers";
    const mapRiverStep = "mod-swooper-maps.standard.map-rivers.plot-rivers";
    const mapLakeStep = "mod-swooper-maps.standard.map-hydrology.lakes";
    const floodplainPlanStep = "mod-swooper-maps.standard.ecology-features.plan-floodplains";
    const featuresStep = "mod-swooper-maps.standard.map-ecology.features-apply";
    const summary = buildRiverLakeFloodplainInspectorSummary({
      layers: [
        gridLayer({
          stageId: "hydrology-hydrography",
          stepId: hydroStep,
          stepIndex: 1,
          dataTypeKey: "hydrology.hydrography.riverClass",
        }),
        gridLayer({
          stageId: "hydrology-hydrography",
          stepId: hydroStep,
          stepIndex: 1,
          dataTypeKey: "hydrology.hydrography.discharge",
        }),
        gridLayer({
          stageId: "map-rivers",
          stepId: mapRiverStep,
          stepIndex: 2,
          dataTypeKey: "map.rivers.projectedRiverMask",
          role: "projection",
          values: [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        }),
        gridLayer({
          stageId: "map-rivers",
          stepId: mapRiverStep,
          stepIndex: 2,
          dataTypeKey: "map.rivers.plannedMajorRiverMask",
          role: "physics",
          values: [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        }),
        gridLayer({
          stageId: "map-rivers",
          stepId: mapRiverStep,
          stepIndex: 2,
          dataTypeKey: "map.rivers.engineRiverMask",
          role: "engine",
          values: [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        }),
        gridLayer({
          stageId: "map-rivers",
          stepId: mapRiverStep,
          stepIndex: 2,
          dataTypeKey: "map.rivers.engineNavigableRiverMetadataMask",
          role: "engine",
          visibility: "debug",
          values: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        }),
        gridLayer({
          stageId: "map-hydrology",
          stepId: mapLakeStep,
          stepIndex: 3,
          dataTypeKey: "map.hydrology.lakes.plannedLakeMask",
          role: "projection",
          values: [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        }),
        gridLayer({
          stageId: "map-hydrology",
          stepId: mapLakeStep,
          stepIndex: 3,
          dataTypeKey: "map.hydrology.lakes.engineLakeMask",
          role: "engine",
          values: [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        }),
        gridLayer({
          stageId: "ecology-features",
          stepId: floodplainPlanStep,
          stepIndex: 4,
          dataTypeKey: "map.ecology.features.floodplainIntentMask",
          role: "intent",
          values: [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        }),
        gridLayer({
          stageId: "map-ecology",
          stepId: featuresStep,
          stepIndex: 5,
          dataTypeKey: "map.ecology.features.floodplainAppliedMask",
          role: "engine",
          values: [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        }),
        gridLayer({
          stageId: "map-ecology",
          stepId: featuresStep,
          stepIndex: 5,
          dataTypeKey: "map.ecology.features.floodplainRejectedMask",
          visibility: "debug",
          values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        }),
      ],
    });

    expect(summary?.version).toBe(1);
    const byRowKey = new Map(summary?.rows.map((row) => [row.rowKey, row]));

    const projection = byRowKey.get("projection-plan");
    expect(projection?.evidenceClass).toBe("projection-plan");
    expect(projection?.claimStatus).toBe("available");
    expect(projection?.displayStatus).toBe("projection-plan-present");
    expect(
      projection?.layerRefs.find((ref) => ref.dataTypeKey === "map.rivers.projectedRiverMask")
    ).toMatchObject({
      role: "projection",
      renderModeId: "grid:projection",
      nonZeroCount: 2,
      presentation: {
        category: "navigable-projection",
        categoryLabel: "Projection plan",
        palette: {
          paletteId: "river-projection-teal",
          activeColor: "#0f766e",
        },
      },
    });
    expect(projection?.counts).toMatchObject({ projected: 2, major: 3 });

    const terrain = byRowKey.get("terrain-readback");
    expect(terrain).toMatchObject({
      evidenceClass: "terrain-readback",
      claimStatus: "available",
      displayStatus: "terrain-readback-present",
    });
    expect(
      terrain?.layerRefs.find((ref) => ref.dataTypeKey === "map.rivers.engineRiverMask")
    ).toMatchObject({
      presentation: {
        category: "engine-terrain-readback",
        palette: {
          paletteId: "terrain-readback-cyan",
          activeColor: "#0891b2",
        },
      },
    });
    const metadata = byRowKey.get("metadata-readback");
    expect(metadata?.counts).toMatchObject({ layers: 1, debug: 1, metadata: 1 });
    expect(
      metadata?.layerRefs.find(
        (ref) => ref.dataTypeKey === "map.rivers.engineNavigableRiverMetadataMask"
      )
    ).toMatchObject({
      presentation: {
        category: "engine-metadata-readback",
        palette: {
          paletteId: "metadata-readback-violet",
          activeColor: "#7c3aed",
        },
      },
    });
    expect(byRowKey.get("lake-plan-readback")).toMatchObject({
      evidenceClass: "lake-final",
      claimStatus: "available",
      displayStatus: "lake-readback-present",
    });
    expect(byRowKey.get("lake-plan-readback")?.counts).toMatchObject({
      "planned lakes": 2,
      "engine lakes": 2,
    });
    expect(
      byRowKey
        .get("lake-plan-readback")
        ?.layerRefs.find((ref) => ref.dataTypeKey === "map.hydrology.lakes.engineLakeMask")
    ).toMatchObject({
      presentation: {
        category: "lake-plan-readback",
        palette: {
          paletteId: "lake-plan-indigo",
          activeColor: "#4f46e5",
        },
      },
    });
    expect(byRowKey.get("lake-exact-counters")).toMatchObject({
      evidenceClass: "lake-final",
      claimStatus: "unresolved",
      displayStatus: "lake-exact-log-missing",
    });
    expect(byRowKey.get("floodplain-intent")).toMatchObject({
      evidenceClass: "floodplain-active",
      claimStatus: "available",
      displayStatus: "floodplain-apply-present",
    });
    expect(byRowKey.get("floodplain-intent")?.counts).toMatchObject({ "fp intent": 2 });
    expect(
      byRowKey
        .get("floodplain-intent")
        ?.layerRefs.find((ref) => ref.dataTypeKey === "map.ecology.features.floodplainIntentMask")
    ).toMatchObject({
      presentation: {
        category: "floodplain-intent",
        palette: {
          paletteId: "floodplain-intent-lime",
          activeColor: "#65a30d",
        },
      },
    });
    expect(byRowKey.get("floodplain-apply")).toMatchObject({
      evidenceClass: "floodplain-active",
      claimStatus: "available",
      displayStatus: "floodplain-apply-present",
    });
    expect(byRowKey.get("floodplain-apply")?.counts).toMatchObject({ "fp applied": 2 });
    expect(
      byRowKey
        .get("floodplain-apply")
        ?.layerRefs.find((ref) => ref.dataTypeKey === "map.ecology.features.floodplainRejectedMask")
    ).toMatchObject({
      presentation: {
        category: "mismatch-debug",
        palette: {
          paletteId: "mismatch-debug-red",
          activeColor: "#dc2626",
        },
      },
    });
    expect(byRowKey.get("floodplain-live-readback")).toMatchObject({
      evidenceClass: "floodplain-active",
      claimStatus: "unresolved",
      displayStatus: "floodplain-live-missing",
    });
    expect(byRowKey.get("civ-rendered")).toMatchObject({
      evidenceClass: "civ-rendered",
      claimStatus: "unresolved",
      displayStatus: "rendered-evidence-missing",
    });
    expect(byRowKey.get("product-acceptance")).toMatchObject({
      evidenceClass: "product-acceptance",
      claimStatus: "unresolved",
      displayStatus: "acceptance-evidence-missing",
    });
  });

  it("refuses malformed inline grid bytes before counting inspector samples", () => {
    const layer = gridLayer({
      stageId: "map-rivers",
      stepId: "test.rivers",
      dataTypeKey: "map.rivers.projectedRiverMask",
      values: [1],
    });
    if (layer.kind !== "grid") throw new Error("Expected a grid fixture.");
    const malformed: VizLayerEntryV2 = {
      ...layer,
      field: {
        ...layer.field,
        data: { kind: "inline", buffer: new Uint8Array([1]).buffer },
      },
    };

    expect(() => buildRiverLakeFloodplainInspectorSummary({ layers: [malformed] })).toThrow(
      `requires exactly ${TINY_CELL_COUNT} bytes`
    );
  });

  it("builds evidence rows from actual standard recipe Studio emissions", () => {
    const { width, height } = tinyMapSize.dimensions;
    const seed = 1337;
    const mapInfo = tinyMapSize.mapInfo;
    const { MaxLatitude: topLatitude, MinLatitude: bottomLatitude } = mapInfo;
    if (typeof topLatitude !== "number" || typeof bottomLatitude !== "number") {
      throw new Error("Civ7 Tiny map-size metadata must declare latitude bounds.");
    }
    const setup = admitMapSetup({
      mapSeed: seed,
      dimensions: { width, height },
      latitudeBounds: { topLatitude, bottomLatitude },
    });
    const earthlikeArtifact = standardMapConfigs.find(
      ({ canonicalConfig }) => canonicalConfig.id === "swooper-earthlike"
    );
    if (!earthlikeArtifact)
      throw new Error("swooper-earthlike config missing from standard map config catalog");
    const standardConfig = studioStandardRecipeConfig(earthlikeArtifact.canonicalConfig);
    const plan = standardRecipe.compile(setup, standardConfig);
    const verboseSteps = Object.fromEntries(
      plan.nodes.map((node) => [node.stepId, "verbose"] as const)
    );
    const adapter = createMockAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createMapContext({ setup, adapter });
    const events: BrowserRunEvent[] = [];
    const post = (event: BrowserRunEvent): void => {
      events.push(event);
    };

    standardRecipe.run(context, standardConfig, {
      trace: {
        config: { steps: verboseSteps },
        sink: createWorkerTraceSink({
          runToken: "studio-river-lake-inspector-test",
          generation: 1,
          post,
        }),
      },
      facets: {
        viz: createWorkerVizFacetSink({
          runToken: "studio-river-lake-inspector-test",
          generation: 1,
          post,
        }),
      },
      log: () => {},
    });

    const layers = events.flatMap((event) =>
      event.type === "viz.layer.upsert" ? [event.layer] : []
    );
    const summary = buildRiverLakeFloodplainInspectorSummary({ layers });
    const byRowKey = new Map(summary?.rows.map((row) => [row.rowKey, row]));

    const projected = byRowKey
      .get("projection-plan")
      ?.layerRefs.find((ref) => ref.dataTypeKey === "map.rivers.projectedRiverMask");
    expect(projected).toMatchObject({
      role: "projection",
      renderModeId: "grid:projection",
      presentation: {
        category: "navigable-projection",
        palette: {
          paletteId: "river-projection-teal",
        },
      },
    });
    expect(projected?.nonZeroCount).toBeGreaterThan(0);

    expect(byRowKey.get("hydrology-model")?.claimStatus).toBe("available");
    expect(byRowKey.get("projection-plan")?.claimStatus).toBe("available");
    expect(byRowKey.get("terrain-readback")?.layerRefs.map((ref) => ref.dataTypeKey)).toContain(
      "map.rivers.engineRiverMask"
    );
    expect(
      byRowKey
        .get("terrain-readback")
        ?.layerRefs.find((ref) => ref.dataTypeKey === "map.rivers.engineRiverMask")?.presentation
        .category
    ).toBe("engine-terrain-readback");
    expect(byRowKey.get("metadata-readback")?.layerRefs.map((ref) => ref.dataTypeKey)).toContain(
      "map.rivers.engineNavigableRiverMetadataMask"
    );
    expect(
      byRowKey
        .get("metadata-readback")
        ?.layerRefs.find((ref) => ref.dataTypeKey === "map.rivers.engineNavigableRiverMetadataMask")
        ?.presentation.category
    ).toBe("engine-metadata-readback");
    expect(byRowKey.get("lake-plan-readback")?.layerRefs.map((ref) => ref.dataTypeKey)).toEqual(
      expect.arrayContaining([
        "map.hydrology.lakes.plannedLakeMask",
        "map.hydrology.lakes.engineLakeMask",
      ])
    );
    expect(byRowKey.get("lake-exact-counters")?.claimStatus).toBe("unresolved");
    expect(byRowKey.get("floodplain-intent")?.layerRefs.map((ref) => ref.dataTypeKey)).toContain(
      "map.ecology.features.floodplainIntentMask"
    );
    expect(byRowKey.get("floodplain-apply")?.layerRefs.map((ref) => ref.dataTypeKey)).toContain(
      "map.ecology.features.floodplainAppliedMask"
    );
    expect(byRowKey.get("floodplain-live-readback")?.claimStatus).toBe("unresolved");
    expect(byRowKey.get("civ-rendered")?.claimStatus).toBe("unresolved");
    expect(byRowKey.get("product-acceptance")?.claimStatus).toBe("unresolved");
  });
});
