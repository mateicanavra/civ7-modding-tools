import type { RecipeDagStageInput } from "@swooper/mapgen-core/authoring/recipe-dag";

import { standardStageContractManifest } from "../standard/contract-manifest.js";

export type StudioRecipeDagSource = Readonly<{
  id: string;
  namespace: string;
  recipeId: string;
  title: string;
  stages: readonly RecipeDagStageInput[];
}>;

export const swooperStandardRecipeDagStages =
  standardStageContractManifest satisfies readonly RecipeDagStageInput[];

export const swooperStudioRecipeDagSources = [
  {
    id: "mod-swooper-maps/standard",
    namespace: "mod-swooper-maps",
    recipeId: "standard",
    title: "Swooper Maps / Standard",
    stages: swooperStandardRecipeDagStages,
  },
] as const satisfies readonly StudioRecipeDagSource[];
