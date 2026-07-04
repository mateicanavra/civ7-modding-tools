import { artifact as biomeBindingsArtifact } from "./artifacts/biome-bindings.artifact.js";
import { artifact as biomeClassificationArtifact } from "./artifacts/biome-classification.artifact.js";
import { artifact as featureApplyDiagnosticsArtifact } from "./artifacts/feature-apply-diagnostics.artifact.js";
import { artifact as featureIntentsFloodplainsArtifact } from "./artifacts/feature-intents-floodplains.artifact.js";
import { artifact as featureIntentsIceArtifact } from "./artifacts/feature-intents-ice.artifact.js";
import { artifact as featureIntentsReefsArtifact } from "./artifacts/feature-intents-reefs.artifact.js";
import { artifact as featureIntentsVegetationArtifact } from "./artifacts/feature-intents-vegetation.artifact.js";
import { artifact as featureIntentsWetlandsArtifact } from "./artifacts/feature-intents-wetlands.artifact.js";
import { artifact as occupancyBaseArtifact } from "./artifacts/occupancy-base.artifact.js";
import { artifact as occupancyFloodplainsArtifact } from "./artifacts/occupancy-floodplains.artifact.js";
import { artifact as occupancyIceArtifact } from "./artifacts/occupancy-ice.artifact.js";
import { artifact as occupancyReefsArtifact } from "./artifacts/occupancy-reefs.artifact.js";
import { artifact as occupancyVegetationArtifact } from "./artifacts/occupancy-vegetation.artifact.js";
import { artifact as occupancyWetlandsArtifact } from "./artifacts/occupancy-wetlands.artifact.js";
import { artifact as pedologyArtifact } from "./artifacts/pedology.artifact.js";
import { artifact as plotEffectPlanArtifact } from "./artifacts/plot-effect-plan.artifact.js";
import { artifact as resourceBasinsArtifact } from "./artifacts/resource-basins.artifact.js";
import { artifact as scoreLayersArtifact } from "./artifacts/score-layers.artifact.js";

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
  biomeClassification: biomeClassificationArtifact,
  pedology: pedologyArtifact,
  resourceBasins: resourceBasinsArtifact,
  scoreLayers: scoreLayersArtifact,
  occupancyBase: occupancyBaseArtifact,
  occupancyFloodplains: occupancyFloodplainsArtifact,
  occupancyIce: occupancyIceArtifact,
  occupancyReefs: occupancyReefsArtifact,
  occupancyWetlands: occupancyWetlandsArtifact,
  occupancyVegetation: occupancyVegetationArtifact,
  featureIntentsVegetation: featureIntentsVegetationArtifact,
  featureIntentsWetlands: featureIntentsWetlandsArtifact,
  featureIntentsFloodplains: featureIntentsFloodplainsArtifact,
  featureIntentsReefs: featureIntentsReefsArtifact,
  featureIntentsIce: featureIntentsIceArtifact,
  plotEffectPlan: plotEffectPlanArtifact,
  biomeBindings: biomeBindingsArtifact,
  featureApplyDiagnostics: featureApplyDiagnosticsArtifact,
} as const;
