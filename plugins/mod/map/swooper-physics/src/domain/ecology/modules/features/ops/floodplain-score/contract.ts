import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import {
  FLOODPLAIN_FEATURE_INTENT_KEYS,
  type FloodplainFeatureIntentKey,
} from "../../model/atoms/index.js";
import alluvialReliefDefinition from "./strategies/alluvial-relief/config.js";

const floodplainLayer = (description: string) => TypedArraySchemas.f32({ description });

const FLOODPLAIN_LAYER_DESCRIPTION = {
  "desert-floodplain-minor": "Desert minor-river floodplain suitability per tile.",
  "desert-floodplain-navigable": "Desert navigable-river floodplain suitability per tile.",
  "grassland-floodplain-minor": "Grassland minor-river floodplain suitability per tile.",
  "grassland-floodplain-navigable": "Grassland navigable-river floodplain suitability per tile.",
  "plains-floodplain-minor": "Plains minor-river floodplain suitability per tile.",
  "plains-floodplain-navigable": "Plains navigable-river floodplain suitability per tile.",
  "tropical-floodplain-minor": "Tropical minor-river floodplain suitability per tile.",
  "tropical-floodplain-navigable": "Tropical navigable-river floodplain suitability per tile.",
  "tundra-floodplain-minor": "Cold-biome minor-river floodplain suitability per tile.",
  "tundra-floodplain-navigable": "Cold-biome navigable-river floodplain suitability per tile.",
} as const satisfies Readonly<Record<FloodplainFeatureIntentKey, string>>;

/** Scores biome-specific minor and navigable floodplain habitat from admitted alluvial evidence. Every implementation shares this admitted input and output boundary. */
const FloodplainScoreContract = defineOp({
  kind: "compute",
  id: "ecology/features/floodplain-score",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
      height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
      seed: Type.Integer({
        minimum: 0,
        maximum: 2_147_483_647,
        description: "Deterministic alluvial patch seed derived by the invoking recipe step.",
      }),
      landMask: TypedArraySchemas.u8({
        description: "Post-hydrology Ecology land mask per tile (1=land, 0=water or lake).",
      }),
      biomeIndex: TypedArraySchemas.u8({
        description: "Stable Ecology biome index per tile.",
      }),
      fertility: TypedArraySchemas.f32({
        description: "Pedology fertility proxy per tile (0..1).",
      }),
      floodplainMask: TypedArraySchemas.u8({
        description: "Hydromorphic floodplain substrate mask per tile (1=eligible substrate).",
      }),
      navigableRiverMask: TypedArraySchemas.u8({
        description: "Materialized navigable-river terrain mask per tile.",
      }),
      discharge: TypedArraySchemas.f32({
        description: "Hydrology discharge proxy per tile.",
      }),
      elevation: TypedArraySchemas.i16({
        description: "Final topographic elevation in meters per tile.",
      }),
      mountainMask: TypedArraySchemas.u8({
        description: "Mountain exclusion mask per tile.",
      }),
      hillMask: TypedArraySchemas.u8({
        description: "Hill exclusion mask per tile.",
      }),
      volcanoMask: TypedArraySchemas.u8({
        description: "Volcano exclusion mask per tile.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Admitted Ecology, Hydrology, and Morphology evidence used to score physical floodplain habitat.",
    }
  ),
  output: Type.Object(
    {
      layers: Type.Object(
        Object.fromEntries(
          FLOODPLAIN_FEATURE_INTENT_KEYS.map((key) => [
            key,
            floodplainLayer(FLOODPLAIN_LAYER_DESCRIPTION[key]),
          ])
        ) as {
          [Key in FloodplainFeatureIntentKey]: ReturnType<typeof floodplainLayer>;
        },
        {
          additionalProperties: false,
          description:
            "Biome-specific floodplain suitability layers separated by minor and navigable river context.",
        }
      ),
    },
    {
      additionalProperties: false,
      description: "Closed floodplain suitability layers consumed by feature intent planning.",
    }
  ),
  strategies: [alluvialReliefDefinition],
});

export default FloodplainScoreContract;
