import { describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createVizLayerKey } from "@swooper/mapgen-viz";
import {
  hammingU8,
  inventoryPathVizLayers,
  MissingGridLayerError,
  pickLatestGridLayer,
  readI16Grid,
  readPathVizManifest,
  readTraceEvents,
  readU8Grid,
} from "../src/index.js";

const fixtureDimensions = { width: 4, height: 4 } as const;

function withRunDirectory(run: (runDirectory: string) => void): void {
  const runDirectory = mkdtempSync(join(tmpdir(), "swooper-diagnostic-reader-"));
  try {
    run(runDirectory);
  } finally {
    rmSync(runDirectory, { recursive: true, force: true });
  }
}

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
        bounds: [0, 0, fixtureDimensions.width, fixtureDimensions.height],
        dims: fixtureDimensions,
        field: { format: "u8", data: { kind: "path", path: "data/test-grid.bin" } },
        meta: { label: "Test grid" },
      },
    ],
    ...overrides,
  };
}

describe("serialized diagnostic evidence", () => {
  it("loads an owner-admitted visualization manifest from its run directory", () => {
    withRunDirectory((runDirectory) => {
      const input = manifest();
      writeFileSync(join(runDirectory, "manifest.json"), JSON.stringify(input));
      expect(JSON.stringify(readPathVizManifest(runDirectory))).toBe(JSON.stringify(input));
    });
  });

  it("inventories layers deterministically and selects the latest semantic grid", () => {
    withRunDirectory((runDirectory) => {
      const input = manifest();
      const firstLayer = (input.layers as Array<Record<string, unknown>>)[0];
      if (!firstLayer) throw new Error("Fixture layer is required.");
      const laterStep = { stepId: "test.later", stageId: "morphology", stepIndex: 3 };
      const laterLayer = {
        ...firstLayer,
        ...laterStep,
        layerKey: "test.later::test.grid::tile.hexOddQ::grid",
        field: {
          format: "u8",
          data: { kind: "path", path: "data/test-grid-later.bin" },
        },
      };
      input.steps = [laterStep, { stepId: "test.step", stageId: "foundation", stepIndex: 0 }];
      input.layers = [laterLayer, firstLayer];
      writeFileSync(join(runDirectory, "manifest.json"), JSON.stringify(input));

      const admitted = readPathVizManifest(runDirectory);
      expect(inventoryPathVizLayers(admitted).map((row) => row.stepIndex)).toEqual([0, 3]);
      expect(
        inventoryPathVizLayers(admitted, { dataTypeKey: "test.grid" }).map((row) => row.dataTypeKey)
      ).toEqual(["test.grid", "test.grid"]);
      expect(pickLatestGridLayer(admitted, { dataTypeKey: "test.grid" }).stepId).toBe("test.later");
    });
  });

  it("refuses same-step semantic ambiguity until variant identity is explicit", () => {
    withRunDirectory((runDirectory) => {
      const input = manifest();
      const baseLayer = (input.layers as Array<Record<string, unknown>>)[0];
      if (!baseLayer) throw new Error("Fixture layer is required.");
      const step = { stepId: "test.latest", stageId: "morphology", stepIndex: 4 };
      const variantLayer = (variantKey: string, path: string) => ({
        ...baseLayer,
        ...step,
        variantKey,
        layerKey: createVizLayerKey({
          stepId: step.stepId,
          dataTypeKey: "test.grid",
          variantKey,
          spaceId: "tile.hexOddQ",
          kind: "grid",
        }),
        field: { format: "u8", data: { kind: "path", path } },
      });
      input.steps = [step];
      input.layers = [
        variantLayer("raw", "data/test-grid-raw.bin"),
        variantLayer("smoothed", "data/test-grid-smoothed.bin"),
      ];
      writeFileSync(join(runDirectory, "manifest.json"), JSON.stringify(input));

      const admitted = readPathVizManifest(runDirectory);
      expect(() => pickLatestGridLayer(admitted, { dataTypeKey: "test.grid" })).toThrow(
        "Ambiguous latest grid layer"
      );
      expect(
        pickLatestGridLayer(admitted, {
          dataTypeKey: "test.grid",
          variantKey: "smoothed",
          spaceId: "tile.hexOddQ",
        }).variantKey
      ).toBe("smoothed");
    });
  });

  it("distinguishes an absent grid from an ambiguous selector", () => {
    withRunDirectory((runDirectory) => {
      writeFileSync(join(runDirectory, "manifest.json"), JSON.stringify(manifest()));
      const admitted = readPathVizManifest(runDirectory);

      expect(() => pickLatestGridLayer(admitted, { dataTypeKey: "test.missing" })).toThrow(
        MissingGridLayerError
      );
      expect(() => pickLatestGridLayer(admitted, { dataTypeKey: "test.grid" })).not.toThrow();
    });
  });

  it("counts exact unsigned-byte differences and refuses mismatched cardinality", () => {
    expect(hammingU8(new Uint8Array([1, 2, 3]), new Uint8Array([1, 9, 8]))).toBe(2);
    expect(() => hammingU8(new Uint8Array(1), new Uint8Array(2))).toThrow(
      "Hamming length mismatch"
    );
  });

  it("returns the complete trace union and drops malformed rows", () => {
    withRunDirectory((runDirectory) => {
      mkdirSync(join(runDirectory, "data"));
      const events = [
        {
          tsMs: 1,
          runId: "run-1",
          planFingerprint: "plan-1",
          kind: "run.start",
        },
        {
          tsMs: 2,
          runId: "run-1",
          planFingerprint: "plan-1",
          kind: "step.start",
          stepId: "test.step",
          stageId: "foundation",
        },
        {
          tsMs: 3,
          runId: "run-1",
          planFingerprint: "plan-1",
          kind: "step.event",
          stepId: "test.step",
          stageId: "foundation",
          data: { kind: "test.summary", count: 3 },
        },
        {
          tsMs: 4,
          runId: "run-1",
          planFingerprint: "plan-1",
          kind: "step.finish",
          stepId: "test.step",
          stageId: "foundation",
          durationMs: 2,
          success: true,
        },
        {
          tsMs: 5,
          runId: "run-1",
          planFingerprint: "plan-1",
          kind: "run.finish",
          success: true,
        },
      ] as const;
      writeFileSync(
        join(runDirectory, "trace.jsonl"),
        [
          ...events.map((event) => JSON.stringify(event)),
          JSON.stringify({
            tsMs: 6,
            runId: "run-1",
            planFingerprint: "plan-1",
            kind: "step.start",
            stepId: "test.step",
          }),
          JSON.stringify({ ...events[0], extra: true }),
          "not-json",
        ].join("\n")
      );

      expect(readTraceEvents(runDirectory)).toEqual([...events]);
    });
  });

  it("refuses a binary symlink that escapes the admitted run directory", () => {
    const outsideDirectory = mkdtempSync(join(tmpdir(), "swooper-diagnostic-outside-"));
    try {
      withRunDirectory((runDirectory) => {
        mkdirSync(join(runDirectory, "data"));
        const outsidePath = join(outsideDirectory, "outside.bin");
        writeFileSync(outsidePath, new Uint8Array([7]));
        symlinkSync(outsidePath, join(runDirectory, "data", "test-grid.bin"));
        writeFileSync(join(runDirectory, "manifest.json"), JSON.stringify(manifest()));

        const admitted = readPathVizManifest(runDirectory);
        const [layer] = admitted.layers;
        if (!layer) throw new Error("Fixture layer is required.");
        expect(() => readU8Grid(runDirectory, layer)).toThrow("escapes its admitted run directory");
      });
    } finally {
      rmSync(outsideDirectory, { recursive: true, force: true });
    }
  });

  it("refuses truncated or padded grid bytes before typed decoding", () => {
    for (const fixture of [
      { format: "u8", bytes: new Uint8Array([1]), read: readU8Grid, expected: 2 },
      { format: "i16", bytes: new Uint8Array([1, 0, 2]), read: readI16Grid, expected: 4 },
      { format: "u8", bytes: new Uint8Array([1, 2, 3]), read: readU8Grid, expected: 2 },
    ] as const) {
      withRunDirectory((runDirectory) => {
        mkdirSync(join(runDirectory, "data"));
        const input = manifest();
        const layer = (input.layers as Array<Record<string, unknown>>)[0];
        if (!layer) throw new Error("Fixture layer is required.");
        layer.dims = { width: 2, height: 1 };
        layer.bounds = [0, 0, 2, 1];
        layer.field = {
          format: fixture.format,
          data: { kind: "path", path: "data/test-grid.bin" },
        };
        writeFileSync(join(runDirectory, "manifest.json"), JSON.stringify(input));
        writeFileSync(join(runDirectory, "data", "test-grid.bin"), fixture.bytes);

        const admitted = readPathVizManifest(runDirectory);
        const admittedLayer = admitted.layers[0];
        if (!admittedLayer) throw new Error("Admitted fixture layer is required.");
        expect(() => fixture.read(runDirectory, admittedLayer)).toThrow(
          `requires exactly ${fixture.expected} bytes`
        );
      });
    }
  });
});
