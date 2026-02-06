import { Type, createStage, type Static } from "@swooper/mapgen-core/authoring";
import { crust, mesh, plateGraph, plateTopology, projection, tectonics } from "./steps/index.js";
import {
  FoundationPlateActivityKnobSchema,
  FoundationPlateCountKnobSchema,
} from "@mapgen/domain/foundation/shared/knobs.js";

const FoundationResolutionProfileSchema = Type.Union(
  [Type.Literal("coarse"), Type.Literal("balanced"), Type.Literal("fine"), Type.Literal("ultra")],
  {
    description: "Resolution profile for Foundation authoring.",
    default: "balanced",
  }
);

const FoundationLithosphereProfileSchema = Type.Literal("maximal-basaltic-lid-v1", {
  description: "Lithosphere profile identifier.",
  default: "maximal-basaltic-lid-v1",
});

const FoundationMantleProfileSchema = Type.Literal("maximal-potential-v1", {
  description: "Mantle profile identifier.",
  default: "maximal-potential-v1",
});

/**
 * Foundation knobs (plateCount/plateActivity). Knobs apply after defaulted step config as deterministic transforms.
 */
const knobsSchema = Type.Object(
  {
    plateCount: FoundationPlateCountKnobSchema,
    plateActivity: FoundationPlateActivityKnobSchema,
  },
  {
    description:
      "Foundation knobs (plateCount/plateActivity). Knobs apply after defaulted step config as deterministic transforms.",
  }
);

const advancedSchema = Type.Object(
  {
    mantleForcing: Type.Optional(
      Type.Object(
        {
          potentialMode: Type.Optional(Type.Literal("default")),
          potentialAmplitude01: Type.Optional(Type.Number({ minimum: 0, maximum: 1 })),
          plumeCount: Type.Optional(Type.Integer({ minimum: 0, maximum: 128 })),
          downwellingCount: Type.Optional(Type.Integer({ minimum: 0, maximum: 128 })),
          lengthScale01: Type.Optional(Type.Number({ minimum: 0, maximum: 1 })),
        },
        { additionalProperties: false }
      )
    ),
    lithosphere: Type.Optional(
      Type.Object(
        {
          yieldStrength01: Type.Optional(Type.Number({ minimum: 0, maximum: 1 })),
          mantleCoupling01: Type.Optional(Type.Number({ minimum: 0, maximum: 1 })),
          riftWeakening01: Type.Optional(Type.Number({ minimum: 0, maximum: 1 })),
        },
        { additionalProperties: false }
      )
    ),
  },
  { additionalProperties: false }
);

const profilesSchema = Type.Object(
  {
    resolutionProfile: FoundationResolutionProfileSchema,
    lithosphereProfile: FoundationLithosphereProfileSchema,
    mantleProfile: FoundationMantleProfileSchema,
  },
  { additionalProperties: false }
);

/**
 * Foundation authoring surface (D08r).
 * Note: `knobs` are modeled via `knobsSchema` and injected into the stage surface.
 */
const publicSchema = Type.Object(
  {
    version: Type.Literal(1, { default: 1 }),
    profiles: profilesSchema,
    advanced: Type.Optional(advancedSchema),
  },
  { additionalProperties: false }
);

type ResolutionProfile = Static<typeof FoundationResolutionProfileSchema>;
type FoundationStageCompileConfig = Static<typeof publicSchema>;

const COMMON_TECTONIC_SEGMENTS = {
  intensityScale: 180,
  regimeMinIntensity: 4,
} as const;

const COMMON_TECTONIC_HISTORY = {
  eraWeights: [0.35, 0.35, 0.3],
  driftStepsByEra: [2, 1, 0],
  beltInfluenceDistance: 8,
  beltDecay: 0.55,
  activityThreshold: 1,
} as const;

type CrustDefaults = Readonly<{
  continentalRatio: number;
  shelfWidthCells: number;
  shelfElevationBoost: number;
  marginElevationPenalty: number;
  continentalBaseElevation: number;
  continentalAgeBoost: number;
  oceanicBaseElevation: number;
  oceanicAgeDepth: number;
}>;

const COMMON_CRUST_BALANCED: CrustDefaults = {
  continentalRatio: 0.29,
  shelfWidthCells: 6,
  shelfElevationBoost: 0.12,
  marginElevationPenalty: 0.04,
  continentalBaseElevation: 0.78,
  continentalAgeBoost: 0.12,
  oceanicBaseElevation: 0.32,
  oceanicAgeDepth: 0.22,
};

const COMMON_CRUST_STANDARD: CrustDefaults = {
  continentalRatio: 0.3,
  shelfWidthCells: 6,
  shelfElevationBoost: 0.12,
  marginElevationPenalty: 0.04,
  continentalBaseElevation: 0.78,
  continentalAgeBoost: 0.12,
  oceanicBaseElevation: 0.32,
  oceanicAgeDepth: 0.22,
};

const FOUNDATION_PROFILE_DEFAULTS: Readonly<
  Record<
    ResolutionProfile,
    Readonly<{
      plateCount: number;
      mesh: Readonly<{
        cellsPerPlate: number;
        relaxationSteps: number;
        referenceArea: number;
        plateScalePower: number;
      }>;
      crust: CrustDefaults;
      plateGraph: Readonly<{ referenceArea: number; plateScalePower: number }>;
      projection: Readonly<{
        boundaryInfluenceDistance: number;
        boundaryDecay: number;
        movementScale: number;
        rotationScale: number;
      }>;
    }>
  >
