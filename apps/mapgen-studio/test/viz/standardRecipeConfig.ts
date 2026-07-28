import { STANDARD_RECIPE_CONFIG_SCHEMA } from "@swooper/swooper-physics/standard/artifacts";
import {
  admitStandardMapConfig,
  type StandardMapConfigEnvelope,
} from "@swooper/swooper-physics/standard/map-config";

/** Admits a canonical envelope through the exact generated Studio recipe contract. */
export function studioStandardRecipeConfig(value: unknown): StandardMapConfigEnvelope["config"] {
  return admitStandardMapConfig(value, STANDARD_RECIPE_CONFIG_SCHEMA).config;
}
