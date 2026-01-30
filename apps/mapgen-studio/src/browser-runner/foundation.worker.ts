/// <reference lib="webworker" />

import { createMockAdapter } from "@civ7/adapter/mock";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
import { deriveRunId } from "@swooper/mapgen-core/engine";

import browserTestRecipe, {
  BROWSER_TEST_RECIPE_CONFIG,
  BROWSER_TEST_RECIPE_CONFIG_SCHEMA,
  type BrowserTestRecipeConfig,
} from "@mapgen/browser-test-recipe";
import { CIV7_BROWSER_TABLES_V0 } from "../civ7-data/civ7-tables.gen";
import type { BrowserRunEvent, BrowserRunRequest } from "./protocol";
import { createWorkerTraceSink } from "./worker-trace-sink";
import { createWorkerVizDumper } from "./worker-viz-dumper";

function post(event: BrowserRunEvent, transfer?: Transferable[]): void {
  (self as DedicatedWorkerGlobalScope).postMessage(event, transfer ?? []);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

const FORBIDDEN_MERGE_KEYS = new Set(["__proto__", "prototype", "constructor"]);

function mergeDeterministic(base: unknown, overrides: unknown): unknown {
  if (overrides === undefined) return base;
  if (!isPlainObject(base) || !isPlainObject(overrides)) return overrides;

  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(overrides)) {
    if (FORBIDDEN_MERGE_KEYS.has(key)) continue;
    out[key] = mergeDeterministic((base as Record<string, unknown>)[key], overrides[key]);
  }
  return out;
}

function formatConfigErrors(errors: ReadonlyArray<{ path: string; message: string }>): string {
  return errors.map((e) => `${e.path}: ${e.message}`).join("\n");
}

function safeStringify(value: unknown): string | null {
  try {
    const seen = new WeakSet<object>();
    return JSON.stringify(
      value,
      (_k, v) => {
        if (typeof v === "bigint") return `${v}n`;
        if (typeof v === "function") return `[Function ${v.name || "anonymous"}]`;
        if (v && typeof v === "object") {
          if (seen.has(v)) return "[Circular]";
          seen.add(v);
        }
        return v;
      },
      2
    );
  } catch {
    return null;
  }
}

function readObjectProp(value: unknown, key: string): unknown {
  if (!value || typeof value !== "object") return undefined;
  return (value as Record<string, unknown>)[key];
}

function describeThrown(e: unknown): { name?: string; message: string; details?: string; stack?: string } {
  if (e instanceof Error) {
    const details = safeStringify(e);
    return {
      name: e.name,
      message: e.message || e.name || "Error",
      details: details && details !== "{}" ? details : undefined,
      stack: e.stack,
    };
  }

  if (typeof e === "string") return { message: e };
  if (typeof e === "number" || typeof e === "boolean" || typeof e === "bigint") return { message: String(e) };

  const maybeMessage = readObjectProp(e, "message");
  const message = typeof maybeMessage === "string" && maybeMessage.trim().length > 0 ? maybeMessage : "Non-Error thrown";
  const details = safeStringify(e);
  const maybeStack = readObjectProp(e, "stack");
  const stack = typeof maybeStack === "string" ? maybeStack : undefined;
  const maybeName = readObjectProp(e, "name");
  const name = typeof maybeName === "string" ? maybeName : undefined;

  return {
    name,
    message,
    details: details ?? String(e),
    stack,
  };
}

function hash32(value: string): number {
  // FNV-1a (32-bit)
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function createLabelRng(seed: number): (max: number, label: string) => number {
  const seedU32 = seed >>> 0;
  return (max: number, label: string): number => {
    const m = Math.max(1, max | 0);
    const h = hash32(`${seedU32}:${label}`);
    return (h % m) | 0;
  };
}

async function runFoundation(request: Extract<BrowserRunRequest, { type: "run.start" }>): Promise<void> {
  const { runToken, seed, mapSizeId, dimensions, latitudeBounds, configOverrides } = request;

  const envBase = {
    seed,
    dimensions,
    latitudeBounds,
  };

  const mergedRaw = mergeDeterministic(BROWSER_TEST_RECIPE_CONFIG, configOverrides);
  const { value: config, errors: configErrors } = normalizeStrict<BrowserTestRecipeConfig>(
    BROWSER_TEST_RECIPE_CONFIG_SCHEMA,
    mergedRaw,
    "/config"
  );
  if (configErrors.length > 0) {
    throw new Error(`Invalid config overrides:\n${formatConfigErrors(configErrors)}`);
  }

  const plan = browserTestRecipe.compile(envBase, config);
  const runId = deriveRunId(plan);
  const verboseSteps: Record<string, "verbose"> = Object.fromEntries(
    plan.nodes.map((node) => [node.stepId, "verbose"] as const)
  );

  const env = {
    ...envBase,
    trace: {
      enabled: true,
      steps: verboseSteps,
    },
  };

  const adapter = createMockAdapter({
    width: dimensions.width,
    height: dimensions.height,
    mapSizeId,
    mapInfo: {
      GridWidth: dimensions.width,
      GridHeight: dimensions.height,
    },
    rng: createLabelRng(seed),
    terrainTypeIndices: { ...CIV7_BROWSER_TABLES_V0.terrainTypeIndices },
    biomeGlobals: { ...CIV7_BROWSER_TABLES_V0.biomeGlobals },
    featureTypes: { ...CIV7_BROWSER_TABLES_V0.featureTypes },
  });

  const context = createExtendedMapContext(dimensions, adapter, env);
  context.viz = createWorkerVizDumper();

  const traceSink = createWorkerTraceSink({ runToken, post });

  // Ensure the worker posts a stable run identity early, even if a failure occurs.
  post({ type: "run.started", runToken, runId, planFingerprint: runId });

  browserTestRecipe.run(context, env, config, { traceSink });
}

self.onmessage = (ev: MessageEvent<BrowserRunRequest>) => {
  const msg = ev.data;
  if (!msg || typeof msg !== "object") return;

  if (msg.type === "run.start") {
    runFoundation(msg).catch((e: unknown) => {
      const err = describeThrown(e);
      post({
        type: "run.error",
        runToken: msg.runToken,
        name: err.name,
        message: err.message,
        details: err.details,
        stack: err.stack,
      });
    });
  }
};
