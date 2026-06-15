import { type Civ7ControlOrpcContext, Civ7ControlOrpcRouter } from "@civ7/control-orpc";
import { onError, type Router } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { Effect } from "effect";
import type { StudioServerContext } from "./context.js";
import type { StudioContract, StudioEffectContract } from "./contract/index.js";
import { type LiveGameWatcherOptions, StudioLiveGameWatcher } from "./liveGame/watcher.js";
import { type StudioDaemonIdentity, StudioOperationRuntime } from "./operationRuntime/index.js";
import { createStudioRouter } from "./router/index.js";
import { makeStudioRuntime } from "./runtime.js";
import { Civ7TunerSession, type Civ7TunerSessionHealth } from "./services/Civ7TunerSession.js";

/**
 * `createStudioRpcHandler(context)` — the host entrypoint for the ONE oRPC
 * mount (runtime-one-mount slice, DP-1).
 *
 * Builds the per-host `ManagedRuntime` (injecting {@link StudioServerContext}),
 * implements the effect-orpc router (studio surface + `recipeDag.*`), merges
 * the prebuilt `@civ7/control-orpc` router under `civ7.*` (disjoint key sets —
 * pinned by the single-mount contract test), and wraps the whole tree in ONE
 * oRPC `RPCHandler` (fetch adapter). The host mounts
 * `handle(request, { prefix })` at `/rpc`; `matched: false` means no procedure
 * matched → the host 404s.
 *
 * Session sharing is STRUCTURAL: the control procedures' per-request context
 * is built here from `context.civ7Control` plus the runtime's shared
 * `Civ7TunerSession`, resolved once and memoized. The session object is
 * acquired UNCONNECTED (`connect()` runs on first command and is
 * reuse-idempotent), so constructing the handler — including in tests — opens
 * no socket. There is no session-extraction port anymore; the former
 * `tuner.session()` consumer (the daemon's control-mount patch) is gone.
 *
 * Remaining host obligations:
 * - `tuner.health()` — consecutive response-timeouts + backoff-gate state
 *   (the daemon's `/healthz` probe).
 * - `dispose()` — closes the runtime scope (graceful FIN to the game and
 *   interruption of runtime-scoped workers such as the live-game watcher and
 *   event hub subscribers). The host MUST call this on shutdown or the release
 *   finalizers never run.
 *
 * `StrictGetMethodPlugin` is on by default (GET CSRF hardening) — left
 * enabled. CORS is omitted: `/rpc` is same-origin.
 */
export interface StudioRpcHandle {
  handle(
    request: Request,
    options?: { prefix?: `/${string}` }
  ): Promise<{ matched: boolean; response?: Response }>;
  readonly tuner: {
    health(): Promise<Civ7TunerSessionHealth>;
  };
  readonly operationRuntime: {
    identity(): Promise<StudioDaemonIdentity>;
  };
  dispose(): Promise<void>;
}

export interface StudioRpcHandlerOptions {
  liveGameWatch?: LiveGameWatcherOptions;
}

export function createStudioRpcHandler(
  context: StudioServerContext,
  options: StudioRpcHandlerOptions = {}
): StudioRpcHandle {
  const runtime = makeStudioRuntime(context, { liveGameWatch: options.liveGameWatch });
  const effectRouter = createStudioRouter(runtime);
  // `Router<…>` types every node as `Lazyable<…>`; our effect router never
  // contains lazy nodes (no `lazy()` anywhere in the builder), so unwrap the
  // `civ7` node for the spread — the single-mount contract pin exercises both
  // merged halves at runtime.
  const studioCiv7 = effectRouter.civ7 as Router<
    StudioEffectContract["civ7"],
    Record<never, never>
  >;
  // The unified router, typed against the unified contract with the control
  // procedures' initial context. The effect procedures' initial context is
  // `Record<never, never>` — contravariantly assignable (they ignore the
  // per-request control context the handler supplies).
  const router: Router<StudioContract, Civ7ControlOrpcContext> = {
    ...effectRouter,
    civ7: {
      ...studioCiv7,
      ...Civ7ControlOrpcRouter,
    },
  };
  const handler = new RPCHandler(router, {
    interceptors: [
      onError((error) => {
        // Surface unexpected (non-ORPCError) defects in the host console; expected
        // status-mapped errors flow through quietly.
        console.error("[studio-server] rpc error", error);
      }),
    ],
  });

  // The ONE shared tuner session, memoized for the handler's lifetime. The
  // runtime layer builds on first resolution; lifecycle stays with the
  // runtime scope (dispose() runs the release finalizer). A rejection clears
  // the memo so the next request retries instead of serving a cached failure
  // forever (today the only rejection path is deterministic env misconfig —
  // the session object itself is acquired without I/O — but the memo must
  // not be the thing that makes a failure sticky).
  let sessionPromise: Promise<Civ7ControlOrpcContext["endpointDefaults"]> | undefined;
  let liveGameWatcherReady: Promise<void> | undefined;
  const ensureLiveGameWatcher = () => {
    if (options.liveGameWatch === undefined) return Promise.resolve();
    return (liveGameWatcherReady ??= runtime
      .runPromise(StudioLiveGameWatcher)
      .then(() => undefined)
      .catch((error: unknown) => {
        liveGameWatcherReady = undefined;
        console.error("[studio-server] failed to acquire live-game watcher", error);
        throw error;
      }));
  };

  const controlEndpointDefaults = () =>
    (sessionPromise ??= runtime
      .runPromise(Effect.map(Civ7TunerSession, (tuner) => tuner.session))
      .then((session) => ({
        timeoutMs: context.civ7Control.timeoutMs,
        session,
      }))
      .catch((error: unknown) => {
        sessionPromise = undefined;
        throw error;
      }));

  return {
    handle: async (request, options) => {
      await ensureLiveGameWatcher();
      return handler.handle(request, {
        prefix: options?.prefix ?? "/rpc",
        context: {
          directControl: context.civ7Control.directControl,
          endpointDefaults: await controlEndpointDefaults(),
        } satisfies Civ7ControlOrpcContext,
      });
    },
    tuner: {
      health: () => runtime.runPromise(Effect.flatMap(Civ7TunerSession, (tuner) => tuner.health)),
    },
    operationRuntime: {
      identity: () =>
        ensureLiveGameWatcher().then(() =>
          runtime.runPromise(
            Effect.map(StudioOperationRuntime, (operationRuntime) => operationRuntime.identity)
          )
        ),
    },
    dispose: async () => {
      await runtime.dispose();
    },
  };
}
