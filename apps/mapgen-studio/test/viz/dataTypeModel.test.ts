import { describe, expect, it } from "vitest";
import type { VizLayerEntryV1 } from "../../src/features/viz/model";
import { buildStepDataTypeModel } from "../../src/features/viz/dataTypeModel";

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
        meta: { label: "Elevation" } as any,
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
        meta: { visibility: "debug" } as any,
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
        meta: { role: "gradient", label: "Hotspots" } as any,
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
        meta: { role: "clamped" } as any,
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
    expect(heightfield.spaces[0]?.renderModes[0]?.variants.map((v) => v.variantId)).toEqual(["f32"]);

    const hotspots = model.dataTypes.find((dt) => dt.dataTypeId === "hotspots")!;
    expect(hotspots.spaces.map((p) => p.spaceId)).toEqual(["world.xy"]);
    expect(hotspots.spaces[0]?.renderModes.map((rm) => rm.renderModeId)).toEqual(["points:gradient", "points:clamped"]);

    const modelWithDebug = buildStepDataTypeModel({ layers }, stepId, { includeDebug: true });
    const heightfieldWithDebug = modelWithDebug.dataTypes.find((dt) => dt.dataTypeId === "heightfield")!;
    expect(heightfieldWithDebug.spaces[0]?.renderModes[0]?.variants.map((v) => v.variantId)).toEqual(["f32", "u8"]);
  });
});
