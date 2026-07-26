import type { EngineAdapter } from "@civ7/adapter";
import type { AuthoredEngineAdapterKey } from "@mapgen/authoring/step/engine-authority.js";
import { assertMapSetupInternal, type MapSetup } from "@mapgen/core/map-setup.js";
import { createLabelRng, type LabelRng } from "@mapgen/lib/rng/label.js";
import type { StepTrace } from "@mapgen/trace/index.js";

const mapContextAuthorities = new WeakMap<object, MapContextAuthority>();
const mapContextAdapters = new WeakMap<object, EngineAdapter>();
const mapContextArtifactStores = new WeakMap<object, Map<object, unknown>>();
const mapContextRandomStates = new WeakMap<object, RandomState>();
const mapContextExecutionStates = new WeakMap<object, MapContextExecutionState>();
const mapContextBrand: unique symbol = Symbol("MapContext");
let fallbackRunSequence = 0;

type ActiveStepState = Readonly<{
  stepId: string;
  context: MapContext;
}>;

type MapContextAuthority =
  | Readonly<{ kind: "root"; root: MapContext }>
  | Readonly<{ kind: "step"; root: MapContext; stepId: string }>;

type MapContextExecutionState =
  | Readonly<{ status: "fresh" }>
  | Readonly<{ status: "running"; runId: string; activeStep?: ActiveStepState }>
  | Readonly<{ status: "terminal"; runId: string }>;

type RandomState = Readonly<{
  callCounts: Map<string, number>;
  nextInt: LabelRng;
}>;

const NOOP_STEP_TRACE: StepTrace = Object.freeze({ event: () => undefined });

function createExecutionRunId(): string {
  try {
    if (typeof globalThis.crypto?.randomUUID === "function") {
      return globalThis.crypto.randomUUID();
    }
  } catch {
    // Embedded runtimes such as Civ7 may not expose Web Crypto.
  }
  fallbackRunSequence += 1;
  return `${Date.now().toString(36)}-${fallbackRunSequence.toString(36)}`;
}

function rootAuthority(context: MapContext): MapContextAuthority {
  const authority = mapContextAuthorities.get(context);
  if (!authority) {
    throw new Error("MapGen execution requires a context returned by createMapContext.");
  }
  return authority;
}

function assertRootMapContextInternal(context: MapContext): void {
  const authority = rootAuthority(context);
  if (authority.kind !== "root" || authority.root !== context) {
    throw new Error("MapGen execution requires the root context returned by createMapContext.");
  }
}

function activeStepRoot(context: MapContext): MapContext {
  const authority = rootAuthority(context);
  if (authority.kind !== "step") {
    throw new Error("MapGen authored capability requires the currently active step context.");
  }
  const state = mapContextExecutionStates.get(authority.root);
  if (state?.status !== "running" || state.activeStep?.context !== context) {
    throw new Error("MapGen authored capability requires the currently active step context.");
  }
  return authority.root;
}

function contextRootForRead(context: MapContext): MapContext {
  const authority = rootAuthority(context);
  return authority.kind === "root" ? authority.root : activeStepRoot(context);
}

/**
 * Immutable setup and authored capabilities available during one MapGen invocation.
 *
 * `createMapContext` returns the executor-owned root. The executor supplies each authored step a
 * distinct facade with a fixed trace port; artifact, engine, and randomness capabilities accept only the
 * currently active facade. Retaining one step's context therefore cannot borrow a later step's
 * artifact, random, or trace authority; dependency evidence is separately scoped to one effect
 * satisfaction call. The adapter remains private executor state; authored code can invoke only the
 * methods named by its frozen step contract through occurrence-scoped dependency wrappers. Artifacts
 * remain behind artifact-bound readers and publishers, while the root remains available to the executor
 * and post-run validated observers.
 */
export interface MapContext {
  readonly [mapContextBrand]: true;
  readonly setup: MapSetup;
  readonly trace: StepTrace;
}

/** Inputs required to construct one internally consistent MapGen execution context. */
export type CreateMapContextInput = Readonly<{
  setup: MapSetup;
  adapter: EngineAdapter;
}>;

/**
 * Creates an isolated MapGen context from one physical setup authority.
 *
 * The admitted setup is retained as the sole physical setup authority. Adapter dimensions must
 * describe the same tile grid.
 */
