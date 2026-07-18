import type { EngineAdapter } from "@civ7/adapter";
import { assertMapSetupInternal, type MapSetup } from "@mapgen/core/map-setup.js";
import { createLabelRng, type LabelRng } from "@mapgen/lib/rng/label.js";
import { createNoopTraceScope, type TraceScope } from "@mapgen/trace/index.js";

const mapContextTraces = new WeakMap<object, TraceScope>();
const mapContextArtifactStores = new WeakMap<object, Map<string, unknown>>();
const mapContextRandomStates = new WeakMap<object, RandomState>();
const mapContextExecutionStates = new WeakMap<object, MapContextExecutionState>();
const mapContextBrand: unique symbol = Symbol("MapContext");
let fallbackRunSequence = 0;

type MapContextExecutionState =
  | Readonly<{ status: "fresh" }>
  | Readonly<{ status: "running"; runId: string }>
  | Readonly<{ status: "terminal"; runId: string }>;

type RandomState = Readonly<{
  callCounts: Map<string, number>;
  nextInt: LabelRng;
}>;

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

function assertActiveMapContextExecutionInternal(context: MapContext): void {
  assertMapContextInternal(context);
  if (mapContextExecutionStates.get(context)?.status !== "running") {
    throw new Error("MapGen context mutation requires an active execution.");
  }
}

/** Read-only artifact queries available to MapGen consumers. */
export type ArtifactStoreView = Readonly<{
  has: (artifactId: string) => boolean;
  get: (artifactId: string) => unknown;
}>;

/**
 * Execution state and immutable setup shared by every step in one map-generation run.
 *
 * Artifacts are the sole inter-step data plane, but the context exposes only read queries;
 * publication remains owned by declared artifact runtimes. Authored code draws deterministic
 * randomness through `ctxRandom` without access to its mutable ledger. The executor privately
 * installs and restores the current trace scope around each invocation; authored steps can observe
 * but cannot replace it. A module-private brand prevents structurally similar objects from entering
 * the execution API; only `createMapContext` can construct an authentic context.
 */
export interface MapContext {
  readonly [mapContextBrand]: true;
  readonly setup: MapSetup;
  readonly adapter: EngineAdapter;
  readonly artifacts: ArtifactStoreView;
  readonly trace: TraceScope;
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

  const artifactStore = new Map<string, unknown>();
  const context = {
    adapter,
    artifacts: Object.freeze({
      has: artifactStore.has.bind(artifactStore),
      get: artifactStore.get.bind(artifactStore),
    }),
  };
  mapContextArtifactStores.set(context, artifactStore);
  mapContextRandomStates.set(
    context,
    Object.freeze({
      callCounts: new Map(),
      nextInt: createLabelRng(setup.mapSeed),
    })
  );
  mapContextTraces.set(context, createNoopTraceScope());
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
      get: () => mapContextTraces.get(context),
      enumerable: true,
      configurable: false,
    },
  });
  Object.freeze(context);
  return context as MapContext;
}

/** @internal Asserts that a context came from `createMapContext` before execution observes it. */
export function assertMapContextInternal(context: MapContext): void {
  if (
    !mapContextTraces.has(context) ||
    !mapContextArtifactStores.has(context) ||
    !mapContextRandomStates.has(context) ||
    !mapContextExecutionStates.has(context)
  ) {
    throw new Error("MapGen execution requires a context returned by createMapContext.");
  }
}

/** @internal Begins the sole execution admitted for one MapContext and owns its attempt identity. */
export function beginMapContextExecutionInternal(context: MapContext): string {
  assertMapContextInternal(context);
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
  assertMapContextInternal(context);
  const state = mapContextExecutionStates.get(context);
  if (state?.status !== "running") {
    throw new Error("MapGen context cannot finish outside an active execution.");
  }
  mapContextExecutionStates.set(context, Object.freeze({ status: "terminal", runId: state.runId }));
}

/** @internal Artifact-runtime-only storage primitive; callers never receive the mutable store. */
export function publishMapContextArtifactInternal(
  context: MapContext,
  artifactId: string,
  value: unknown
): void {
  assertActiveMapContextExecutionInternal(context);
  const store = mapContextArtifactStores.get(context);
  if (!store) {
    throw new Error("MapGen artifact publication requires a context returned by createMapContext.");
  }
  store.set(artifactId, value);
}

/** @internal Draws from the private authored-randomness ledger for `ctxRandom`. */
export function drawMapContextRandomInternal(
  context: MapContext,
  label: string,
  max: number
): number {
  assertActiveMapContextExecutionInternal(context);
  const state = mapContextRandomStates.get(context);
  if (!state) {
    throw new Error("MapGen randomness requires a context returned by createMapContext.");
  }
  const count = state.callCounts.get(label) ?? 0;
  state.callCounts.set(label, count + 1);
  return state.nextInt(max, `${label}_${count}`);
}

/** @internal Executor-only trace transition for a context created by `createMapContext`. */
export function setMapContextTraceInternal(context: MapContext, trace: TraceScope): void {
  assertMapContextInternal(context);
  mapContextTraces.set(context, trace);
}
