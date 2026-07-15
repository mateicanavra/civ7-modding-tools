import {
  Civ7ControlOrpcAdmissionRefusal,
  type Civ7ControlOrpcContext,
  Civ7ControlOrpcRouter,
} from "@civ7/control-orpc";
import type { StudioEffectContract } from "@civ7/studio-contract";
import {
  createRouterClient,
  isDefinedError,
  isLazy,
  onError,
  type Router,
  type RouterClient,
} from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { Effect, Match } from "effect";
import type { StudioServerContext } from "./context.js";
import type { StudioContract } from "./contract/index.js";
import { type LiveGameWatcherOptions, StudioLiveGameWatcher } from "./liveGame/watcher.js";
import { type StudioDaemonIdentity, StudioOperationRuntime } from "./operationRuntime/index.js";
import { createStudioRouter, type StudioRouter } from "./router/index.js";
import { makeStudioRuntime } from "./runtime.js";
import {
  type Civ7TunerAdmissionError,
  Civ7TunerSession,
  type Civ7TunerSessionApi,
  type Civ7TunerSessionHealth,
} from "./services/Civ7TunerSession.js";

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
 * `Civ7TunerSession`, resolved once and memoized. Its session and whole-
 * procedure admission lease flow together, so the merged control router cannot
 * bypass Studio reads, lifecycle ownership, or the backoff gate. The session is
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
  readonly live: StudioLiveRuntimeReader;
  dispose(): Promise<void>;
}

/** Narrow in-process read surface over the exact Studio router and runtime. */
export type StudioLiveRuntimeReader = Pick<
  RouterClient<StudioRouter>["civ7"]["live"],
  "status" | "snapshot"
>;

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
  const studioCiv7Node = effectRouter.civ7;
  const studioCiv7 = Match.value(studioCiv7Node).pipe(
    Match.when(isLazy, unexpectedLazyStudioNamespace),
    Match.orElse((router) => router)
  );
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
        if (isDefinedError(error)) return;
        console.error("[studio-server] rpc error", error);
      }),
    ],
  });

  // The ONE shared tuner service, memoized for the handler's lifetime. The
  // runtime layer builds on first resolution; connection lifecycle stays with the
  // runtime scope (dispose() runs the release finalizer). A rejection clears
  // the memo so the next request retries instead of serving a cached failure
  // forever (today the only rejection path is deterministic env misconfig —
  // the session object itself is acquired without I/O — but the memo must
  // not be the thing that makes a failure sticky).
  let tunerPromise: Promise<Civ7TunerSessionApi> | undefined;
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

  const controlTuner = () =>
    (tunerPromise ??= runtime
      .runPromise(Effect.map(Civ7TunerSession, (tuner) => tuner))
      .catch((error: unknown) => {
        tunerPromise = undefined;
        throw error;
      }));
  const controlContext = async (): Promise<Civ7ControlOrpcContext> => {
    const tuner = await controlTuner();
    return {
      directControl: context.civ7Control.directControl,
      // Studio's operation runtime is the sole setup/start admission owner.
      // The merged router intentionally cannot acquire lifecycle mutation.
      endpointDefaults: {
        timeoutMs: context.civ7Control.timeoutMs,
        session: tuner.session,
      },
      procedureAdmission: (procedure) => {
        const admittedLease = tuner.lease.pipe(Effect.mapError(tunerAdmissionRefusal));
        return Effect.uninterruptibleMask((restoreLease) =>
          Effect.scoped(restoreLease(admittedLease).pipe(Effect.flatMap(() => procedure)))
        );
      },
    };
  };
  const localClient = createRouterClient(router, { context: controlContext });

  return {
    handle: async (request, options) => {
      await ensureLiveGameWatcher();
      return handler.handle(request, {
        prefix: options?.prefix ?? "/rpc",
        context: await controlContext(),
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
    live: {
      status: (...args) =>
        ensureLiveGameWatcher().then(() => localClient.civ7.live.status(...args)),
      snapshot: (...args) =>
        ensureLiveGameWatcher().then(() => localClient.civ7.live.snapshot(...args)),
    },
    dispose: async () => {
      await runtime.dispose();
    },
  };
}

function tunerAdmissionRefusal(error: Civ7TunerAdmissionError): Civ7ControlOrpcAdmissionRefusal {
  return Match.value(error).pipe(
    Match.tag(
      "Civ7TunerBackoffError",
      ({ retryAtMs }) => new Civ7ControlOrpcAdmissionRefusal(retryAtMs)
    ),
    Match.tag("Civ7TunerClosingError", () => new Civ7ControlOrpcAdmissionRefusal()),
    Match.exhaustive
  );
}

function unexpectedLazyStudioNamespace(): never {
  throw new Error("The authored Studio router must not contain lazy namespaces");
}
