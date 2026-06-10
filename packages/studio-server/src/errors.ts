import { ORPCError } from "@orpc/server";

/**
 * `@civ7/studio-server` — error mapping helpers (parity registry, A3).
 *
 * The legacy `/api/*` handlers emit **non-uniform** HTTP status codes
 * (architecture/10 §1 + §7 "Do-not-break registry"):
 *   - civ7.gameInfo / live.* → 400
 *   - civ7.setupConfig → 503
 *   - civ7.autoplay → 400 (bad action) / 409 (mutex) / 500 (other)
 *   - runInGame.start → 400/409/500/503 via RunInGameHttpError; 404 on status miss
 *   - mapConfigs.saveDeploy → 409 (mutex) / 400 (validation); 404 on status miss
 *   - everything else (status / mapSummary / savedConfigs / setupCatalog) → 500
 *
 * effect-orpc converts a thrown `ORPCError` (or a failing Effect carrying one) into
 * the transport error verbatim, preserving `status`, `code`, `message` and `data`.
 * These helpers build those `ORPCError`s so the procedures (router/*) reproduce the
 * exact per-procedure status code + payload of the corresponding `/api` handler.
 *
 * The `data` payload carries the legacy body's extra fields (`details`,
 * `observedAt`, `serverInstanceId`, …) so no parity information is lost across the
 * oRPC boundary; the `{ ok:false, error }` wire wrapper is the old `/api` handler's
 * concern (kept alive this run) — the oRPC client reads `error.status`/`error.data`.
 */

/** Map an arbitrary thrown value to its message, matching `err instanceof Error ? err.message : fallback`. */
export function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

/**
 * Construct an `ORPCError` with an explicit HTTP `status` and optional `data`
 * payload. `code` is a CONSTANT_CASE label; oRPC also derives a default status
 * from well-known codes, but we pass `status` explicitly to pin the legacy value.
 */
export function orpcError(
  status: number,
  message: string,
  data?: Record<string, unknown>,
): ORPCError<string, Record<string, unknown> | undefined> {
  const code = statusToCode(status);
  return new ORPCError(code, {
    status,
    message,
    ...(data === undefined ? {} : { data }),
  });
}

function statusToCode(status: number): string {
  switch (status) {
    case 400:
      return "BAD_REQUEST";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 500:
      return "INTERNAL_SERVER_ERROR";
    case 503:
      return "SERVICE_UNAVAILABLE";
    default:
      return "INTERNAL_SERVER_ERROR";
  }
}
