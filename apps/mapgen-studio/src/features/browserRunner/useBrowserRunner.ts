import { useCallback, useEffect, useRef, useState } from "react";
import type { BrowserRunErrorEvent, BrowserRunRequest } from "../../browser-runner/protocol";
import type { VizEvent } from "../../shared/vizEvents";
import { toVizEvent } from "./adapter";
import { formatErrorForUi } from "./errorFormat";
import { createWorkerClient } from "./workerClient";

export type BrowserRunnerStatus = "idle" | "running" | "finished" | "error";

export type BrowserRunnerInputs = {
  recipeId: string;
  seed: number;
  mapSizeId: string;
  dimensions: { width: number; height: number };
  latitudeBounds: { topLatitude: number; bottomLatitude: number };
  playerCount?: number;
  resourcesMode?: "balanced" | "strategic";
  configOverrides?: unknown;
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

function randomRunToken(): string {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `run_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function useBrowserRunner(args: UseBrowserRunnerArgs): UseBrowserRunnerResult {
  const { enabled, onVizEvent } = args;
  const runTokenRef = useRef<string>(randomRunToken());
  const generationRef = useRef<number>(0);
  const activeGenerationRef = useRef<number | null>(null);
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
    const runToken = runTokenRef.current;
    const generation = activeGenerationRef.current;
    if (generation != null) {
      const request: BrowserRunRequest = { type: "run.cancel", runToken, generation };
      clientRef.current.start(request, {
        onEvent: () => {},
        onError: () => {},
      });
    }
    activeGenerationRef.current = null;
    setState((prev) => ({
      ...prev,
      running: false,
      status: prev.error ? "error" : "idle",
      lastStep: null,
    }));
  }, []);

  const start = useCallback(
    (inputs: BrowserRunnerInputs) => {
      const runToken = runTokenRef.current;
      const generation = (generationRef.current + 1) | 0;
      generationRef.current = generation;
      activeGenerationRef.current = generation;
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
        generation,
        recipeId: inputs.recipeId,
        seed: inputs.seed,
        mapSizeId: inputs.mapSizeId,
        dimensions: inputs.dimensions,
        latitudeBounds: inputs.latitudeBounds,
        playerCount: inputs.playerCount,
        resourcesMode: inputs.resourcesMode,
        configOverrides: inputs.configOverrides,
      };

      clientRef.current.start(request, {
        onEvent: (event) => {
          if (event.runToken !== runToken) return;
          if (event.generation !== generationRef.current) return;

          onVizEvent(toVizEvent(event));

          if (event.type === "run.progress" && event.kind === "step.start") {
            setState((prev) => ({
              ...prev,
              lastStep: { stepId: event.stepId, stepIndex: event.stepIndex },
            }));
            return;
          }

          if (event.type === "run.finished") {
            activeGenerationRef.current = null;
            setState((prev) => ({
              ...prev,
              status: "finished",
              running: false,
            }));
            return;
          }

          if (event.type === "run.canceled") {
            activeGenerationRef.current = null;
            setState((prev) => ({
              ...prev,
              status: "idle",
              running: false,
              lastStep: null,
            }));
            return;
          }

          if (event.type === "run.error") {
            activeGenerationRef.current = null;
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
          if (activeGenerationRef.current == null) return;
          console.error("BrowserRunner worker error", error);
          activeGenerationRef.current = null;
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
    return () => {
      cancel();
      clientRef.current.terminate();
    };
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
