import type {
  RecipeDagStageInput,
  RecipeDagStepContractInput,
} from "@swooper/mapgen-core/authoring/recipe-dag";

import { BiomesStepContract } from "./stages/ecology-biomes/steps/biomes/config.js";
import { PlanFloodplainsStepContract } from "./stages/ecology-features/steps/plan-floodplains/config.js";
import { PlanIceStepContract } from "./stages/ecology-features/steps/plan-ice/config.js";
import { PlanPlotEffectsStepContract } from "./stages/ecology-features/steps/plan-plot-effects/config.js";
import { PlanReefsStepContract } from "./stages/ecology-features/steps/plan-reefs/config.js";
import { PlanVegetationStepContract } from "./stages/ecology-features/steps/plan-vegetation/config.js";
import { PlanWetlandsStepContract } from "./stages/ecology-features/steps/plan-wetlands/config.js";
import { ScoreLayersStepContract } from "./stages/ecology-features/steps/score-layers/config.js";
import { PedologyStepContract } from "./stages/ecology-pedology/steps/pedology/config.js";
import { ResourceBasinsStepContract } from "./stages/ecology-pedology/steps/resource-basins/config.js";
import { CrustStepContract } from "./stages/foundation-lithosphere/steps/crust/config.js";
import { PlateGraphStepContract } from "./stages/foundation-lithosphere/steps/plate-graph/config.js";
import { MantleForcingStepContract } from "./stages/foundation-mantle/steps/mantle-forcing/config.js";
import { MantlePotentialStepContract } from "./stages/foundation-mantle/steps/mantle-potential/config.js";
import { MeshStepContract } from "./stages/foundation-mantle/steps/mesh/config.js";
import { CrustEvolutionStepContract } from "./stages/foundation-orogeny/steps/crust-evolution/config.js";
import { PlateTopologyStepContract } from "./stages/foundation-projection/steps/plate-topology/config.js";
import { ProjectionStepContract } from "./stages/foundation-projection/steps/projection/config.js";
import { PlateMotionStepContract } from "./stages/foundation-tectonics/steps/plate-motion/config.js";
import { TectonicsStepContract } from "./stages/foundation-tectonics/steps/tectonics/config.js";
import { ClimateBaselineStepContract } from "./stages/hydrology-climate-baseline/steps/climate-baseline/config.js";
import { ClimateRefineStepContract } from "./stages/hydrology-climate-refine/steps/climate-refine/config.js";
import { LakesStepContract as HydrologyLakesStepContract } from "./stages/hydrology-hydrography/steps/lakes/config.js";
import { RiversStepContract } from "./stages/hydrology-hydrography/steps/rivers/config.js";
import { FeaturesApplyStepContract } from "./stages/map-ecology/steps/features-apply/config.js";
import { PlotBiomesStepContract } from "./stages/map-ecology/steps/plot-biomes/config.js";
import { PlotEffectsStepContract } from "./stages/map-ecology/steps/plot-effects/config.js";
import { BuildElevationStepContract } from "./stages/map-elevation/steps/build-elevation/config.js";
import { LakesStepContract as MapHydrologyLakesStepContract } from "./stages/map-hydrology/steps/lakes/config.js";
import { ProjectRainfallStepContract } from "./stages/map-hydrology/steps/project-rainfall/config.js";
import { PlotCoastsStepContract } from "./stages/map-morphology/steps/plot-coasts/config.js";
import { PlotContinentsStepContract } from "./stages/map-morphology/steps/plot-continents/config.js";
import { PlotMountainsStepContract } from "./stages/map-morphology/steps/plot-mountains/config.js";
import { PlotVolcanoesStepContract } from "./stages/map-morphology/steps/plot-volcanoes/config.js";
import { PlotRiversStepContract } from "./stages/map-rivers/steps/plot-rivers/config.js";
import { LandmassPlatesStepContract } from "./stages/morphology-coasts/steps/landmass-plates/config.js";
import { RuggedCoastsStepContract } from "./stages/morphology-coasts/steps/rugged-coasts/config.js";
import { GeomorphologyStepContract } from "./stages/morphology-erosion/steps/geomorphology/config.js";
import { IslandsStepContract } from "./stages/morphology-features/steps/islands/config.js";
import { LandmassesStepContract } from "./stages/morphology-features/steps/landmasses/config.js";
import { MountainsStepContract } from "./stages/morphology-features/steps/mountains/config.js";
import { VolcanoesStepContract } from "./stages/morphology-features/steps/volcanoes/config.js";
import { RoutingStepContract } from "./stages/morphology-routing/steps/routing/config.js";
import { ComputeShelfStepContract } from "./stages/morphology-shelf/steps/compute-shelf/config.js";
import { AdjustResourcesStepContract } from "./stages/placement/steps/adjust-resources/config.js";
import { AssignAdvancedStartsStepContract } from "./stages/placement/steps/assign-advanced-starts/config.js";
import { AssignStartsStepContract } from "./stages/placement/steps/assign-starts/config.js";
import { DerivePlacementInputsStepContract } from "./stages/placement/steps/derive-placement-inputs/config.js";
import { PlaceDiscoveriesStepContract } from "./stages/placement/steps/place-discoveries/config.js";
import { PlaceNaturalWondersStepContract } from "./stages/placement/steps/place-natural-wonders/config.js";
import { PlaceResourcesStepContract } from "./stages/placement/steps/place-resources/config.js";
import { PlacementStepContract } from "./stages/placement/steps/placement/config.js";
import { PlanResourcesStepContract } from "./stages/placement/steps/plan-resources/config.js";
import { PlotLandmassRegionsStepContract } from "./stages/placement/steps/plot-landmass-regions/config.js";
import { PreparePlacementSurfaceStepContract } from "./stages/placement/steps/prepare-placement-surface/config.js";

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
  stage("foundation-mantle", [
    MeshStepContract,
    MantlePotentialStepContract,
    MantleForcingStepContract,
  ]),
  stage("foundation-lithosphere", [CrustStepContract, PlateGraphStepContract]),
  stage("foundation-tectonics", [PlateMotionStepContract, TectonicsStepContract]),
  stage("foundation-orogeny", [CrustEvolutionStepContract]),
  stage("foundation-projection", [ProjectionStepContract, PlateTopologyStepContract]),
  stage("morphology-coasts", [LandmassPlatesStepContract, RuggedCoastsStepContract]),
  stage("morphology-routing", [RoutingStepContract]),
  stage("morphology-erosion", [GeomorphologyStepContract]),
  stage("morphology-features", [
    IslandsStepContract,
    MountainsStepContract,
    VolcanoesStepContract,
    LandmassesStepContract,
  ]),
  stage("morphology-shelf", [ComputeShelfStepContract]),
  stage("hydrology-climate-baseline", [ClimateBaselineStepContract]),
  stage("hydrology-hydrography", [RiversStepContract, HydrologyLakesStepContract]),
  stage("hydrology-climate-refine", [ClimateRefineStepContract]),
  stage("ecology-pedology", [PedologyStepContract, ResourceBasinsStepContract]),
  stage("ecology-biomes", [BiomesStepContract]),
  stage("map-morphology", [
    PlotCoastsStepContract,
    PlotContinentsStepContract,
    PlotMountainsStepContract,
    PlotVolcanoesStepContract,
  ]),
  stage("map-hydrology", [ProjectRainfallStepContract, MapHydrologyLakesStepContract]),
  stage("map-elevation", [BuildElevationStepContract]),
  stage("map-rivers", [PlotRiversStepContract]),
  stage("ecology-features", [
    ScoreLayersStepContract,
    PlanFloodplainsStepContract,
    PlanIceStepContract,
    PlanReefsStepContract,
    PlanWetlandsStepContract,
    PlanVegetationStepContract,
    PlanPlotEffectsStepContract,
  ]),
  stage("map-ecology", [
    PlotBiomesStepContract,
    FeaturesApplyStepContract,
    PlotEffectsStepContract,
  ]),
  stage("placement", [
    DerivePlacementInputsStepContract,
    PlotLandmassRegionsStepContract,
    PlaceNaturalWondersStepContract,
    PreparePlacementSurfaceStepContract,
    PlanResourcesStepContract,
    AssignStartsStepContract,
    AdjustResourcesStepContract,
    PlaceResourcesStepContract,
    PlaceDiscoveriesStepContract,
    AssignAdvancedStartsStepContract,
    PlacementStepContract,
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
