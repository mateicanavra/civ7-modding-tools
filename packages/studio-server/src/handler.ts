import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";

import type { StudioServerContext } from "./context.js";
import { createStudioRouter, type StudioRouter } from "./router/index.js";
import { makeStudioRuntime } from "./runtime.js";

/**
 * `createStudioRpcHandler(context)` — the host entrypoint.
 *
 * Builds the per-host `ManagedRuntime` (injecting {@link StudioServerContext}),
 * implements the effect-orpc router, and wraps it in an oRPC `RPCHandler` (fetch
 * adapter — `Request`/`Response`, works under Bun and Node/Vite). The host mounts
 * `handle(request, { prefix })` at `/rpc` (the Vite dev middleware this run; a Bun
 * server later). `RPCHandler` returns `{ matched, response }`; `matched: false`
 * means no procedure matched the path → the host falls through (`next()`).
 *
 * `StrictGetMethodPlugin` is on by default (GET CSRF hardening) — left enabled.
 * CORS is omitted: `/rpc` is same-origin (served from the Vite dev server / the
 * app's own host), so no cross-origin plugin is needed.
 */
export interface StudioRpcHandle {
  readonly router: StudioRouter;
  handle(
    request: Request,
    options?: { prefix?: `/${string}`; context?: Record<never, never> },
  ): Promise<{ matched: boolean; response?: Response }>;
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
  };
}
