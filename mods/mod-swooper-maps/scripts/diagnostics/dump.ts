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
  assertUniqueVizLayerKeys,
  materializeVizProjection,
  type VizBinaryMaterializer,
  type VizBinarySlot,
  type VizLayerEntryV2,
  type VizManifestV2,
  type VizPathRef,
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
  manifest: VizManifestV2<VizPathRef>;
  stepById: Map<string, DumpStepIdentity>;
  stepIdByIndex: Map<number, string>;
  nextStepIndex: number;
};

type DumpStepIdentity = Readonly<{
  stageId: string;
  stepId: string;
  stepIndex: number;
}>;

function publishManifest(runDir: string, manifest: VizManifestV2<VizPathRef>): void {
  writeFileAtomic(join(runDir, "manifest.json"), JSON.stringify(manifest, null, 2));
}

type DumpRunStatePlan = Readonly<{
  state: DumpRunState;
  isNew: boolean;
}>;

function planDumpRunState(
  stateByRun: Map<string, DumpRunState>,
  runId: string,
  planFingerprint: string
): DumpRunStatePlan {
  const existing = stateByRun.get(runId);
  if (existing) {
    if (existing.manifest.planFingerprint !== planFingerprint) {
      throw new TypeError(
        `Contradictory visualization run identity for "${runId}": expected plan ` +
          `"${existing.manifest.planFingerprint}", received "${planFingerprint}".`
      );
    }
    return { state: existing, isNew: false };
  }

  const state: DumpRunState = {
    manifest: {
      version: 2,
      runId,
      planFingerprint,
      steps: [],
      layers: [],
    },
    stepById: new Map(),
    stepIdByIndex: new Map(),
    nextStepIndex: 0,
  };
  return { state, isNew: true };
}

function commitDumpRunState(
  stateByRun: Map<string, DumpRunState>,
  runId: string,
  plan: DumpRunStatePlan
): void {
  if (plan.isNew) stateByRun.set(runId, plan.state);
}

type StepAdmission = Readonly<{
  manifest: VizManifestV2<VizPathRef>;
  step: DumpStepIdentity;
  didChange: boolean;
}>;

function planStepAdmission(
  state: DumpRunState,
  step: Readonly<{ stepId: string; stageId: string; stepIndex?: number }>
): StepAdmission {
  const existing = state.stepById.get(step.stepId);
  if (existing) {
    const stepIndex = step.stepIndex ?? existing.stepIndex;
    if (step.stageId !== existing.stageId || stepIndex !== existing.stepIndex) {
      throw new TypeError(
        `Contradictory visualization step identity for "${step.stepId}": expected ` +
          `${existing.stageId}#${existing.stepIndex}, received ${step.stageId}#${stepIndex}.`
      );
    }
    return { manifest: state.manifest, step: existing, didChange: false };
  }

  const stepIndex = step.stepIndex ?? state.nextStepIndex;
  const indexedStepId = state.stepIdByIndex.get(stepIndex);
  if (indexedStepId !== undefined) {
    throw new TypeError(
      `Contradictory visualization step identity at index ${stepIndex}: ` +
        `expected "${indexedStepId}", received "${step.stepId}".`
    );
  }
  const admittedStep = { stageId: step.stageId, stepId: step.stepId, stepIndex };
  return {
    manifest: {
      ...state.manifest,
      steps: [...state.manifest.steps, admittedStep],
    },
    step: admittedStep,
    didChange: true,
  };
}

function commitStepAdmission(state: DumpRunState, admission: StepAdmission): void {
  if (!admission.didChange) return;
  state.stepById.set(admission.step.stepId, admission.step);
  state.stepIdByIndex.set(admission.step.stepIndex, admission.step.stepId);
  state.nextStepIndex = Math.max(state.nextStepIndex, admission.step.stepIndex + 1);
}