export function createMapContext(input: CreateMapContextInput): MapContext {
  const { adapter } = input;
  const setup = input.setup;
  assertMapSetupInternal(setup);
  if (adapter.width !== setup.dimensions.width || adapter.height !== setup.dimensions.height) {
    throw new Error(
      `Map adapter dimensions ${adapter.width}x${adapter.height} do not match setup dimensions ${setup.dimensions.width}x${setup.dimensions.height}.`
    );
  }

  const artifactStore = new Map<object, unknown>();
  const context = {} as MapContext;
  mapContextAuthorities.set(context, Object.freeze({ kind: "root", root: context }));
  mapContextAdapters.set(context, adapter);
  mapContextArtifactStores.set(context, artifactStore);
  mapContextRandomStates.set(
    context,
    Object.freeze({
      callCounts: new Map(),
      nextInt: createLabelRng(setup.mapSeed),
    })
  );
  mapContextExecutionStates.set(context, Object.freeze({ status: "fresh" }));
  Object.defineProperties(context, {
    [mapContextBrand]: {
      value: true,
      enumerable: false,
      writable: false,
      configurable: false,
    },
    setup: {
      value: setup,
      enumerable: true,
      writable: false,
      configurable: false,
    },
    trace: {
      value: NOOP_STEP_TRACE,
      enumerable: true,
      writable: false,
      configurable: false,
    },
  });
  Object.freeze(context);
  return context;
}

/** @internal Asserts that a context came from `createMapContext` before execution observes it. */
export function assertMapContextInternal(context: MapContext): void {
  const authority = mapContextAuthorities.get(context);
  const root = authority?.root;
  if (
    !root ||
    !mapContextAdapters.has(root) ||
    !mapContextArtifactStores.has(root) ||
    !mapContextRandomStates.has(root) ||
    !mapContextExecutionStates.has(root)
  ) {
    throw new Error("MapGen execution requires a context returned by createMapContext.");
  }
}

/** @internal Begins the sole execution admitted for one MapContext and owns its attempt identity. */
export function beginMapContextExecutionInternal(context: MapContext): string {
  assertRootMapContextInternal(context);
  const state = mapContextExecutionStates.get(context);
  if (state?.status === "running") {
    throw new Error("MapGen context is already executing.");
  }
  if (state?.status === "terminal") {
    throw new Error("MapGen context has already completed an execution.");
  }
  const runId = createExecutionRunId();
  mapContextExecutionStates.set(context, Object.freeze({ status: "running", runId }));
  return runId;
}

/** @internal Completes the sole execution admitted for one MapContext. */
export function finishMapContextExecutionInternal(context: MapContext): void {
  assertRootMapContextInternal(context);
  const state = mapContextExecutionStates.get(context);
  if (state?.status !== "running") {
    throw new Error("MapGen context cannot finish outside an active execution.");
  }
  if (state.activeStep) {
    throw new Error(
      `MapGen context cannot finish while step "${state.activeStep.stepId}" is active.`
    );
  }
  mapContextExecutionStates.set(context, Object.freeze({ status: "terminal", runId: state.runId }));
}

/** @internal Restricts public artifact observation to the completed executor-owned root. */
export function assertTerminalMapContextObservationInternal(context: MapContext): void {
  const authority = rootAuthority(context);
  const state = mapContextExecutionStates.get(authority.root);
  if (authority.kind !== "root" || authority.root !== context || state?.status !== "terminal") {
    throw new Error(
      "Validated artifact observation requires the root MapContext after execution has completed."
    );
  }
}

/** @internal Enters one executor-owned step invocation inside the active context execution. */
export function enterMapContextStepInternal(
  context: MapContext,
  stepId: string,
  trace: StepTrace
): MapContext {
  assertRootMapContextInternal(context);
  const state = mapContextExecutionStates.get(context);
  if (state?.status !== "running") {
    throw new Error("MapGen step entry requires an active execution.");
  }
  if (state.activeStep) {
    throw new Error(
      `MapGen context cannot enter step "${stepId}" while step "${state.activeStep.stepId}" is active.`
    );
  }
  const stepContext = {} as MapContext;
  Object.defineProperties(stepContext, {
    [mapContextBrand]: {
      value: true,
      enumerable: false,
      writable: false,
      configurable: false,
    },
    setup: {
      value: context.setup,
      enumerable: true,
      writable: false,
      configurable: false,
    },
    trace: {
      value: trace,
      enumerable: true,
      writable: false,
      configurable: false,
    },
  });
  Object.freeze(stepContext);
  mapContextAuthorities.set(stepContext, Object.freeze({ kind: "step", root: context, stepId }));
  mapContextExecutionStates.set(
    context,
    Object.freeze({
      status: "running",
      runId: state.runId,
      activeStep: Object.freeze({ stepId, context: stepContext }),
    })
  );
  return stepContext;
}

