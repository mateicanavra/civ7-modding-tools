import { QueryClient } from "@tanstack/react-query";

/**
 * The stub TanStack Query client every story renders under.
 *
 * It is the cold-`/rpc` backstop for the workbench. Stage-1 stories pass fixtures
 * to pure presentational leaves and should mount no `orpc.*` query at all; this
 * client guarantees the network seam stays cold even if a leaf is accidentally
 * wrapped in a query. It deliberately OVERRIDES the prod defaults from
 * `src/lib/query.ts` (`staleTime: 5_000`, `retry: 1`, `refetchOnWindowFocus: true`)
 * — those would let a stray query thrash `/rpc` on focus.
 *
 * Build a FRESH client per story (the preview decorator does, via `useState`) so
 * seeded cache state never leaks across stories.
 */
export function createStoryQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Number.POSITIVE_INFINITY,
        gcTime: Number.POSITIVE_INFINITY,
        networkMode: "always",
      },
      mutations: { retry: false },
    },
  });
}
