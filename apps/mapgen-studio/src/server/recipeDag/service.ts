import type { RecipeDagResult, RecipeDagService } from "@civ7/studio-server";
import { buildRecipeDag } from "@swooper/mapgen-core/authoring/recipe-dag";
import {
  type StudioRecipeDagSource,
  swooperStudioRecipeDagSources,
} from "@swooper/swooper-physics/standard/dag";

type RecipeDagSource = StudioRecipeDagSource;

type RecipeDagSourcesProvider = () => Promise<readonly RecipeDagSource[]>;

async function getDefaultRecipeDagSources(): Promise<readonly RecipeDagSource[]> {
  return swooperStudioRecipeDagSources;
}

/** Identifies a recipe lookup failure without conflating it with DAG construction defects. */
export class RecipeDagNotFound extends Error {
  constructor(readonly recipeId: string) {
    super(`Unknown recipeId: ${recipeId}`);
    this.name = "RecipeDagNotFound";
  }
}

/** Creates a recipe DAG reader over either static sources or a deferred source provider. */
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

/** Process-wide DAG service backed by the checked-in Studio recipe sources. */
export const defaultRecipeDagService = createRecipeDagService();
