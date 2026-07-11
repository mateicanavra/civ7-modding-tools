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
  type RecipePublicConfigOf,
} from "@swooper/mapgen-core/authoring";
import { orderStandardStages } from "./contract-manifest.js";
import ecologyBiomes from "./stages/ecology-biomes/index.js";
import ecologyFeatures from "./stages/ecology-features/index.js";
import ecologyPedology from "./stages/ecology-pedology/index.js";
import foundationPlates from "./stages/foundation-lithosphere/index.js";
import foundationMantle from "./stages/foundation-mantle/index.js";
import foundationCrust from "./stages/foundation-orogeny/index.js";
import foundationProjection from "./stages/foundation-projection/index.js";
import foundationTectonics from "./stages/foundation-tectonics/index.js";
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
import morphologyShelf from "./stages/morphology-shelf/index.js";
import placement from "./stages/placement/index.js";
import { STANDARD_TAG_DEFINITIONS } from "./tags.js";

const NAMESPACE = "mod-swooper-maps";
const stages = orderStandardStages({
  "foundation-mantle": foundationMantle,
  "foundation-lithosphere": foundationPlates,
  "foundation-tectonics": foundationTectonics,
  "foundation-orogeny": foundationCrust,
  "foundation-projection": foundationProjection,
  "morphology-coasts": morphologyCoasts,
  "morphology-routing": morphologyRouting,
  "morphology-erosion": morphologyErosion,
  "morphology-features": morphologyFeatures,
  "morphology-shelf": morphologyShelf,
  "hydrology-climate-baseline": hydrologyClimateBaseline,
  "hydrology-hydrography": hydrologyHydrography,
  "hydrology-climate-refine": hydrologyClimateRefine,
  "ecology-pedology": ecologyPedology,
  "ecology-biomes": ecologyBiomes,
  "map-morphology": mapMorphology,
  "map-hydrology": mapHydrology,
  "map-elevation": mapElevation,
  "map-rivers": mapRivers,
  "ecology-features": ecologyFeatures,
  "map-ecology": mapEcology,
  placement,
} as const);

export const STANDARD_STAGES = stages;

export type StandardRecipeConfig = RecipePublicConfigOf<typeof stages>;
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
