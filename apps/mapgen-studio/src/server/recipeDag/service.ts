import type { RecipeDagResult, RecipeDagService } from "@civ7/studio-server";
import { buildRecipeDag } from "@swooper/mapgen-core/authoring/recipe-dag";
import {
  type StudioRecipeDagSource,
  swooperStudioRecipeDagSources,
} from "mod-swooper-maps/recipes/studio-contracts";

type RecipeDagSource = StudioRecipeDagSource;

type RecipeDagSourcesProvider = () => Promise<readonly RecipeDagSource[]>;

async function getDefaultRecipeDagSources(): Promise<readonly RecipeDagSource[]> {
  return swooperStudioRecipeDagSources;
}

export class RecipeDagNotFound extends Error {
  constructor(readonly recipeId: string) {
    super(`Unknown recipeId: ${recipeId}`);
    this.name = "RecipeDagNotFound";
  }
}

export function createRecipeDagService(
  sources: readonly RecipeDagSource[] | RecipeDagSourcesProvider = getDefaultRecipeDagSources
): RecipeDagService {
  return {
    async getRecipeDag(recipeId: string): Promise<RecipeDagResult> {
      const resolvedSources = typeof sources === "function" ? await sources() : sources;
      const byId = new Map(resolvedSources.map((source) => [source.id, source]));
      const source = byId.get(recipeId);
      if (!source) throw new RecipeDagNotFound(recipeId);
      return buildRecipeDag({
        namespace: source.namespace,
        recipeId: source.recipeId,
        recipeKey: source.id,
        title: source.title,
        stages: source.stages,
      }) as RecipeDagResult;
    },
  };
}

export const defaultRecipeDagService = createRecipeDagService();
