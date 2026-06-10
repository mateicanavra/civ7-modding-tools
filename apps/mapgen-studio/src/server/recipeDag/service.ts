import { buildRecipeDag, type StageContractAny } from "@swooper/mapgen-core/authoring";
import {
  BROWSER_TEST_STAGES,
} from "mod-swooper-maps/recipes/browser-test";
import {
  STANDARD_STAGES,
} from "mod-swooper-maps/recipes/standard";

import type { RecipeDagService } from "./context";
import type { RecipeDagResult } from "./schema";

type RecipeDagSource = Readonly<{
  id: string;
  namespace: string;
  recipeId: string;
  title: string;
  stages: readonly StageContractAny[];
}>;

const DEFAULT_RECIPE_DAG_SOURCES: readonly RecipeDagSource[] = [
  {
    id: "mod-swooper-maps/standard",
    namespace: "mod-swooper-maps",
    recipeId: "standard",
    title: "Swooper Maps / Standard",
    stages: STANDARD_STAGES as readonly StageContractAny[],
  },
  {
    id: "mod-swooper-maps/browser-test",
    namespace: "mod-swooper-maps",
    recipeId: "browser-test",
    title: "Swooper Maps / Browser Test",
    stages: BROWSER_TEST_STAGES as readonly StageContractAny[],
  },
] as const;

export class RecipeDagNotFound extends Error {
  constructor(readonly recipeId: string) {
    super(`Unknown recipeId: ${recipeId}`);
    this.name = "RecipeDagNotFound";
  }
}

export function createRecipeDagService(
  sources: readonly RecipeDagSource[] = DEFAULT_RECIPE_DAG_SOURCES,
): RecipeDagService {
  const byId = new Map(sources.map((source) => [source.id, source]));
  return {
    async getRecipeDag(recipeId: string): Promise<RecipeDagResult> {
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
