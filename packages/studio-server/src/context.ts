import type {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from "@orpc/contract";

import type { contract } from "./contract/index.js";

/**
 * Typed I/O for every studio-server procedure, derived from the oRPC contract so
 * the host engine fns stay in lockstep with the wire contract.
 */
export type StudioInputs = InferContractRouterInputs<typeof contract>;
export type StudioOutputs = InferContractRouterOutputs<typeof contract>;

export type SetupCatalog = StudioOutputs["civ7"]["setupCatalog"]["catalog"];

/**
 * `StudioServerContext` — the dependency seam the host (the Vite dev middleware,
 * later a Bun server) supplies to the studio-server oRPC router.
 *
 * WHY a context seam instead of fully self-owned services: this run keeps the
 * legacy `/api/*` handlers **alive alongside** `/rpc` (coexistence; cutover is a
 * later supervised step). The stateful run-in-game / save-deploy / autoplay
 * surface shares ONE serialized operation queue and ONE pair of operation stores
 * (the dual-store 409 mutex, architecture/10 §7). If the oRPC router instantiated
 * its own stores, `/api` and `/rpc` would diverge and the cross-mutex parity would
 * break. So the host owns the singletons and the verbatim engine bodies, and
 * injects them here; the package owns the oRPC/Effect wiring + the read surface.
 *
 * The read surface (status, mapSummary, gameInfo, live.*, setupConfig,
 * savedConfigs, serverInfo) is implemented inside the package from
 * `@civ7/direct-control` directly — only the catalog loader and the three
 * stateful engines cross this seam.
 *
 * Each engine fn returns the SAME success shape its `/api` handler wrote, OR
 * throws an `ORPCError` (built via ./errors) carrying the legacy non-uniform
 * status code + body. The package re-throws engine `ORPCError`s unchanged.
 */
export interface StudioServerContext {
  /** Process-lifetime singletons surfaced by `studio.serverInfo` + run-in-game 404 echo. */
  readonly serverInstanceId: string;
  readonly serverStartedAt: string;
  /** The Vite `command` ("serve" | "build") echoed by `studio.serverInfo`. */
  readonly viteCommand: string;

  /** Loads the Civ7 setup catalog (filesystem mirror + macOS app resources). */
  loadSetupCatalog(): Promise<SetupCatalog>;

  /**
   * Autoplay engine (#8). Resolves with the success body; throws `ORPCError`
   * 409 (run-in-game OR save/deploy active, `data.details.code`) or 500.
   */
  autoplay(input: StudioInputs["civ7"]["autoplay"]): Promise<StudioOutputs["civ7"]["autoplay"]>;

  /**
   * Launch run-in-game (#14). Resolves the 202-equivalent operation snapshot
   * (incl. the duplicate-request snapshot when fingerprint matches an active op);
   * throws `ORPCError` 409/400/500/503 with `data.details`.
   */
  runInGameStart(
    input: StudioInputs["runInGame"]["start"],
  ): Promise<StudioOutputs["runInGame"]["start"]>;

  /**
   * Poll run-in-game (#13). Resolves the operation snapshot; throws `ORPCError`
   * 404 carrying `data.serverInstanceId`/`data.serverStartedAt` for restart
   * detection (parity invariant).
   */
  runInGameStatus(
    input: StudioInputs["runInGame"]["status"],
  ): Promise<StudioOutputs["runInGame"]["status"]>;

  /**
   * Save + deploy (#16). Resolves the 202-equivalent snapshot (idempotent on an
   * active requestId); throws `ORPCError` 409 (mutex) / 400 (validation).
   */
  mapConfigSaveDeploy(
    input: StudioInputs["mapConfigs"]["saveDeploy"],
  ): Promise<StudioOutputs["mapConfigs"]["saveDeploy"]>;

  /**
   * Poll save/deploy (#15). Resolves the snapshot; throws `ORPCError` 404 (NO
   * serverInstanceId echo — asymmetry vs run-in-game status, parity note).
   */
  mapConfigStatus(
    input: StudioInputs["mapConfigs"]["status"],
  ): Promise<StudioOutputs["mapConfigs"]["status"]>;
}
