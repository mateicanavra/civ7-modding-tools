import { createORPCClient } from "@orpc/client";
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

// NOTE: error payloads are CONTRACT-TYPED now. Every procedure declares its error
// codes via `oc.errors(...)` (packages/studio-server/src/contract/errors.ts), so
// call sites use `safe(...)` + `isDefinedError(...)` from `@orpc/client` and read
// `error.code` / `error.data` with full types — the former `readErrorData` cast
// helper is gone.

export { contract };
export type { StudioContract };
