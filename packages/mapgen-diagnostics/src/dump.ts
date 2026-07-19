import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  lstatSync,
  mkdirSync,
  openSync,
  realpathSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path";
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

let atomicWriteSequence = 0;

function writeFileAtomic(path: string, data: string | Uint8Array): void {
  atomicWriteSequence += 1;
  const temporaryPath = `${path}.tmp-${process.pid}-${atomicWriteSequence}`;
  let temporaryFileCreated = false;
  try {
    writeFileSync(temporaryPath, data, { flag: "wx" });
    temporaryFileCreated = true;
    renameSync(temporaryPath, path);
  } catch (error) {
    if (temporaryFileCreated) {
      try {
        unlinkSync(temporaryPath);
      } catch {
        // Preserve the original publication failure.
      }
    }
    throw error;
  }
}

function writeBinaryAtomic(path: string, view: ArrayBufferView): void {
  writeFileAtomic(path, Buffer.from(view.buffer, view.byteOffset, view.byteLength));
}

function resolveDirectChildName(parentDirectory: string, childIdentity: string): string {
  const childPath = resolve(parentDirectory, childIdentity);
  const pathFromParent = relative(parentDirectory, childPath);
  if (
    pathFromParent === "" ||
    pathFromParent === ".." ||
    pathFromParent.startsWith(`..${sep}`) ||
    pathFromParent.includes(sep) ||
    isAbsolute(pathFromParent) ||
    pathFromParent !== childIdentity
  ) {
    throw new TypeError(
      `Diagnostic run "${childIdentity}" must identify one direct child of its output root.`
    );
  }
  return pathFromParent;
}

function admitChildDirectory(parentDirectory: string, childName: string, label: string): string {
  const childPath = join(parentDirectory, childName);
  let entry = lstatSync(childPath, { throwIfNoEntry: false });
  if (entry?.isSymbolicLink()) {
    throw new TypeError(`${label} must not be a symbolic link.`);
  }
  if (!entry) {
    mkdirSync(childPath);
    entry = lstatSync(childPath);
  }
  if (!entry.isDirectory()) {
    throw new TypeError(`${label} must be a directory.`);
  }

  const admittedPath = realpathSync(childPath);
  if (relative(parentDirectory, admittedPath) !== childName) {
    throw new TypeError(`${label} escapes its admitted parent directory.`);
  }
  return admittedPath;
}

type DumpPaths = Readonly<{ runDir: string; dataDir: string; tracePath: string }>;

function createDumpPathAdmission(outputRoot: string): (runId: string) => DumpPaths {
  const requestedOutputRoot = resolve(outputRoot);
  let admittedOutputRoot: string | undefined;
  return (runId) => {
    const runDirectoryName = resolveDirectChildName(requestedOutputRoot, runId);
    if (!admittedOutputRoot) {
      mkdirSync(requestedOutputRoot, { recursive: true });
      admittedOutputRoot = realpathSync(requestedOutputRoot);
      if (!lstatSync(admittedOutputRoot).isDirectory()) {
        throw new TypeError(`Diagnostic output root must be a directory.`);
      }
    }
    const runDir = admitChildDirectory(
      admittedOutputRoot,
      runDirectoryName,
      `Diagnostic run directory`
    );
    const dataDir = admitChildDirectory(runDir, "data", `Diagnostic data directory`);
    return { runDir, dataDir, tracePath: join(runDir, "trace.jsonl") };
  };
}

function appendTraceEvent(path: string, event: TraceEvent): void {
  const entry = lstatSync(path, { throwIfNoEntry: false });
  if (entry?.isSymbolicLink()) {
    throw new TypeError(`Diagnostic trace file must not be a symbolic link.`);
  }
  const descriptor = openSync(
    path,
    constants.O_APPEND | constants.O_CREAT | constants.O_WRONLY | constants.O_NOFOLLOW,
    0o666
  );
  try {
    writeFileSync(descriptor, `${JSON.stringify(event)}\n`);
  } finally {
    closeSync(descriptor);
  }
}

