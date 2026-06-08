/**
 * `@civ7/studio-server` — public entrypoint.
 *
 * Slice A1 exports the oRPC contract surface only (zod I/O for all 16 endpoints).
 * Later slices add Effect services (A2), the effect-orpc router (A3), and the Bun
 * server entrypoint (A4) behind this barrel.
 */
export { contract, civ7, live, mapConfigs, runInGame, studio } from "./contract/index.js";
export type { StudioContract } from "./contract/index.js";
