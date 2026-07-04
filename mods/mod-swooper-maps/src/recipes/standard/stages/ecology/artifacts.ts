import { artifactContracts as ecologyArtifactContracts } from "./artifacts/index.js";

export {
  type BiomeBindingsArtifact,
  BiomeBindingsArtifactSchema,
} from "./artifacts/biome-bindings.artifact.js";
export {
  type BiomeClassificationArtifact,
  BiomeClassificationArtifactSchema,
} from "./artifacts/biome-classification.artifact.js";
export {
  type FeatureApplyDiagnosticsArtifact,
  FeatureApplyDiagnosticsArtifactSchema,
} from "./artifacts/feature-apply-diagnostics.artifact.js";
export {
  type FeatureIntentsListArtifact,
  FeatureIntentsListArtifactSchema,
  type FeaturePlacementIntent,
  FeaturePlacementIntentSchema,
} from "./artifacts/feature-intents-vegetation.artifact.js";
export {
  type OccupancyArtifact,
  OccupancyArtifactSchema,
} from "./artifacts/occupancy-base.artifact.js";
export { type PedologyArtifact, PedologyArtifactSchema } from "./artifacts/pedology.artifact.js";
export {
  PlotEffectPlacementIntentSchema,
  type PlotEffectPlanArtifact,
  PlotEffectPlanArtifactSchema,
} from "./artifacts/plot-effect-plan.artifact.js";
export {
  type ResourceBasinsArtifact,
  ResourceBasinsArtifactSchema,
} from "./artifacts/resource-basins.artifact.js";
export {
  type ScoreLayersArtifact,
  ScoreLayersArtifactSchema,
} from "./artifacts/score-layers.artifact.js";

export const ecologyArtifacts = {
  biomeClassification: ecologyArtifactContracts.biomeClassification.artifact,
  pedology: ecologyArtifactContracts.pedology.artifact,
  resourceBasins: ecologyArtifactContracts.resourceBasins.artifact,
  scoreLayers: ecologyArtifactContracts.scoreLayers.artifact,
  occupancyBase: ecologyArtifactContracts.occupancyBase.artifact,
  occupancyFloodplains: ecologyArtifactContracts.occupancyFloodplains.artifact,
  occupancyIce: ecologyArtifactContracts.occupancyIce.artifact,
  occupancyReefs: ecologyArtifactContracts.occupancyReefs.artifact,
  occupancyWetlands: ecologyArtifactContracts.occupancyWetlands.artifact,
  occupancyVegetation: ecologyArtifactContracts.occupancyVegetation.artifact,
  featureIntentsVegetation: ecologyArtifactContracts.featureIntentsVegetation.artifact,
  featureIntentsWetlands: ecologyArtifactContracts.featureIntentsWetlands.artifact,
  featureIntentsFloodplains: ecologyArtifactContracts.featureIntentsFloodplains.artifact,
  featureIntentsReefs: ecologyArtifactContracts.featureIntentsReefs.artifact,
  featureIntentsIce: ecologyArtifactContracts.featureIntentsIce.artifact,
  plotEffectPlan: ecologyArtifactContracts.plotEffectPlan.artifact,
  biomeBindings: ecologyArtifactContracts.biomeBindings.artifact,
  featureApplyDiagnostics: ecologyArtifactContracts.featureApplyDiagnostics.artifact,
} as const;
