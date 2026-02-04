import { clamp01, lerp } from "@swooper/mapgen-core";
import { Type, createStage, type Static } from "@swooper/mapgen-core/authoring";
import {
  crust,
  mantleForcing,
  mantlePotential,
  mesh,
  plateGraph,
  plateTopology,
  projection,
  tectonics,
} from "./steps/index.js";
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
  basalticThickness01: number;
  yieldStrength01: number;
  mantleCoupling01: number;
  riftWeakening01: number;
}>;

type MantleDefaults = Readonly<{
  plumeCount: number;
  downwellingCount: number;
  radius: number;
  amplitudeScale: number;
}>;

const COMMON_CRUST_BALANCED: CrustDefaults = {
  basalticThickness01: 0.25,
  yieldStrength01: 0.55,
  mantleCoupling01: 0.6,
  riftWeakening01: 0.35,
};

const COMMON_CRUST_STANDARD: CrustDefaults = {
  basalticThickness01: 0.25,
  yieldStrength01: 0.55,
  mantleCoupling01: 0.6,
  riftWeakening01: 0.35,
};

const COMMON_MANTLE_DEFAULTS: MantleDefaults = {
  plumeCount: 6,
  downwellingCount: 6,
  radius: 0.18,
  amplitudeScale: 1,
};

const COMMON_MANTLE_POTENTIAL = {
  smoothingIterations: 2,
  smoothingAlpha: 0.35,
  minSeparationScale: 0.85,
} as const;

const COMMON_MANTLE_FORCING = {
  velocityScale: 1,
  rotationScale: 0.2,
  stressNorm: 1,
  curvatureWeight: 0.35,
  upwellingThreshold: 0.35,
  downwellingThreshold: 0.35,
} as const;

const MANTLE_RADIUS_RANGE = {
  min: 0.08,
  max: 0.35,
} as const;

const MANTLE_AMPLITUDE_RANGE = {
  min: 0.4,
  max: 2.0,
} as const;

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
      mantle: MantleDefaults;
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
    mantle: COMMON_MANTLE_DEFAULTS,
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
    mantle: COMMON_MANTLE_DEFAULTS,
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
    mantle: COMMON_MANTLE_DEFAULTS,
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
    mantle: COMMON_MANTLE_DEFAULTS,
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
  "mantle-potential",
  "mantle-forcing",
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

    const lithosphereOverrides =
      advanced && typeof advanced === "object" && "lithosphere" in advanced
        ? (advanced as { lithosphere?: Record<string, unknown> }).lithosphere ?? {}
        : {};

    const mantleOverrides =
      advanced && typeof advanced === "object" && "mantleForcing" in advanced
        ? (advanced as { mantleForcing?: Record<string, unknown> }).mantleForcing ?? {}
        : {};
    const mantleOverrideValues = mantleOverrides as {
      plumeCount?: unknown;
      downwellingCount?: unknown;
      lengthScale01?: unknown;
      potentialAmplitude01?: unknown;
    };
    const mantleLengthScale =
      typeof mantleOverrideValues.lengthScale01 === "number"
        ? clamp01(mantleOverrideValues.lengthScale01)
        : undefined;
    const mantleRadius =
      mantleLengthScale !== undefined
        ? lerp(MANTLE_RADIUS_RANGE.min, MANTLE_RADIUS_RANGE.max, mantleLengthScale)
        : defaults.mantle.radius;
    const mantleAmplitudeScale =
      typeof mantleOverrideValues.potentialAmplitude01 === "number"
        ? lerp(
            MANTLE_AMPLITUDE_RANGE.min,
            MANTLE_AMPLITUDE_RANGE.max,
            clamp01(mantleOverrideValues.potentialAmplitude01)
          )
        : defaults.mantle.amplitudeScale;
    const mantlePlumeCount = clampInt(
      typeof mantleOverrideValues.plumeCount === "number" ? mantleOverrideValues.plumeCount : defaults.mantle.plumeCount,
      { min: 2, max: 16 }
    );
    const mantleDownwellingCount = clampInt(
      typeof mantleOverrideValues.downwellingCount === "number"
        ? mantleOverrideValues.downwellingCount
        : defaults.mantle.downwellingCount,
      { min: 2, max: 16 }
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
      "mantle-potential": {
        computeMantlePotential: {
          strategy: "default",
          config: {
            plumeCount: mantlePlumeCount,
            downwellingCount: mantleDownwellingCount,
            plumeRadius: mantleRadius,
            downwellingRadius: mantleRadius,
            plumeAmplitude: mantleAmplitudeScale,
            downwellingAmplitude: -mantleAmplitudeScale,
            smoothingIterations: COMMON_MANTLE_POTENTIAL.smoothingIterations,
            smoothingAlpha: COMMON_MANTLE_POTENTIAL.smoothingAlpha,
            minSeparationScale: COMMON_MANTLE_POTENTIAL.minSeparationScale,
          },
        },
      },
      "mantle-forcing": {
        computeMantleForcing: {
          strategy: "default",
          config: COMMON_MANTLE_FORCING,
        },
      },
      crust: {
        computeCrust: {
          strategy: "default",
          config: {
            ...defaults.crust,
            ...(typeof lithosphereOverrides === "object" ? lithosphereOverrides : {}),
          },
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
  steps: [mesh, mantlePotential, mantleForcing, crust, plateGraph, tectonics, projection, plateTopology],
} as const);
