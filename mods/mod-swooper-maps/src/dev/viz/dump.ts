import { createHash } from "node:crypto";
import { appendFileSync, mkdirSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type {
  StepFacetFailure,
  StepFacetSinkContext,
  StepFacetSinks,
  TraceEvent,
  TraceSink,
  VizDumper,
} from "@swooper/mapgen-core";
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

function resolveDumpRunState(
  stateByRun: Map<string, DumpRunState>,
  outputRoot: string,
  runId: string,
  planFingerprint: string
): DumpRunState {
  const existing = stateByRun.get(runId);
  if (existing) return existing;

  const runDir = resolveRunDir(outputRoot, runId);
  ensureDir(resolveDataDir(outputRoot, runId));
  const state: DumpRunState = {
    manifest: {
      version: 1,
      runId,
      planFingerprint,
      steps: [],
      layers: [],
    },
    stepIndexById: new Map(),
    nextStepIndex: 0,
  };
  stateByRun.set(runId, state);
  publishManifest(runDir, state.manifest);
  return state;
}

type StepAdmission = Readonly<{
  manifest: VizManifestV1<VizPathRef>;
  stepIndex: number;
  didChange: boolean;
}>;

function planStepAdmission(
  state: DumpRunState,
  step: Readonly<{ stepId: string; phase?: string; stepIndex?: number }>
): StepAdmission {
  const existingIndex = state.stepIndexById.get(step.stepId);
  if (existingIndex !== undefined) {
    if (step.stepIndex === undefined || step.stepIndex === existingIndex) {
      return { manifest: state.manifest, stepIndex: existingIndex, didChange: false };
    }

    const stepIndex = step.stepIndex;
    return {
      manifest: {
        ...state.manifest,
        steps: state.manifest.steps.map((entry) =>
          entry.stepId === step.stepId ? { ...entry, stepIndex } : entry
        ),
        layers: state.manifest.layers.map((layer) =>
          layer.stepId === step.stepId ? { ...layer, stepIndex } : layer
        ),
      },
      stepIndex,
      didChange: true,
    };
  }

  const stepIndex = step.stepIndex ?? state.nextStepIndex;
  return {
    manifest: {
      ...state.manifest,
      steps: [...state.manifest.steps, { stepId: step.stepId, phase: step.phase, stepIndex }],
    },
    stepIndex,
    didChange: true,
  };
}

function commitStepAdmission(state: DumpRunState, stepId: string, admission: StepAdmission): void {
  if (!admission.didChange) return;
  state.stepIndexById.set(stepId, admission.stepIndex);
  state.nextStepIndex = Math.max(state.nextStepIndex, admission.stepIndex + 1);
}

function upsertLayers(
  manifest: VizManifestV1<VizPathRef>,
  layers: readonly VizLayerEntryV1<VizPathRef>[]
): VizManifestV1<VizPathRef> {
  const next = [...manifest.layers];
  for (const layer of layers) {
    const existing = next.findIndex((candidate) => candidate.layerKey === layer.layerKey);
    if (existing >= 0) next[existing] = layer;
    else next.push(layer);
  }
  return { ...manifest, layers: next };
}

function createTraceDumpSinkWithState(
  outputRoot: string,
  stateByRun: Map<string, DumpRunState>
): TraceSink {
  const emit = (event: TraceEvent): void => {
    try {
      const runDir = resolveRunDir(outputRoot, event.runId);
      ensureDir(resolveDataDir(outputRoot, event.runId));
      appendFileSync(join(runDir, "trace.jsonl"), `${JSON.stringify(event)}\n`);

      const state = resolveDumpRunState(stateByRun, outputRoot, event.runId, event.planFingerprint);

      if (event.kind === "step.start" && event.stepId) {
        const admission = planStepAdmission(state, {
          stepId: event.stepId,
          phase: event.phase,
        });
        if (!admission.didChange) return;
        publishManifest(runDir, admission.manifest);
        state.manifest = admission.manifest;
        commitStepAdmission(state, event.stepId, admission);
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
      const manifest = upsertLayers(state.manifest, [layer]);
      publishManifest(runDir, manifest);
      state.manifest = manifest;
    } catch {
      // Trace persistence is diagnostic evidence and must never alter generation flow.
    }
  };

  return { emit };
}

/**
 * Creates the replay trace sink that owns per-run step order and path-backed manifest updates.
 * Diagnostics remain refusal-only: filesystem failures are contained and never alter generation.
 */
export function createTraceDumpSink(options: { outputRoot: string }): TraceSink {
  const { outputRoot } = options;
  const stateByRun = new Map<string, DumpRunState>();
  return createTraceDumpSinkWithState(outputRoot, stateByRun);
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

function materializePathProjection(
  outputRoot: string,
  runId: string,
  projection: VizProjection,
  context: Readonly<{ stepId: string; phase?: string }>
): VizLayerEmissionV1<VizPathRef> {
  const runDir = resolveRunDir(outputRoot, runId);
  ensureDir(resolveDataDir(outputRoot, runId));
  return materializeVizProjection(projection, context, createPathMaterializer(runDir));
}

function createFilesystemVizFacetSink(
  outputRoot: string,
  stateByRun: Map<string, DumpRunState>
): NonNullable<StepFacetSinks["viz"]> {
  return (projections, context: StepFacetSinkContext) => {
    const state = resolveDumpRunState(
      stateByRun,
      outputRoot,
      context.runId,
      context.planFingerprint
    );
    const admission = planStepAdmission(state, context);
    const layers = projections.map((projection) => {
      const emitted = materializePathProjection(outputRoot, context.runId, projection, context);
      return { ...emitted, stepIndex: context.stepIndex };
    });
    const manifest = upsertLayers(admission.manifest, layers);
    publishManifest(resolveRunDir(outputRoot, context.runId), manifest);
    state.manifest = manifest;
    commitStepAdmission(state, context.stepId, admission);
  };
}

function reportFilesystemFacetFailure(failure: StepFacetFailure): undefined {
  const { context, facet, operation } = failure;
  console.error(
    `[mapgen:facet] run=${context.runId} step=${context.stepId}#${context.stepIndex} ${facet}.${operation} failed`
  );
  return undefined;
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
      const layer = materializePathProjection(outputRoot, trace.runId, buildProjection(), {
        stepId: trace.stepId,
        phase: trace.phase,
      });
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

/**
 * Creates the coupled filesystem outputs for one diagnostic execution surface.
 * The trace sink and execution-owned viz facet share run state so legacy and pure projections
 * update one path-backed manifest without duplicate materialization or competing authorities.
 */
export function createVizDumpAdapters(options: { outputRoot: string }): Readonly<{
  traceSink: TraceSink;
  facetSinks: StepFacetSinks;
  legacyVizDumper: VizDumper;
}> {
  const { outputRoot } = options;
  const stateByRun = new Map<string, DumpRunState>();
  return {
    traceSink: createTraceDumpSinkWithState(outputRoot, stateByRun),
    facetSinks: {
      viz: createFilesystemVizFacetSink(outputRoot, stateByRun),
      onError: reportFilesystemFacetFailure,
    },
    legacyVizDumper: createVizDumper({ outputRoot }),
  };
}
