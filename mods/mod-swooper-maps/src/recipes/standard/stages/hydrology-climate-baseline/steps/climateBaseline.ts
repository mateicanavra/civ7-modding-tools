import {
  ctxRandom,
  ctxRandomLabel,
  defineVizMeta,
  dumpScalarFieldVariants,
  dumpVectorFieldVariants,
  writeClimateField,
} from "@swooper/mapgen-core";
import type { MapDimensions } from "@civ7/adapter";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { estimateCurlZOddQ, estimateDivergenceOddQ } from "@swooper/mapgen-core/lib/grid";
import { hydrologyClimateBaselineArtifacts } from "../artifacts.js";
import ClimateBaselineStepContract from "./climateBaseline.contract.js";
import {
  HYDROLOGY_DRYNESS_WETNESS_SCALE,
  HYDROLOGY_EVAPORATION_LAND_STRENGTH_BASE,
  HYDROLOGY_EVAPORATION_OCEAN_STRENGTH_BASE,
  HYDROLOGY_OCEAN_COUPLING_CURRENT_STRENGTH,
  HYDROLOGY_OCEAN_COUPLING_MOISTURE_TRANSPORT_ITERATIONS,
  HYDROLOGY_OCEAN_COUPLING_WATER_GRADIENT_RADIUS,
  HYDROLOGY_OCEAN_COUPLING_WIND_JET_STRENGTH,
  HYDROLOGY_OROGRAPHIC_REDUCTION_BASE,
  HYDROLOGY_OROGRAPHIC_REDUCTION_PER_STEP,
  HYDROLOGY_SEASONALITY_DEFAULTS,
  HYDROLOGY_SEASONALITY_PRECIP_NOISE_AMPLITUDE,
  HYDROLOGY_SEASONALITY_WIND_JET_STREAKS,
  HYDROLOGY_SEASONALITY_WIND_VARIANCE,
  HYDROLOGY_TEMPERATURE_BASE_TEMPERATURE_C,
  HYDROLOGY_WATER_GRADIENT_LOWLAND_BONUS_BASE,
  HYDROLOGY_WATER_GRADIENT_PER_RING_BONUS_BASE,
} from "@mapgen/domain/hydrology/shared/knob-multipliers.js";
import type {
  HydrologyDrynessKnob,
  HydrologyOceanCouplingKnob,
  HydrologySeasonalityKnob,
  HydrologyTemperatureKnob,
} from "@mapgen/domain/hydrology/shared/knobs.js";

type ArtifactValidationIssue = Readonly<{ message: string }>;
type TypedArrayConstructor = { new (...args: unknown[]): { length: number } };

const GROUP_SEASONALITY = "Hydrology / Seasonality";
const GROUP_CLIMATE = "Hydrology / Climate";
const GROUP_WIND = "Hydrology / Wind";
const GROUP_CURRENT = "Hydrology / Currents";
const GROUP_OCEAN = "Hydrology / Ocean";
const TILE_SPACE_ID = "tile.hexOddR" as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function expectedSize(dimensions: MapDimensions): number {
  return Math.max(0, (dimensions.width | 0) * (dimensions.height | 0));
}

function clampLatitudeDeg(latitudeDeg: number): number {
  if (!Number.isFinite(latitudeDeg)) return 0;
  return Math.max(-89.999, Math.min(89.999, latitudeDeg));
}

function validateTypedArray(
  errors: ArtifactValidationIssue[],
  label: string,
  value: unknown,
  ctor: TypedArrayConstructor,
  expectedLength?: number
): value is { length: number } {
  if (!(value instanceof ctor)) {
    errors.push({ message: `Expected ${label} to be ${ctor.name}.` });
    return false;
  }
  if (expectedLength != null && value.length !== expectedLength) {
    errors.push({
      message: `Expected ${label} length ${expectedLength} (received ${value.length}).`,
    });
  }
  return true;
}

function validateClimateFieldBuffer(
  value: unknown,
  dimensions: MapDimensions
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isRecord(value)) {
    errors.push({ message: "Missing climate field buffer." });
    return errors;
  }
  const size = expectedSize(dimensions);
  const candidate = value as { rainfall?: unknown; humidity?: unknown };
  validateTypedArray(errors, "climate.rainfall", candidate.rainfall, Uint8Array, size);
  validateTypedArray(errors, "climate.humidity", candidate.humidity, Uint8Array, size);
  return errors;
}

