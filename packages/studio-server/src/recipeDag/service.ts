import type { RecipeDagResult } from "@civ7/studio-contract";

/**
 * `RecipeDagService` — the host-injected recipe-DAG projection seam.
 *
 * The TYPE lives here (runtime-one-mount slice); the IMPLEMENTATION stays in
 * the studio app (`apps/mapgen-studio/src/server/recipeDag/service.ts`)
 * because it imports `mod-swooper-maps` recipe stages — a dependency
 * direction that must not enter this package. The host supplies an instance
 * via `StudioServerContext.recipeDagService`, and the `recipeDag.get`
 * procedure reads it from the `StudioConfig` layer.
 */
export type RecipeDagService = Readonly<{
  getRecipeDag(recipeId: string): Promise<RecipeDagResult>;
}>;
