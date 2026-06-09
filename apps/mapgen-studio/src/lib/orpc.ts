import { createORPCClient, ORPCError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { ContractRouterClient } from "@orpc/contract";
import { contract, type StudioContract } from "@civ7/studio-server/contract";

/**
 * Studio oRPC client — the typed seam to `@civ7/studio-server`'s `/rpc` mount.
 *
 * EVERYTHING talks oRPC (FRAME §4.7): this is the client half of the studio's own
 * API. The server (effect-orpc router) is mounted at `/rpc` inside the Vite dev
 * middleware (`vite.config.ts`); this client speaks the same `StudioContract`.
 *
 * The client is typed off the **contract** (`ContractRouterClient<StudioContract>`),
 * NOT the router implementation — so the app never imports server/Effect code, and
 * the types are end-to-end-safe without a bundling dependency on the router.
 *
 * SCOPE NOTE (this slice): the client + query utils are created and exported, but
 * call sites are NOT switched yet — the existing hand-rolled `/api` fetches under
 * `src/features` stay until the next slice migrates them onto these utils. Both the
 * legacy `/api` handlers and `/rpc` are alive during cutover (coexistence).
 */

/** RPC transport link. `/rpc` is same-origin (served by the Vite dev server). */
const link = new RPCLink({
  url: () => `${window.location.origin}/rpc`,
});

/** Typed RPC client mirroring the studio contract tree (`orpcClient.civ7.status(...)`, …). */
export const orpcClient: ContractRouterClient<StudioContract> =
  createORPCClient(link);

/**
 * oRPC-native TanStack Query utils. Use directly per architecture/10 §2:
 * `orpc.civ7.status.queryOptions()` into a standard `useQuery` — no hand-written
 * query-key factory or wrapper-hook lib. Built from the contract so query keys and
 * I/O types are contract-derived.
 */
export const orpc = createTanstackQueryUtils(orpcClient);

/**
 * Read the extra-body `data` an `ORPCError` carried back from the studio router.
 *
 * The router pins each procedure's legacy HTTP code on `ORPCError.status` and
 * tucks the legacy body's side fields (`observedAt`, `details`, …) into
 * `ORPCError.data` (see `packages/studio-server/src/router` + `errors.ts`). The
 * contract does not declare an `errorMap`, so on the client `err.data` is typed
 * `unknown` — every caller would otherwise repeat the same inline
 * `(err.data ?? undefined) as { … }` cast to recover one field.
 *
 * This is the single typed accessor for that recovery: it narrows `data` to a
 * `Partial<T>` (each field still treated as possibly-absent, because the wire
 * shape is not statically guaranteed) and returns `undefined` when there is no
 * usable object. Callers read individual fields with their own runtime guard,
 * exactly as the previous hand-rolled casts did — only the cast is centralized.
 */
export function readErrorData<T extends Record<string, unknown>>(
  err: ORPCError<string, unknown>,
): Partial<T> | undefined {
  return typeof err.data === "object" && err.data !== null
    ? (err.data as Partial<T>)
    : undefined;
}

export { contract };
export type { StudioContract };
