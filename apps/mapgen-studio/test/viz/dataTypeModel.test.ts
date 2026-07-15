import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import standardRecipe from "mod-swooper-maps/recipes/standard";
import { standardMapConfigs } from "mod-swooper-maps/recipes/standard-map-configs";
import { describe, expect, it } from "vitest";
import type { BrowserRunEvent } from "../../src/browser-runner/protocol";
import { createWorkerTraceSink } from "../../src/browser-runner/worker-trace-sink";
import { createWorkerVizDumper } from "../../src/browser-runner/worker-viz-dumper";
import { buildStepDataTypeModel } from "../../src/features/viz/dataTypeModel";
import type { VizLayerEntryV1 } from "../../src/features/viz/model";
import { studioStandardRecipeConfig } from "./standardRecipeConfig";

describe("buildStepDataTypeModel", () => {
  it("groups layers by data type (dataTypeKey) and render mode (kind + role)", () => {
    const stepId = "mod-swooper-maps.standard.ecology.assign-biomes";

    const layers: VizLayerEntryV1[] = [
      {
        kind: "grid",
        layerKey: `${stepId}::heightfield::tile.hexOddR::grid::f32`,
        dataTypeKey: "heightfield",
        variantKey: "f32",
        stepId,
        stepIndex: 0,
        spaceId: "tile.hexOddR",
        dims: { width: 4, height: 3 },
        field: { format: "f32", data: { kind: "path", path: "height/f32" } },
        bounds: [0, 0, 4, 3],
        meta: { label: "Elevation" },
      },
      {
        kind: "grid",
        layerKey: `${stepId}::heightfield::tile.hexOddR::grid::u8`,
        dataTypeKey: "heightfield",
        variantKey: "u8",
        stepId,
        stepIndex: 0,
        spaceId: "tile.hexOddR",
        dims: { width: 4, height: 3 },
        field: { format: "u8", data: { kind: "path", path: "height/u8" } },
        bounds: [0, 0, 4, 3],
        meta: { visibility: "debug" },
      },
      {
        kind: "points",
        layerKey: `${stepId}::hotspots::world.xy::points:gradient`,
        dataTypeKey: "hotspots",
        stepId,
        stepIndex: 0,
        spaceId: "world.xy",
        count: 2,
        positions: { kind: "path", path: "hotspots/positions" },
        values: { format: "f32", data: { kind: "path", path: "hotspots/gradient" } },
        bounds: [0, 0, 4, 3],
        meta: { role: "gradient", label: "Hotspots" },
      },
      {
        kind: "points",
        layerKey: `${stepId}::hotspots::world.xy::points:clamped`,
        dataTypeKey: "hotspots",
        stepId,
        stepIndex: 0,
        spaceId: "world.xy",
        count: 2,
        positions: { kind: "path", path: "hotspots/positions" },
        values: { format: "f32", data: { kind: "path", path: "hotspots/clamped" } },
        bounds: [0, 0, 4, 3],
        meta: { role: "clamped" },
      },
    ];

    const model = buildStepDataTypeModel({ layers }, stepId);
    expect(model.stepId).toBe(stepId);
    expect(model.dataTypes.map((dt) => dt.dataTypeId)).toEqual(["heightfield", "hotspots"]);

    const heightfield = model.dataTypes.find((dt) => dt.dataTypeId === "heightfield")!;
    expect(heightfield.label).toBe("Elevation");
    expect(heightfield.visibility).toBe("default");
    expect(heightfield.spaces.map((p) => p.spaceId)).toEqual(["tile.hexOddR"]);
    expect(heightfield.spaces[0]?.renderModes.map((rm) => rm.renderModeId)).toEqual(["grid"]);
    expect(heightfield.spaces[0]?.renderModes[0]?.variants.map((v) => v.variantId)).toEqual([
      "f32",
    ]);

    const hotspots = model.dataTypes.find((dt) => dt.dataTypeId === "hotspots")!;
    expect(hotspots.spaces.map((p) => p.spaceId)).toEqual(["world.xy"]);
    expect(hotspots.spaces[0]?.renderModes.map((rm) => rm.renderModeId)).toEqual([
      "points:gradient",
      "points:clamped",
    ]);

    const modelWithDebug = buildStepDataTypeModel({ layers }, stepId, { includeDebug: true });
    const heightfieldWithDebug = modelWithDebug.dataTypes.find(
      (dt) => dt.dataTypeId === "heightfield"
    )!;
    expect(
      heightfieldWithDebug.spaces[0]?.renderModes[0]?.variants.map((v) => v.variantId)
    ).toEqual(["f32", "u8"]);
  });

  it("keeps river evidence layers inspectable while hiding metadata diagnostics by default", () => {
    const stepId = "mod-swooper-maps.standard.map-rivers.plot-rivers";
    const layer = (
      dataTypeKey: string,
      visibility: "default" | "debug",
      role: string | undefined = undefined
    ): VizLayerEntryV1 => ({
      kind: "grid",
      layerKey: `${stepId}::${dataTypeKey}::tile.hexOddQ::grid`,
      dataTypeKey,
      stepId,
      stepIndex: 0,
      spaceId: "tile.hexOddQ",
      dims: { width: 4, height: 3 },
      field: { format: "u8", data: { kind: "path", path: `${dataTypeKey}.u8` } },
      bounds: [0, 0, 4, 3],
      meta: { visibility, ...(role === undefined ? {} : { role }) },
    });

    const layers = [
      layer("map.rivers.projectedRiverMask", "default", "projection"),
      layer("map.rivers.plannedMinorRiverMask", "default", "physics"),
      layer("map.rivers.plannedMajorRiverMask", "default", "physics"),
      layer("map.rivers.engineRiverMask", "default", "engine"),
      layer("map.rivers.engineNavigableRiverMetadataMask", "debug", "engine"),
      layer("map.rivers.riverMismatchMask", "debug"),
      layer("map.rivers.engineMinorRiverMask", "debug", "engine"),
    ];

    const defaultModel = buildStepDataTypeModel({ layers }, stepId);
    expect(defaultModel.dataTypes.map((dt) => dt.dataTypeId)).toEqual([
      "map.rivers.projectedRiverMask",
      "map.rivers.plannedMinorRiverMask",
      "map.rivers.plannedMajorRiverMask",
      "map.rivers.engineRiverMask",
    ]);
    expect(defaultModel.dataTypes.map((dt) => dt.visibility)).toEqual([
      "default",
      "default",
      "default",
      "default",
    ]);

    const debugModel = buildStepDataTypeModel({ layers }, stepId, { includeDebug: true });
    expect(debugModel.dataTypes.map((dt) => dt.dataTypeId)).toEqual([
      "map.rivers.projectedRiverMask",
      "map.rivers.plannedMinorRiverMask",
      "map.rivers.plannedMajorRiverMask",
      "map.rivers.engineRiverMask",
      "map.rivers.engineNavigableRiverMetadataMask",
      "map.rivers.riverMismatchMask",
      "map.rivers.engineMinorRiverMask",
    ]);

    const byId = new Map(debugModel.dataTypes.map((dt) => [dt.dataTypeId, dt]));
    expect(byId.get("map.rivers.projectedRiverMask")?.spaces[0]?.renderModes[0]?.renderModeId).toBe(
      "grid:projection"
    );
    expect(
      byId.get("map.rivers.plannedMinorRiverMask")?.spaces[0]?.renderModes[0]?.renderModeId
    ).toBe("grid:physics");
    expect(
      byId.get("map.rivers.plannedMajorRiverMask")?.spaces[0]?.renderModes[0]?.renderModeId
    ).toBe("grid:physics");
    expect(byId.get("map.rivers.engineRiverMask")?.spaces[0]?.renderModes[0]?.renderModeId).toBe(
      "grid:engine"
    );
    expect(byId.get("map.rivers.engineNavigableRiverMetadataMask")?.visibility).toBe("debug");
    expect(byId.get("map.rivers.riverMismatchMask")?.visibility).toBe("debug");
    expect(byId.get("map.rivers.engineMinorRiverMask")?.visibility).toBe("debug");
  });

  it("builds the river step model from actual standard recipe Studio emissions", () => {
    const width = 32;
    const height = 20;
    const seed = 1337;
    const stepId = "mod-swooper-maps.standard.map-rivers.plot-rivers";
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
    const earthlikeArtifact = standardMapConfigs.find(
      ({ canonicalConfig }) => canonicalConfig.id === "swooper-earthlike"
    );
    if (!earthlikeArtifact)
      throw new Error("swooper-earthlike config missing from standard map config catalog");
    const standardConfig = studioStandardRecipeConfig(earthlikeArtifact.canonicalConfig);
    const plan = standardRecipe.compile(envBase, standardConfig);
    const verboseSteps = Object.fromEntries(
      plan.nodes.map((node) => [node.stepId, "verbose"] as const)
    );
    const env = {
      ...envBase,
      trace: {
        enabled: true,
        steps: verboseSteps,
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
    const events: BrowserRunEvent[] = [];
    context.viz = createWorkerVizDumper();

    standardRecipe.run(context, env, standardConfig, {
      traceSink: createWorkerTraceSink({
        runToken: "studio-river-model-test",
        generation: 1,
        post: (event) => events.push(event),
      }),
      log: () => {},
    });

    const layers = events.flatMap((event) =>
      event.type === "viz.layer.upsert" ? [event.layer] : []
    );
    const defaultModel = buildStepDataTypeModel({ layers }, stepId);
    expect(defaultModel.dataTypes.map((dt) => dt.dataTypeId)).toEqual([
      "map.rivers.riverClass",
      "map.rivers.projectedRiverMask",
      "map.rivers.plannedMinorRiverMask",
      "map.rivers.plannedMajorRiverMask",
      "map.rivers.engineRiverMask",
    ]);

    const debugModel = buildStepDataTypeModel({ layers }, stepId, { includeDebug: true });
    expect(debugModel.dataTypes.map((dt) => dt.dataTypeId)).toEqual([
      "map.rivers.riverClass",
      "map.rivers.discharge",
      "map.rivers.projectedRiverMask",
      "map.rivers.plannedMinorRiverMask",
      "map.rivers.plannedMajorRiverMask",
      "map.rivers.engineRiverMask",
      "map.rivers.engineNavigableRiverMetadataMask",
      "map.rivers.riverMismatchMask",
      "map.rivers.engineMinorRiverMask",
      "debug.heightfield.landMask",
    ]);

    const byId = new Map(debugModel.dataTypes.map((dt) => [dt.dataTypeId, dt]));
    expect(byId.get("map.rivers.projectedRiverMask")?.spaces[0]?.renderModes[0]?.renderModeId).toBe(
      "grid:projection"
    );
    expect(
      byId.get("map.rivers.plannedMinorRiverMask")?.spaces[0]?.renderModes[0]?.renderModeId
    ).toBe("grid:physics");
    expect(
      byId.get("map.rivers.plannedMajorRiverMask")?.spaces[0]?.renderModes[0]?.renderModeId
    ).toBe("grid:physics");
    expect(byId.get("map.rivers.engineRiverMask")?.spaces[0]?.renderModes[0]?.renderModeId).toBe(
      "grid:engine"
    );
    expect(byId.get("map.rivers.engineNavigableRiverMetadataMask")?.visibility).toBe("debug");
    expect(byId.get("map.rivers.riverMismatchMask")?.visibility).toBe("debug");
    expect(byId.get("map.rivers.engineMinorRiverMask")?.visibility).toBe("debug");
  });
});
