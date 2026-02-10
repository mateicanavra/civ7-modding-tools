import {
  collectCompileOps,
  createRecipe,
  type CompiledRecipeConfigOf,
  type RecipeConfigInputOf,
} from "@swooper/mapgen-core/authoring";
import ecologyDomain from "@mapgen/domain/ecology/ops";
import foundationDomain from "@mapgen/domain/foundation/ops";
import hydrologyDomain from "@mapgen/domain/hydrology/ops";
import morphologyDomain from "@mapgen/domain/morphology/ops";
import placementDomain from "@mapgen/domain/placement/ops";

import ecologyPedology from "./stages/ecology-pedology/index.js";
import ecologyBiomes from "./stages/ecology-biomes/index.js";
import ecologyFeaturesScore from "./stages/ecology-features-score/index.js";
import ecologyIce from "./stages/ecology-ice/index.js";
import ecologyReefs from "./stages/ecology-reefs/index.js";
import ecologyWetlands from "./stages/ecology-wetlands/index.js";
import ecologyVegetation from "./stages/ecology-vegetation/index.js";
import foundation from "./stages/foundation/index.js";
import hydrologyClimateBaseline from "./stages/hydrology-climate-baseline/index.js";
import hydrologyClimateRefine from "./stages/hydrology-climate-refine/index.js";
import hydrologyHydrography from "./stages/hydrology-hydrography/index.js";
import mapEcology from "./stages/map-ecology/index.js";
import mapHydrology from "./stages/map-hydrology/index.js";
import morphologyCoasts from "./stages/morphology-coasts/index.js";
import morphologyRouting from "./stages/morphology-routing/index.js";
import morphologyErosion from "./stages/morphology-erosion/index.js";
import morphologyFeatures from "./stages/morphology-features/index.js";
import mapMorphology from "./stages/map-morphology/index.js";
import placement from "./stages/placement/index.js";
import { STANDARD_TAG_DEFINITIONS } from "./tags.js";

const NAMESPACE = "mod-swooper-maps";
const stages = [
  foundation,
  morphologyCoasts,
  morphologyRouting,
  morphologyErosion,
  morphologyFeatures,
  hydrologyClimateBaseline,
  hydrologyHydrography,
  hydrologyClimateRefine,
  ecologyPedology,
  ecologyBiomes,
  ecologyFeaturesScore,
  ecologyIce,
  ecologyReefs,
  ecologyWetlands,
  ecologyVegetation,
  mapMorphology,
  mapHydrology,
  mapEcology,
  placement,
] as const;

export const STANDARD_STAGES = stages;

export type StandardRecipeConfig = RecipeConfigInputOf<typeof stages>;
export type StandardRecipeCompiledConfig = CompiledRecipeConfigOf<typeof stages>;

export const compileOpsById = collectCompileOps(
  foundationDomain,
  morphologyDomain,
  hydrologyDomain,
  ecologyDomain,
  placementDomain
);

export default createRecipe({
  id: "standard",
  namespace: NAMESPACE,
  tagDefinitions: STANDARD_TAG_DEFINITIONS,
  stages,
  compileOpsById,
} as const);