function validateClimateSeasonalityPayload(
  value: unknown,
  dimensions: MapDimensions
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  const size = expectedSize(dimensions);
  if (!isRecord(value)) {
    errors.push({ message: "Missing hydrology climate seasonality artifact payload." });
    return errors;
  }

  const candidate = value as {
    modeCount?: unknown;
    axialTiltDeg?: unknown;
    rainfallAmplitude?: unknown;
    humidityAmplitude?: unknown;
  };

  const modeCount = candidate.modeCount;
  if (modeCount !== 2 && modeCount !== 4) {
    errors.push({ message: "Expected climateSeasonality.modeCount to be 2 or 4." });
  }
  if (typeof candidate.axialTiltDeg !== "number" || !Number.isFinite(candidate.axialTiltDeg)) {
    errors.push({ message: "Expected climateSeasonality.axialTiltDeg to be a finite number." });
  }

  validateTypedArray(errors, "climateSeasonality.rainfallAmplitude", candidate.rainfallAmplitude, Uint8Array, size);
  validateTypedArray(errors, "climateSeasonality.humidityAmplitude", candidate.humidityAmplitude, Uint8Array, size);
  return errors;
}

function getSeasonPhases(modeCount: 2 | 4): readonly number[] {
  if (modeCount === 4) return [0, 0.25, 0.5, 0.75];
  return [0.25, 0.75];
}

