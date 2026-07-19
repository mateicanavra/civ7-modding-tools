import { describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getCiv7StandardMapSizePreset } from "@civ7/adapter";
import { readI16Grid, readU8Grid } from "../../scripts/diagnostics/grid-analysis.js";
import {
  loadPathVizManifest,
  loadTraceEvents,
} from "../../scripts/diagnostics/serialized-evidence.js";

const tinyPreset = getCiv7StandardMapSizePreset("MAPSIZE_TINY");
if (!tinyPreset) throw new Error("Civ7 Tiny map-size metadata is required by diagnostics tests.");
const tinyDimensions = tinyPreset.dimensions;

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
        bounds: [0, 0, tinyDimensions.width, tinyDimensions.height],
        dims: tinyDimensions,
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
      expect(JSON.stringify(loadPathVizManifest(runDirectory))).toBe(JSON.stringify(input));
    });
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

      expect(loadTraceEvents(runDirectory)).toEqual([...events]);
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

        const admitted = loadPathVizManifest(runDirectory);
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

        const admitted = loadPathVizManifest(runDirectory);
        const admittedLayer = admitted.layers[0];
        if (!admittedLayer) throw new Error("Admitted fixture layer is required.");
        expect(() => fixture.read(runDirectory, admittedLayer)).toThrow(
          `requires exactly ${fixture.expected} bytes`
        );
      });
    }
  });
});
