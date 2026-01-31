import { useCallback, useEffect, useRef, useState } from "react";
import type { BrowserRunErrorEvent, BrowserRunRequest } from "../../browser-runner/protocol";
import type { VizEvent } from "../../shared/vizEvents";
import { toVizEvent } from "./adapter";
import { createWorkerClient } from "./workerClient";

export type BrowserRunnerStatus = "idle" | "running" | "finished" | "error";

export type BrowserRunnerInputs = {
  seed: number;
  mapSizeId: string;
  dimensions: { width: number; height: number };
  latitudeBounds: { topLatitude: number; bottomLatitude: number };
  configOverrides?: import("mod-swooper-maps/recipes/browser-test").BrowserTestRecipeConfig;
};

export type BrowserRunnerState = {
  status: BrowserRunnerStatus;
  running: boolean;
  lastStep: { stepId: string; stepIndex: number } | null;
  error: string | null;
};

export type BrowserRunnerActions = {
  start(inputs: BrowserRunnerInputs): void;
  cancel(): void;
  clearError(): void;
};

export type UseBrowserRunnerArgs = {
  enabled: boolean;
  onVizEvent(event: VizEvent): void;
};

export type UseBrowserRunnerResult = {
  state: BrowserRunnerState;
  actions: BrowserRunnerActions;
};

function formatRunError(event: BrowserRunErrorEvent): string {
  const parts: string[] = [];
  if (event.name) parts.push(`${event.name}: ${event.message}`);
  else parts.push(event.message);
  if (event.details) parts.push(event.details);
  if (event.stack) parts.push(event.stack);
  return parts.filter(Boolean).join("\n\n");
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

function formatErrorForUi(e: unknown): string {
  if (e instanceof Error) {
    const parts: string[] = [];
    const header = e.name ? `${e.name}: ${e.message}` : e.message;
    parts.push(header || "Error");
    const details = safeStringify(e);
    if (details && details !== "{}") parts.push(details);
    if (e.stack) parts.push(e.stack);
    return parts.join("\n\n");
  }

  if (e instanceof ErrorEvent) {
    const parts: string[] = [];
    parts.push(e.message || "ErrorEvent");
    if ((e as ErrorEvent).filename) parts.push(`${(e as ErrorEvent).filename}:${(e as ErrorEvent).lineno}:${(e as ErrorEvent).colno}`);
    if ((e as ErrorEvent).error) parts.push(formatErrorForUi((e as ErrorEvent).error));
    return parts.join("\n\n");
  }

  if (typeof e === "string") return e;
  if (typeof e === "number" || typeof e === "boolean" || typeof e === "bigint") return String(e);

  const json = safeStringify(e);
  return json ?? String(e);
}

function randomRunToken(): string {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `run_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function useBrowserRunner(args: UseBrowserRunnerArgs): UseBrowserRunnerResult {
  const { enabled, onVizEvent } = args;
  const runTokenRef = useRef<string | null>(null);
  const clientRef = useRef(createWorkerClient());
  const [state, setState] = useState<BrowserRunnerState>({
    status: "idle",
    running: false,
    lastStep: null,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
      status: prev.running ? "running" : "idle",
    }));
  }, []);

  const cancel = useCallback(() => {
    runTokenRef.current = null;
    clientRef.current.terminate();
    setState((prev) => ({
      ...prev,
      running: false,
      status: prev.error ? "error" : "idle",
      lastStep: null,
    }));
  }, []);

  const start = useCallback(
    (inputs: BrowserRunnerInputs) => {
      runTokenRef.current = null;
      clientRef.current.terminate();

      const runToken = randomRunToken();
      runTokenRef.current = runToken;
      setState((prev) => ({
        ...prev,
        status: "running",
        running: true,
        lastStep: null,
        error: null,
      }));

      const request: BrowserRunRequest = {
        type: "run.start",
        runToken,
        seed: inputs.seed,
        mapSizeId: inputs.mapSizeId,
        dimensions: inputs.dimensions,
        latitudeBounds: inputs.latitudeBounds,
        configOverrides: inputs.configOverrides,
      };

      clientRef.current.start(request, {
        onEvent: (event) => {
          if (event.runToken !== runTokenRef.current) return;

          onVizEvent(toVizEvent(event));

          if (event.type === "run.progress" && event.kind === "step.start") {
            setState((prev) => ({
              ...prev,
              lastStep: { stepId: event.stepId, stepIndex: event.stepIndex },
            }));
            return;
          }

          if (event.type === "run.finished") {
            setState((prev) => ({
              ...prev,
              status: "finished",
              running: false,
            }));
            return;
          }

          if (event.type === "run.error") {
            setState((prev) => ({
              ...prev,
              status: "error",
              running: false,
              error: formatRunError(event),
            }));
            return;
          }
        },
        onError: (error) => {
          if (!runTokenRef.current) return;
          setState((prev) => ({
            ...prev,
            status: "error",
            running: false,
            error: formatErrorForUi(error),
          }));
        },
      });
    },
    [onVizEvent]
  );

  useEffect(() => {
    if (!enabled) cancel();
  }, [enabled, cancel]);

  useEffect(() => {
    return () => cancel();
  }, [cancel]);

  return {
    state,
    actions: {
      start,
      cancel,
      clearError,
    },
  };
}