export default createStep(ClimateBaselineStepContract, {
  artifacts: implementArtifacts(
    [
      hydrologyClimateBaselineArtifacts.climateField,
      hydrologyClimateBaselineArtifacts.climateSeasonality,
      hydrologyClimateBaselineArtifacts.windField,
    ],
    {
      climateField: {
        validate: (value, context) => validateClimateFieldBuffer(value, context.dimensions),
      },
      climateSeasonality: {
        validate: (value, context) => validateClimateSeasonalityPayload(value, context.dimensions),
      },
      windField: {
        validate: (value, context) => {
          const errors: ArtifactValidationIssue[] = [];
          const size = expectedSize(context.dimensions);
          if (!isRecord(value)) {
            return [{ message: "Missing wind field artifact payload." }];
          }
          const candidate = value as {
            windU?: unknown;
            windV?: unknown;
            currentU?: unknown;
            currentV?: unknown;
          };
          validateTypedArray(errors, "wind.windU", candidate.windU, Int8Array, size);
          validateTypedArray(errors, "wind.windV", candidate.windV, Int8Array, size);
          validateTypedArray(errors, "wind.currentU", candidate.currentU, Int8Array, size);
          validateTypedArray(errors, "wind.currentV", candidate.currentV, Int8Array, size);
          return errors;
        },
      },
    }
  ),
  normalize: (config, ctx) => {
    const { dryness, temperature, seasonality, oceanCoupling } = ctx.knobs as Readonly<{
      dryness: HydrologyDrynessKnob;
      temperature: HydrologyTemperatureKnob;
      seasonality: HydrologySeasonalityKnob;
      oceanCoupling: HydrologyOceanCouplingKnob;
    }>;

    const wetnessScale = HYDROLOGY_DRYNESS_WETNESS_SCALE[dryness];
    const temperatureDeltaC =
      HYDROLOGY_TEMPERATURE_BASE_TEMPERATURE_C[temperature] -
      HYDROLOGY_TEMPERATURE_BASE_TEMPERATURE_C.temperate;

    const seasonalityDefaults = HYDROLOGY_SEASONALITY_DEFAULTS[seasonality];
    const normalSeasonalityDefaults = HYDROLOGY_SEASONALITY_DEFAULTS.normal;
    const modeCountCandidate =
      (config.seasonality?.modeCount ?? normalSeasonalityDefaults.modeCount) +
      (seasonalityDefaults.modeCount - normalSeasonalityDefaults.modeCount);
    const modeCount: 2 | 4 = modeCountCandidate >= 3 ? 4 : 2;
    const axialTiltDeg =
      (config.seasonality?.axialTiltDeg ?? normalSeasonalityDefaults.axialTiltDeg) +
      (seasonalityDefaults.axialTiltDeg - normalSeasonalityDefaults.axialTiltDeg);

    const jetStreakDelta =
      HYDROLOGY_SEASONALITY_WIND_JET_STREAKS[seasonality] -
      HYDROLOGY_SEASONALITY_WIND_JET_STREAKS.normal;
    const varianceFactor =
      HYDROLOGY_SEASONALITY_WIND_VARIANCE[seasonality] /
      HYDROLOGY_SEASONALITY_WIND_VARIANCE.normal;
    const noiseAmplitudeFactor =
      HYDROLOGY_SEASONALITY_PRECIP_NOISE_AMPLITUDE[seasonality] /
      HYDROLOGY_SEASONALITY_PRECIP_NOISE_AMPLITUDE.normal;

    const jetStrengthFactor =
      HYDROLOGY_OCEAN_COUPLING_WIND_JET_STRENGTH[oceanCoupling] /
      HYDROLOGY_OCEAN_COUPLING_WIND_JET_STRENGTH.earthlike;
    const currentStrengthFactor =
      HYDROLOGY_OCEAN_COUPLING_CURRENT_STRENGTH[oceanCoupling] /
      HYDROLOGY_OCEAN_COUPLING_CURRENT_STRENGTH.earthlike;

    const transportIterationsDelta =
      HYDROLOGY_OCEAN_COUPLING_MOISTURE_TRANSPORT_ITERATIONS[oceanCoupling] -
      HYDROLOGY_OCEAN_COUPLING_MOISTURE_TRANSPORT_ITERATIONS.earthlike;

    const clampNumber = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

    const computeThermalState =
      config.computeThermalState.strategy === "default"
        ? {
            ...config.computeThermalState,
            config: {
              ...config.computeThermalState.config,
              // Temperature knobs should not simply warm/cool the whole world uniformly (that erases tundra/snow).
              // Instead, bias the baseline modestly and put most of the adjustment into the equator-to-pole contrast.
              baseTemperatureC: config.computeThermalState.config.baseTemperatureC + temperatureDeltaC * 0.5,
              insolationScaleC: clampNumber(
                config.computeThermalState.config.insolationScaleC + temperatureDeltaC * 2,
                0,
                80
              ),
            },
          }
        : config.computeThermalState;

    const computeAtmosphericCirculation = (() => {
      if (config.computeAtmosphericCirculation.strategy === "latitude") {
        return {
          ...config.computeAtmosphericCirculation,
          config: {
            ...config.computeAtmosphericCirculation.config,
            windJetStreaks: Math.max(
              0,
              Math.round(config.computeAtmosphericCirculation.config.windJetStreaks + jetStreakDelta)
            ),
            windVariance: config.computeAtmosphericCirculation.config.windVariance * varianceFactor,
            windJetStrength: config.computeAtmosphericCirculation.config.windJetStrength * jetStrengthFactor,
          },
        };
      }

      if (config.computeAtmosphericCirculation.strategy === "default") {
        return {
          ...config.computeAtmosphericCirculation,
          config: {
            ...config.computeAtmosphericCirculation.config,
            // Reuse the legacy coupling knobs as broad "strength/variance" scalars.
            zonalStrength: clampNumber(
              config.computeAtmosphericCirculation.config.zonalStrength * jetStrengthFactor,
              0,
              300
            ),
            geostrophicStrength: clampNumber(
              config.computeAtmosphericCirculation.config.geostrophicStrength * jetStrengthFactor,
              0,
              400
            ),
            pressureNoiseAmp: clampNumber(
              config.computeAtmosphericCirculation.config.pressureNoiseAmp * varianceFactor,
              0,
              400
            ),
            waveStrength: clampNumber(config.computeAtmosphericCirculation.config.waveStrength * varianceFactor, 0, 300),
          },
        };
      }

      return config.computeAtmosphericCirculation;
    })();

    const computeOceanSurfaceCurrents = (() => {
      if (config.computeOceanSurfaceCurrents.strategy === "latitude") {
        return {
          ...config.computeOceanSurfaceCurrents,
          config: {
            ...config.computeOceanSurfaceCurrents.config,
            strength: config.computeOceanSurfaceCurrents.config.strength * currentStrengthFactor,
          },
        };
      }

      if (config.computeOceanSurfaceCurrents.strategy === "default") {
        return {
          ...config.computeOceanSurfaceCurrents,
          config: {
            ...config.computeOceanSurfaceCurrents.config,
            windStrength: clampNumber(
              config.computeOceanSurfaceCurrents.config.windStrength * currentStrengthFactor,
              0,
              2
            ),
            ekmanStrength: clampNumber(
              config.computeOceanSurfaceCurrents.config.ekmanStrength * currentStrengthFactor,
              0,
              2
            ),
            gyreStrength: clampNumber(
              config.computeOceanSurfaceCurrents.config.gyreStrength * currentStrengthFactor,
              0,
              80
            ),
            coastStrength: clampNumber(
              config.computeOceanSurfaceCurrents.config.coastStrength * currentStrengthFactor,
              0,
              80
            ),
          },
        };
      }

      return config.computeOceanSurfaceCurrents;
    })();

    const computeEvaporationSources =
      config.computeEvaporationSources.strategy === "default"
        ? {
            ...config.computeEvaporationSources,
            config: {
              ...config.computeEvaporationSources.config,
              oceanStrength: config.computeEvaporationSources.config.oceanStrength * wetnessScale,
              landStrength: config.computeEvaporationSources.config.landStrength * wetnessScale,
            },
          }
        : config.computeEvaporationSources;

    const transportMoisture = (() => {
      if (config.transportMoisture.strategy === "default") {
        return {
          ...config.transportMoisture,
          config: {
            ...config.transportMoisture.config,
            iterations: Math.max(0, Math.round(config.transportMoisture.config.iterations + transportIterationsDelta)),
          },
        };
      }

      if (config.transportMoisture.strategy === "cardinal") {
        return {
          ...config.transportMoisture,
          config: {
            ...config.transportMoisture.config,
            iterations: Math.max(0, Math.round(config.transportMoisture.config.iterations + transportIterationsDelta)),
          },
        };
      }

      return config.transportMoisture;
    })();

    const computePrecipitation = (() => {
      const waterGradientRadiusDelta =
        HYDROLOGY_OCEAN_COUPLING_WATER_GRADIENT_RADIUS[oceanCoupling] -
        HYDROLOGY_OCEAN_COUPLING_WATER_GRADIENT_RADIUS.earthlike;
      const perRingBonusDelta =
        HYDROLOGY_WATER_GRADIENT_PER_RING_BONUS_BASE[oceanCoupling] -
        HYDROLOGY_WATER_GRADIENT_PER_RING_BONUS_BASE.earthlike;

      if (config.computePrecipitation.strategy === "basic") {
        const scaleDenom = Math.max(0.1, wetnessScale);
        return {
          ...config.computePrecipitation,
          config: {
            ...config.computePrecipitation.config,
            rainfallScale: config.computePrecipitation.config.rainfallScale * wetnessScale,
            noiseAmplitude: config.computePrecipitation.config.noiseAmplitude * noiseAmplitudeFactor,
            waterGradient: {
              ...config.computePrecipitation.config.waterGradient,
              radius: Math.max(1, Math.round(config.computePrecipitation.config.waterGradient.radius + waterGradientRadiusDelta)),
              perRingBonus: Math.max(
                0,
                Math.round((config.computePrecipitation.config.waterGradient.perRingBonus + perRingBonusDelta) * wetnessScale)
              ),
              lowlandBonus: Math.max(0, Math.round(config.computePrecipitation.config.waterGradient.lowlandBonus * wetnessScale)),
            },
            orographic: {
              ...config.computePrecipitation.config.orographic,
              reductionBase: Math.max(0, Math.round(config.computePrecipitation.config.orographic.reductionBase / scaleDenom)),
              reductionPerStep: Math.max(
                0,
                Math.round(config.computePrecipitation.config.orographic.reductionPerStep / scaleDenom)
              ),
            },
          },
        };
      }

      if (config.computePrecipitation.strategy === "default") {
        return {
          ...config.computePrecipitation,
          config: {
            ...config.computePrecipitation.config,
            rainfallScale: config.computePrecipitation.config.rainfallScale * wetnessScale,
            noiseAmplitude: config.computePrecipitation.config.noiseAmplitude * noiseAmplitudeFactor,
            waterGradient: {
              ...config.computePrecipitation.config.waterGradient,
              radius: Math.max(1, Math.round(config.computePrecipitation.config.waterGradient.radius + waterGradientRadiusDelta)),
              perRingBonus: Math.max(
                0,
                Math.round((config.computePrecipitation.config.waterGradient.perRingBonus + perRingBonusDelta) * wetnessScale)
              ),
              lowlandBonus: Math.max(0, Math.round(config.computePrecipitation.config.waterGradient.lowlandBonus * wetnessScale)),
            },
          },
        };
      }

      return config.computePrecipitation;
    })();

    return {
      ...config,
      seasonality: { modeCount, axialTiltDeg },
      computeThermalState,
      computeAtmosphericCirculation,
      computeOceanSurfaceCurrents,
      computeEvaporationSources,
      transportMoisture,
      computePrecipitation,
    };
  },
  run: (context, config, ops, deps) => {
    const { width, height } = context.dimensions;
    const { topLatitude, bottomLatitude } = context.env.latitudeBounds;
    const latitudeByRow = new Float32Array(height);
    if (height <= 1) {
      const mid = (topLatitude + bottomLatitude) / 2;
      for (let y = 0; y < height; y++) latitudeByRow[y] = clampLatitudeDeg(mid);
    } else {
      const step = (bottomLatitude - topLatitude) / (height - 1);
      for (let y = 0; y < height; y++) {
        latitudeByRow[y] = clampLatitudeDeg(topLatitude + step * y);
      }
    }

    const topography = deps.artifacts.topography.read(context);
    const coastlineMetrics = deps.artifacts.coastlineMetrics.read(context);
    const elevation = topography.elevation;
    const landMask = topography.landMask;
    const isWaterMask = new Uint8Array(width * height);
    for (let i = 0; i < isWaterMask.length; i++) {
      isWaterMask[i] = landMask[i] === 0 ? 1 : 0;
    }

    const stepId = `${ClimateBaselineStepContract.phase}/${ClimateBaselineStepContract.id}`;
    const rngSeed = ctxRandom(
      context,
      ctxRandomLabel(stepId, "hydrology/compute-atmospheric-circulation"),
      2_147_483_647
    );
    const perlinSeed = ctxRandom(
      context,
      ctxRandomLabel(stepId, "hydrology/compute-precipitation/noise"),
      2_147_483_647
    );

    const size = expectedSize(context.dimensions);
    const zeros = new Uint8Array(size);

    const modeCount = config.seasonality?.modeCount === 4 ? 4 : 2;
    const axialTiltDeg = config.seasonality?.axialTiltDeg ?? 18;
    const phases = getSeasonPhases(modeCount);

    const seasonalRainfall: Uint8Array[] = [];
    const seasonalHumidity: Uint8Array[] = [];
    const seasonalWindU: Int8Array[] = [];
    const seasonalWindV: Int8Array[] = [];
    const seasonalCurrentU: Int8Array[] = [];
    const seasonalCurrentV: Int8Array[] = [];

    const useCirculationV2 =
      config.computeAtmosphericCirculation.strategy === "default" ||
      config.computeOceanSurfaceCurrents.strategy === "default" ||
      config.transportMoisture.strategy === "default" ||
      config.computePrecipitation.strategy === "default";

    let oceanGeometry:
      | {
          basinId: Int32Array;
          coastDistance: Uint16Array;
          coastNormalU: Int8Array;
          coastNormalV: Int8Array;
          coastTangentU: Int8Array;
          coastTangentV: Int8Array;
        }
      | null = null;

    if (useCirculationV2) {
      oceanGeometry = ops.computeOceanGeometry(
        {
          width,
          height,
          isWaterMask,
          coastalWaterMask: coastlineMetrics.coastalWater,
          distanceToCoast: coastlineMetrics.distanceToCoast,
          shelfMask: coastlineMetrics.shelfMask,
        },
        config.computeOceanGeometry
      );
    }

    // Pass 1: winds + currents (seasonal). Legacy behavior is preserved when legacy strategies are selected.
    for (const phase of phases) {
      const declinationDeg = axialTiltDeg * Math.sin(2 * Math.PI * phase);
      const latitudeByRowSeasonal = new Float32Array(height);
      for (let y = 0; y < height; y++) {
        latitudeByRowSeasonal[y] = clampLatitudeDeg(latitudeByRow[y] - declinationDeg);
      }

      // If the axial tilt is effectively zero, there should be no seasonality. Keep `seasonPhase01` fixed
      // so wind/currents don't vary solely because we looped through phases.
      const seasonPhase01 = Math.abs(axialTiltDeg) < 1e-6 ? 0 : phase;

      const winds = ops.computeAtmosphericCirculation(
        {
          width,
          height,
          latitudeByRow: latitudeByRowSeasonal,
          rngSeed,
          landMask,
          elevation,
          seasonPhase01,
        },
        config.computeAtmosphericCirculation
      );

      const currents = ops.computeOceanSurfaceCurrents(
        {
          width,
          height,
          latitudeByRow: latitudeByRowSeasonal,
          isWaterMask,
          windU: winds.windU,
          windV: winds.windV,
          basinId: oceanGeometry?.basinId,
          coastDistance: oceanGeometry?.coastDistance,
          coastTangentU: oceanGeometry?.coastTangentU,
          coastTangentV: oceanGeometry?.coastTangentV,
        },
        config.computeOceanSurfaceCurrents
      );

      seasonalWindU.push(winds.windU);
      seasonalWindV.push(winds.windV);
      seasonalCurrentU.push(currents.currentU);
      seasonalCurrentV.push(currents.currentV);
    }

    const seasonCount = phases.length;
    const meanRainfall = new Uint8Array(size);
    const meanHumidity = new Uint8Array(size);
    const rainfallAmplitude = new Uint8Array(size);
    const humidityAmplitude = new Uint8Array(size);
    const meanWindU = new Int8Array(size);
    const meanWindV = new Int8Array(size);
    const meanCurrentU = new Int8Array(size);
    const meanCurrentV = new Int8Array(size);

    const clampI8 = (value: number): number => Math.max(-128, Math.min(127, value));

    for (let i = 0; i < size; i++) {
      let windUSum = 0;
      let windVSum = 0;
      let currentUSum = 0;
      let currentVSum = 0;

      for (let s = 0; s < seasonCount; s++) {
        windUSum += seasonalWindU[s]?.[i] ?? 0;
        windVSum += seasonalWindV[s]?.[i] ?? 0;
        currentUSum += seasonalCurrentU[s]?.[i] ?? 0;
        currentVSum += seasonalCurrentV[s]?.[i] ?? 0;
      }

      meanWindU[i] = clampI8(Math.round(windUSum / seasonCount));
      meanWindV[i] = clampI8(Math.round(windVSum / seasonCount));
      meanCurrentU[i] = clampI8(Math.round(currentUSum / seasonCount));
      meanCurrentV[i] = clampI8(Math.round(currentVSum / seasonCount));
    }

    let oceanThermal: { sstC: Float32Array; seaIceMask: Uint8Array } | null = null;
    if (useCirculationV2) {
      // Annual mean SST/ice coupling: compute once from mean currents (bounded, deterministic).
      oceanThermal = ops.computeOceanThermalState(
        {
          width,
          height,
          latitudeByRow,
          isWaterMask,
          shelfMask: coastlineMetrics.shelfMask,
          currentU: meanCurrentU,
          currentV: meanCurrentV,
        },
        config.computeOceanThermalState
      );

      if (oceanGeometry) {
        dumpScalarFieldVariants(context.trace, context.viz, {
          dataTypeKey: "hydrology.ocean.basinId",
          spaceId: TILE_SPACE_ID,
          dims: { width, height },
          field: { format: "i32", values: oceanGeometry.basinId },
          label: "Ocean Basin Id",
          group: GROUP_OCEAN,
          palette: "categorical",
          visibility: "debug",
          points: {},
        });
        dumpScalarFieldVariants(context.trace, context.viz, {
          dataTypeKey: "hydrology.ocean.coastDistance",
          spaceId: TILE_SPACE_ID,
          dims: { width, height },
          field: { format: "u16", values: oceanGeometry.coastDistance },
          label: "Ocean Coast Distance (Water)",
          group: GROUP_OCEAN,
          palette: "continuous",
          visibility: "debug",
          points: {},
        });
        dumpVectorFieldVariants(context.trace, context.viz, {
          dataTypeKey: "hydrology.ocean.coastFrame",
          spaceId: TILE_SPACE_ID,
          dims: { width, height },
          u: { format: "i8", values: oceanGeometry.coastTangentU },
          v: { format: "i8", values: oceanGeometry.coastTangentV },
          label: "Coast Tangent (Advisory)",
          group: GROUP_OCEAN,
          palette: "continuous",
          visibility: "debug",
          arrows: { maxArrowLenTiles: 1.25 },
          points: {},
        });
      }

      if (oceanThermal) {
        dumpScalarFieldVariants(context.trace, context.viz, {
          dataTypeKey: "hydrology.ocean.sstC",
          spaceId: TILE_SPACE_ID,
          dims: { width, height },
          field: { format: "f32", values: oceanThermal.sstC },
          label: "Ocean SST (C)",
          group: GROUP_OCEAN,
          palette: "continuous",
          visibility: "debug",
          points: {},
        });
        dumpScalarFieldVariants(context.trace, context.viz, {
          dataTypeKey: "hydrology.ocean.seaIceMask",
          spaceId: TILE_SPACE_ID,
          dims: { width, height },
          field: { format: "u8", values: oceanThermal.seaIceMask },
          label: "Ocean Sea Ice Mask",
          group: GROUP_OCEAN,
          palette: "categorical",
          visibility: "debug",
          points: {},
        });
      }

      const toF32 = (arr: Int8Array): Float32Array => {
        const out = new Float32Array(arr.length);
        for (let i = 0; i < out.length; i++) out[i] = arr[i] ?? 0;
        return out;
      };

      const windFx = toF32(meanWindU);
      const windFy = toF32(meanWindV);
      const currentFx = toF32(meanCurrentU);
      const currentFy = toF32(meanCurrentV);

      dumpScalarFieldVariants(context.trace, context.viz, {
        dataTypeKey: "hydrology.wind.divergence",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        field: { format: "f32", values: estimateDivergenceOddQ(width, height, windFx, windFy) },
        label: "Wind Divergence (Proxy)",
        group: GROUP_WIND,
        palette: "continuous",
        visibility: "debug",
        points: {},
      });
      dumpScalarFieldVariants(context.trace, context.viz, {
        dataTypeKey: "hydrology.wind.curlZ",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        field: { format: "f32", values: estimateCurlZOddQ(width, height, windFx, windFy) },
        label: "Wind Curl Z (Proxy)",
        group: GROUP_WIND,
        palette: "continuous",
        visibility: "debug",
        points: {},
      });
      dumpScalarFieldVariants(context.trace, context.viz, {
        dataTypeKey: "hydrology.current.divergence",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        field: { format: "f32", values: estimateDivergenceOddQ(width, height, currentFx, currentFy) },
        label: "Current Divergence (Proxy)",
        group: GROUP_CURRENT,
        palette: "continuous",
        visibility: "debug",
        points: {},
      });
      dumpScalarFieldVariants(context.trace, context.viz, {
        dataTypeKey: "hydrology.current.curlZ",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        field: { format: "f32", values: estimateCurlZOddQ(width, height, currentFx, currentFy) },
        label: "Current Curl Z (Proxy)",
        group: GROUP_CURRENT,
        palette: "continuous",
        visibility: "debug",
        points: {},
      });
    }

    if (useCirculationV2) {
      // Pass 2: moisture + precip (seasonal), with optional SST/wind coupling into thermal+evap.
      for (let s = 0; s < phases.length; s++) {
        const phase = phases[s] ?? 0;
        const declinationDeg = axialTiltDeg * Math.sin(2 * Math.PI * phase);
        const latitudeByRowSeasonal = new Float32Array(height);
        for (let y = 0; y < height; y++) {
          latitudeByRowSeasonal[y] = clampLatitudeDeg(latitudeByRow[y] - declinationDeg);
        }

        const forcing = ops.computeRadiativeForcing(
          { width, height, latitudeByRow: latitudeByRowSeasonal },
          config.computeRadiativeForcing
        );

        const thermal = ops.computeThermalState(
          {
            width,
            height,
            insolation: forcing.insolation,
            elevation,
            landMask,
            sstC: oceanThermal?.sstC,
          },
          config.computeThermalState
        );

        const windU = seasonalWindU[s] ?? meanWindU;
        const windV = seasonalWindV[s] ?? meanWindV;

        const evaporation = ops.computeEvaporationSources(
          {
            width,
            height,
            landMask,
            surfaceTemperatureC: thermal.surfaceTemperatureC,
            windU,
            windV,
            sstC: oceanThermal?.sstC,
            seaIceMask: oceanThermal?.seaIceMask,
          },
          config.computeEvaporationSources
        );

        const moisture = ops.transportMoisture(
          {
            width,
            height,
            latitudeByRow: latitudeByRowSeasonal,
            landMask,
            windU,
            windV,
            evaporation: evaporation.evaporation,
          },
          config.transportMoisture
        );

        const precipitation = ops.computePrecipitation(
          {
            width,
            height,
            latitudeByRow: latitudeByRowSeasonal,
            elevation,
            landMask,
            windU,
            windV,
            humidityF32: moisture.humidity,
            rainfallIn: zeros,
            humidityIn: zeros,
            riverAdjacency: zeros,
            perlinSeed,
          },
          config.computePrecipitation
        );

        seasonalRainfall.push(precipitation.rainfall);
        seasonalHumidity.push(precipitation.humidity);
      }
    } else {
      // Legacy coupling path: compute full seasonal climate in one pass (kept intact for stability).
      for (let s = 0; s < phases.length; s++) {
        const phase = phases[s] ?? 0;
        const declinationDeg = axialTiltDeg * Math.sin(2 * Math.PI * phase);
        const latitudeByRowSeasonal = new Float32Array(height);
        for (let y = 0; y < height; y++) {
          latitudeByRowSeasonal[y] = clampLatitudeDeg(latitudeByRow[y] - declinationDeg);
        }

        const forcing = ops.computeRadiativeForcing(
          { width, height, latitudeByRow: latitudeByRowSeasonal },
          config.computeRadiativeForcing
        );

        const thermal = ops.computeThermalState(
          {
            width,
            height,
            insolation: forcing.insolation,
            elevation,
            landMask,
          },
          config.computeThermalState
        );

        const windU = seasonalWindU[s] ?? meanWindU;
        const windV = seasonalWindV[s] ?? meanWindV;

        const evaporation = ops.computeEvaporationSources(
          {
            width,
            height,
            landMask,
            surfaceTemperatureC: thermal.surfaceTemperatureC,
          },
          config.computeEvaporationSources
        );

        const moisture = ops.transportMoisture(
          {
            width,
            height,
            latitudeByRow: latitudeByRowSeasonal,
            landMask,
            windU,
            windV,
            evaporation: evaporation.evaporation,
          },
          config.transportMoisture
        );

        const precipitation = ops.computePrecipitation(
          {
            width,
            height,
            latitudeByRow: latitudeByRowSeasonal,
            elevation,
            landMask,
            windU,
            windV,
            humidityF32: moisture.humidity,
            rainfallIn: zeros,
            humidityIn: zeros,
            riverAdjacency: zeros,
            perlinSeed,
          },
          config.computePrecipitation
        );

        seasonalRainfall.push(precipitation.rainfall);
        seasonalHumidity.push(precipitation.humidity);
      }
    }

    // Recompute annual mean + amplitude now that we have seasonal rainfall/humidity.
    for (let i = 0; i < size; i++) {
      let rainSum = 0;
      let humidSum = 0;
      let rainMin = 255;
      let rainMax = 0;
      let humidMin = 255;
      let humidMax = 0;

      for (let s = 0; s < seasonCount; s++) {
        const rain = seasonalRainfall[s]?.[i] ?? 0;
        const humid = seasonalHumidity[s]?.[i] ?? 0;
        rainSum += rain;
        humidSum += humid;
        if (rain < rainMin) rainMin = rain;
        if (rain > rainMax) rainMax = rain;
        if (humid < humidMin) humidMin = humid;
        if (humid > humidMax) humidMax = humid;
      }

      meanRainfall[i] = Math.max(0, Math.min(255, Math.round(rainSum / seasonCount)));
      meanHumidity[i] = Math.max(0, Math.min(255, Math.round(humidSum / seasonCount)));
      rainfallAmplitude[i] = Math.max(0, Math.min(255, Math.round((rainMax - rainMin) / 2)));
      humidityAmplitude[i] = Math.max(0, Math.min(255, Math.round((humidMax - humidMin) / 2)));
    }

    dumpScalarFieldVariants(context.trace, context.viz, {
      dataTypeKey: "hydrology.climate.rainfall",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      field: { format: "u8", values: meanRainfall },
      label: "Rainfall (Baseline)",
      group: GROUP_CLIMATE,
      palette: "continuous",
      points: {},
    });
    dumpScalarFieldVariants(context.trace, context.viz, {
      dataTypeKey: "hydrology.climate.humidity",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      field: { format: "u8", values: meanHumidity },
      label: "Humidity (Baseline)",
      group: GROUP_CLIMATE,
      palette: "continuous",
      visibility: "debug",
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.climate.seasonality.rainfallAmplitude",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: rainfallAmplitude,
      meta: defineVizMeta("hydrology.climate.seasonality.rainfallAmplitude", {
        label: "Rainfall Amplitude",
        group: GROUP_SEASONALITY,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.climate.seasonality.humidityAmplitude",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: humidityAmplitude,
      meta: defineVizMeta("hydrology.climate.seasonality.humidityAmplitude", {
        label: "Humidity Amplitude",
        group: GROUP_SEASONALITY,
      }),
    });
    for (let s = 0; s < seasonCount; s++) {
      const rain = seasonalRainfall[s];
      const humid = seasonalHumidity[s];
      if (!rain || !humid) continue;
      dumpScalarFieldVariants(context.trace, context.viz, {
        dataTypeKey: "hydrology.climate.rainfall",
        variantKey: `season:${s}`,
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        field: { format: "u8", values: rain },
        label: `Rainfall (Season ${s + 1})`,
        group: GROUP_SEASONALITY,
        palette: "continuous",
        visibility: "debug",
      });
      dumpScalarFieldVariants(context.trace, context.viz, {
        dataTypeKey: "hydrology.climate.humidity",
        variantKey: `season:${s}`,
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        field: { format: "u8", values: humid },
        label: `Humidity (Season ${s + 1})`,
        group: GROUP_SEASONALITY,
        palette: "continuous",
        visibility: "debug",
      });
    }
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.wind.windU",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "i8",
      values: meanWindU,
      meta: defineVizMeta("hydrology.wind.windU", {
        label: "Wind U",
        group: GROUP_WIND,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.wind.windV",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "i8",
      values: meanWindV,
      meta: defineVizMeta("hydrology.wind.windV", {
        label: "Wind V",
        group: GROUP_WIND,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.current.currentU",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "i8",
      values: meanCurrentU,
      meta: defineVizMeta("hydrology.current.currentU", {
        label: "Current U",
        group: GROUP_CURRENT,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.current.currentV",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "i8",
      values: meanCurrentV,
      meta: defineVizMeta("hydrology.current.currentV", {
        label: "Current V",
        group: GROUP_CURRENT,
        visibility: "debug",
      }),
    });
    dumpVectorFieldVariants(context.trace, context.viz, {
      dataTypeKey: "hydrology.wind.wind",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      u: { format: "i8", values: meanWindU },
      v: { format: "i8", values: meanWindV },
      label: "Wind",
      group: GROUP_WIND,
      palette: "continuous",
      magnitude: { debugOnly: true },
      arrows: { maxArrowLenTiles: 1.25 },
      points: { debugOnly: true },
    });

    dumpVectorFieldVariants(context.trace, context.viz, {
      dataTypeKey: "hydrology.current.current",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      u: { format: "i8", values: meanCurrentU },
      v: { format: "i8", values: meanCurrentV },
      label: "Current",
      group: GROUP_CURRENT,
      palette: "continuous",
      magnitude: { debugOnly: true },
      arrows: { maxArrowLenTiles: 1.25 },
      points: { debugOnly: true },
    });

    for (let s = 0; s < seasonCount; s++) {
      const su = seasonalWindU[s];
      const sv = seasonalWindV[s];
      const cu = seasonalCurrentU[s];
      const cv = seasonalCurrentV[s];
      if (!su || !sv || !cu || !cv) continue;

      dumpVectorFieldVariants(context.trace, context.viz, {
        dataTypeKey: "hydrology.wind.wind",
        variantKey: `season:${s}`,
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        u: { format: "i8", values: su },
        v: { format: "i8", values: sv },
        label: "Wind",
        group: GROUP_WIND,
        palette: "continuous",
        visibility: "debug",
        arrows: { maxArrowLenTiles: 1.25 },
        points: {},
      });

      dumpVectorFieldVariants(context.trace, context.viz, {
        dataTypeKey: "hydrology.current.current",
        variantKey: `season:${s}`,
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        u: { format: "i8", values: cu },
        v: { format: "i8", values: cv },
        label: "Current",
        group: GROUP_CURRENT,
        palette: "continuous",
        visibility: "debug",
        arrows: { maxArrowLenTiles: 1.25 },
        points: {},
      });
    }

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const i = rowOffset + x;
        writeClimateField(context, x, y, {
          rainfall: meanRainfall[i],
          humidity: meanHumidity[i],
        });
      }
    }

    deps.artifacts.climateField.publish(context, context.buffers.climate);
    deps.artifacts.climateSeasonality.publish(context, {
      modeCount,
      axialTiltDeg,
      rainfallAmplitude,
      humidityAmplitude,
    });
    deps.artifacts.windField.publish(context, {
      windU: meanWindU,
      windV: meanWindV,
      currentU: meanCurrentU,
      currentV: meanCurrentV,
    });
  },
});
