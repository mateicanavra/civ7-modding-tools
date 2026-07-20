import type { Env } from "@swooper/mapgen-core/engine";
import { getRuntimeRecipe } from "../recipeRuntime";

declare const env: Env;

const entry = getRuntimeRecipe("mod-swooper-maps/standard");
entry.recipe.compile(env, entry.defaultConfig);

// @ts-expect-error Runtime recipe compilation always requires an admitted config.
entry.recipe.compile(env);
