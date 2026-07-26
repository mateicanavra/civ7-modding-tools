import placement from "@mapgen/domain/placement";
import { stableStringify } from "@swooper/mapgen-core";
import { fnv1a32BytesHex, fnv1a32StringHex } from "@swooper/mapgen-core/lib/hash";
import type { ReadonlyDeep, SetRequired } from "type-fest";
import { type Static, Type } from "typebox";

const HASH32_PATTERN = "^[0-9a-f]{8}$";
const MAX_INPUT_ROWS = 16;
const PARTS_PER_MILLION = 1_000_000;

type PlanNaturalWondersInput = Static<(typeof placement.wonders.ops.planNaturalWonders)["input"]>;
type PlanNaturalWondersStrategySelection = Static<
  (typeof placement.wonders.ops.planNaturalWonders)["config"]
>;
type StandardRequiredSuitabilitySurface =
  | "vegetationDensity"
  | "effectiveMoisture"
  | "surfaceTemperature"
  | "fertility"
  | "discharge"
  | "slopeClass";
type StandardPlanNaturalWondersInput = SetRequired<
  PlanNaturalWondersInput,
  StandardRequiredSuitabilitySurface
>;

/**
 * Exhaustive compile-time ownership ledger from every operation-input property
 * to its compact Standard measurement projection.
 *
 * Adding a planner-input property makes this declaration compiler-red until
 * the measurement assigns that causal channel an explicit evidence owner.
 */
const STANDARD_NATURAL_WONDER_PLANNER_INPUT_EVIDENCE_OWNERS = {
  width: "plannerInput.dimensions.width",
  height: "plannerInput.dimensions.height",
  wondersCount: "plannerInput.wondersCount",
  landMask: "plannerInput.surfaceDigests.landMaskHash32",
  elevation: "plannerInput.surfaceDigests.elevationHash32",
  aridityIndex: "plannerInput.surfaceDigests.aridityIndexHash32",
  riverClass: "plannerInput.surfaceDigests.riverClassHash32",
  lakeMask: "plannerInput.surfaceDigests.lakeMaskHash32",
  vegetationDensity: "plannerInput.surfaceDigests.vegetationDensityHash32",
  effectiveMoisture: "plannerInput.surfaceDigests.effectiveMoistureHash32",
  surfaceTemperature: "plannerInput.surfaceDigests.surfaceTemperatureHash32",
  fertility: "plannerInput.surfaceDigests.fertilityHash32",
  discharge: "plannerInput.surfaceDigests.dischargeHash32",
  slopeClass: "plannerInput.surfaceDigests.slopeClassHash32",
  coastTerrainType: "plannerInput.engineConstants.coastTerrainType",
  mountainTerrainType: "plannerInput.engineConstants.mountainTerrainType",
  iceFeatureType: "plannerInput.engineConstants.iceFeatureType",
  terrainType: "plannerInput.surfaceDigests.terrainTypeHash32",
  biomeType: "plannerInput.surfaceDigests.biomeTypeHash32",
  featureType: "plannerInput.surfaceDigests.featureTypeHash32",
  noFeatureType: "plannerInput.engineConstants.noFeatureType",
  naturalWonderBlockedMask: "plannerInput.surfaceDigests.naturalWonderBlockedMaskHash32",
  featureCatalog: "plannerInput.featureCatalog",
} as const satisfies Record<keyof PlanNaturalWondersInput, `plannerInput.${string}`>;
void STANDARD_NATURAL_WONDER_PLANNER_INPUT_EVIDENCE_OWNERS;

function digest(description: string) {
  return Type.String({ pattern: HASH32_PATTERN, description });
}

