/**
 * `@civ7/studio-server` — error helpers (contract-errors regime).
 *
 * Error mapping is CONTRACT-FIRST: every failure a procedure can emit is a
 * DECLARED oRPC error in `./contract/errors.ts` (attached per procedure via
 * `oc.errors(...)`), carrying the legacy non-uniform status code
 * (architecture/10 §1 + §7 "Do-not-break registry"):
 *   - civ7.gameInfo / live.* → 400
 *   - civ7.setupConfig → 503
 *   - civ7.autoplay → 409 (mutex) / 500 (other)
 *   - runInGame.* → 409/400/500/503; 404 status miss (with server-identity echo)
 *   - mapConfigs.* → 409 (mutex) / 400 (validation); 404 status miss (no echo)
 *   - everything else (status / mapSummary / savedConfigs / setupCatalog) → 500
 *
 * Procedures throw via the typed `errors.CODE({ message, data })` constructor the
 * effect handler receives (router/*); the host context throws raw `ORPCError`s
 * matching the declared entries, which oRPC validates into DEFINED errors. There
 * is no ad-hoc status→code construction left here — only the message fallback.
 */

/** Map an arbitrary thrown value to its message, matching `err instanceof Error ? err.message : fallback`. */
export function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}
