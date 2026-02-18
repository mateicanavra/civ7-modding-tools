import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { deriveRunId } from "@swooper/mapgen-core/engine";

import browserTestRecipe from "../../recipes/browser-test/recipe.js";
import { createTraceDumpSink, createVizDumper } from "./dump.js";
import { join } from "node:path";

const BROWSER_TEST_RECIPE_CONFIG = {
  foundation: {
    knobs: {
      plateCount: 28,
      plateActivity: 0.8,
    },
  },
} as const;

function parseIntArg(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

// V0 default: Civ7 MAPSIZE_HUGE.
const width = parseIntArg(process.argv[2], 106);
const height = parseIntArg(process.argv[3], 66);
const seed = parseIntArg(process.argv[4], 123);

const outputRoot = join(process.cwd(), "dist", "visualization");

const traceSink = createTraceDumpSink({ outputRoot });
const viz = createVizDumper({ outputRoot });

const envBase = {
  seed,
  dimensions: { width, height },
  latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
} as const;

const plan = browserTestRecipe.compile(envBase, BROWSER_TEST_RECIPE_CONFIG);
const verboseSteps = Object.fromEntries(plan.nodes.map((node) => [node.stepId, "verbose"] as const));

const env = {
  ...envBase,
  trace: {
    enabled: true,
    steps: verboseSteps,
  },
} as const;

const adapter = createMockAdapter({
  width,
  height,
  mapSizeId: "MAPSIZE_HUGE",
  mapInfo: {
    GridWidth: width,
    GridHeight: height,
  },
});

const context = createExtendedMapContext({ width, height }, adapter, env);
context.viz = viz;

browserTestRecipe.run(context, env, BROWSER_TEST_RECIPE_CONFIG, { traceSink });

const runId = deriveRunId(plan);
console.log(`[viz] wrote dump under: ${join(outputRoot, runId)}`);