function appendLayers(
  manifest: VizManifestV2<VizPathRef>,
  layers: readonly VizLayerEntryV2<VizPathRef>[]
): VizManifestV2<VizPathRef> {
  const combined = [...manifest.layers, ...layers];
  assertUniqueVizLayerKeys(combined, "Visualization dump manifest");
  return { ...manifest, layers: combined };
}

function createTraceDumpSinkWithState(
  outputRoot: string,
  stateByRun: Map<string, DumpRunState>
): TraceSink {
  const emit = (event: TraceEvent): void => {
    try {
      const runPlan = planDumpRunState(stateByRun, event.runId, event.planFingerprint);
      const { state } = runPlan;
      const admission =
        event.kind === "step.start" || event.kind === "step.event" || event.kind === "step.finish"
          ? planStepAdmission(state, {
              stepId: event.stepId,
              stageId: event.stageId,
            })
          : undefined;
      const manifest = admission?.manifest ?? state.manifest;

      const runDir = resolveRunDir(outputRoot, event.runId);
      ensureDir(resolveDataDir(outputRoot, event.runId));
      appendFileSync(join(runDir, "trace.jsonl"), `${JSON.stringify(event)}\n`);
      if (runPlan.isNew || admission?.didChange) publishManifest(runDir, manifest);
      state.manifest = manifest;
      if (admission) commitStepAdmission(state, admission);
      commitDumpRunState(stateByRun, event.runId, runPlan);
    } catch {
      // Trace persistence is diagnostic evidence and must never alter generation flow.
    }
  };

  return { emit };
}

function encodePortablePathComponent(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function binaryPath(slot: VizBinarySlot, bytes: Uint8Array): string {
  const layer = encodePortablePathComponent(slot.layerKey);
  const digest = createHash("sha256").update(bytes).digest("hex");
  const role =
    slot.kind === "grid-field-values"
      ? `field-${encodePortablePathComponent(slot.fieldKey)}`
      : slot.kind;
  return `data/${layer}__${role}__sha256-${digest}.bin`;
}

type StagedVizBinary = Readonly<{ path: string; bytes: Uint8Array }>;

function createStagedPathMaterializer(
  stagedBinaries: StagedVizBinary[]
): VizBinaryMaterializer<VizPathRef> {
  return (slot) => {
    const bytes = new Uint8Array(slot.source.byteLength);
    bytes.set(new Uint8Array(slot.source.buffer, slot.source.byteOffset, slot.source.byteLength));
    const path = binaryPath(slot, bytes);
    stagedBinaries.push({ path, bytes });
    return { kind: "path", path };
  };
}

function persistStagedBinaries(runDir: string, stagedBinaries: readonly StagedVizBinary[]): void {
  for (const staged of stagedBinaries) {
    writeBinaryAtomic(join(runDir, staged.path), staged.bytes);
  }
}

function createFilesystemVizFacetSink(
  outputRoot: string,
  stateByRun: Map<string, DumpRunState>
): NonNullable<StepFacetSinks["viz"]> {
  return (projections, context: StepFacetSinkContext) => {
    const runPlan = planDumpRunState(stateByRun, context.runId, context.planFingerprint);
    const { state } = runPlan;
    const admission = planStepAdmission(state, context);
    const stagedBinaries: StagedVizBinary[] = [];
    const materializePath = createStagedPathMaterializer(stagedBinaries);
    const layers = projections.map((projection) => {
      const emitted = materializeVizProjection(projection, admission.step, materializePath);
      return { ...emitted, stepIndex: admission.step.stepIndex };
    });
    assertUniqueVizLayerKeys(layers, "Visualization dump batch");
    const manifest = appendLayers(admission.manifest, layers);
    const runDir = resolveRunDir(outputRoot, context.runId);
    ensureDir(resolveDataDir(outputRoot, context.runId));
    persistStagedBinaries(runDir, stagedBinaries);
    publishManifest(runDir, manifest);
    state.manifest = manifest;
    commitStepAdmission(state, admission);
    commitDumpRunState(stateByRun, context.runId, runPlan);
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