const PlannerSurfaceDigestsSchema = Type.Object(
  {
    version: Type.Literal(1, {
      description: "Schema version for the natural-wonder planner surface digest set.",
    }),
    plotCount: Type.Integer({
      minimum: 1,
      description: "Number of tiles represented by every planner surface digest.",
    }),
    landMaskHash32: digest(
      "Raw-byte digest of the Morphology land/water mask admitted by natural-wonder planning."
    ),
    elevationHash32: digest(
      "Raw-byte digest of the Morphology elevation field admitted by natural-wonder planning."
    ),
    aridityIndexHash32: digest(
      "Raw-byte digest of the Hydrology aridity field admitted by natural-wonder planning."
    ),
    riverClassHash32: digest(
      "Raw-byte digest of the Hydrology river hierarchy admitted by natural-wonder planning."
    ),
    lakeMaskHash32: digest(
      "Raw-byte digest of the accepted Hydrology lake intent admitted by natural-wonder planning."
    ),
    vegetationDensityHash32: digest(
      "Raw-byte digest of Ecology vegetation density admitted as a wonder suitability signal."
    ),
    effectiveMoistureHash32: digest(
      "Raw-byte digest of Hydrology effective moisture admitted as a wonder suitability signal."
    ),
    surfaceTemperatureHash32: digest(
      "Raw-byte digest of Hydrology surface temperature admitted as a wonder suitability signal."
    ),
    fertilityHash32: digest(
      "Raw-byte digest of Pedology fertility admitted as a wonder suitability signal."
    ),
    dischargeHash32: digest(
      "Raw-byte digest of Hydrology discharge admitted as a wonder suitability signal."
    ),
    slopeClassHash32: digest(
      "Raw-byte digest of Hydrology slope classes admitted as a wonder suitability signal."
    ),
    terrainTypeHash32: digest(
      "Raw-byte digest of current Civ7 terrain identities admitted by natural-wonder planning."
    ),
    biomeTypeHash32: digest(
      "Raw-byte digest of current Civ7 biome identities admitted by natural-wonder planning."
    ),
    featureTypeHash32: digest(
      "Raw-byte digest of current Civ7 feature occupancy admitted by natural-wonder planning."
    ),
    naturalWonderBlockedMaskHash32: digest(
      "Raw-byte digest of recipe-owned tiles excluded from natural-wonder planning."
    ),
  },
  {
    additionalProperties: false,
    description:
      "Bit-preserving digests of every complete typed-array surface admitted by the natural-wonder planner.",
  }
);

const PlannerInputSchema = Type.Object(
  {
    version: Type.Literal(1, {
      description: "Schema version for the natural-wonder planner causal-input projection.",
    }),
    dimensions: Type.Object(
      {
        width: Type.Integer({
          minimum: 1,
          description: "Admitted Civ7 map width supplied to natural-wonder planning.",
        }),
        height: Type.Integer({
          minimum: 1,
          description: "Admitted Civ7 map height supplied to natural-wonder planning.",
        }),
      },
      {
        additionalProperties: false,
        description: "Civ7 preset dimensions used by every planner surface and anchor.",
      }
    ),
    wondersCount: Type.Integer({
      minimum: 0,
      description: "Map-size-derived natural-wonder target count supplied to the planner.",
    }),
    engineConstants: Type.Object(
      {
        coastTerrainType: Type.Integer({
          minimum: 0,
          description: "Civ7 coast terrain identity used by coastal suitability scoring.",
        }),
        mountainTerrainType: Type.Integer({
          minimum: 0,
          description: "Civ7 mountain terrain identity used by hard terrain constraints.",
        }),
        iceFeatureType: Type.Integer({
          minimum: 0,
          description: "Civ7 ice feature identity excluded from natural-wonder anchors.",
        }),
        noFeatureType: Type.Integer({
          description: "Civ7 sentinel that denotes an unoccupied feature slot.",
        }),
      },
      {
        additionalProperties: false,
        description:
          "Static Civ7 identities that affect natural-wonder suitability or admissibility.",
      }
    ),
    featureCatalog: Type.Object(
      {
        count: Type.Integer({
          minimum: 0,
          description: "Number of policy-enriched natural-wonder catalog entries admitted.",
        }),
        featureTypes: Type.Array(Type.Integer({ minimum: 0 }), {
          description:
            "Natural-wonder feature identities in the exact order supplied to the planner.",
        }),
        canonicalHash32: digest(
          "Digest of the complete policy-enriched catalog after canonical JSON serialization."
        ),
      },
      {
        additionalProperties: false,
        description:
          "Compact identity of the exact catalog constraints and footprint geometry supplied to the planner.",
      }
    ),
    strategy: Type.Object(
      {
        id: Type.String({
          minLength: 1,
          description: "Selected implementation strategy for the natural-wonder operation.",
        }),
        configCanonicalJson: Type.String({
          description:
            "Exact selected strategy configuration serialized with deterministic object-key ordering.",
        }),
        configHash32: digest(
          "Digest of the canonical selected strategy configuration used by the planner."
        ),
      },
      {
        additionalProperties: false,
        description:
          "Selected natural-wonder strategy identity and its complete authored configuration.",
      }
    ),
    surfaceDigests: PlannerSurfaceDigestsSchema,
  },
  {
    additionalProperties: false,
    description:
      "Compact JSON-safe projection of every causal scalar, catalog, strategy setting, and surface admitted by natural-wonder planning.",
  }
);

