import { Effect } from "effect";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";

import type { Civ7DirectControlSession } from "@civ7/direct-control";

import type { StudioServerContext } from "./context.js";
import { createStudioRouter, type StudioRouter } from "./router/index.js";
import { makeStudioRuntime } from "./runtime.js";
import {
  Civ7TunerSession,
  type Civ7TunerSessionHealth,
} from "./services/Civ7TunerSession.js";

/**
 * `createStudioRpcHandler(context)` — the host entrypoint.
 *
 * Builds the per-host `ManagedRuntime` (injecting {@link StudioServerContext}),
 * implements the effect-orpc router, and wraps it in an oRPC `RPCHandler` (fetch
 * adapter — `Request`/`Response`, works under Bun and Node/Vite). The host mounts
 * `handle(request, { prefix })` at `/rpc`. `RPCHandler` returns
 * `{ matched, response }`; `matched: false` means no procedure matched the path
 * → the host falls through (`next()`).
 *
 * The handle also carries the shared-tuner-session ports:
 * - `tuner.session()` — the ONE `Civ7DirectControlSession` for injection into
 *   non-Effect consumers (`Civ7DirectControlOptions.session`, e.g. the
 *   control-oRPC mount's `endpointDefaults`). Lifecycle stays with the runtime.
 * - `tuner.health()` — consecutive response-timeouts + backoff-gate state.
 * - `dispose()` — closes the runtime scope (graceful FIN to the game). The
 *   host MUST call this on shutdown or the release finalizer never runs.
 *
 * `StrictGetMethodPlugin` is on by default (GET CSRF hardening) — left enabled.
 * CORS is omitted: `/rpc` is same-origin, so no cross-origin plugin is needed.
 */
export interface StudioRpcHandle {
  readonly router: StudioRouter;
  handle(
    request: Request,
    options?: { prefix?: `/${string}`; context?: Record<never, never> },
  ): Promise<{ matched: boolean; response?: Response }>;
  readonly tuner: {
    session(): Promise<Civ7DirectControlSession>;
    health(): Promise<Civ7TunerSessionHealth>;
  };
  dispose(): Promise<void>;
}

export function createStudioRpcHandler(context: StudioServerContext): StudioRpcHandle {
  const runtime = makeStudioRuntime(context);
  const router = createStudioRouter(runtime);
  const handler = new RPCHandler(router, {
    interceptors: [
      onError((error) => {
        // Surface unexpected (non-ORPCError) defects in the host console; expected
        // status-mapped errors flow through quietly.
        console.error("[studio-server] rpc error", error);
      }),
    ],
  });

  return {
    router,
    handle: (request, options) =>
      handler.handle(request, {
        prefix: options?.prefix ?? "/rpc",
        context: options?.context ?? {},
      }),
    tuner: {
      session: () =>
        runtime.runPromise(Effect.map(Civ7TunerSession, (tuner) => tuner.session)),
      health: () =>
        runtime.runPromise(Effect.flatMap(Civ7TunerSession, (tuner) => tuner.health)),
    },
    dispose: () => runtime.dispose(),
  };
}
