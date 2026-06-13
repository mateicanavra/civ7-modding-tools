import ecologyDomain from "@mapgen/domain/ecology/ops";
import foundationDomain from "@mapgen/domain/foundation/ops";
import hydrologyDomain from "@mapgen/domain/hydrology/ops";
import morphologyDomain from "@mapgen/domain/morphology/ops";
import placementDomain from "@mapgen/domain/placement/ops";
import resourcesDomain from "@mapgen/domain/resources/ops";
import {
  type CompiledRecipeConfigOf,
  collectCompileOps,
  createRecipe,
  type RecipeConfigInputOf,
} from "@swooper/mapgen-core/authoring";
import ecologyBiomes from "./stages/ecology-biomes/index.js";
import ecologyFeatures from "./stages/ecology-features/index.js";
import ecologyPedology from "./stages/ecology-pedology/index.js";
import foundation from "./stages/foundation/index.js";
import hydrologyClimateBaseline from "./stages/hydrology-climate-baseline/index.js";
import hydrologyClimateRefine from "./stages/hydrology-climate-refine/index.js";
import hydrologyHydrography from "./stages/hydrology-hydrography/index.js";
import mapEcology from "./stages/map-ecology/index.js";
import mapElevation from "./stages/map-elevation/index.js";
import mapHydrology from "./stages/map-hydrology/index.js";
import mapMorphology from "./stages/map-morphology/index.js";
import mapRivers from "./stages/map-rivers/index.js";
import morphologyCoasts from "./stages/morphology-coasts/index.js";
import morphologyErosion from "./stages/morphology-erosion/index.js";
import morphologyFeatures from "./stages/morphology-features/index.js";
import morphologyRouting from "./stages/morphology-routing/index.js";
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
  mapMorphology,
  mapHydrology,
  mapElevation,
  mapRivers,
  ecologyFeatures,
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
  placementDomain,
  resourcesDomain
);

export default createRecipe({
  id: "standard",
  namespace: NAMESPACE,
  tagDefinitions: STANDARD_TAG_DEFINITIONS,
  stages,
  compileOpsById,
} as const);
