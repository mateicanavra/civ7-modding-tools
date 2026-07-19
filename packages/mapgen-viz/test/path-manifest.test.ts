import { describe, expect, it } from "bun:test";
import { admitPathVizManifest } from "../src/path-manifest.js";

function manifest(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const step = { stepId: "test.step", stageId: "foundation", stepIndex: 0 };
  return {
    version: 2,
    runId: "run-1",
    planFingerprint: "plan-1",
    steps: [step],
    layers: [
      {
        kind: "grid",
        layerKey: "test.step::test.grid::tile.hexOddQ::grid",
        dataTypeKey: "test.grid",
        stepId: step.stepId,
        stageId: step.stageId,
        stepIndex: step.stepIndex,
        spaceId: "tile.hexOddQ",
        bounds: [0, 0, 4, 4],
        dims: { width: 4, height: 4 },
        field: {
          format: "u8",
          data: { kind: "path", path: "data/test-grid.bin" },
          valueSpec: {
            scale: "categorical",
            domain: { kind: "explicit", min: 0, max: 1 },
            noData: { kind: "sentinel", value: 255 },
          },
        },
        meta: {
          label: "Test grid",
          palette: { kind: "categorical" },
          categories: [
            { value: 0, label: "Water", color: [10, 20, 30, 255] },
            { value: 1, label: "Land", color: [40, 50, 60, 255] },
          ],
        },
      },
    ],
    ...overrides,
  };
}

