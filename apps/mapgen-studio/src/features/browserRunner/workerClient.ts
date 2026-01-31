import type { BrowserRunEvent, BrowserRunRequest } from "../../browser-runner/protocol";

export type WorkerClientHandlers = {
  onEvent(event: BrowserRunEvent): void;
  onError(error: unknown): void;
};

export type WorkerClient = {
  start(request: BrowserRunRequest, handlers: WorkerClientHandlers): void;
  terminate(): void;
};

export function createWorkerClient(): WorkerClient {
  let worker: Worker | null = null;

  const terminate = () => {
    if (worker) {
      worker.terminate();
      worker = null;
    }
  };

  const start = (request: BrowserRunRequest, handlers: WorkerClientHandlers) => {
    if (!worker) {
      worker = new Worker(new URL("../../browser-runner/foundation.worker.ts", import.meta.url), { type: "module" });
    }
    worker.onmessage = (ev: MessageEvent<BrowserRunEvent>) => {
      if (!ev.data) return;
      handlers.onEvent(ev.data);
    };
    worker.onerror = handlers.onError;
    worker.onmessageerror = handlers.onError as (ev: MessageEvent) => void;
    try {
      worker.postMessage(request);
    } catch (err) {
      handlers.onError(err);
    }
  };

  return { start, terminate };
}
