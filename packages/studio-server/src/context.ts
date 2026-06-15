import type { Civ7ControlOrpcDirectControlFacade } from "@civ7/control-orpc/runtime";
import type { InferContractRouterInputs, InferContractRouterOutputs } from "@orpc/contract";

import type { studioEffectContract as contract } from "./contract/index.js";
import type { RecipeDagService } from "./recipeDag/service.js";
import type { StudioEventHubApi } from "./services/StudioEventHub.js";

/**
 * Typed I/O for every studio-server procedure, derived from the oRPC contract so
 * the host engine fns stay in lockstep with the wire contract.
 */
export type StudioInputs = InferContractRouterInputs<typeof contract>;
export type StudioOutputs = InferContractRouterOutputs<typeof contract>;

export type SetupCatalog = StudioOutputs["civ7"]["setupCatalog"]["catalog"];

/**
 * `StudioServerContext` - the dependency seam the host (the Vite dev middleware,
 * later a Bun server) supplies to the studio-server oRPC router.
 *
 * WHY a context seam instead of fully self-owned services: the stateful
 * run-in-game / save-deploy / autoplay surface shares ONE serialized operation
 * queue and ONE pair of operation stores (the dual-store 409 mutex,
 * architecture/10 section 7). The daemon is now one `/rpc` surface; the host
 * still owns those process-lifetime singletons and injects them here so the
 * package owns the oRPC/Effect wiring without duplicating engine state.
 *
 * The read surface (status, mapSummary, gameInfo, live.*, setupConfig,
 * savedConfigs, serverInfo) is implemented inside the package from
 * `@civ7/direct-control` directly - only the catalog loader and the three
 * stateful engines cross this seam.
 *
 * Each router-facing stateful host fn returns the SAME success shape its `/api`
 * handler wrote, OR throws a package-mapped declared `ORPCError`. The app
 * engines construct package-owned `StudioRuntimeFailure` values for known
 * outcomes; the app host context maps them by procedure to declared oRPC errors
 * (./contract/errors.ts) before they cross this seam. Unknown exceptions remain
 * router-edge defect containment and map only to namespace `*_FAILED` with
 * package-projected `UnexpectedDefectData`.
 */
export interface StudioServerContext {
  /** Process-lifetime singletons surfaced by `studio.serverInfo` + run-in-game 404 echo. */
  readonly serverInstanceId: string;
  readonly serverStartedAt: string;
  /** The Vite `command` ("serve" | "build") echoed by `studio.serverInfo`. */
  readonly viteCommand: string;

  /**
   * Recipe-DAG projection service (runtime-one-mount slice). The
   * implementation stays host-side - it imports `mod-swooper-maps` recipe
   * stages, a dependency this package must not take. `recipeDag.get` reads
   * it through the `StudioConfig` layer.
   */
  readonly recipeDagService: RecipeDagService;

  /**
   * Civ7 control-oRPC dependencies (runtime-one-mount slice). The handler
   * builds the control procedures' per-request context from these plus the
   * runtime's shared `Civ7TunerSession` - session sharing is structural,
   * not a host-side patch. Hosts pass the live facade; tests pass fakes.
   */
  readonly civ7Control: Readonly<{
    directControl: Civ7ControlOrpcDirectControlFacade;
    timeoutMs: number;
  }>;

  /**
   * Daemon-owned runtime event bus (S3.1). The package watch procedure and
   * app-side publishers share this one hub through the host context.
   */
  readonly eventHub: StudioEventHubApi;

  /** Loads the Civ7 setup catalog (filesystem mirror + macOS app resources). */
  loadSetupCatalog(): Promise<SetupCatalog>;

  /**
   * Autoplay engine (#8). Resolves with the success body; throws declared
   * `ORPCError`s for blocked, unavailable, and failed outcomes.
   */
  autoplay(input: StudioInputs["civ7"]["autoplay"]): Promise<StudioOutputs["civ7"]["autoplay"]>;

  /**
   * Launch run-in-game (#14). Resolves the 202-equivalent operation snapshot
   * (incl. the duplicate-request snapshot when fingerprint matches an active op);
   * throws declared `ORPCError`s for blocked, invalid, unavailable,
   * materialization, and proof outcomes.
   */
  runInGameStart(
    input: StudioInputs["runInGame"]["start"]
  ): Promise<StudioOutputs["runInGame"]["start"]>;

  /**
   * Poll run-in-game (#13). Resolves the operation snapshot; throws a declared
   * 404 `ORPCError` with request id plus daemon identity for restart detection
   * (parity invariant).
   */
  runInGameStatus(
    input: StudioInputs["runInGame"]["status"]
  ): Promise<StudioOutputs["runInGame"]["status"]>;

  /**
   * Save + deploy (#16). Resolves the 202-equivalent snapshot (idempotent on an
   * active requestId); throws declared `ORPCError`s for mutex, validation,
   * unavailable, and deploy outcomes.
   */
  mapConfigSaveDeploy(
    input: StudioInputs["mapConfigs"]["saveDeploy"]
  ): Promise<StudioOutputs["mapConfigs"]["saveDeploy"]>;

  /**
   * Poll save/deploy (#15). Resolves the snapshot; throws a declared 404
   * `ORPCError` with request id plus daemon identity for the same
   * restart-detection contract as run-in-game status.
   */
  mapConfigStatus(
    input: StudioInputs["mapConfigs"]["status"]
  ): Promise<StudioOutputs["mapConfigs"]["status"]>;

  /**
   * Current retained operation truth (S2.1). Fresh daemons return empty
   * registries; retained active/recent operations are adopted by the client
   * instead of replaying browser-persisted request ids.
   */
  operationsCurrent(): Promise<StudioOutputs["studio"]["operations"]["current"]>;
}