const PlanningInputRowSchema = Type.Object(
  {
    plotIndex: Type.Integer({
      minimum: 0,
      description: "Linear map index of the selected natural-wonder anchor.",
    }),
    x: Type.Integer({
      minimum: 0,
      description: "Zero-based Civ7 map column of the selected anchor.",
    }),
    y: Type.Integer({
      minimum: 0,
      description: "Zero-based Civ7 map row of the selected anchor.",
    }),
    featureType: Type.Integer({
      minimum: 0,
      description: "Civ7 feature identity of the natural wonder planned at this anchor.",
    }),
    terrainType: Type.Integer({
      description: "Current Civ7 terrain identity admitted at the selected anchor.",
    }),
    biomeType: Type.Integer({
      description: "Current Civ7 biome identity admitted at the selected anchor.",
    }),
    occupiedFeatureType: Type.Integer({
      description:
        "Current Civ7 feature identity occupying the selected anchor before materialization.",
    }),
    elevation: Type.Integer({
      description: "Morphology elevation admitted at the selected anchor.",
    }),
    aridityPpm: Type.Integer({
      minimum: 0,
      maximum: PARTS_PER_MILLION,
      description:
        "Hydrology aridity admitted at the selected anchor, quantized to parts per million for readable evidence.",
    }),
    riverClass: Type.Integer({
      minimum: 0,
      description: "Hydrology river class admitted at the selected anchor.",
    }),
    lakeMask: Type.Integer({
      minimum: 0,
      maximum: 1,
      description: "Whether accepted Hydrology lake intent occupies the selected anchor.",
    }),
    blockedMask: Type.Integer({
      minimum: 0,
      maximum: 1,
      description: "Whether recipe policy excluded the selected anchor from placement.",
    }),
    landMask: Type.Integer({
      minimum: 0,
      maximum: 1,
      description: "Whether Morphology classifies the selected anchor as land.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Selected natural-wonder anchor paired with readable causal inputs observed at that tile.",
  }
);

/**
 * Closed Standard measurement of the exact admitted natural-wonder planner
 * request and the anchors it selected before Civ7 materialization.
 */
export const StandardNaturalWonderPlanInputMeasurementsSchema = Type.Object(
  {
    version: Type.Literal(2, {
      description: "Schema version for Standard natural-wonder planning-input measurements.",
    }),
    plannerInput: PlannerInputSchema,
    plannedCount: Type.Integer({
      minimum: 0,
      description: "Number of natural-wonder anchors selected by the admitted plan.",
    }),
    rows: Type.Array(PlanningInputRowSchema, {
      maxItems: MAX_INPUT_ROWS,
      description:
        "Bounded selected-anchor sample used to explain a planning divergence without retaining mutable map surfaces.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Standard product evidence that identifies the complete admitted planner request and its selected anchors.",
  }
);

/** Measurements projected from one completed Standard natural-wonder planning step. */
export type StandardNaturalWonderPlanInputMeasurements = ReadonlyDeep<
  Static<typeof StandardNaturalWonderPlanInputMeasurementsSchema>
>;

/** Stable metric projection key for Standard natural-wonder planning-input evidence. */
export const STANDARD_NATURAL_WONDER_PLAN_INPUT_METRIC_KEY =
  "placement.naturalWonderPlanInput" as const;

/** Exact Standard planner request and selected strategy needed to measure one admitted plan. */
export type StandardNaturalWonderPlanInputMeasurementInput = Readonly<{
  plannerInput: StandardPlanNaturalWondersInput;
  strategySelection: PlanNaturalWondersStrategySelection;
  plan: Readonly<{
    plannedCount: number;
    placements: readonly Readonly<{ plotIndex: number; featureType: number }>[];
  }>;
}>;

/**
 * Closes the exact admitted natural-wonder planner request into deterministic,
 * JSON-safe product evidence without retaining any mutable source surface.
 */
export function measureStandardNaturalWonderPlanInput({
  plannerInput,
  strategySelection,
  plan,
}: StandardNaturalWonderPlanInputMeasurementInput): StandardNaturalWonderPlanInputMeasurements {
  const plotCount = plannerInput.width * plannerInput.height;
  const configCanonicalJson = stableStringify(strategySelection.config);
  const featureCatalogCanonicalJson = stableStringify(plannerInput.featureCatalog);
  const rows = Object.freeze(
    plan.placements.slice(0, MAX_INPUT_ROWS).map((placement) => {
      const plotIndex = placement.plotIndex;
      const y = Math.floor(plotIndex / plannerInput.width);
      const x = plotIndex - y * plannerInput.width;
      return Object.freeze({
        plotIndex,
        x,
        y,
        featureType: placement.featureType,
        terrainType: requiredSurfaceValue(plannerInput.terrainType, plotIndex, "terrainType"),
        biomeType: requiredSurfaceValue(plannerInput.biomeType, plotIndex, "biomeType"),
        occupiedFeatureType: requiredSurfaceValue(
          plannerInput.featureType,
          plotIndex,
          "featureType"
        ),
        elevation: requiredSurfaceValue(plannerInput.elevation, plotIndex, "elevation"),
        aridityPpm: quantizePpm(
          requiredSurfaceValue(plannerInput.aridityIndex, plotIndex, "aridityIndex")
        ),
        riverClass: requiredSurfaceValue(plannerInput.riverClass, plotIndex, "riverClass"),
        lakeMask: requiredSurfaceValue(plannerInput.lakeMask, plotIndex, "lakeMask"),
        blockedMask: requiredSurfaceValue(
          plannerInput.naturalWonderBlockedMask,
          plotIndex,
          "naturalWonderBlockedMask"
        ),
        landMask: requiredSurfaceValue(plannerInput.landMask, plotIndex, "landMask"),
      });
    })
  );

  return Object.freeze({
    version: 2,
    plannerInput: Object.freeze({
      version: 1,
      dimensions: Object.freeze({
        width: plannerInput.width,
        height: plannerInput.height,
      }),
      wondersCount: plannerInput.wondersCount,
      engineConstants: Object.freeze({
        coastTerrainType: plannerInput.coastTerrainType,
        mountainTerrainType: plannerInput.mountainTerrainType,
        iceFeatureType: plannerInput.iceFeatureType,
        noFeatureType: plannerInput.noFeatureType,
      }),
      featureCatalog: Object.freeze({
        count: plannerInput.featureCatalog.length,
        featureTypes: Object.freeze(
          plannerInput.featureCatalog.map(({ featureType }) => featureType)
        ),
        canonicalHash32: fnv1a32StringHex(featureCatalogCanonicalJson),
      }),
      strategy: Object.freeze({
        id: strategySelection.strategy,
        configCanonicalJson,
        configHash32: fnv1a32StringHex(configCanonicalJson),
      }),
      surfaceDigests: Object.freeze({
        version: 1,
        plotCount,
        landMaskHash32: fnv1a32BytesHex(plannerInput.landMask),
        elevationHash32: fnv1a32BytesHex(plannerInput.elevation),
        aridityIndexHash32: fnv1a32BytesHex(plannerInput.aridityIndex),
        riverClassHash32: fnv1a32BytesHex(plannerInput.riverClass),
        lakeMaskHash32: fnv1a32BytesHex(plannerInput.lakeMask),
        vegetationDensityHash32: fnv1a32BytesHex(plannerInput.vegetationDensity),
        effectiveMoistureHash32: fnv1a32BytesHex(plannerInput.effectiveMoisture),
        surfaceTemperatureHash32: fnv1a32BytesHex(plannerInput.surfaceTemperature),
        fertilityHash32: fnv1a32BytesHex(plannerInput.fertility),
        dischargeHash32: fnv1a32BytesHex(plannerInput.discharge),
        slopeClassHash32: fnv1a32BytesHex(plannerInput.slopeClass),
        terrainTypeHash32: fnv1a32BytesHex(plannerInput.terrainType),
        biomeTypeHash32: fnv1a32BytesHex(plannerInput.biomeType),
        featureTypeHash32: fnv1a32BytesHex(plannerInput.featureType),
        naturalWonderBlockedMaskHash32: fnv1a32BytesHex(plannerInput.naturalWonderBlockedMask),
      }),
    }),
    plannedCount: plan.plannedCount,
    rows,
  });
}

function requiredSurfaceValue(
  values: ArrayLike<number>,
  plotIndex: number,
  channel: string
): number {
  const value = values[plotIndex];
  if (value === undefined) {
    throw new Error(
      `Admitted natural-wonder plan anchor ${plotIndex} is outside planner input "${channel}".`
    );
  }
  return value;
}

function quantizePpm(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error("Natural-wonder planner aridity evidence must be finite.");
  }
  return Math.max(0, Math.min(PARTS_PER_MILLION, Math.round(value * PARTS_PER_MILLION)));
}
