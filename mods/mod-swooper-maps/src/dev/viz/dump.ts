import { createHash } from "node:crypto";
import { appendFileSync, mkdirSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { TraceEvent, TraceSink, VizDumper } from "@swooper/mapgen-core";
import {
  admitVizScalarSource,
  materializeVizProjection,
  type VizBinaryMaterializer,
  type VizBinarySlot,
  type VizLayerEmissionV1,
  type VizLayerEntryV1,
  type VizManifestV1,
  type VizPathRef,
  type VizProjection,
  type VizScalarSource,
} from "@swooper/mapgen-viz";

function isPlainObject(value: unknown): value is Record<PropertyKey, unknown> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

let atomicWriteSequence = 0;

function writeFileAtomic(path: string, data: string | Uint8Array): void {
  atomicWriteSequence += 1;
  const temporaryPath = `${path}.tmp-${process.pid}-${atomicWriteSequence}`;
  writeFileSync(temporaryPath, data);
  renameSync(temporaryPath, path);
}

function writeBinaryAtomic(path: string, view: ArrayBufferView): void {
  writeFileAtomic(path, Buffer.from(view.buffer, view.byteOffset, view.byteLength));
}

function resolveRunDir(outputRoot: string, runId: string): string {
  return join(outputRoot, runId);
}

function resolveDataDir(outputRoot: string, runId: string): string {
  return join(resolveRunDir(outputRoot, runId), "data");
}

type DumpRunState = {
  manifest: VizManifestV1<VizPathRef>;
  stepIndexById: Map<string, number>;
  nextStepIndex: number;
};

const PATH_VIZ_EVENT = Symbol("mod-swooper-maps.path-viz-event");

type PathVizLayerEvent = Readonly<{
  type: "viz.layer.dump.v1";
  layer: VizLayerEmissionV1<VizPathRef>;
  [PATH_VIZ_EVENT]: true;
}>;

function isPathRef(value: unknown): value is VizPathRef {
  return isPlainObject(value) && value.kind === "path" && typeof value.path === "string";
}

function isPathScalarField(value: unknown): boolean {
  return isPlainObject(value) && isPathRef(value.data);
}

function isPathLayer(value: unknown): value is VizLayerEmissionV1<VizPathRef> {
  if (!isPlainObject(value)) return false;
  if (
    typeof value.layerKey !== "string" ||
    typeof value.dataTypeKey !== "string" ||
    typeof value.stepId !== "string" ||
    typeof value.spaceId !== "string" ||
    !Array.isArray(value.bounds) ||
    value.bounds.length !== 4 ||
    !value.bounds.every(Number.isFinite)
  ) {
    return false;
  }
  if (value.kind === "grid") return isPathScalarField(value.field);
  if (value.kind === "points") {
    return (
      isPathRef(value.positions) && (value.values === undefined || isPathScalarField(value.values))
    );
  }
  if (value.kind === "segments") {
    return (
      isPathRef(value.segments) && (value.values === undefined || isPathScalarField(value.values))
    );
  }
  if (value.kind !== "gridFields" || !isPlainObject(value.fields)) return false;
  const fields = Object.values(value.fields);
  return fields.length > 0 && fields.every(isPathScalarField);
}

function createPathVizLayerEvent(layer: VizLayerEmissionV1<VizPathRef>): unknown {
  return Object.freeze({ type: "viz.layer.dump.v1", layer, [PATH_VIZ_EVENT]: true });
}

function isPathVizLayerEvent(value: unknown): value is PathVizLayerEvent {
  return (
    isPlainObject(value) &&
    value[PATH_VIZ_EVENT] === true &&
    value.type === "viz.layer.dump.v1" &&
    isPathLayer(value.layer)
  );
}

function publishManifest(runDir: string, manifest: VizManifestV1<VizPathRef>): void {
  writeFileAtomic(join(runDir, "manifest.json"), JSON.stringify(manifest, null, 2));
}

/**
 * Creates the replay trace sink that owns per-run step order and path-backed manifest updates.
 * Diagnostics remain refusal-only: filesystem failures are contained and never alter generation.
 */
export function createTraceDumpSink(options: { outputRoot: string }): TraceSink {
  const { outputRoot } = options;
  const stateByRun = new Map<string, DumpRunState>();

  const emit = (event: TraceEvent): void => {
    try {
      const runDir = resolveRunDir(outputRoot, event.runId);
      ensureDir(resolveDataDir(outputRoot, event.runId));
      appendFileSync(join(runDir, "trace.jsonl"), `${JSON.stringify(event)}\n`);

      let state = stateByRun.get(event.runId);
      if (!state) {
        state = {
          manifest: {
            version: 1,
            runId: event.runId,
            planFingerprint: event.planFingerprint,
            steps: [],
            layers: [],
          },
          stepIndexById: new Map(),
          nextStepIndex: 0,
        };
        stateByRun.set(event.runId, state);
      }

      if (event.kind === "step.start" && event.stepId) {
        if (!state.stepIndexById.has(event.stepId)) {
          const stepIndex = state.nextStepIndex;
          const manifest = {
            ...state.manifest,
            steps: [
              ...state.manifest.steps,
              { stepId: event.stepId, phase: event.phase, stepIndex },
            ],
          };
          publishManifest(runDir, manifest);
          state.manifest = manifest;
          state.nextStepIndex += 1;
          state.stepIndexById.set(event.stepId, stepIndex);
        }
        return;
      }

      if (event.kind !== "step.event" || !event.stepId) return;
      const data = event.data;
      if (!isPathVizLayerEvent(data)) return;
      const layer: VizLayerEntryV1<VizPathRef> = {
        ...data.layer,
        stepId: event.stepId,
        phase: event.phase,
        stepIndex: state.stepIndexById.get(event.stepId) ?? -1,
      };
      const layers = [...state.manifest.layers];
      const existing = layers.findIndex((candidate) => candidate.layerKey === layer.layerKey);
      if (existing >= 0) layers[existing] = layer;
      else layers.push(layer);
      const manifest = { ...state.manifest, layers };
      publishManifest(runDir, manifest);
      state.manifest = manifest;
    } catch {
      // Trace persistence is diagnostic evidence and must never alter generation flow.
    }
  };

  return { emit };
}

function binaryPath(slot: VizBinarySlot): string {
  const layer = encodeURIComponent(slot.layerKey);
  const bytes = new Uint8Array(slot.source.buffer, slot.source.byteOffset, slot.source.byteLength);
  const digest = createHash("sha256").update(bytes).digest("hex");
  const role =
    slot.kind === "grid-field-values" ? `field-${encodeURIComponent(slot.fieldKey)}` : slot.kind;
  return `data/${layer}__${role}__sha256-${digest}.bin`;
}

function createPathMaterializer(runDir: string): VizBinaryMaterializer<VizPathRef> {
  return (slot) => {
    const path = binaryPath(slot);
    writeBinaryAtomic(join(runDir, path), slot.source);
    return { kind: "path", path };
  };
}

function optionalScalarSource(
  args: Readonly<{
    values?: ArrayBufferView;
    format?: Parameters<typeof admitVizScalarSource>[0]["format"];
    valueSpec?: Parameters<typeof admitVizScalarSource>[0]["valueSpec"];
  }>
): VizScalarSource | undefined {
  if (args.values === undefined && args.format === undefined) return undefined;
  if (args.values === undefined || args.format === undefined) {
    throw new TypeError(`Visualization values and scalar format must be provided together.`);
  }
  return admitVizScalarSource({
    format: args.format,
    values: args.values,
    valueSpec: args.valueSpec,
  });
}

/**
 * Creates the filesystem compatibility adapter for legacy `VizDumper` calls.
 * The portable kernel validates and materializes evidence; this adapter only persists each slot,
 * returns a relative path, and emits the existing trace envelope.
 */
export function createVizDumper(options: { outputRoot: string }): VizDumper {
  const { outputRoot } = options;

  const emit = (
    trace: Parameters<VizDumper["dumpGrid"]>[0],
    buildProjection: () => VizProjection
  ): void => {
    if (!trace.isVerbose || !trace.runId) return;
    try {
      const runDir = resolveRunDir(outputRoot, trace.runId);
      ensureDir(resolveDataDir(outputRoot, trace.runId));
      const layer = materializeVizProjection(
        buildProjection(),
        { stepId: trace.stepId, phase: trace.phase },
        createPathMaterializer(runDir)
      );
      trace.event(() => createPathVizLayerEvent(layer));
    } catch {
      // Visualization persistence is diagnostic evidence and must never alter generation flow.
    }
  };

  const dumpGrid: VizDumper["dumpGrid"] = (trace, layer) => {
    emit(trace, () => ({
      kind: "grid",
      dataTypeKey: layer.dataTypeKey,
      variantKey: layer.variantKey,
      spaceId: layer.spaceId,
      meta: layer.meta,
      dims: layer.dims,
      field: admitVizScalarSource({
        format: layer.format,
        values: layer.values,
        valueSpec: layer.valueSpec,
      }),
    }));
  };

  const dumpPoints: VizDumper["dumpPoints"] = (trace, layer) => {
    emit(trace, () => ({
      kind: "points",
      dataTypeKey: layer.dataTypeKey,
      variantKey: layer.variantKey,
      spaceId: layer.spaceId,
      meta: layer.meta,
      positions: layer.positions,
      values: optionalScalarSource({
        values: layer.values,
        format: layer.valueFormat,
        valueSpec: layer.valueSpec,
      }),
    }));
  };

  const dumpSegments: VizDumper["dumpSegments"] = (trace, layer) => {
    emit(trace, () => ({
      kind: "segments",
      dataTypeKey: layer.dataTypeKey,
      variantKey: layer.variantKey,
      spaceId: layer.spaceId,
      meta: layer.meta,
      segments: layer.segments,
      values: optionalScalarSource({
        values: layer.values,
        format: layer.valueFormat,
        valueSpec: layer.valueSpec,
      }),
    }));
  };

  const dumpGridFields: VizDumper["dumpGridFields"] = (trace, layer) => {
    emit(trace, () => {
      const fields: Record<string, VizScalarSource> = {};
      for (const [fieldKey, field] of Object.entries(layer.fields)) {
        fields[fieldKey] = admitVizScalarSource({
          format: field.format,
          values: field.values,
          valueSpec: field.valueSpec,
        });
      }
      return {
        kind: "gridFields",
        dataTypeKey: layer.dataTypeKey,
        variantKey: layer.variantKey,
        spaceId: layer.spaceId,
        meta: layer.meta,
        dims: layer.dims,
        fields,
        vector: layer.vector,
      };
    });
  };

  return { outputRoot, dumpGrid, dumpPoints, dumpSegments, dumpGridFields };
}
