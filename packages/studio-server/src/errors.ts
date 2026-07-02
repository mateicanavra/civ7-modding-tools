/**
 * `@civ7/studio-server` — error helpers (contract-errors regime).
 *
 * Error mapping is CONTRACT-FIRST: every failure a procedure can emit is a
 * DECLARED oRPC error in `@civ7/studio-contract` (`packages/studio-contract/src/errors.ts`,
 * attached per procedure via
 * `oc.errors(...)`), carrying the legacy non-uniform status code
 * (architecture/10 §1 + §7 "Do-not-break registry"):
 *   - civ7.gameInfo / live.* → 400
 *   - civ7.setupConfig → 503
 *   - civ7.autoplay → 409 (mutex) / 500 (other)
 *   - runInGame.* → 409/400/500/503; 404 status miss (with server-identity echo)
 *   - mapConfigs.* → 409/400/500/503; 404 status miss (with server-identity echo)
 *   - everything else (status / mapSummary / savedConfigs / setupCatalog) → 500
 *
 * Read procedures throw via the typed `errors.CODE({ message, data })`
 * constructor the effect handler receives (router/*). Stateful app engines
 * construct package-owned `StudioRuntimeFailure` values; the app host context
 * maps those through the package mapper into declared `ORPCError`s that this
 * router rethrows unchanged. There is no app-local status→code bridge left here;
 * unexpected stateful host defects are sanitized into namespace `*_FAILED`
 * `UnexpectedDefectData` at the router edge.
 */

/** Map an arbitrary thrown value to its message, matching `err instanceof Error ? err.message : fallback`. */
export function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}
