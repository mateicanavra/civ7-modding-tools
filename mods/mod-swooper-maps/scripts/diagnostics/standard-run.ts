import { join } from "node:path";
import { createMockAdapter } from "@civ7/adapter";
import {
  createLabelRng,
  createMapContext,
  type TraceEvent,
  type TraceSink,
} from "@swooper/mapgen-core";
import { canonicalRecipeConfig } from "../../src/maps/configs/canonical.js";
import swooperEarthlikeConfigRaw from "../../src/maps/configs/swooper-earthlike.config.json";
import standardRecipe from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { createVizDumpAdapters } from "./dump.js";

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
const vizOutputs = createVizDumpAdapters({ outputRoot });

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

const setupBase = {
  mapSeed: seed,
  dimensions: { width, height },
  latitudeBounds: {
    topLatitude: mapInfo.MaxLatitude,
    bottomLatitude: mapInfo.MinLatitude,
  },
} as const;

const config = canonicalRecipeConfig(swooperEarthlikeConfigRaw);
const plan = standardRecipe.compile(setupBase, config);
const verboseSteps = Object.fromEntries(
  plan.nodes.map((node) => [node.stepId, "verbose"] as const)
);

const adapter = createMockAdapter({
  width,
  height,
  mapInfo,
  mapSizeId: 1,
  rng: createLabelRng(seed),
});

const context = createMapContext({ setup: plan.setup, adapter });
let runId: string | undefined;
const traceSink: TraceSink = {
  emit: (event: TraceEvent): void => {
    if (event.kind === "run.start") runId = event.runId;
    vizOutputs.traceSink.emit(event);
  },
};

initializeStandardRuntime(context, { mapInfo, logPrefix: "[viz]" });
standardRecipe.execute(context, plan, {
  trace: {
    config: { steps: verboseSteps },
    sink: traceSink,
  },
  facets: vizOutputs.facetSinks,
  log: () => {},
});

if (!runId) throw new Error("Standard visualization execution emitted no run.start evidence.");
console.log(`[viz] wrote dump under: ${join(outputRoot, runId)}`);