/** @internal Leaves the exact executor-owned step currently active on the context. */
export function leaveMapContextStepInternal(context: MapContext, stepContext: MapContext): void {
  assertRootMapContextInternal(context);
  const state = mapContextExecutionStates.get(context);
  const authority = mapContextAuthorities.get(stepContext);
  if (
    state?.status !== "running" ||
    state.activeStep?.context !== stepContext ||
    authority?.kind !== "step" ||
    authority.root !== context
  ) {
    throw new Error("MapGen context cannot leave an inactive step capability.");
  }
  mapContextExecutionStates.set(context, Object.freeze({ status: "running", runId: state.runId }));
  mapContextAuthorities.delete(stepContext);
}

/** @internal Returns the executor-owned active step identity for error attribution. */
export function getActiveMapContextStepIdInternal(context: MapContext): string | undefined {
  const authority = rootAuthority(context);
  if (authority.kind !== "step") return undefined;
  const state = mapContextExecutionStates.get(authority.root);
  return state?.status === "running" && state.activeStep?.context === context
    ? authority.stepId
    : undefined;
}

/**
 * @internal Invokes one declared adapter method through the exact active step occurrence that owns
 * the wrapper. The adapter identity never crosses this boundary.
 */
export function invokeMapContextAdapterMethodInternal(
  context: MapContext,
  boundContext: MapContext,
  consumerStepId: string,
  key: AuthoredEngineAdapterKey,
  args: readonly unknown[]
): unknown {
  if (context !== boundContext || getActiveMapContextStepIdInternal(context) !== consumerStepId) {
    throw new Error(
      `Engine capability for step "${consumerStepId}" requires that step's exact active context.`
    );
  }
  const root = activeStepRoot(context);
  const adapter = mapContextAdapters.get(root);
  if (!adapter) {
    throw new Error("MapGen engine capability requires a context returned by createMapContext.");
  }
  const method = Reflect.get(adapter, key);
  if (typeof method !== "function") {
    throw new TypeError(`Engine adapter method "${key}" is unavailable or not callable.`);
  }
  return Reflect.apply(method, adapter, args);
}

/** @internal Verifies one executor-owned effect without exposing adapter authority to authored code. */
export function verifyMapContextEffectInternal(context: MapContext, effectId: string): boolean {
  assertRootMapContextInternal(context);
  const adapter = mapContextAdapters.get(context);
  if (!adapter) {
    throw new Error("MapGen effect verification requires a context returned by createMapContext.");
  }
  return Reflect.apply(adapter.verifyEffect, adapter, [effectId]);
}

/**
 * @internal Observes raw artifact storage by exact artifact identity for Core-owned capabilities.
 * capabilities. Artifact ids remain diagnostic and dependency evidence; they never authorize a
 * stored value.
 */
export function readMapContextArtifactInternal(
  context: MapContext,
  artifactContract: object
): Readonly<{ found: false }> | Readonly<{ found: true; value: unknown }> {
  const root = contextRootForRead(context);
  const store = mapContextArtifactStores.get(root);
  if (!store || !store.has(artifactContract)) return Object.freeze({ found: false });
  return Object.freeze({ found: true, value: store.get(artifactContract) });
}

/**
 * @internal Publishes through the exact canonical contract retained by an artifact runtime;
 * callers never receive the mutable store.
 */
export function publishMapContextArtifactInternal(
  context: MapContext,
  artifactContract: object,
  value: unknown
): void {
  const root = activeStepRoot(context);
  const store = mapContextArtifactStores.get(root);
  if (!store) {
    throw new Error("MapGen artifact publication requires a context returned by createMapContext.");
  }
  store.set(artifactContract, value);
}

/** @internal Draws from the private authored-randomness ledger for `ctxRandom`. */
export function drawMapContextRandomInternal(
  context: MapContext,
  label: string,
  max: number
): number {
  const root = activeStepRoot(context);
  const state = mapContextRandomStates.get(root);
  if (!state) {
    throw new Error("MapGen randomness requires a context returned by createMapContext.");
  }
  const count = state.callCounts.get(label) ?? 0;
  state.callCounts.set(label, count + 1);
  return state.nextInt(max, `${label}_${count}`);
}
