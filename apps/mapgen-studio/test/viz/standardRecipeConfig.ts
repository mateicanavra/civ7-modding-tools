import {
  admitStandardMapConfig,
  type StandardMapConfigEnvelope,
} from "mod-swooper-maps/maps/configs/canonical";
import { STANDARD_RECIPE_CONFIG_SCHEMA } from "mod-swooper-maps/recipes/standard-artifacts";

/** Admits a canonical envelope through the exact generated Studio recipe contract. */
export function studioStandardRecipeConfig(value: unknown): StandardMapConfigEnvelope["config"] {
  return admitStandardMapConfig(value, STANDARD_RECIPE_CONFIG_SCHEMA).config;
}
