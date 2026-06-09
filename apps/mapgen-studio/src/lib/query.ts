import { QueryClient } from "@tanstack/react-query";

/**
 * The studio's single TanStack Query client.
 *
 * Server state flows through oRPC-native query utils (`src/lib/orpc.ts`) into
 * standard `useQuery`/`useMutation`; this client provides their shared cache and
 * defaults. Per architecture/10 §2 we own ONLY the `QueryClient` — no hand-written
 * query-key factory or wrapper-hook lib.
 *
 * Defaults are tuned for a live-authoring tool that polls a local dev server:
 * - `staleTime` is short (a few seconds) — setup catalog / saved configs change
 *   when the game or filesystem does, so we want refetch-on-focus to feel live
 *   without hammering the socket on every render.
 * - `retry: 1` — the studio surfaces transport errors inline (the legacy `/api`
 *   callers returned `{ ok:false, error }`); a single retry smooths a transient
 *   socket blip without masking a real outage behind exponential backoff.
 * - `refetchOnWindowFocus` stays on (the legacy saved-configs effect re-loaded on
 *   `window.focus`) so reconnecting the game refreshes the catalog.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5_000,
        retry: 1,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
