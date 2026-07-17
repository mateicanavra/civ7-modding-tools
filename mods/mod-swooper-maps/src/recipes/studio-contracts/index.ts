import type { RecipeDagStageInput } from "@swooper/mapgen-core/authoring/recipe-dag";

import { standardStageContractManifest } from "../standard/contract-manifest.js";

export type StudioRecipeDagSource = Readonly<{
  id: string;
  namespace: string;
  recipeId: string;
  title: string;
  stages: readonly RecipeDagStageInput[];
}>;

/** Studio-safe Standard stage metadata in canonical runtime order, without step implementations. */
export const swooperStandardRecipeDagStages =
  standardStageContractManifest satisfies readonly RecipeDagStageInput[];

/**
 * Studio-facing catalog of Swooper recipe DAGs. It projects the live Standard
 * contract manifest without importing runtime step implementations, preserving
 * contract metadata and canonical order at the server boundary.
 */
export const swooperStudioRecipeDagSources = [
  {
    id: "mod-swooper-maps/standard",
    namespace: "mod-swooper-maps",
    recipeId: "standard",
    title: "Swooper Maps / Standard",
    stages: swooperStandardRecipeDagStages,
  },
] as const satisfies readonly StudioRecipeDagSource[];
