// Equality between a proved live-game source snapshot and the current Studio
// authoring model. Drives whether "Sync from Live Game" / "Run in Game" relation
// states are offered — its semantics are PARITY-CRITICAL and reproduced verbatim
// from `App.tsx` (app-decomposition slice).

import type {
  PipelineConfig,
  RecipeSettings,
  WorldSettings,
} from "@swooper/mapgen-studio-ui/types";
import { configsEqual } from "../../ui/utils/config";
import { type Civ7StudioSetupConfig, studioSetupConfigsEqual } from "../civ7Setup/setupConfig";
import type { RunInGameSourceSnapshot } from "./clientState";

export type LastRunSnapshot = {
  worldSettings: WorldSettings;
  recipeSettings: RecipeSettings;
  pipelineConfig: PipelineConfig;
};

export function liveSourceMatchesStudio(args: {
  source: RunInGameSourceSnapshot;
  recipeSettings: RecipeSettings;
  worldSettings: WorldSettings;
  pipelineConfig: PipelineConfig;
  setupConfig: Civ7StudioSetupConfig;
}): boolean {
  return (
    args.source.recipeSettings.recipe === args.recipeSettings.recipe &&
    args.source.recipeSettings.seed === args.recipeSettings.seed &&
    args.source.worldSettings.mapSize === args.worldSettings.mapSize &&
    args.source.worldSettings.playerCount === args.worldSettings.playerCount &&
    args.source.worldSettings.resources === args.worldSettings.resources &&
    studioSetupConfigsEqual(args.source.setupConfig, args.setupConfig) &&
    configsEqual(args.source.pipelineConfig, args.pipelineConfig)
  );
}
