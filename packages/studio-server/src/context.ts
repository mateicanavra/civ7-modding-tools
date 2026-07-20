import type {
  Civ7ControlOrpcDirectControlFacade,
  Civ7ControlOrpcDirectLifecycleFacade,
} from "@civ7/control-orpc/runtime";
import type { studioEffectContract as contract } from "@civ7/studio-contract";
import type { InferContractRouterInputs, InferContractRouterOutputs } from "@orpc/contract";
import type { StudioOperationRuntimePorts } from "./operationRuntime/index.js";
import type { RecipeDagService } from "./recipeDag/service.js";

/**
 * Typed I/O for every studio-server procedure, derived from the oRPC contract so
 * host leaf ports stay in lockstep with the wire contract.
 */
export type StudioInputs = InferContractRouterInputs<typeof contract>;
export type StudioOutputs = InferContractRouterOutputs<typeof contract>;

export type SetupCatalog = StudioOutputs["civ7"]["setupCatalog"]["catalog"];

/**
 * `StudioServerContext` - the dependency seam the host (the Vite dev middleware,
 * later a Bun server) supplies to the studio-server oRPC router.
 *
 * Runtime-owned operations: the stateful run-in-game / save-deploy / autoplay
 * surface is owned by the package operation runtime layer. The host
 * supplies leaf ports for filesystem/deploy/direct-control atoms only; it does
 * not own operation identity, admission, registries, TTL/tombstones, current
 * projection, event publication, event hub lifecycle, worker supervision, or
 * lifecycle disposal.
 *
 * The read surface (status, mapSummary, gameInfo, live.*, setupConfig,
 * savedConfigs, serverInfo) is implemented inside the package from
 * `@civ7/direct-control` directly - only the catalog loader, recipe DAG service,
 * control facade, and operation leaf ports cross this seam.
 */
export interface StudioServerContext {
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
   * Civ7 control-oRPC dependencies (runtime-one-mount slice). HTTP procedures
   * receive only `directControl`; the in-process operation runtime receives
   * `directLifecycle` and the shared `Civ7TunerSession` as its sole setup/start
   * mutation path. Hosts pass live facades; tests pass fakes.
   */
  readonly civ7Control: Readonly<{
    directControl: Civ7ControlOrpcDirectControlFacade;
    directLifecycle: Civ7ControlOrpcDirectLifecycleFacade;
    timeoutMs: number;
  }>;

  /** Loads the Civ7 setup catalog (filesystem mirror + macOS app resources). */
  loadSetupCatalog(): Promise<SetupCatalog>;

  /** Leaf operation adapters consumed by the package-owned operation runtime. */
  readonly operationRuntime: StudioOperationRuntimePorts;
}
