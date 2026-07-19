import { createHash } from "node:crypto";
import { appendFileSync, mkdirSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type {
  StepFacetFailure,
  StepFacetSinkContext,
  StepFacetSinks,
  TraceEvent,
  TraceSink,
} from "@swooper/mapgen-core";
import {
  materializeVizProjection,
  type VizBinaryMaterializer,
  type VizBinarySlot,
  type VizLayerEmissionV1,
  type VizLayerEntryV1,
  type VizManifestV1,
  type VizPathRef,
  type VizProjection,
} from "@swooper/mapgen-viz";

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

/**
 * Creates the coupled filesystem outputs for one diagnostic execution surface.
 * Trace progress and execution-owned visualization facets share one path-backed manifest state.
 * Persistence remains diagnostic-only: sink failures are reported without changing generation flow.
 */
export function createVizDumpAdapters(options: { outputRoot: string }): Readonly<{
  traceSink: TraceSink;
  facetSinks: StepFacetSinks;
}> {
  const { outputRoot } = options;
  const stateByRun = new Map<string, DumpRunState>();
  return {
    traceSink: createTraceDumpSinkWithState(outputRoot, stateByRun),
    facetSinks: {
      viz: createFilesystemVizFacetSink(outputRoot, stateByRun),
      onError: reportFilesystemFacetFailure,
    },
  };
}
