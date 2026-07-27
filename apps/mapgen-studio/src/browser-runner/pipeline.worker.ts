/// <reference lib="webworker" />

import { createMockAdapter } from "@civ7/adapter/mock";
import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import {
  createLabelRng,
  createMapContext,
  type StepFacetFailure,
  type TraceEvent,
  type TraceSink,
} from "@swooper/mapgen-core";
import { admitPipelineConfig } from "../features/configAuthoring/canonicalConfig";
import type { BrowserRunEvent, BrowserRunRequest } from "./protocol";
import { getRuntimeRecipe } from "./recipeRuntime";
import { createWorkerTraceSink } from "./worker-trace-sink";
import { createWorkerVizFacetSink } from "./worker-viz-facet-sink";

function post(event: BrowserRunEvent, transfer?: Transferable[]): void {
  (self as DedicatedWorkerGlobalScope).postMessage(event, transfer ?? []);
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

function describeThrown(e: unknown): {
  name?: string;
  message: string;
  details?: string;
  stack?: string;
} {
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
  if (typeof e === "number" || typeof e === "boolean" || typeof e === "bigint")
    return { message: String(e) };

  const maybeMessage = readObjectProp(e, "message");
  const message =
    typeof maybeMessage === "string" && maybeMessage.trim().length > 0
      ? maybeMessage
      : "Non-Error thrown";
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

function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  return (error as { name?: unknown }).name === "AbortError";
}

function createWorkerFacetFailureReporter(execution: {
  runToken: string;
  generation: number;
}): (failure: StepFacetFailure) => undefined {
  return (failure) => {
    const { context, facet, operation } = failure;
    console.error(
      `[mapgen-studio:facet] request=${execution.runToken}@${execution.generation} run=${context.runId} plan=${context.planFingerprint} step=${context.stepId}#${context.stepIndex} ${facet}.${operation} failed`
    );
    return undefined;
  };
}

async function runRecipe(
  request: Extract<BrowserRunRequest, { type: "run.start" }>,
  abortSignal: { readonly aborted: boolean }
): Promise<void> {
  const { runToken, generation, recipeId, initialSetup, pipelineConfig } = request;
  const recipeEntry = getRuntimeRecipe(recipeId);

  const configResult = admitPipelineConfig({
    schema: recipeEntry.configSchema,
    config: pipelineConfig,
    label: "browser-run",
  });
  if (!configResult.ok) {
    throw new Error(`Invalid recipe config:\n${formatConfigErrors(configResult.errors)}`);
  }

  const plan = recipeEntry.recipe.compile(initialSetup, configResult.value);
  const adapterSetup = recipeEntry.recipe.projectAdapterSetup(plan);
  const verboseSteps: Record<string, "verbose"> = Object.fromEntries(
    plan.nodes.map((node) => [node.stepId, "verbose"] as const)
  );

  const adapter = createMockAdapter({
    width: adapterSetup.dimensions.width,
    height: adapterSetup.dimensions.height,
    mapSizeId: adapterSetup.mapSizeId,
    mapInfo: adapterSetup.mapInfo,
    aliveMajorPlayerIds: adapterSetup.aliveMajorPlayerIds,
    rng: createLabelRng(adapterSetup.mapSeed),
    terrainTypeIndices: { ...CIV7_BROWSER_TABLES_V0.terrainTypeIndices },
    biomeGlobals: { ...CIV7_BROWSER_TABLES_V0.biomeGlobals },
    featureTypes: { ...CIV7_BROWSER_TABLES_V0.featureTypes },
  });

  const context = createMapContext({ setup: plan.setup, adapter });

  const workerTraceSink = createWorkerTraceSink({
    runToken,
    generation,
    post,
    abortSignal,
  });
  let didEmitStarted = false;
  const traceSink: TraceSink = {
    emit: (event: TraceEvent): undefined => {
      if (event.kind === "run.start" && !didEmitStarted) {
        didEmitStarted = true;
        post({
          type: "run.started",
          runToken,
          generation,
          runId: event.runId,
          planFingerprint: event.planFingerprint,
        });
      }
      workerTraceSink.emit(event);
      return undefined;
    },
  };

  await recipeEntry.recipe.executeAsync(context, plan, {
    trace: {
      config: { steps: verboseSteps },
      sink: traceSink,
    },
    facets: {
      viz: createWorkerVizFacetSink({
        runToken,
        generation,
        post,
        abortSignal,
      }),
      onError: createWorkerFacetFailureReporter({ runToken, generation }),
    },
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

    runRecipe(msg, abortController.signal).then(
      () => {
        // If we were canceled, `worker-trace-sink` suppresses user-facing events; emit run.canceled explicitly.
        if (abortController.signal.aborted) {
          post({ type: "run.canceled", runToken: msg.runToken, generation: msg.generation });
        } else {
          post({ type: "run.finished", runToken: msg.runToken, generation: msg.generation });
        }
        if (active?.runToken === msg.runToken && active.generation === msg.generation)
          active = null;
      },
      (e: unknown) => {
        if (abortController.signal.aborted || isAbortError(e)) {
          post({ type: "run.canceled", runToken: msg.runToken, generation: msg.generation });
          if (active?.runToken === msg.runToken && active.generation === msg.generation)
            active = null;
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
        if (active?.runToken === msg.runToken && active.generation === msg.generation)
          active = null;
      }
    );
  }
};
