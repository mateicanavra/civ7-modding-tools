import type { MapContext } from "@mapgen/core/map-context.js";
import { withMapContextExecutionForTest } from "@mapgen/testing/index.js";

declare const context: MapContext;

// @ts-expect-error Test execution is synchronous and cannot admit a Promise-returning action.
withMapContextExecutionForTest(context, async () => undefined);
