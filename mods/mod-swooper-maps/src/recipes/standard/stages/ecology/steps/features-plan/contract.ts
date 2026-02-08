import { Type, defineStep, type Static, type TSchema } from "@swooper/mapgen-core/authoring";
import ecology from "@mapgen/domain/ecology";
import { ecologyArtifacts } from "../../artifacts.js";
import { hydrologyHydrographyArtifacts } from "../../../hydrology-hydrography/artifacts.js";
import { morphologyArtifacts } from "../../../morphology/artifacts.js";

function createOpSelectionSchema<TSelection>(op: { id: string; strategies: Record<string, TSchema> }) {
  const strategyIds = Object.keys(op.strategies);
  if (strategyIds.length === 0) {
    throw new Error(`op(${op.id}) missing strategies`);
  }

  // IMPORTANT: do not set a default on this schema. These keys must stay absent unless the author provides them.
  const cases = strategyIds.map((id) =>
    Type.Object(
      {
        strategy: Type.Literal(id),
        config: op.strategies[id]!,
      },
      { additionalProperties: false }
    )
  );

  return Type.Unsafe<TSelection>(Type.Union(cases as [TSchema, ...TSchema[]]));
}

type VegetatedFeaturePlacementsSelection = Static<
  (typeof ecology.ops.planVegetatedFeaturePlacements)["config"]
>;
type WetFeaturePlacementsSelection = Static<(typeof ecology.ops.planWetFeaturePlacements)["config"]>;

const VegetatedFeaturePlacementsSelectionSchema = createOpSelectionSchema<VegetatedFeaturePlacementsSelection>(
  ecology.ops.planVegetatedFeaturePlacements
);

const WetFeaturePlacementsSelectionSchema = createOpSelectionSchema<WetFeaturePlacementsSelection>(
  ecology.ops.planWetFeaturePlacements
);

const FeaturesPlanStepContract = defineStep({
  id: "features-plan",
  phase: "ecology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      ecologyArtifacts.biomeClassification,
      ecologyArtifacts.pedology,
      hydrologyHydrographyArtifacts.hydrography,
      morphologyArtifacts.topography,
    ],
    provides: [ecologyArtifacts.featureIntents],
  },
  ops: {
    vegetation: ecology.ops.planVegetation,
    wetlands: ecology.ops.planWetlands,
    reefs: ecology.ops.planReefs,
    ice: ecology.ops.planIce,
    advancedVegetatedFeaturePlacements: {
      contract: ecology.ops.planVegetatedFeaturePlacements,
      defaultStrategy: "disabled",
    },
    advancedWetFeaturePlacements: {
      contract: ecology.ops.planWetFeaturePlacements,
      defaultStrategy: "disabled",
    },
  },
  schema: Type.Object(
    {
      vegetatedFeaturePlacements: Type.Optional(VegetatedFeaturePlacementsSelectionSchema),
      wetFeaturePlacements: Type.Optional(WetFeaturePlacementsSelectionSchema),
    },
    {
      description: "Configuration for planning vegetation, wetlands, reefs, and ice features.",
    }
  ),
});

export default FeaturesPlanStepContract;
