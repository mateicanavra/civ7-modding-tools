import { describe, expect, it } from "vitest";
import type { VizLayerEntryV0 } from "../../src/features/viz/model";
import { buildStepDataTypeModel } from "../../src/features/viz/dataTypeModel";

describe("buildStepDataTypeModel", () => {
  it("groups layers by data type (layerId) and render mode (kind + role)", () => {
    const stepId = "mod-swooper-maps.standard.ecology.assign-biomes";

    const layers: VizLayerEntryV0[] = [
      {
        kind: "grid",
        layerId: "heightfield",
        stepId,
        stepIndex: 0,
        format: "f32",
        dims: { width: 4, height: 3 },
        path: "height/f32",
        bounds: [0, 0, 4, 3],
        meta: { label: "Elevation" } as any,
      },
      {
        kind: "grid",
        layerId: "heightfield",
        stepId,
        stepIndex: 0,
        format: "u8",
        dims: { width: 4, height: 3 },
        path: "height/u8",
        bounds: [0, 0, 4, 3],
        meta: { visibility: "debug" } as any,
      },
      {
        kind: "points",
        layerId: "hotspots",
        stepId,
        stepIndex: 0,
        count: 2,
        positionsPath: "hotspots/positions",
        valuesPath: "hotspots/gradient",
        bounds: [0, 0, 4, 3],
        meta: { role: "gradient", label: "Hotspots" } as any,
      },
      {
        kind: "points",
        layerId: "hotspots",
        stepId,
        stepIndex: 0,
        count: 2,
        positionsPath: "hotspots/positions",
        valuesPath: "hotspots/clamped",
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
    expect(heightfield.renderModes.map((rm) => rm.renderModeId)).toEqual(["grid"]);
    expect(heightfield.renderModes[0]?.variants.map((v) => v.variantId)).toEqual(["f32", "u8"]);

    const hotspots = model.dataTypes.find((dt) => dt.dataTypeId === "hotspots")!;
    expect(hotspots.renderModes.map((rm) => rm.renderModeId)).toEqual(["points:gradient", "points:clamped"]);
  });
});

