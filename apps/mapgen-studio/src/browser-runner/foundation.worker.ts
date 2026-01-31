/// <reference lib="webworker" />

import { createMockAdapter } from "@civ7/adapter/mock";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
import { deriveRunId } from "@swooper/mapgen-core/engine";

import standardRecipe, {
  STANDARD_RECIPE_CONFIG,
  STANDARD_RECIPE_CONFIG_SCHEMA,
  type StandardRecipeConfig,
} from "mod-swooper-maps/recipes/standard";
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

function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  return (error as { name?: unknown }).name === "AbortError";
}

async function runFoundation(
  request: Extract<BrowserRunRequest, { type: "run.start" }>,
  abortSignal: { readonly aborted: boolean }
): Promise<void> {
  const { runToken, generation, seed, mapSizeId, dimensions, latitudeBounds, configOverrides } = request;

  const envBase = {
    seed,
    dimensions,
    latitudeBounds,
  };

  const mergedRaw = mergeDeterministic(STANDARD_RECIPE_CONFIG, configOverrides);
  const { value: config, errors: configErrors } = normalizeStrict<StandardRecipeConfig>(
    STANDARD_RECIPE_CONFIG_SCHEMA,
    mergedRaw,
    "/config"
  );
  if (configErrors.length > 0) {
    throw new Error(`Invalid config overrides:\n${formatConfigErrors(configErrors)}`);
  }

  const plan = standardRecipe.compile(envBase, config);
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

  const traceSink = createWorkerTraceSink({ runToken, generation, post, abortSignal });

  // Ensure the worker posts a stable run identity early, even if a failure occurs.
  post({ type: "run.started", runToken, generation, runId, planFingerprint: runId });

  await standardRecipe.runAsync(context, env, config, {
    traceSink,
    abortSignal,
    // Yield between steps so cooperative cancellation (via postMessage) can be observed.
    yieldToEventLoop: true,
  });
}

type ActiveRun = {
  runToken: string;
  generation: number;
  abortController: AbortController;
};

let active: ActiveRun | null = null;

self.onmessage = (ev: MessageEvent<BrowserRunRequest>) => {
  const msg = ev.data;
  if (!msg || typeof msg !== "object") return;

  if (msg.type === "run.cancel") {
    if (active && active.runToken === msg.runToken && active.generation === msg.generation) {
      active.abortController.abort();
    }
    return;
  }

  if (msg.type === "run.start") {
    // Cancel any active run before starting a new one.
    if (active) active.abortController.abort();

    const abortController = new AbortController();
    active = { runToken: msg.runToken, generation: msg.generation, abortController };

    runFoundation(msg, abortController.signal).then(
      () => {
        // If we were canceled, `worker-trace-sink` suppresses run.finished; emit run.canceled explicitly.
        if (abortController.signal.aborted) {
          post({ type: "run.canceled", runToken: msg.runToken, generation: msg.generation });
        }
        if (active?.runToken === msg.runToken && active.generation === msg.generation) active = null;
      },
      (e: unknown) => {
        if (abortController.signal.aborted || isAbortError(e)) {
          post({ type: "run.canceled", runToken: msg.runToken, generation: msg.generation });
          if (active?.runToken === msg.runToken && active.generation === msg.generation) active = null;
          return;
        }

        const err = describeThrown(e);
        post({
          type: "run.error",
          runToken: msg.runToken,
          generation: msg.generation,
          name: err.name,
          message: err.message,
          details: err.details,
          stack: err.stack,
        });
        if (active?.runToken === msg.runToken && active.generation === msg.generation) active = null;
      }
    );
  }
};
