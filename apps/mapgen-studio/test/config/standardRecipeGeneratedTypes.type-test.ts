import type { StandardRecipeConfig } from "mod-swooper-maps/recipes/standard";

const fixedProjectionConfig: StandardRecipeConfig["map-morphology"] = {};

// @ts-expect-error Generated configuration types reject fictional fixed-stage knobs.
const fixedProjectionKnobs: StandardRecipeConfig["map-morphology"] = { knobs: {} };

// @ts-expect-error Generated configuration types reject primitive fixed-stage values.
const fixedProjectionPrimitive: StandardRecipeConfig["map-morphology"] = 1;

void fixedProjectionConfig;
void fixedProjectionKnobs;
void fixedProjectionPrimitive;
