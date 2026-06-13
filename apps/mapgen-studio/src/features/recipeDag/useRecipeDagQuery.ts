import { useQuery } from "@tanstack/react-query";

import type { RecipeDagResult } from "@civ7/studio-server/contract";

import { orpcClient } from "../../lib/orpc";

/**
 * `useRecipeDagQuery` — the pipeline view's READ surface on TanStack Query
 * (mapgen-studio-dag-tab). It re-homes the pre-redesign App.tsx lazy-fetch
 * behavior in the client-data layer: the DAG is fetched on first activation
 * per recipe (`enabled` gates on the pipeline view being visible), cached by
 * recipe id, and never considered stale — the projection only changes when
 * authored code changes, which in dev means a page reload anyway. Stale
 * responses and cancellation, hand-rolled in the monolith, fall out of the
 * query cache keying.
 *
 * Transport is the ONE unified oRPC client (`orpcClient.recipeDag.get`,
 * runtime-one-mount slice) — the client never imports recipe modules.
 */

export type RecipeDagLoadStatus = "idle" | "loading" | "ready" | "error";

export type RecipeDagQueryView = Readonly<{
  dag: RecipeDagResult | null;
  status: RecipeDagLoadStatus;
  error: string | null;
}>;

export function useRecipeDagQuery(
  recipeId: string,
  options: Readonly<{ enabled: boolean }>,
): RecipeDagQueryView {
  const query = useQuery<RecipeDagResult, Error>({
    queryKey: ["recipeDag", recipeId],
    queryFn: () => orpcClient.recipeDag.get({ recipeId }),
    enabled: options.enabled,
    staleTime: Infinity,
  });

  if (query.data) return { dag: query.data, status: "ready", error: null };
  if (query.isError) {
    return {
      dag: null,
      status: "error",
      error: query.error.message || "Failed to load the recipe pipeline.",
    };
  }
  if (!options.enabled) return { dag: null, status: "idle", error: null };
  return { dag: null, status: "loading", error: null };
}