describe("path-backed Viz manifest admission", () => {
  it("admits the closed path-backed v2 wire contract", () => {
    const input = manifest();
    expect(JSON.stringify(admitPathVizManifest(input))).toBe(JSON.stringify(input));

    expect(() => admitPathVizManifest(manifest({ version: 1 }))).toThrow("2");
    expect(() => admitPathVizManifest({ ...manifest(), legacyPalette: "turbo" })).toThrow();

    const legacyPresentation = manifest();
    const [layer] = legacyPresentation.layers as Array<Record<string, unknown>>;
    if (!layer) throw new Error("Fixture layer is required.");
    layer.meta = { label: "Test grid", palette: "turbo" };
    expect(() => admitPathVizManifest(legacyPresentation)).toThrow();
  });

  it("requires path-backed binary payloads", () => {
    const inlineLayer = manifest();
    const [layer] = inlineLayer.layers as Array<Record<string, unknown>>;
    if (!layer) throw new Error("Fixture layer is required.");
    layer.field = {
      format: "u8",
      data: { kind: "inline", buffer: "not-path-backed" },
    };

    expect(() => admitPathVizManifest(inlineLayer)).toThrow();
  });

  it("rejects absolute, platform-specific, and traversal binary paths", () => {
    for (const path of [
      "/tmp/test-grid.bin",
      "C:/tmp/test-grid.bin",
      "data\\test-grid.bin",
      "../test-grid.bin",
      "data/./test-grid.bin",
      "data//test-grid.bin",
      "data/control\u0000.bin",
      "data/control\u001f.bin",
      "data/bad?.bin",
      "data/bad<name.bin",
      "data/NUL.bin",
      "data/com1.txt",
      "data/trailing.",
      "data/trailing ",
    ]) {
      const invalidPath = manifest();
      const [layer] = invalidPath.layers as Array<Record<string, unknown>>;
      if (!layer) throw new Error("Fixture layer is required.");
      layer.field = {
        format: "u8",
        data: { kind: "path", path },
      };

      expect(() => admitPathVizManifest(invalidPath)).toThrow("portable relative path");
    }

    const encodedProducerPath = manifest();
    const [encodedLayer] = encodedProducerPath.layers as Array<Record<string, unknown>>;
    if (!encodedLayer) throw new Error("Fixture layer is required.");
    encodedLayer.field = {
      format: "u8",
      data: {
        kind: "path",
        path: "data/test.step%3A%3Atest.grid__field-a%2Ab__sha256-deadbeef.bin",
      },
    };
    expect(() => admitPathVizManifest(encodedProducerPath)).not.toThrow();
  });

  it("enforces the exact stage, step, and execution-index relation", () => {
    const missingStage = manifest({ steps: [{ stepId: "test.step", stepIndex: 0 }] });
    expect(() => admitPathVizManifest(missingStage)).toThrow("stageId");

    const duplicateStep = manifest();
    duplicateStep.steps = [
      { stepId: "test.step", stageId: "foundation", stepIndex: 0 },
      { stepId: "test.step", stageId: "other-stage", stepIndex: 1 },
    ];
    expect(() => admitPathVizManifest(duplicateStep)).toThrow("duplicate step execution identity");

    const duplicateIndex = manifest();
    duplicateIndex.steps = [
      { stepId: "test.step", stageId: "foundation", stepIndex: 0 },
      { stepId: "other.step", stageId: "other-stage", stepIndex: 0 },
    ];
    expect(() => admitPathVizManifest(duplicateIndex)).toThrow("duplicate step execution identity");

    const danglingLayer = manifest();
    const [layer] = danglingLayer.layers as Array<Record<string, unknown>>;
    if (!layer) throw new Error("Fixture layer is required.");
    layer.stageId = "other-stage";
    expect(() => admitPathVizManifest(danglingLayer)).toThrow(
      "does not reference an admitted manifest step"
    );

    const nulFlattening = manifest({
      steps: [{ stepId: "step\0split", stageId: "stage", stepIndex: 0 }],
    });
    const [nulLayer] = nulFlattening.layers as Array<Record<string, unknown>>;
    if (!nulLayer) throw new Error("Fixture layer is required.");
    nulLayer.stepId = "split";
    nulLayer.stageId = "stage\0step";
    nulLayer.layerKey = "split::test.grid::tile.hexOddQ::grid";
    expect(() => admitPathVizManifest(nulFlattening)).toThrow(
      "does not reference an admitted manifest step"
    );
  });

  it("shares materialization semantics for palette metadata and canonical layer identity", () => {
    const invisiblePalette = manifest();
    const [invisibleLayer] = invisiblePalette.layers as Array<Record<string, any>>;
    invisibleLayer.meta = {
      palette: { kind: "categorical", colors: [[10, 20, 30, 0]] },
    };
    expect(() => admitPathVizManifest(invisiblePalette)).toThrow("must remain visible");

    const duplicateCategories = manifest();
    const [categoryLayer] = duplicateCategories.layers as Array<Record<string, any>>;
    categoryLayer.meta = {
      palette: { kind: "categorical" },
      categories: [
        { value: 1, label: "One", color: [1, 2, 3, 255] },
        { value: 1, label: "Duplicate", color: [4, 5, 6, 255] },
      ],
    };
    expect(() => admitPathVizManifest(duplicateCategories)).toThrow(
      "category values must be unique"
    );

    const nonCanonicalKey = manifest();
    const [keyLayer] = nonCanonicalKey.layers as Array<Record<string, unknown>>;
    keyLayer.layerKey = "caller-authored-key";
    expect(() => admitPathVizManifest(nonCanonicalKey)).toThrow("layer key must be canonical");

    const duplicateKey = manifest();
    duplicateKey.layers = [
      ...(duplicateKey.layers as unknown[]),
      ...(structuredClone(duplicateKey.layers) as unknown[]),
    ];
    expect(() => admitPathVizManifest(duplicateKey)).toThrow("duplicate layer key");
  });

  it("requires vector references to name distinct existing grid fields", () => {
    const vectorManifest = manifest({
      layers: [
        {
          kind: "gridFields",
          layerKey: "test.step::test.vector::tile.hexOddQ::gridFields",
          dataTypeKey: "test.vector",
          stepId: "test.step",
          stageId: "foundation",
          stepIndex: 0,
          spaceId: "tile.hexOddQ",
          bounds: [0, 0, 1, 1],
          dims: { width: 1, height: 1 },
          fields: {
            u: { format: "f32", data: { kind: "path", path: "data/u.bin" } },
            v: { format: "f32", data: { kind: "path", path: "data/v.bin" } },
          },
          vector: { u: "u", v: "u", magnitude: "missing" },
        },
      ],
    });

    expect(() => admitPathVizManifest(vectorManifest)).toThrow("must name distinct grid fields");
    const [layer] = vectorManifest.layers as Array<Record<string, any>>;
    layer.vector = { u: "u", v: "v", magnitude: "missing" };
    expect(() => admitPathVizManifest(vectorManifest)).toThrow(
      "magnitude reference must name an existing grid field"
    );
    layer.vector = { u: "u", v: "v", magnitude: "toString" };
    expect(() => admitPathVizManifest(vectorManifest)).toThrow(
      "magnitude reference must name an existing grid field"
    );
  });

  it("returns a deeply owned and deeply immutable snapshot", () => {
    const input = manifest();
    const admitted = admitPathVizManifest(input);
    const [inputLayer] = input.layers as Array<Record<string, any>>;
    inputLayer.dataTypeKey = "mutated";
    inputLayer.field.data.path = "data/mutated.bin";
    inputLayer.meta.categories[0].label = "Mutated";

    const [layer] = admitted.layers;
    expect(layer?.dataTypeKey).toBe("test.grid");
    if (layer?.kind !== "grid") throw new Error("Expected grid layer.");
    const categories = layer.meta && "categories" in layer.meta ? layer.meta.categories : undefined;
    expect(layer.field.data.path).toBe("data/test-grid.bin");
    expect(categories?.[0]?.label).toBe("Water");
    expect(Object.isFrozen(admitted)).toBe(true);
    expect(Object.isFrozen(admitted.layers)).toBe(true);
    expect(Object.isFrozen(layer.field.data)).toBe(true);
    expect(Object.isFrozen(categories?.[0])).toBe(true);
  });
});
