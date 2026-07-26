import type {
  RecipeDagStageInput,
  RecipeDagStepContractInput,
} from "@swooper/mapgen-core/authoring/recipe-dag";

import { config as biomesConfig } from "./stages/ecology/biomes/steps/biomes/config.js";
import { config as planFloodplainsConfig } from "./stages/ecology/features/steps/plan-floodplains/config.js";
import { config as planIceConfig } from "./stages/ecology/features/steps/plan-ice/config.js";
import { config as planPlotEffectsConfig } from "./stages/ecology/features/steps/plan-plot-effects/config.js";
import { config as planReefsConfig } from "./stages/ecology/features/steps/plan-reefs/config.js";
import { config as planVegetationConfig } from "./stages/ecology/features/steps/plan-vegetation/config.js";
import { config as planWetlandsConfig } from "./stages/ecology/features/steps/plan-wetlands/config.js";
import { config as scoreLayersConfig } from "./stages/ecology/features/steps/score-layers/config.js";
import { config as pedologyConfig } from "./stages/ecology/pedology/steps/pedology/config.js";
import { config as featuresApplyConfig } from "./stages/ecology/projection/steps/features-apply/config.js";
import { config as plotBiomesConfig } from "./stages/ecology/projection/steps/plot-biomes/config.js";
import { config as plotEffectsConfig } from "./stages/ecology/projection/steps/plot-effects/config.js";
import { config as crustConfig } from "./stages/foundation/lithosphere/steps/crust/config.js";
import { config as plateGraphConfig } from "./stages/foundation/lithosphere/steps/plate-graph/config.js";
import { config as mantleForcingConfig } from "./stages/foundation/mantle/steps/mantle-forcing/config.js";
import { config as mantlePotentialConfig } from "./stages/foundation/mantle/steps/mantle-potential/config.js";
import { config as meshConfig } from "./stages/foundation/mantle/steps/mesh/config.js";
import { config as crustEvolutionConfig } from "./stages/foundation/orogeny/steps/crust-evolution/config.js";
import { config as plateTopologyConfig } from "./stages/foundation/projection/steps/plate-topology/config.js";
import { config as projectionConfig } from "./stages/foundation/projection/steps/projection/config.js";
import { config as tectonicsConfig } from "./stages/foundation/tectonics/steps/tectonics/config.js";
import { config as climateBaselineConfig } from "./stages/hydrology/climate/baseline/steps/climate-baseline/config.js";
import { config as climateRefineConfig } from "./stages/hydrology/climate/refine/steps/climate-refine/config.js";
import { config as hydrologyLakesConfig } from "./stages/hydrology/hydrography/steps/lakes/config.js";
import { config as riversConfig } from "./stages/hydrology/hydrography/steps/rivers/config.js";
import { config as mapHydrologyLakesConfig } from "./stages/hydrology/projection/steps/lakes/config.js";
import { config as projectRainfallConfig } from "./stages/hydrology/projection/steps/project-rainfall/config.js";
import { config as plotRiversConfig } from "./stages/hydrology/rivers/steps/plot-rivers/config.js";
import { config as landmassPlatesConfig } from "./stages/morphology/coasts/steps/landmass-plates/config.js";
import { config as ruggedCoastsConfig } from "./stages/morphology/coasts/steps/rugged-coasts/config.js";
import { config as buildElevationConfig } from "./stages/morphology/elevation/steps/build-elevation/config.js";
import { config as geomorphologyConfig } from "./stages/morphology/erosion/steps/geomorphology/config.js";
import { config as islandsConfig } from "./stages/morphology/features/steps/islands/config.js";
import { config as landmassesConfig } from "./stages/morphology/features/steps/landmasses/config.js";
import { config as mountainsConfig } from "./stages/morphology/features/steps/mountains/config.js";
import { config as volcanoesConfig } from "./stages/morphology/features/steps/volcanoes/config.js";
import { config as plotCoastsConfig } from "./stages/morphology/projection/steps/plot-coasts/config.js";
import { config as plotContinentsConfig } from "./stages/morphology/projection/steps/plot-continents/config.js";
import { config as plotMountainsConfig } from "./stages/morphology/projection/steps/plot-mountains/config.js";
import { config as plotVolcanoesConfig } from "./stages/morphology/projection/steps/plot-volcanoes/config.js";
import { config as routingConfig } from "./stages/morphology/routing/steps/routing/config.js";
import { config as computeShelfConfig } from "./stages/morphology/shelf/steps/compute-shelf/config.js";
import { config as adjustResourcesConfig } from "./stages/placement/steps/adjust-resources/config.js";
import { config as assignAdvancedStartsConfig } from "./stages/placement/steps/assign-advanced-starts/config.js";
import { config as assignStartsConfig } from "./stages/placement/steps/assign-starts/config.js";
import { config as derivePlacementInputsConfig } from "./stages/placement/steps/derive-placement-inputs/config.js";
import { config as placeDiscoveriesConfig } from "./stages/placement/steps/place-discoveries/config.js";
import { config as placeNaturalWondersConfig } from "./stages/placement/steps/place-natural-wonders/config.js";
import { config as placeResourcesConfig } from "./stages/placement/steps/place-resources/config.js";
import { config as placementConfig } from "./stages/placement/steps/placement/config.js";
import { config as planResourcesConfig } from "./stages/placement/steps/plan-resources/config.js";
import { config as plotLandmassRegionsConfig } from "./stages/placement/steps/plot-landmass-regions/config.js";
import { config as preparePlacementSurfaceConfig } from "./stages/placement/steps/prepare-placement-surface/config.js";

