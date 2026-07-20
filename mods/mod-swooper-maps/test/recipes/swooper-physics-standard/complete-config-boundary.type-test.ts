import type { StandardRecipeConfig } from "../../../src/recipes/standard/recipe.js";

declare const completeConfig: StandardRecipeConfig;

const completeAsInput: StandardRecipeConfig = completeConfig;

// @ts-expect-error A persisted recipe config requires every stage.
const emptyComplete: StandardRecipeConfig = {};

void completeAsInput;
void emptyComplete;
