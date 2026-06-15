import type { RecipeDagResult, RecipeDagService } from "@civ7/studio-server";
import { buildRecipeDag, type StageContractAny } from "@swooper/mapgen-core/authoring";

type RecipeDagSource = Readonly<{
  id: string;
  namespace: string;
  recipeId: string;
  title: string;
  stages: readonly StageContractAny[];
}>;

type RecipeDagSourcesProvider = () => Promise<readonly RecipeDagSource[]>;

const swooperRecipeSourceRoot = "../../../../../mods/mod-swooper-maps/src/recipes";
let defaultRecipeDagSourcesPromise: Promise<readonly RecipeDagSource[]> | undefined;

async function loadDefaultRecipeDagSources(): Promise<readonly RecipeDagSource[]> {
  const [standardRecipe, browserTestRecipe] = await Promise.all([
    import(`${swooperRecipeSourceRoot}/standard/recipe.js`) as Promise<{
      STANDARD_STAGES: readonly StageContractAny[];
    }>,
    import(`${swooperRecipeSourceRoot}/browser-test/recipe.js`) as Promise<{
      BROWSER_TEST_STAGES: readonly StageContractAny[];
    }>,
  ]);
  return [
    {
      id: "mod-swooper-maps/standard",
      namespace: "mod-swooper-maps",
      recipeId: "standard",
      title: "Swooper Maps / Standard",
      stages: standardRecipe.STANDARD_STAGES,
    },
    {
      id: "mod-swooper-maps/browser-test",
      namespace: "mod-swooper-maps",
      recipeId: "browser-test",
      title: "Swooper Maps / Browser Test",
      stages: browserTestRecipe.BROWSER_TEST_STAGES,
    },
  ] as const;
}

function getDefaultRecipeDagSources(): Promise<readonly RecipeDagSource[]> {
  defaultRecipeDagSourcesPromise ??= loadDefaultRecipeDagSources();
  return defaultRecipeDagSourcesPromise;
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
