import { describe, expect, it } from "vitest";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import type { VizLayerEntryV1 } from "../../src/features/viz/model";
import { createWorkerTraceSink } from "../../src/browser-runner/worker-trace-sink";
import { createWorkerVizDumper } from "../../src/browser-runner/worker-viz-dumper";
import { buildRiverLakeFloodplainInspectorSummary } from "../../src/features/viz/riverLakeInspector";
import type { BrowserRunEvent } from "../../src/browser-runner/protocol";
import standardRecipe from "mod-swooper-maps/recipes/standard";
import { standardMapConfigs } from "mod-swooper-maps/recipes/standard-map-configs";

function gridLayer(args: {
  stepId: string;
  stepIndex?: number;
  dataTypeKey: string;
  role?: string;
  visibility?: "default" | "debug" | "hidden";
  values?: readonly number[];
}): VizLayerEntryV1 {
  const { stepId, stepIndex = 0, dataTypeKey, role, visibility = "default", values } = args;
  const buffer = values ? Uint8Array.from(values).buffer : null;
  return {
    kind: "grid",
    layerKey: `${stepId}::${dataTypeKey}::tile.hexOddQ::${role ? `grid:${role}` : "grid"}`,
    dataTypeKey,
    stepId,
    stepIndex,
    spaceId: "tile.hexOddQ",
    dims: { width: 4, height: 3 },
    field: { format: "u8", data: buffer ? { kind: "inline", buffer } : { kind: "path", path: `${dataTypeKey}.u8` } },
    bounds: [0, 0, 4, 3],
    meta: { label: dataTypeKey, role, visibility } as any,
  };
}

