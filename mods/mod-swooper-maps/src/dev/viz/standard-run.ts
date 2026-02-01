import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { deriveRunId } from "@swooper/mapgen-core/engine";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import standardRecipe, { STANDARD_RECIPE_CONFIG } from "../../recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../recipes/standard/runtime.js";
import { createTraceDumpSink, createVizDumper } from "./dump.js";
import { join } from "node:path";

function parseIntArg(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

// Default: small deterministic map for fast iteration.
const width = parseIntArg(process.argv[2], 48);
const height = parseIntArg(process.argv[3], 30);
const seed = parseIntArg(process.argv[4], 1337);

const outputRoot = join(process.cwd(), "dist", "visualization");
const traceSink = createTraceDumpSink({ outputRoot });
const viz = createVizDumper({ outputRoot });

const mapInfo = {
  GridWidth: width,
  GridHeight: height,
  MinLatitude: -60,
  MaxLatitude: 60,
  PlayersLandmass1: 4,
  PlayersLandmass2: 4,
  StartSectorRows: 4,
  StartSectorCols: 4,
};

const envBase = {
  seed,
  dimensions: { width, height },
  latitudeBounds: {
    topLatitude: mapInfo.MaxLatitude,
    bottomLatitude: mapInfo.MinLatitude,
  },
} as const;

const plan = standardRecipe.compile(envBase, STANDARD_RECIPE_CONFIG);
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
  mapInfo,
  mapSizeId: 1,
  rng: createLabelRng(seed),
});

const context = createExtendedMapContext({ width, height }, adapter, env);
context.viz = viz;

initializeStandardRuntime(context, { mapInfo, logPrefix: "[viz]", storyEnabled: true });
standardRecipe.run(context, env, STANDARD_RECIPE_CONFIG, { traceSink, log: () => {} });

const runId = deriveRunId(plan);
console.log(`[viz] wrote dump under: ${join(outputRoot, runId)}`);

