import type { MapSetup } from "@swooper/mapgen-core/engine";
import { getRuntimeRecipe } from "../../src/browser-runner/recipeRuntime";

declare const setup: MapSetup;

const entry = getRuntimeRecipe("standard");
const plan = entry.recipe.compile(setup, entry.defaultConfig);
entry.recipe.executeAsync({} as never, plan);

// @ts-expect-error Runtime recipe compilation always requires an admitted config.
entry.recipe.compile(setup);

// @ts-expect-error Runtime recipe execution always requires the exact compiled plan.
entry.recipe.executeAsync({} as never);