export type StandardContractStageManifest = RecipeDagStageInput;

function stage(id: string, contracts: readonly RecipeDagStepContractInput[]): RecipeDagStageInput {
  return {
    id,
    steps: contracts.map((contract) => ({ contract })),
  };
}

/**
 * Canonical Standard recipe stage and step contract order shared by runtime
 * composition and Studio DAG projection. Each contract appears in its admitted
 * stage exactly once and array order is execution order.
 */
export const standardStageContractManifest = [
  stage("foundation-mantle", [meshConfig, mantlePotentialConfig, mantleForcingConfig]),
  stage("foundation-lithosphere", [crustConfig, plateGraphConfig]),
  stage("foundation-tectonics", [tectonicsConfig]),
  stage("foundation-orogeny", [crustEvolutionConfig]),
  stage("foundation-projection", [projectionConfig, plateTopologyConfig]),
  stage("morphology-coasts", [landmassPlatesConfig, ruggedCoastsConfig]),
  stage("morphology-routing", [routingConfig]),
  stage("morphology-erosion", [geomorphologyConfig]),
  stage("morphology-features", [islandsConfig, mountainsConfig, volcanoesConfig, landmassesConfig]),
  stage("morphology-shelf", [computeShelfConfig]),
  stage("hydrology-climate-baseline", [climateBaselineConfig]),
  stage("hydrology-hydrography", [riversConfig, hydrologyLakesConfig]),
  stage("hydrology-climate-refine", [climateRefineConfig]),
  stage("ecology-pedology", [pedologyConfig]),
  stage("ecology-biomes", [biomesConfig]),
  stage("map-morphology", [
    plotCoastsConfig,
    plotContinentsConfig,
    plotMountainsConfig,
    plotVolcanoesConfig,
  ]),
  stage("map-hydrology", [projectRainfallConfig, mapHydrologyLakesConfig]),
  stage("map-elevation", [buildElevationConfig]),
  stage("map-rivers", [plotRiversConfig]),
  stage("ecology-features", [
    scoreLayersConfig,
    planFloodplainsConfig,
    planIceConfig,
    planReefsConfig,
    planWetlandsConfig,
    planVegetationConfig,
    planPlotEffectsConfig,
  ]),
  stage("map-ecology", [plotBiomesConfig, featuresApplyConfig, plotEffectsConfig]),
  stage("placement", [
    derivePlacementInputsConfig,
    plotLandmassRegionsConfig,
    placeNaturalWondersConfig,
    preparePlacementSurfaceConfig,
    planResourcesConfig,
    assignStartsConfig,
    adjustResourcesConfig,
    placeResourcesConfig,
    placeDiscoveriesConfig,
    assignAdvancedStartsConfig,
    placementConfig,
  ]),
] as const satisfies readonly StandardContractStageManifest[];

export type StandardStageId = (typeof standardStageContractManifest)[number]["id"];

/**
 * Returns a fresh step list in canonical manifest order, rejecting any required step absent from
 * the supplied registry. Registry entries not named by the manifest are intentionally ignored.
 */
export function orderStandardStageSteps<const TStep extends { contract: { id: string } }>(
  stageId: StandardStageId,
  stepsById: Readonly<Record<string, TStep>>
): TStep[] {
  const stageManifest = standardStageContractManifest.find((stage) => stage.id === stageId);
  if (!stageManifest) throw new Error(`Unknown Standard stage contract manifest: ${stageId}`);
  return stageManifest.steps.map(({ contract }) => {
    const step = stepsById[contract.id];
    if (!step)
      throw new Error(`Missing runtime step "${contract.id}" for Standard stage "${stageId}"`);
    return step;
  });
}

/**
 * Resolves runtime stages into manifest order without mutating the supplied
 * registry. Missing registered stages fail immediately instead of producing a
 * partial recipe.
 */
export function orderStandardStages<const TStage extends { id: string }>(
  stagesById: Readonly<Record<StandardStageId, TStage>>
): TStage[] {
  return standardStageContractManifest.map((stage) => {
    const runtimeStage = stagesById[stage.id];
    if (!runtimeStage) throw new Error(`Missing runtime stage "${stage.id}" for Standard recipe`);
    return runtimeStage;
  });
}