type DumpRunState = {
  manifest: VizManifestV2<VizPathRef>;
  stageByStepId: Map<string, string>;
  indexedStepById: Map<string, DumpStepIdentity>;
  stepIdByIndex: Map<number, string>;
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
    stageByStepId: new Map(),
    indexedStepById: new Map(),
    stepIdByIndex: new Map(),
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
  step: Readonly<{ stepId: string; stageId: string; stepIndex: number }>
): StepAdmission {
  const observedStageId = state.stageByStepId.get(step.stepId);
  if (observedStageId !== undefined && observedStageId !== step.stageId) {
    throw new TypeError(
      `Contradictory visualization step stage for "${step.stepId}": expected ` +
        `"${observedStageId}", received "${step.stageId}".`
    );
  }

  const existing = state.indexedStepById.get(step.stepId);
  if (existing) {
    if (step.stageId !== existing.stageId || step.stepIndex !== existing.stepIndex) {
      throw new TypeError(
        `Contradictory visualization step identity for "${step.stepId}": expected ` +
          `${existing.stageId}#${existing.stepIndex}, received ${step.stageId}#${step.stepIndex}.`
      );
    }
    return { manifest: state.manifest, step: existing, didChange: false };
  }

  const indexedStepId = state.stepIdByIndex.get(step.stepIndex);
  if (indexedStepId !== undefined) {
    throw new TypeError(
      `Contradictory visualization step identity at index ${step.stepIndex}: ` +
        `expected "${indexedStepId}", received "${step.stepId}".`
    );
  }
  const admittedStep = {
    stageId: step.stageId,
    stepId: step.stepId,
    stepIndex: step.stepIndex,
  };
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
  state.stageByStepId.set(admission.step.stepId, admission.step.stageId);
  if (admission.didChange) {
    state.indexedStepById.set(admission.step.stepId, admission.step);
    state.stepIdByIndex.set(admission.step.stepIndex, admission.step.stepId);
  }
}

type TraceStepAdmission = Readonly<{
  stepId: string;
  stageId: string;
  didChange: boolean;
}>;

function planTraceStepAdmission(
  state: DumpRunState,
  step: Readonly<{ stepId: string; stageId: string }>
): TraceStepAdmission {
  const existingStageId = state.stageByStepId.get(step.stepId);
  if (existingStageId !== undefined && existingStageId !== step.stageId) {
    throw new TypeError(
      `Contradictory visualization step stage for "${step.stepId}": expected ` +
        `"${existingStageId}", received "${step.stageId}".`
    );
  }
  return { ...step, didChange: existingStageId === undefined };
}

function commitTraceStepAdmission(state: DumpRunState, admission: TraceStepAdmission): void {
  if (admission.didChange) state.stageByStepId.set(admission.stepId, admission.stageId);
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
  admitPaths: (runId: string) => DumpPaths,
  stateByRun: Map<string, DumpRunState>
): TraceSink {
  const emit = (event: TraceEvent): void => {
    try {
      const paths = admitPaths(event.runId);
      const runPlan = planDumpRunState(stateByRun, event.runId, event.planFingerprint);
      const { state } = runPlan;
      const traceAdmission =
        event.kind === "step.start" || event.kind === "step.event" || event.kind === "step.finish"
          ? planTraceStepAdmission(state, {
              stepId: event.stepId,
              stageId: event.stageId,
            })
          : undefined;

      appendTraceEvent(paths.tracePath, event);
      if (runPlan.isNew) publishManifest(paths.runDir, state.manifest);
      if (traceAdmission) commitTraceStepAdmission(state, traceAdmission);
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

function persistStagedBinaries(dataDir: string, stagedBinaries: readonly StagedVizBinary[]): void {
  for (const staged of stagedBinaries) {
    writeBinaryAtomic(join(dataDir, basename(staged.path)), staged.bytes);
  }
}

function createFilesystemVizFacetSink(
  admitPaths: (runId: string) => DumpPaths,
  stateByRun: Map<string, DumpRunState>
): NonNullable<StepFacetSinks["viz"]> {
  return (projections, context: StepFacetSinkContext) => {
    const paths = admitPaths(context.runId);
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
    persistStagedBinaries(paths.dataDir, stagedBinaries);
    publishManifest(paths.runDir, manifest);
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

/** Filesystem root below which each admitted diagnostic run receives its own directory. */
export type DiagnosticDumpOptions = Readonly<{ outputRoot: string }>;

/** Coupled trace and visualization sinks sharing one path-backed run manifest. */
export type DiagnosticDumpAdapters = Readonly<{
  traceSink: TraceSink;
  facetSinks: StepFacetSinks;
}>;

/**
 * Creates the coupled filesystem outputs for one diagnostic execution surface.
 * Trace progress and execution-owned visualization facets share one path-backed manifest state.
 * Contradictory identities and layer collisions are refused before writes; the optional facet
 * failure reporter remains diagnostic-only and cannot change generation flow.
 */
export function createDiagnosticDumpAdapters(
  options: DiagnosticDumpOptions
): DiagnosticDumpAdapters {
  const { outputRoot } = options;
  const stateByRun = new Map<string, DumpRunState>();
  const admitPaths = createDumpPathAdmission(outputRoot);
  return {
    traceSink: createTraceDumpSinkWithState(admitPaths, stateByRun),
    facetSinks: {
      viz: createFilesystemVizFacetSink(admitPaths, stateByRun),
      onError: reportFilesystemFacetFailure,
    },
  };
}
