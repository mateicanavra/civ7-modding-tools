import type { MapContext } from "@mapgen/core/map-context.js";

type PublicMapContextShape = Pick<MapContext, "setup" | "adapter" | "trace">;

declare const structurallySimilarContext: PublicMapContextShape;

// @ts-expect-error MapContext can only be constructed by createMapContext.
const forgedContext: MapContext = structurallySimilarContext;

void forgedContext;

declare const context: MapContext;

// @ts-expect-error Artifact storage is not an authored context capability.
context.artifacts;
// @ts-expect-error Trace identity is executor-owned rather than author-observable.
context.trace.stepId;
// @ts-expect-error Trace selection is executor-owned rather than author-observable.
context.trace.isVerbose;
// @ts-expect-error Authored code cannot access the private RNG ledger.
context.rng;
