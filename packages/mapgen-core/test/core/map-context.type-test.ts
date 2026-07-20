import type { MapContext } from "@mapgen/core/map-context.js";

type PublicMapContextShape = Pick<MapContext, "setup" | "adapter" | "artifacts" | "trace">;

declare const structurallySimilarContext: PublicMapContextShape;

// @ts-expect-error MapContext can only be constructed by createMapContext.
const forgedContext: MapContext = structurallySimilarContext;

void forgedContext;

declare const context: MapContext;

// @ts-expect-error Artifact storage exposes queries, not mutation authority.
context.artifacts.set("artifact:test.forbidden", true);
// @ts-expect-error Artifact storage exposes queries, not deletion authority.
context.artifacts.delete("artifact:test.forbidden");
// @ts-expect-error Artifact storage exposes queries, not reset authority.
context.artifacts.clear();
// @ts-expect-error Authored code cannot access the private RNG ledger.
context.rng;
