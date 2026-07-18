import { describe, expect, it, spyOn } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext, createTraceSession } from "@swooper/mapgen-core";
import { createRecipe, createStage, createStep, defineStep } from "@swooper/mapgen-core/authoring";
import {
  createVizLayerKey,
  type VizGridLayerEmissionV1,
  type VizInlineRef,
  type VizManifestV1,
  type VizPathRef,
} from "@swooper/mapgen-viz";
import { Type } from "typebox";
import {
  createTraceDumpSink,
  createVizDumpAdapters,
  createVizDumper,
} from "../../../src/dev/viz/dump.js";

function readManifest(outputRoot: string, runId: string): VizManifestV1<VizPathRef> {
  return JSON.parse(
    readFileSync(join(outputRoot, runId, "manifest.json"), "utf8")
  ) as VizManifestV1<VizPathRef>;
}

describe("filesystem visualization adapters", () => {
  it("materializes execution-owned projections into the shared trace manifest", () => {
    const outputRoot = mkdtempSync(join(tmpdir(), "swooper-viz-facet-"));
    try {
      const outputs = createVizDumpAdapters({ outputRoot });
      const session = createTraceSession({
        runId: "facet-run",
        planFingerprint: "facet-plan",
        config: { enabled: true, steps: { "test.facet-step": "verbose" } },
        sink: outputs.traceSink,
      });
      session.emitStepStart({ stepId: "test.facet-step", phase: "foundation" });
      const backing = new Uint8Array([90, 4, 7, 91]);
      outputs.facetSinks.viz?.(
        [
          {
            kind: "grid",
            dataTypeKey: "test.facet-grid",
            spaceId: "tile.hexOddQ",
            dims: { width: 2, height: 1 },
            field: {
              format: "u8",
              values: new Uint8Array(backing.buffer, 1, 2),
            },
          },
        ],
        {
          runId: "facet-run",
          planFingerprint: "facet-plan",
          stepId: "test.facet-step",
          phase: "foundation",
          stepIndex: 0,
        }
      );

      const manifest = readManifest(outputRoot, "facet-run");
      expect(manifest.steps).toEqual([
        { stepId: "test.facet-step", phase: "foundation", stepIndex: 0 },
      ]);
      expect(manifest.layers).toHaveLength(1);
      const layer = manifest.layers[0];
      if (layer?.kind !== "grid") throw new Error("Expected grid facet evidence.");
      expect(layer).toMatchObject({
        dataTypeKey: "test.facet-grid",
        stepId: "test.facet-step",
        phase: "foundation",
        stepIndex: 0,
      });
      expect(
        Array.from(readFileSync(join(outputRoot, "facet-run", layer.field.data.path)))
      ).toEqual([4, 7]);
      expect(Array.from(backing)).toEqual([90, 4, 7, 91]);
    } finally {
      rmSync(outputRoot, { recursive: true, force: true });
    }
  });

  it("reconciles partial trace order to the Core-assigned facet index", () => {
    const outputRoot = mkdtempSync(join(tmpdir(), "swooper-viz-index-"));
    try {
      const runId = "partial-trace-run";
      const stepId = "test.late-faceted-step";
      const outputs = createVizDumpAdapters({ outputRoot });
      const session = createTraceSession({
        runId,
        planFingerprint: "partial-trace-plan",
        config: { enabled: true, steps: { [stepId]: "verbose" } },
        sink: outputs.traceSink,
      });
      session.emitStepStart({ stepId, phase: "foundation" });
      outputs.legacyVizDumper.dumpGrid(session.createStepScope({ stepId, phase: "foundation" }), {
        dataTypeKey: "test.legacy-before-facet",
        spaceId: "tile.hexOddQ",
        dims: { width: 1, height: 1 },
        format: "u8",
        values: new Uint8Array([1]),
      });

      outputs.facetSinks.viz?.(
        [
          {
            kind: "grid",
            dataTypeKey: "test.core-facet",
            spaceId: "tile.hexOddQ",
            dims: { width: 1, height: 1 },
            field: { format: "u8", values: new Uint8Array([2]) },
          },
        ],
        {
          runId,
          planFingerprint: "partial-trace-plan",
          stepId,
          phase: "foundation",
          stepIndex: 7,
        }
      );

      const manifest = readManifest(outputRoot, runId);
      expect(manifest.steps).toEqual([{ stepId, phase: "foundation", stepIndex: 7 }]);
      expect(manifest.layers).toHaveLength(2);
      expect(manifest.layers.every((layer) => layer.stepIndex === 7)).toBe(true);
    } finally {
      rmSync(outputRoot, { recursive: true, force: true });
    }
  });

  it("contains projector and sink failures while reporting each once at the filesystem edge", () => {
    const outputRoot = mkdtempSync(join(tmpdir(), "swooper-viz-failure-"));
    const diagnostics = spyOn(console, "error").mockImplementation(() => {});
    const executions: string[] = [];
    try {
      const EmptySchema = Type.Object({}, { additionalProperties: false });
      const projectorContract = defineStep({
        id: "projector-failure",
        phase: "foundation",
        requires: [],
        provides: [],
        schema: EmptySchema,
      });
      const sinkContract = defineStep({
        id: "sink-failure",
        phase: "foundation",
        requires: [],
        provides: [],
        schema: EmptySchema,
      });
      const projectorStep = createStep(projectorContract, {
        run: () => {
          executions.push("projector-step-completed");
          return undefined;
        },
        viz: () => {
          throw new Error("private projector detail");
        },
      });
      const sinkStep = createStep(sinkContract, {
        run: () => {
          executions.push("sink-step-completed");
          return undefined;
        },
        viz: () => [
          {
            kind: "grid",
            dataTypeKey: "test.invalid-cardinality",
            spaceId: "tile.hexOddQ",
            dims: { width: 2, height: 2 },
            field: { format: "u8", values: new Uint8Array([1]) },
          },
        ],
      });
      const stage = createStage({
        id: "foundation",
        knobsSchema: EmptySchema,
        steps: [projectorStep, sinkStep],
      });
      const recipe = createRecipe({
        id: "facet-failures",
        namespace: "test",
        tagDefinitions: [],
        stages: [stage],
        compileOpsById: {},
      });
      const setup = {
        seed: 1,
        dimensions: { width: 2, height: 2 },
        latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
      };
      const context = createExtendedMapContext(
        setup.dimensions,
        createMockAdapter({ width: 2, height: 2, mapSizeId: 1 }),
        setup
      );
      const outputs = createVizDumpAdapters({ outputRoot });

      recipe.run(
        context,
        setup,
        {
          foundation: {
            knobs: {},
            "projector-failure": {},
            "sink-failure": {},
          },
        },
        { facets: outputs.facetSinks }
      );

      expect(executions).toEqual(["projector-step-completed", "sink-step-completed"]);
      expect(diagnostics).toHaveBeenCalledTimes(2);
      const messages = diagnostics.mock.calls.map(([message]) => String(message));
      expect(messages).toEqual([
        expect.stringContaining("viz.project failed"),
        expect.stringContaining("viz.emit failed"),
      ]);
      expect(messages.join("\n")).not.toContain("private projector detail");
    } finally {
      diagnostics.mockRestore();
      rmSync(outputRoot, { recursive: true, force: true });
    }
  });

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
      if (firstLayer?.kind !== "grid") throw new Error("Expected grid manifest layer.");
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
      if (oldLayer?.kind !== "gridFields") {
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