> = {
  coarse: {
    plateCount: 9,
    mesh: {
      cellsPerPlate: 5,
      relaxationSteps: 5,
      referenceArea: 4000,
      plateScalePower: 0.6,
    },
    crust: COMMON_CRUST_STANDARD,
    plateGraph: {
      referenceArea: 4000,
      plateScalePower: 0.6,
    },
    projection: {
      boundaryInfluenceDistance: 5,
      boundaryDecay: 0.55,
      movementScale: 100,
      rotationScale: 100,
    },
  },
  balanced: {
    plateCount: 28,
    mesh: {
      cellsPerPlate: 14,
      relaxationSteps: 4,
      referenceArea: 6996,
      plateScalePower: 0.65,
    },
    crust: COMMON_CRUST_BALANCED,
    plateGraph: {
      referenceArea: 6996,
      plateScalePower: 0.65,
    },
    projection: {
      boundaryInfluenceDistance: 12,
      boundaryDecay: 0.5,
      movementScale: 65,
      rotationScale: 80,
    },
  },
  fine: {
    plateCount: 28,
    mesh: {
      cellsPerPlate: 2,
      relaxationSteps: 6,
      referenceArea: 4000,
      plateScalePower: 0.5,
    },
    crust: COMMON_CRUST_STANDARD,
    plateGraph: {
      referenceArea: 4000,
      plateScalePower: 0.5,
    },
    projection: {
      boundaryInfluenceDistance: 5,
      boundaryDecay: 0.55,
      movementScale: 100,
      rotationScale: 100,
    },
  },
  ultra: {
    plateCount: 32,
    mesh: {
      cellsPerPlate: 2,
      relaxationSteps: 4,
      referenceArea: 4000,
      plateScalePower: 0.5,
    },
    crust: COMMON_CRUST_STANDARD,
    plateGraph: {
      referenceArea: 4000,
      plateScalePower: 0.5,
    },
    projection: {
      boundaryInfluenceDistance: 5,
      boundaryDecay: 0.55,
      movementScale: 100,
      rotationScale: 100,
    },
  },
} as const;

const DEFAULT_PROFILES = {
  resolutionProfile: "balanced",
  lithosphereProfile: "maximal-basaltic-lid-v1",
  mantleProfile: "maximal-potential-v1",
} as const;

const FOUNDATION_STEP_IDS = [
  "mesh",
  "crust",
  "plate-graph",
  "tectonics",
  "projection",
  "plate-topology",
] as const;

function clampInt(value: number, bounds: { min: number; max?: number }): number {
  const rounded = Math.round(value);
  const max = bounds.max ?? Number.POSITIVE_INFINITY;
  return Math.max(bounds.min, Math.min(max, rounded));
}

export default createStage({
  id: "foundation",
  knobsSchema,
  public: publicSchema,
  compile: ({
    knobs,
    config,
  }: {
    knobs: Static<typeof knobsSchema>;
    config: FoundationStageCompileConfig;
  }) => {
    const advanced = config.advanced as Record<string, unknown> | undefined;
    if (advanced && typeof advanced === "object") {
      const hasSentinel = FOUNDATION_STEP_IDS.some((stepId) =>
        Object.prototype.hasOwnProperty.call(advanced, stepId)
      );
      if (hasSentinel) {
        return Object.fromEntries(FOUNDATION_STEP_IDS.map((stepId) => [stepId, advanced[stepId]]));
      }
    }

    const profileSentinel =
      (config.profiles as Record<string, unknown> | undefined)?.__studioUiMetaSentinelPath;
    if (Array.isArray(profileSentinel)) {
      return Object.fromEntries(FOUNDATION_STEP_IDS.map((stepId) => [stepId, config.profiles]));
    }

    const profiles = config.profiles ?? DEFAULT_PROFILES;
    const defaults = FOUNDATION_PROFILE_DEFAULTS[profiles.resolutionProfile];
    const plateCount = clampInt(
      typeof knobs.plateCount === "number" ? knobs.plateCount : defaults.plateCount,
      { min: 2, max: 256 }
    );

    return {
      mesh: {
        computeMesh: {
          strategy: "default",
          config: {
            plateCount,
            cellsPerPlate: defaults.mesh.cellsPerPlate,
            relaxationSteps: defaults.mesh.relaxationSteps,
            referenceArea: defaults.mesh.referenceArea,
            plateScalePower: defaults.mesh.plateScalePower,
          },
        },
      },
      crust: {
        computeCrust: {
          strategy: "default",
          config: defaults.crust,
        },
      },
      "plate-graph": {
        computePlateGraph: {
          strategy: "default",
          config: {
            plateCount,
            referenceArea: defaults.plateGraph.referenceArea,
            plateScalePower: defaults.plateGraph.plateScalePower,
          },
        },
      },
      tectonics: {
        computeTectonicSegments: {
          strategy: "default",
          config: COMMON_TECTONIC_SEGMENTS,
        },
        computeTectonicHistory: {
          strategy: "default",
          config: COMMON_TECTONIC_HISTORY,
        },
      },
      projection: {
        computePlates: {
          strategy: "default",
          config: defaults.projection,
        },
      },
    };
  },
  steps: [mesh, crust, plateGraph, tectonics, projection, plateTopology],
} as const);
