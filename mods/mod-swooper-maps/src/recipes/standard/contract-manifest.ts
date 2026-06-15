import type {
  RecipeDagStageInput,
  RecipeDagStepContractInput,
} from "@swooper/mapgen-core/authoring/recipe-dag";

import BiomesStepContract from "./stages/ecology-biomes/steps/biomes/contract.js";
import PlanFloodplainsStepContract from "./stages/ecology-features/steps/plan-floodplains/contract.js";
import PlanIceStepContract from "./stages/ecology-features/steps/plan-ice/contract.js";
import PlanPlotEffectsStepContract from "./stages/ecology-features/steps/plan-plot-effects/contract.js";
import PlanReefsStepContract from "./stages/ecology-features/steps/plan-reefs/contract.js";
import PlanVegetationStepContract from "./stages/ecology-features/steps/plan-vegetation/contract.js";
import PlanWetlandsStepContract from "./stages/ecology-features/steps/plan-wetlands/contract.js";
import ScoreLayersStepContract from "./stages/ecology-features/steps/score-layers/contract.js";
import PedologyStepContract from "./stages/ecology-pedology/steps/pedology/contract.js";
import ResourceBasinsStepContract from "./stages/ecology-pedology/steps/resource-basins/contract.js";
import CrustStepContract from "./stages/foundation/steps/crust.contract.js";
import CrustEvolutionStepContract from "./stages/foundation/steps/crustEvolution.contract.js";
import MantleForcingStepContract from "./stages/foundation/steps/mantleForcing.contract.js";
import MantlePotentialStepContract from "./stages/foundation/steps/mantlePotential.contract.js";
import MeshStepContract from "./stages/foundation/steps/mesh.contract.js";
import PlateGraphStepContract from "./stages/foundation/steps/plateGraph.contract.js";
import PlateMotionStepContract from "./stages/foundation/steps/plateMotion.contract.js";
import PlateTopologyStepContract from "./stages/foundation/steps/plateTopology.contract.js";
import ProjectionStepContract from "./stages/foundation/steps/projection.contract.js";
import TectonicsStepContract from "./stages/foundation/steps/tectonics.contract.js";
import ClimateBaselineStepContract from "./stages/hydrology-climate-baseline/steps/climateBaseline.contract.js";
import ClimateRefineStepContract from "./stages/hydrology-climate-refine/steps/climateRefine.contract.js";
import HydrologyLakesStepContract from "./stages/hydrology-hydrography/steps/lakes.contract.js";
import RiversStepContract from "./stages/hydrology-hydrography/steps/rivers.contract.js";
import FeaturesApplyStepContract from "./stages/map-ecology/steps/features-apply/contract.js";
import PlotEffectsStepContract from "./stages/map-ecology/steps/plot-effects/contract.js";
import PlotBiomesStepContract from "./stages/map-ecology/steps/plotBiomes.contract.js";
import BuildElevationStepContract from "./stages/map-elevation/steps/buildElevation.contract.js";
import MapHydrologyLakesStepContract from "./stages/map-hydrology/steps/lakes.contract.js";
import PlotCoastsStepContract from "./stages/map-morphology/steps/plotCoasts.contract.js";
import PlotContinentsStepContract from "./stages/map-morphology/steps/plotContinents.contract.js";
import PlotMountainsStepContract from "./stages/map-morphology/steps/plotMountains.contract.js";
import PlotVolcanoesStepContract from "./stages/map-morphology/steps/plotVolcanoes.contract.js";
import PlotRiversStepContract from "./stages/map-rivers/steps/plotRivers.contract.js";
import LandmassPlatesStepContract from "./stages/morphology-coasts/steps/landmassPlates.contract.js";
import RuggedCoastsStepContract from "./stages/morphology-coasts/steps/ruggedCoasts.contract.js";
import GeomorphologyStepContract from "./stages/morphology-erosion/steps/geomorphology.contract.js";
import IslandsStepContract from "./stages/morphology-features/steps/islands.contract.js";
import LandmassesStepContract from "./stages/morphology-features/steps/landmasses.contract.js";
import MountainsStepContract from "./stages/morphology-features/steps/mountains.contract.js";
import VolcanoesStepContract from "./stages/morphology-features/steps/volcanoes.contract.js";
import RoutingStepContract from "./stages/morphology-routing/steps/routing.contract.js";
import AdjustResourcesStepContract from "./stages/placement/steps/adjust-resources/contract.js";
import AssignAdvancedStartsStepContract from "./stages/placement/steps/assign-advanced-starts/contract.js";
import AssignStartsStepContract from "./stages/placement/steps/assign-starts/contract.js";
import DerivePlacementInputsContract from "./stages/placement/steps/derive-placement-inputs/contract.js";
import PlaceDiscoveriesStepContract from "./stages/placement/steps/place-discoveries/contract.js";
import PlaceNaturalWondersStepContract from "./stages/placement/steps/place-natural-wonders/contract.js";
import PlaceResourcesStepContract from "./stages/placement/steps/place-resources/contract.js";
import PlacementStepContract from "./stages/placement/steps/placement/contract.js";
import PlanResourcesStepContract from "./stages/placement/steps/plan-resources/contract.js";
import PlotLandmassRegionsStepContract from "./stages/placement/steps/plot-landmass-regions/contract.js";
import PreparePlacementSurfaceStepContract from "./stages/placement/steps/prepare-placement-surface/contract.js";

export type StandardContractStageManifest = RecipeDagStageInput;

function stage(id: string, contracts: readonly RecipeDagStepContractInput[]): RecipeDagStageInput {
  return {
    id,
    steps: contracts.map((contract) => ({ contract })),
  };
}

export const standardStageContractManifest = [
  stage("foundation", [
    MeshStepContract,
    MantlePotentialStepContract,
    MantleForcingStepContract,
    CrustStepContract,
    PlateGraphStepContract,
    PlateMotionStepContract,
    TectonicsStepContract,
    CrustEvolutionStepContract,
    ProjectionStepContract,
    PlateTopologyStepContract,
  ]),
  stage("morphology-coasts", [LandmassPlatesStepContract, RuggedCoastsStepContract]),
  stage("morphology-routing", [RoutingStepContract]),
  stage("morphology-erosion", [GeomorphologyStepContract]),
  stage("morphology-features", [
    IslandsStepContract,
    MountainsStepContract,
    VolcanoesStepContract,
    LandmassesStepContract,
  ]),
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
  stage("map-hydrology", [MapHydrologyLakesStepContract]),
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
    DerivePlacementInputsContract,
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

export function orderStandardStages<const TStage extends { id: string }>(
  stagesById: Readonly<Record<StandardStageId, TStage>>
): TStage[] {
  return standardStageContractManifest.map((stage) => {
    const runtimeStage = stagesById[stage.id];
    if (!runtimeStage) throw new Error(`Missing runtime stage "${stage.id}" for Standard recipe`);
    return runtimeStage;
  });
}
