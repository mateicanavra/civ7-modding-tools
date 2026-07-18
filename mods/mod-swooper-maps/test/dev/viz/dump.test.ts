import { describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createTraceSession } from "@swooper/mapgen-core";
import {
  createVizLayerKey,
  type VizGridLayerEmissionV1,
  type VizInlineRef,
  type VizManifestV1,
  type VizPathRef,
} from "@swooper/mapgen-viz";
import { createTraceDumpSink, createVizDumper } from "../../../src/dev/viz/dump.js";

function readManifest(outputRoot: string, runId: string): VizManifestV1<VizPathRef> {
  return JSON.parse(
    readFileSync(join(outputRoot, runId, "manifest.json"), "utf8")
  ) as VizManifestV1<VizPathRef>;
}

describe("filesystem visualization adapters", () => {
  it("isolates run step indexes, upserts layer identity, and writes exact subview bytes", () => {
    const outputRoot = mkdtempSync(join(tmpdir(), "swooper-viz-"));
    try {
      const sink = createTraceDumpSink({ outputRoot });
      const dumper = createVizDumper({ outputRoot });
      const run = (runId: string, first: Uint8Array, second: Uint8Array): void => {
        const session = createTraceSession({
          runId,
          planFingerprint: `${runId}-plan`,
          config: { enabled: true, steps: { "test.step": "verbose" } },
          sink,
        });
        session.emitStepStart({ stepId: "test.step" });
        const trace = session.createStepScope({ stepId: "test.step" });
        for (const values of [first, second]) {
          dumper.dumpGrid(trace, {
            dataTypeKey: "test.grid",
            spaceId: "tile.hexOddQ",
            dims: { width: 2, height: 1 },
            format: "u8",
            values,
          });
        }
      };

      const firstBacking = new Uint8Array([90, 1, 2, 91]);
      const secondBacking = new Uint8Array([80, 7, 8, 81]);
      run(
        "run-one",
        new Uint8Array(firstBacking.buffer, 1, 2),
        new Uint8Array(secondBacking.buffer, 1, 2)
      );
      run("run-two", new Uint8Array([3, 4]), new Uint8Array([5, 6]));

      const firstManifest = readManifest(outputRoot, "run-one");
      const secondManifest = readManifest(outputRoot, "run-two");
      expect(firstManifest.steps).toEqual([{ stepId: "test.step", stepIndex: 0 }]);
      expect(secondManifest.steps).toEqual([{ stepId: "test.step", stepIndex: 0 }]);
      expect(firstManifest.layers).toHaveLength(1);
      expect(secondManifest.layers).toHaveLength(1);

      const firstLayer = firstManifest.layers[0];
      if (!firstLayer || firstLayer.kind !== "grid")
        throw new Error("Expected grid manifest layer.");
      expect(
        Array.from(readFileSync(join(outputRoot, "run-one", firstLayer.field.data.path)))
      ).toEqual([7, 8]);
      expect(Array.from(secondBacking)).toEqual([80, 7, 8, 81]);
    } finally {
      rmSync(outputRoot, { recursive: true, force: true });
    }
  });

  it("preserves last-good evidence when a later multi-slot publication fails", () => {
    const outputRoot = mkdtempSync(join(tmpdir(), "swooper-viz-atomic-"));
    try {
      const runId = "atomic-run";
      const runDir = join(outputRoot, runId);
      const sink = createTraceDumpSink({ outputRoot });
      const dumper = createVizDumper({ outputRoot });
      const session = createTraceSession({
        runId,
        planFingerprint: "atomic-plan",
        config: { enabled: true, steps: { "test.step": "verbose" } },
        sink,
      });
      session.emitStepStart({ stepId: "test.step" });
      const trace = session.createStepScope({ stepId: "test.step" });
      const dump = (a: number, b: number): void => {
        dumper.dumpGridFields(trace, {
          dataTypeKey: "test.atomic",
          spaceId: "tile.hexOddQ",
          dims: { width: 1, height: 1 },
          fields: {
            a: { format: "u8", values: new Uint8Array([a]) },
            b: { format: "u8", values: new Uint8Array([b]) },
          },
        });
      };

      dump(1, 2);
      const manifestPath = join(runDir, "manifest.json");
      const lastGoodManifest = readFileSync(manifestPath, "utf8");
      const lastGood = readManifest(outputRoot, runId);
      const oldLayer = lastGood.layers[0];
      if (!oldLayer || oldLayer.kind !== "gridFields") {
        throw new Error("Expected the last-good grid-fields layer.");
      }
      const oldAPath = oldLayer.fields.a?.data.path;
      const oldBPath = oldLayer.fields.b?.data.path;
      if (!oldAPath || !oldBPath) throw new Error("Expected both last-good field paths.");

      const layerKey = createVizLayerKey({
        stepId: "test.step",
        dataTypeKey: "test.atomic",
        spaceId: "tile.hexOddQ",
        kind: "gridFields",
      });
      const digest = createHash("sha256")
        .update(new Uint8Array([10]))
        .digest("hex");
      const blockedPath = join(
        runDir,
        `data/${encodeURIComponent(layerKey)}__field-b__sha256-${digest}.bin`
      );
      mkdirSync(blockedPath);

      dump(9, 10);

      expect(readFileSync(manifestPath, "utf8")).toBe(lastGoodManifest);
      expect(Array.from(readFileSync(join(runDir, oldAPath)))).toEqual([1]);
      expect(Array.from(readFileSync(join(runDir, oldBPath)))).toEqual([2]);
      const newADigest = createHash("sha256")
        .update(new Uint8Array([9]))
        .digest("hex");
      expect(readdirSync(join(runDir, "data"))).toContain(
        `${encodeURIComponent(layerKey)}__field-a__sha256-${newADigest}.bin`
      );

      const inlineLayer: VizGridLayerEmissionV1<VizInlineRef> = {
        kind: "grid",
        layerKey: "inline",
        dataTypeKey: "test.inline",
        stepId: "test.step",
        spaceId: "tile.hexOddQ",
        bounds: [0, 0, 1, 1],
        dims: { width: 1, height: 1 },
        field: { format: "u8", data: { kind: "inline", buffer: new Uint8Array([1]).buffer } },
      };
      const injectedEvent = {
        tsMs: 0,
        runId,
        planFingerprint: "atomic-plan",
        kind: "step.event" as const,
        stepId: "test.step",
      };
      sink.emit({
        ...injectedEvent,
        data: { type: "viz.layer.dump.v1", layer: inlineLayer },
      });
      sink.emit({ ...injectedEvent, data: { type: "viz.layer.dump.v1", layer: {} } });
      expect(readFileSync(manifestPath, "utf8")).toBe(lastGoodManifest);
    } finally {
      rmSync(outputRoot, { recursive: true, force: true });
    }
  });
});
