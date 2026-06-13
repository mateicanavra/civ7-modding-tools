import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { ClientRetryPlugin } from "@orpc/client/plugins";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { ContractRouterClient } from "@orpc/contract";
import type { StudioContract } from "@civ7/studio-server/contract";

/**
 * Studio oRPC client — the ONE typed seam to the daemon's `/rpc` mount
 * (runtime-one-mount slice, DP-1).
 *
 * The unified `StudioContract` covers the entire server surface: the studio
 * read/engine procedures, the absorbed Civ7 control namespaces under
 * `civ7.*` (`orpcClient.civ7.readiness.current`, …), and `recipeDag.*`.
 * There are no satellite clients and no second mount path.
 *
 * The client is typed off the **contract type only**
 * (`ContractRouterClient<StudioContract>`): the import above is type-level,
 * so no server/Effect/control-runtime code (including
 * `@civ7/direct-control`'s socket machinery, which sits behind the control
 * contract's VALUE graph) can reach the browser bundle.
 */

/** RPC transport link. `/rpc` is same-origin (Vite dev proxy → daemon). */
const link = new RPCLink({
  url: () => `${window.location.origin}/rpc`,
  plugins: [new ClientRetryPlugin()],
});

/** Typed RPC client mirroring the unified contract tree. */
export const orpcClient: ContractRouterClient<StudioContract> =
  createORPCClient(link);

/**
 * oRPC-native TanStack Query utils. Use directly per architecture/10 §2:
 * `orpc.civ7.status.queryOptions()` into a standard `useQuery` — no
 * hand-written query-key factory or wrapper-hook lib. Query keys and I/O
 * types are contract-derived.
 */
export const orpc = createTanstackQueryUtils(orpcClient);

// NOTE: error payloads are CONTRACT-TYPED. Every procedure declares its error
// codes (packages/studio-server + @civ7/control-orpc contracts), so call
// sites use `safe(...)` + `isDefinedError(...)` from `@orpc/client` and read
// `error.code` / `error.data` with full types.

export type { StudioContract };
