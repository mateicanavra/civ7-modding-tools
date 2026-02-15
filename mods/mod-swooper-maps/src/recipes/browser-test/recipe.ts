import { collectCompileOps, createRecipe, type CompiledRecipeConfigOf, type RecipeConfigInputOf } from "@swooper/mapgen-core/authoring";
import foundationDomain from "@mapgen/domain/foundation/ops";

import foundation from "../standard/stages/foundation/index.js";
import { STANDARD_TAG_DEFINITIONS } from "../standard/tags.js";

const NAMESPACE = "mod-swooper-maps";
const stages = [foundation] as const;

export const BROWSER_TEST_STAGES = stages;

export type BrowserTestRecipeConfig = RecipeConfigInputOf<typeof stages>;
export type BrowserTestRecipeCompiledConfig = CompiledRecipeConfigOf<typeof stages>;
export type BrowserTestFoundationStageConfig = NonNullable<BrowserTestRecipeConfig["foundation"]>;
export type BrowserTestFoundationStageKnobsConfig = NonNullable<BrowserTestFoundationStageConfig["knobs"]>;

export const compileOpsById = collectCompileOps(foundationDomain);

export default createRecipe({
  id: "browser-test",
  namespace: NAMESPACE,
  tagDefinitions: STANDARD_TAG_DEFINITIONS,
  stages,
  compileOpsById,
} as const);