describe("buildRiverLakeFloodplainInspectorSummary", () => {
  it("separates projection, terrain readback, metadata, lakes, and rendered acceptance", () => {
    const hydroStep = "mod-swooper-maps.standard.hydrology-hydrography.rivers";
    const mapRiverStep = "mod-swooper-maps.standard.map-rivers.plot-rivers";
    const mapLakeStep = "mod-swooper-maps.standard.map-hydrology.lakes";
    const featuresStep = "mod-swooper-maps.standard.map-ecology.features-apply";
    const summary = buildRiverLakeFloodplainInspectorSummary({
      layers: [
        gridLayer({ stepId: hydroStep, stepIndex: 1, dataTypeKey: "hydrology.hydrography.riverClass" }),
        gridLayer({ stepId: hydroStep, stepIndex: 1, dataTypeKey: "hydrology.hydrography.discharge" }),
        gridLayer({
          stepId: mapRiverStep,
          stepIndex: 2,
          dataTypeKey: "map.rivers.projectedRiverMask",
          role: "projection",
          values: [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        }),
        gridLayer({
          stepId: mapRiverStep,
          stepIndex: 2,
          dataTypeKey: "map.rivers.plannedMajorRiverMask",
          role: "physics",
          values: [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        }),
        gridLayer({
          stepId: mapRiverStep,
          stepIndex: 2,
          dataTypeKey: "map.rivers.engineRiverMask",
          role: "engine",
          values: [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        }),
        gridLayer({
          stepId: mapRiverStep,
          stepIndex: 2,
          dataTypeKey: "map.rivers.engineNavigableRiverMetadataMask",
          role: "engine",
          visibility: "debug",
          values: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        }),
        gridLayer({
          stepId: mapLakeStep,
          stepIndex: 3,
          dataTypeKey: "map.hydrology.lakes.plannedLakeMask",
          role: "projection",
          values: [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        }),
        gridLayer({
          stepId: mapLakeStep,
          stepIndex: 3,
          dataTypeKey: "map.hydrology.lakes.engineLakeMask",
          role: "engine",
          values: [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        }),
        gridLayer({
          stepId: featuresStep,
          stepIndex: 4,
          dataTypeKey: "map.ecology.featureType",
          role: "engine",
          values: [0, 0, 5, 0, 0, 8, 0, 0, 0, 0, 0, 0],
        }),
      ],
    });

    expect(summary?.version).toBe(1);
    const byLane = new Map(summary?.rows.map((row) => [row.lane, row]));

    const projection = byLane.get("projection");
    expect(projection?.proofClass).toBe("projection-plan");
    expect(projection?.claimStatus).toBe("available");
    expect(projection?.displayStatus).toBe("projection-plan-present");
    expect(projection?.layerRefs.find((ref) => ref.dataTypeKey === "map.rivers.projectedRiverMask")).toMatchObject({
      role: "projection",
      renderModeId: "grid:projection",
      nonZeroCount: 2,
    });
    expect(projection?.counts).toMatchObject({ projected: 2, major: 3 });

    expect(byLane.get("terrain-readback")).toMatchObject({
      proofClass: "terrain-readback",
      claimStatus: "available",
      displayStatus: "terrain-readback-present",
    });
    expect(byLane.get("metadata-readback")?.counts).toMatchObject({ layers: 1, debug: 1, metadata: 1 });
    expect(byLane.get("lakes")).toMatchObject({
      proofClass: "lake-final",
      claimStatus: "available",
      displayStatus: "lake-readback-present",
    });
    expect(byLane.get("lakes")?.counts).toMatchObject({ "planned lakes": 2, "engine lakes": 2 });
    expect(byLane.get("floodplains")).toMatchObject({
      proofClass: "floodplain-active",
      claimStatus: "available",
      displayStatus: "floodplain-apply-present",
    });
    expect(byLane.get("floodplains")?.counts).toMatchObject({ features: 2 });
    expect(byLane.get("rendered")).toMatchObject({
      proofClass: "civ-rendered",
      claimStatus: "unresolved",
      displayStatus: "rendered-proof-missing",
    });
    expect(byLane.get("acceptance")).toMatchObject({
      proofClass: "product-acceptance",
      claimStatus: "unresolved",
      displayStatus: "acceptance-proof-missing",
    });
  });

  it("builds proof rows from actual standard recipe Studio emissions", () => {
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
    const envBase = {
      seed,
      dimensions: { width, height },
      latitudeBounds: {
        topLatitude: mapInfo.MaxLatitude,
        bottomLatitude: mapInfo.MinLatitude,
      },
    };
    const standardConfig = standardMapConfigs.find((config) => config.id === "swooper-earthlike")?.config;
    if (!standardConfig) throw new Error("swooper-earthlike config missing from standard map config catalog");
    const plan = standardRecipe.compile(envBase, standardConfig);
    const verboseSteps = Object.fromEntries(plan.nodes.map((node) => [node.stepId, "verbose"] as const));
    const env = {
      ...envBase,
      trace: {
        enabled: true,
        steps: verboseSteps,
      },
    };
    const adapter = createMockAdapter({ width, height, mapInfo, mapSizeId: 1, rng: createLabelRng(seed) });
    const context = createExtendedMapContext({ width, height }, adapter, env);
    const events: BrowserRunEvent[] = [];
    context.viz = createWorkerVizDumper();

    standardRecipe.run(context, env, standardConfig, {
      traceSink: createWorkerTraceSink({
        runToken: "studio-river-lake-inspector-test",
        generation: 1,
        post: (event) => events.push(event),
      }),
      log: () => {},
    });

    const layers = events.flatMap((event) => (event.type === "viz.layer.upsert" ? [event.layer] : []));
    const summary = buildRiverLakeFloodplainInspectorSummary({ layers });
    const byLane = new Map(summary?.rows.map((row) => [row.lane, row]));

    const projected = byLane
      .get("projection")
      ?.layerRefs.find((ref) => ref.dataTypeKey === "map.rivers.projectedRiverMask");
    expect(projected).toMatchObject({ role: "projection", renderModeId: "grid:projection" });
    expect(projected?.nonZeroCount).toBeGreaterThan(0);

    expect(byLane.get("hydrology")?.claimStatus).toBe("available");
    expect(byLane.get("projection")?.claimStatus).toBe("available");
    expect(byLane.get("terrain-readback")?.layerRefs.map((ref) => ref.dataTypeKey)).toContain(
      "map.rivers.engineRiverMask"
    );
    expect(byLane.get("metadata-readback")?.layerRefs.map((ref) => ref.dataTypeKey)).toContain(
      "map.rivers.engineNavigableRiverMetadataMask"
    );
    expect(byLane.get("lakes")?.layerRefs.map((ref) => ref.dataTypeKey)).toEqual(
      expect.arrayContaining(["map.hydrology.lakes.plannedLakeMask", "map.hydrology.lakes.engineLakeMask"])
    );
    expect(byLane.get("rendered")?.claimStatus).toBe("unresolved");
    expect(byLane.get("acceptance")?.claimStatus).toBe("unresolved");
  });
});
