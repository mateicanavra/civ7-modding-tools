/// <reference lib="webworker" />

import { createMockAdapter } from "@civ7/adapter/mock";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { deriveRunId } from "@swooper/mapgen-core/engine";

import browserTestRecipe, { BROWSER_TEST_RECIPE_CONFIG } from "@mapgen/browser-test-recipe";
import { CIV7_BROWSER_TABLES_V0 } from "../civ7-data/civ7-tables.gen";
import type { BrowserRunEvent, BrowserRunRequest } from "./protocol";
import { createWorkerTraceSink } from "./worker-trace-sink";
import { createWorkerVizDumper } from "./worker-viz-dumper";

function post(event: BrowserRunEvent, transfer?: Transferable[]): void {
  (self as DedicatedWorkerGlobalScope).postMessage(event, transfer ?? []);
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

  const maybeMessage = e && typeof e === "object" && "message" in e ? (e as any).message : undefined;
  const message = typeof maybeMessage === "string" && maybeMessage.trim().length ? maybeMessage : "Non-Error thrown";
  const details = safeStringify(e);
  const stack = e && typeof e === "object" && "stack" in e && typeof (e as any).stack === "string" ? (e as any).stack : undefined;
  const name = e && typeof e === "object" && "name" in e && typeof (e as any).name === "string" ? (e as any).name : undefined;

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
  const { runToken, seed, mapSizeId, dimensions, latitudeBounds } = request;

  const envBase = {
    seed,
    dimensions,
    latitudeBounds,
  } as const;

  const config = BROWSER_TEST_RECIPE_CONFIG as any;
  const plan = browserTestRecipe.compile(envBase, config);
  const runId = deriveRunId(plan);
  const verboseSteps = Object.fromEntries(plan.nodes.map((node: any) => [node.stepId, "verbose"] as const));

  const env = {
    ...envBase,
    trace: {
      enabled: true,
      steps: verboseSteps,
    },
  } as const;

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

  browserTestRecipe.run(context as any, env as any, config as any, { traceSink });
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
