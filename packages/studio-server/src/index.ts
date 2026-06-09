/**
 * `@civ7/studio-server` — public entrypoint.
 *
 * - Contract surface (slice A1): zod I/O for all 16 endpoints.
 * - Effect services (A2): `Civ7TunerClient`, `StudioConfig`.
 * - effect-orpc router (A3): `createStudioRouter` + non-uniform error mapping.
 * - Host handler (A4-lite): `createStudioRpcHandler(context)` → an `RPCHandler`
 *   the host mounts at `/rpc` (the Vite dev middleware this run; a Bun server
 *   later). A standalone Bun process is DEFERRED (FRAME §4.7).
 *
 * The host supplies a {@link StudioServerContext} carrying the process singletons,
 * the catalog loader, and the three stateful engine fns (shared queue + dual-store
 * mutex live host-side) — see ./context.ts.
 */
export { contract, civ7, live, mapConfigs, runInGame, studio } from "./contract/index.js";
export type { StudioContract } from "./contract/index.js";

export type {
  StudioServerContext,
  StudioInputs,
  StudioOutputs,
  SetupCatalog,
} from "./context.js";
export { errorMessage, orpcError } from "./errors.js";
export { createStudioRpcHandler, type StudioRpcHandle } from "./handler.js";
export { createStudioRouter, type StudioRouter } from "./router/index.js";
export { makeStudioRuntime, type StudioRuntime } from "./runtime.js";
export { Civ7TunerClient } from "./services/Civ7TunerClient.js";
export { StudioConfig } from "./services/StudioConfig.js";
