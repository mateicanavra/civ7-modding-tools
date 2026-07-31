import { ctxRandom, ctxRandomLabel } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { I8_VECTOR_MAX_ABS } from "@swooper/mapgen-core/lib/grid";
import {
  HYDROLOGY_DRYNESS_WETNESS_SCALE,
  HYDROLOGY_OCEAN_COUPLING_CURRENT_STRENGTH,
  HYDROLOGY_OCEAN_COUPLING_MOISTURE_TRANSPORT_ITERATIONS,
  HYDROLOGY_OCEAN_COUPLING_WATER_GRADIENT_RADIUS,
  HYDROLOGY_OCEAN_COUPLING_WIND_JET_STRENGTH,
  HYDROLOGY_SEASONALITY_DEFAULTS,
  HYDROLOGY_SEASONALITY_PRECIP_NOISE_AMPLITUDE,
  HYDROLOGY_SEASONALITY_WIND_JET_STREAKS,
  HYDROLOGY_SEASONALITY_WIND_VARIANCE,
  HYDROLOGY_TEMPERATURE_BASE_TEMPERATURE_C,
  HYDROLOGY_WATER_GRADIENT_PER_RING_BONUS_BASE,
} from "../../../model/policy/climate-knob-policy.js";
import { config } from "./config.js";
import { buildClimateBaselineVizProjections } from "./viz.js";

type HydrologyDrynessKnob = "wet" | "mix" | "dry";
type HydrologyOceanCouplingKnob = "off" | "simple" | "earthlike";
type HydrologySeasonalityKnob = "low" | "normal" | "high";
type HydrologyTemperatureKnob = "cold" | "temperate" | "hot";

const QUARTER_YEAR_MODE_COUNT_THRESHOLD = 3;
const CIRCULATION_MIGRATION_FRACTION = 0.35;
const SEASON_TRANSIENT_SALT_MULTIPLIER = 0x9e3779b1;
const TRANSIENT_POLARITIES = [1, -1] as const;

function clampLatitudeDeg(latitudeDeg: number): number {
  if (!Number.isFinite(latitudeDeg)) return 0;
  return Math.max(-89.999, Math.min(89.999, latitudeDeg));
}

function getSeasonPhases(modeCount: 2 | 4): readonly number[] {
  if (modeCount === 4) return [0, 0.25, 0.5, 0.75];
  return [0.25, 0.75];
}

/**
 * Orchestrates deterministic atmosphere-ocean forcing and moisture transport over final
 * topography, publishing climate, pressure, and winds together.
 */
export const ClimateBaselineStep = createStep(config, {
  normalize: (stepConfig, ctx) => {
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
      stepConfig.seasonality.modeCount +
      (seasonalityDefaults.modeCount - normalSeasonalityDefaults.modeCount);
    const modeCount: 2 | 4 = modeCountCandidate >= QUARTER_YEAR_MODE_COUNT_THRESHOLD ? 4 : 2;
    const axialTiltDeg =
      stepConfig.seasonality.axialTiltDeg +
      (seasonalityDefaults.axialTiltDeg - normalSeasonalityDefaults.axialTiltDeg);

    const jetStreakDelta =
      HYDROLOGY_SEASONALITY_WIND_JET_STREAKS[seasonality] -
      HYDROLOGY_SEASONALITY_WIND_JET_STREAKS.normal;
    const varianceFactor =
      HYDROLOGY_SEASONALITY_WIND_VARIANCE[seasonality] / HYDROLOGY_SEASONALITY_WIND_VARIANCE.normal;
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

    const clampNumber = (value: number, min: number, max: number): number =>
      Math.max(min, Math.min(max, value));

    const computeThermalState =
      stepConfig.computeThermalState.strategy === "insolation-lapse-rate"
        ? {
            ...stepConfig.computeThermalState,
            config: {
              ...stepConfig.computeThermalState.config,
              // Temperature knobs should not simply warm/cool the whole world uniformly (that erases tundra/snow).
              // Instead, bias the baseline modestly and put most of the adjustment into the equator-to-pole contrast.
              baseTemperatureC:
                stepConfig.computeThermalState.config.baseTemperatureC + temperatureDeltaC * 0.5,
              insolationScaleC: clampNumber(
                stepConfig.computeThermalState.config.insolationScaleC + temperatureDeltaC * 2,
                0,
                80
              ),
            },
          }
        : stepConfig.computeThermalState;

    const computeAtmosphericCirculation = (() => {
      if (stepConfig.computeAtmosphericCirculation.strategy === "latitude") {
        return {
          ...stepConfig.computeAtmosphericCirculation,
          config: {
            ...stepConfig.computeAtmosphericCirculation.config,
            windJetStreaks: Math.max(
              0,
              Math.round(
                stepConfig.computeAtmosphericCirculation.config.windJetStreaks + jetStreakDelta
              )
            ),
            windVariance:
              stepConfig.computeAtmosphericCirculation.config.windVariance * varianceFactor,
            windJetStrength:
              stepConfig.computeAtmosphericCirculation.config.windJetStrength * jetStrengthFactor,
          },
        };
      }

      if (stepConfig.computeAtmosphericCirculation.strategy === "geostrophic-proxy") {
        const circulation = stepConfig.computeAtmosphericCirculation.config;
        return {
          ...stepConfig.computeAtmosphericCirculation,
          config: {
            ...circulation,
            // Ocean coupling controls the circulation backbone; seasonality controls the
            // decorrelated weather budget. Keeping those axes separate preserves the authored
            // zonal-to-meridional ratio and avoids double-scaling transient pressure texture.
            zonalStrength: clampNumber(
              circulation.zonalStrength * jetStrengthFactor,
              0,
              300
            ),
            meridionalStrength: clampNumber(
              circulation.meridionalStrength * jetStrengthFactor,
              0,
              200
            ),
            pressureDrivenRms: clampNumber(
              circulation.pressureDrivenRms * varianceFactor,
              0,
              400
            ),
          },
        };
      }

      return stepConfig.computeAtmosphericCirculation;
    })();

    const computeOceanSurfaceCurrents = (() => {
      if (stepConfig.computeOceanSurfaceCurrents.strategy === "latitude") {
        return {
          ...stepConfig.computeOceanSurfaceCurrents,
          config: {
            ...stepConfig.computeOceanSurfaceCurrents.config,
            strength:
              stepConfig.computeOceanSurfaceCurrents.config.strength * currentStrengthFactor,
          },
        };
      }

      if (stepConfig.computeOceanSurfaceCurrents.strategy === "wind-gyre-projection") {
        return {
          ...stepConfig.computeOceanSurfaceCurrents,
          config: {
            ...stepConfig.computeOceanSurfaceCurrents.config,
            windStrength: clampNumber(
              stepConfig.computeOceanSurfaceCurrents.config.windStrength * currentStrengthFactor,
              0,
              2
            ),
            ekmanStrength: clampNumber(
              stepConfig.computeOceanSurfaceCurrents.config.ekmanStrength * currentStrengthFactor,
              0,
              2
            ),
            gyreStrength: clampNumber(
              stepConfig.computeOceanSurfaceCurrents.config.gyreStrength * currentStrengthFactor,
              0,
              80
            ),
            coastStrength: clampNumber(
              stepConfig.computeOceanSurfaceCurrents.config.coastStrength * currentStrengthFactor,
              0,
              80
            ),
          },
        };
      }

      return stepConfig.computeOceanSurfaceCurrents;
    })();

    const computeEvaporationSources =
      stepConfig.computeEvaporationSources.strategy === "thermal-surface"
        ? {
            ...stepConfig.computeEvaporationSources,
            config: {
              ...stepConfig.computeEvaporationSources.config,
              oceanStrength:
                stepConfig.computeEvaporationSources.config.oceanStrength * wetnessScale,
              landStrength: stepConfig.computeEvaporationSources.config.landStrength * wetnessScale,
            },
          }
        : stepConfig.computeEvaporationSources;

    const transportMoisture = (() => {
      if (stepConfig.transportMoisture.strategy === "vector-advection") {
        return {
          ...stepConfig.transportMoisture,
          config: {
            ...stepConfig.transportMoisture.config,
            iterations: Math.max(
              0,
              Math.round(stepConfig.transportMoisture.config.iterations + transportIterationsDelta)
            ),
          },
        };
      }

      if (stepConfig.transportMoisture.strategy === "cardinal") {
        return {
          ...stepConfig.transportMoisture,
          config: {
            ...stepConfig.transportMoisture.config,
            iterations: Math.max(
              0,
              Math.round(stepConfig.transportMoisture.config.iterations + transportIterationsDelta)
            ),
          },
        };
      }

      return stepConfig.transportMoisture;
    })();

    const computePrecipitation = (() => {
      const waterGradientRadiusDelta =
        HYDROLOGY_OCEAN_COUPLING_WATER_GRADIENT_RADIUS[oceanCoupling] -
        HYDROLOGY_OCEAN_COUPLING_WATER_GRADIENT_RADIUS.earthlike;
      const perRingBonusDelta =
        HYDROLOGY_WATER_GRADIENT_PER_RING_BONUS_BASE[oceanCoupling] -
        HYDROLOGY_WATER_GRADIENT_PER_RING_BONUS_BASE.earthlike;

      if (stepConfig.computePrecipitation.strategy === "baseline") {
        const scaleDenom = Math.max(0.1, wetnessScale);
        return {
          ...stepConfig.computePrecipitation,
          config: {
            ...stepConfig.computePrecipitation.config,
            rainfallScale: stepConfig.computePrecipitation.config.rainfallScale * wetnessScale,
            noiseAmplitude:
              stepConfig.computePrecipitation.config.noiseAmplitude * noiseAmplitudeFactor,
            waterGradient: {
              ...stepConfig.computePrecipitation.config.waterGradient,
              radius: Math.max(
                1,
                Math.round(
                  stepConfig.computePrecipitation.config.waterGradient.radius +
                    waterGradientRadiusDelta
                )
              ),
              perRingBonus: Math.max(
                0,
                Math.round(
                  (stepConfig.computePrecipitation.config.waterGradient.perRingBonus +
                    perRingBonusDelta) *
                    wetnessScale
                )
              ),
              lowlandBonus: Math.max(
                0,
                Math.round(
                  stepConfig.computePrecipitation.config.waterGradient.lowlandBonus * wetnessScale
                )
              ),
            },
            orographic: {
              ...stepConfig.computePrecipitation.config.orographic,
              reductionBase: Math.max(
                0,
                Math.round(
                  stepConfig.computePrecipitation.config.orographic.reductionBase / scaleDenom
                )
              ),
              reductionPerStep: Math.max(
                0,
                Math.round(
                  stepConfig.computePrecipitation.config.orographic.reductionPerStep / scaleDenom
                )
              ),
            },
          },
        };
      }

      if (stepConfig.computePrecipitation.strategy === "vector") {
        return {
          ...stepConfig.computePrecipitation,
          config: {
            ...stepConfig.computePrecipitation.config,
            rainfallScale: stepConfig.computePrecipitation.config.rainfallScale * wetnessScale,
            noiseAmplitude:
              stepConfig.computePrecipitation.config.noiseAmplitude * noiseAmplitudeFactor,
            waterGradient: {
              ...stepConfig.computePrecipitation.config.waterGradient,
              radius: Math.max(
                1,
                Math.round(
                  stepConfig.computePrecipitation.config.waterGradient.radius +
                    waterGradientRadiusDelta
                )
              ),
              perRingBonus: Math.max(
                0,
                Math.round(
                  (stepConfig.computePrecipitation.config.waterGradient.perRingBonus +
                    perRingBonusDelta) *
                    wetnessScale
                )
              ),
              lowlandBonus: Math.max(
                0,
                Math.round(
                  stepConfig.computePrecipitation.config.waterGradient.lowlandBonus * wetnessScale
                )
              ),
            },
          },
        };
      }

      return stepConfig.computePrecipitation;
    })();

    return {
      ...stepConfig,
      seasonality: { modeCount, axialTiltDeg },
      computeThermalState,
      computeAtmosphericCirculation,
      computeOceanSurfaceCurrents,
      computeEvaporationSources,
      transportMoisture,
      computePrecipitation,
    };
  },
  run: (context, stepConfig, ops, deps) => {
    const { width, height } = context.setup.dimensions;
    const { topLatitude, bottomLatitude } = context.setup.latitudeBounds;
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

    const topography = deps.artifacts.topography.read();
    const shelf = deps.artifacts.shelf.read();
    const elevation = topography.elevation;
    const landMask = topography.landMask;
    const isWaterMask = new Uint8Array(width * height);
    for (let i = 0; i < isWaterMask.length; i++) {
      isWaterMask[i] = landMask[i] === 0 ? 1 : 0;
    }

    const stepId = `hydrology/${config.id}`;
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

    const size = width * height;

    const modeCount = stepConfig.seasonality.modeCount;
    const axialTiltDeg = stepConfig.seasonality.axialTiltDeg;
    const phases = getSeasonPhases(modeCount);

    const seasonalRainfall: Uint8Array[] = [];
    const seasonalHumidity: Uint8Array[] = [];

    const usesCoupledClimatePath =
      stepConfig.computeAtmosphericCirculation.strategy === "geostrophic-proxy" ||
      stepConfig.computeOceanSurfaceCurrents.strategy === "wind-gyre-projection" ||
      stepConfig.transportMoisture.strategy === "vector-advection" ||
      stepConfig.computePrecipitation.strategy === "vector";

    let oceanGeometry: {
      basinId: Int32Array;
      coastDistance: Uint16Array;
      coastNormalU: Int8Array;
      coastNormalV: Int8Array;
      coastTangentU: Int8Array;
      coastTangentV: Int8Array;
    } | null = null;

    if (usesCoupledClimatePath) {
      oceanGeometry = ops.computeOceanGeometry(
        {
          width,
          height,
          isWaterMask,
          coastalWaterMask: shelf.coastalWater,
          distanceToCoast: shelf.distanceToCoast,
          shelfMask: shelf.shelfMask,
        },
        stepConfig.computeOceanGeometry
      );
    }

    // Per-phase forcing is static across the fixed-point cycle. Circulation belts follow only
    // part of solar declination because atmospheric and oceanic inertia keeps their seasonal
    // migration narrower than direct insolation.
    const hasSeasons = Math.abs(axialTiltDeg) >= 1e-6;
    const seasonalForcing = phases.map((phase, seasonIndex) => {
      const declinationDeg = axialTiltDeg * Math.sin(2 * Math.PI * phase);
      const circulationLatitude = new Float32Array(height);
      const thermalLatitude = new Float32Array(height);
      for (let y = 0; y < height; y++) {
        circulationLatitude[y] = clampLatitudeDeg(
          latitudeByRow[y] - declinationDeg * CIRCULATION_MIGRATION_FRACTION
        );
        thermalLatitude[y] = clampLatitudeDeg(latitudeByRow[y] - declinationDeg);
      }

      return {
        circulationLatitude,
        thermalLatitude,
        insolation: ops.computeRadiativeForcing(
          { width, height, latitudeByRow: thermalLatitude },
          stepConfig.computeRadiativeForcing
        ).insolation,
        transientSalt: hasSeasons
          ? (Math.imul(
              rngSeed ^ (seasonIndex + 1),
              SEASON_TRANSIENT_SALT_MULTIPLIER
            ) >>>
              1) |
            0
          : 0,
      };
    });

    const seasonCount = seasonalForcing.length;
    const meanRainfall = new Uint8Array(size);
    const meanHumidity = new Uint8Array(size);
    const rainfallAmplitude = new Uint8Array(size);
    const humidityAmplitude = new Uint8Array(size);
    const clampI8 = (value: number): number =>
      Math.max(-I8_VECTOR_MAX_ABS, Math.min(I8_VECTOR_MAX_ABS, value));
    const meanOfF32Fields = (fields: readonly Float32Array[]): Float32Array<ArrayBuffer> => {
      const mean = new Float32Array(size);
      const fieldCount = Math.max(1, fields.length);
      for (let index = 0; index < size; index++) {
        let sum = 0;
        for (const field of fields) sum += field[index] ?? 0;
        mean[index] = sum / fieldCount;
      }
      return mean;
    };
    const meanOfI8Fields = (fields: readonly Int8Array[]): Int8Array<ArrayBuffer> => {
      const mean = new Int8Array(size);
      const fieldCount = Math.max(1, fields.length);
      for (let index = 0; index < size; index++) {
        let sum = 0;
        for (const field of fields) sum += field[index] ?? 0;
        mean[index] = clampI8(Math.round(sum / fieldCount));
      }
      return mean;
    };
    const meanOfU8Fields = (fields: readonly Uint8Array[]): Uint8Array<ArrayBuffer> => {
      const mean = new Uint8Array(size);
      const fieldCount = Math.max(1, fields.length);
      for (let index = 0; index < size; index++) {
        let sum = 0;
        for (const field of fields) sum += field[index] ?? 0;
        mean[index] = Math.max(0, Math.min(255, Math.round(sum / fieldCount)));
      }
      return mean;
    };

    const computeSeasonalAtmosphere = (sstC?: Float32Array) => {
      const zeroElevation = new Int16Array(size);
      const thermalSamples = seasonalForcing.map((forcing) => ({
        ...forcing,
        surfaceTemperatureC: ops.computeThermalState(
          {
            width,
            height,
            insolation: forcing.insolation,
            elevation: zeroElevation,
            landMask,
            ...(sstC ? { sstC } : {}),
          },
          stepConfig.computeThermalState
        ).surfaceTemperatureC,
      }));

      const meanSeaLevelTemperatureC = new Float32Array(size);
      for (const sample of thermalSamples) {
        for (let index = 0; index < size; index++) {
          meanSeaLevelTemperatureC[index] += sample.surfaceTemperatureC[index] ?? 0;
        }
      }
      for (let index = 0; index < size; index++) {
        meanSeaLevelTemperatureC[index] /= Math.max(1, thermalSamples.length);
      }

      const samples = thermalSamples.map((sample) => {
        const weatherMembers = TRANSIENT_POLARITIES.map((transientPolarity) => {
          const pressure = ops.computePressureField(
            {
              width,
              height,
              latitudeByRow: sample.circulationLatitude,
              surfaceTemperatureC: sample.surfaceTemperatureC,
              meanSurfaceTemperatureC: meanSeaLevelTemperatureC,
              landMask,
              rngSeed,
              seasonSalt: sample.transientSalt,
              transientPolarity,
            },
            stepConfig.computePressureField
          ).pressure;
          const winds = ops.computeAtmosphericCirculation(
            {
              width,
              height,
              latitudeByRow: sample.circulationLatitude,
              rngSeed,
              pressureField: pressure,
            },
            stepConfig.computeAtmosphericCirculation
          );
          const currents = ops.computeOceanSurfaceCurrents(
            {
              width,
              height,
              latitudeByRow: sample.circulationLatitude,
              isWaterMask,
              windU: winds.windU,
              windV: winds.windV,
              basinId: oceanGeometry?.basinId,
              coastDistance: oceanGeometry?.coastDistance,
              coastTangentU: oceanGeometry?.coastTangentU,
              coastTangentV: oceanGeometry?.coastTangentV,
            },
            stepConfig.computeOceanSurfaceCurrents
          );
          return {
            transientPolarity,
            pressure,
            windU: winds.windU,
            windV: winds.windV,
            currentU: currents.currentU,
            currentV: currents.currentV,
          };
        });
        return {
          ...sample,
          weatherMembers,
          pressure: meanOfF32Fields(weatherMembers.map((member) => member.pressure)),
          windU: meanOfI8Fields(weatherMembers.map((member) => member.windU)),
          windV: meanOfI8Fields(weatherMembers.map((member) => member.windV)),
          currentU: meanOfI8Fields(weatherMembers.map((member) => member.currentU)),
          currentV: meanOfI8Fields(weatherMembers.map((member) => member.currentV)),
        };
      });

      return {
        samples,
        meanWindU: meanOfI8Fields(samples.map((sample) => sample.windU)),
        meanWindV: meanOfI8Fields(samples.map((sample) => sample.windV)),
        meanCurrentU: meanOfI8Fields(samples.map((sample) => sample.currentU)),
        meanCurrentV: meanOfI8Fields(samples.map((sample) => sample.currentV)),
      };
    };

    const couplingIterations = usesCoupledClimatePath
      ? stepConfig.computeAtmosphericCirculation.strategy === "geostrophic-proxy"
        ? stepConfig.coupling.iterations
        : 1
      : 0;
    let carriedSstC: Float32Array | undefined;
    let oceanThermal: { sstC: Float32Array; seaIceMask: Uint8Array } | null = null;

    // Temperature -> pressure -> wind -> currents -> SST advances the slow ocean state. A final
    // atmosphere evaluation then consumes that state without advancing it again, so every
    // published atmospheric field and the downstream moisture pass share one climate vintage.
    for (let iteration = 0; iteration < couplingIterations; iteration++) {
      const iterationAtmosphere = computeSeasonalAtmosphere(carriedSstC);
      oceanThermal = ops.computeOceanThermalState(
        {
          width,
          height,
          latitudeByRow,
          isWaterMask,
          shelfMask: shelf.shelfMask,
          currentU: iterationAtmosphere.meanCurrentU,
          currentV: iterationAtmosphere.meanCurrentV,
        },
        stepConfig.computeOceanThermalState
      );
      carriedSstC = oceanThermal.sstC;
    }

    const atmosphere = computeSeasonalAtmosphere(carriedSstC);
    const seasonalPressure = atmosphere.samples.map((sample) => sample.pressure);
    const seasonalWindU = atmosphere.samples.map((sample) => sample.windU);
    const seasonalWindV = atmosphere.samples.map((sample) => sample.windV);
    const seasonalCurrentU = atmosphere.samples.map((sample) => sample.currentU);
    const seasonalCurrentV = atmosphere.samples.map((sample) => sample.currentV);
    const {
      meanWindU,
      meanWindV,
      meanCurrentU,
      meanCurrentV,
    } = atmosphere;
    const meanPressure = new Float32Array(size);
    for (const pressure of seasonalPressure) {
      for (let index = 0; index < size; index++) {
        meanPressure[index] += pressure[index] ?? 0;
      }
    }
    for (let index = 0; index < size; index++) {
      meanPressure[index] /= Math.max(1, seasonalPressure.length);
    }

    // Moisture and precipitation consume the same final atmosphere vintage. The uncoupled path
    // intentionally omits ocean-only inputs rather than manufacturing an empty ocean state.
    for (const sample of atmosphere.samples) {
      const thermal = ops.computeThermalState(
        {
          width,
          height,
          insolation: sample.insolation,
          elevation,
          landMask,
          ...(oceanThermal ? { sstC: oceanThermal.sstC } : {}),
        },
        stepConfig.computeThermalState
      );
      const weatherPrecipitation = sample.weatherMembers.map((member) => {
        const evaporation = ops.computeEvaporationSources(
          oceanThermal
            ? {
                width,
                height,
                landMask,
                surfaceTemperatureC: thermal.surfaceTemperatureC,
                windU: member.windU,
                windV: member.windV,
                sstC: oceanThermal.sstC,
                seaIceMask: oceanThermal.seaIceMask,
              }
            : {
                width,
                height,
                landMask,
                surfaceTemperatureC: thermal.surfaceTemperatureC,
              },
          stepConfig.computeEvaporationSources
        );
        const moisture = ops.transportMoisture(
          {
            width,
            height,
            latitudeByRow: sample.thermalLatitude,
            landMask,
            windU: member.windU,
            windV: member.windV,
            evaporation: evaporation.evaporation,
          },
          stepConfig.transportMoisture
        );
        return ops.computePrecipitation(
          {
            width,
            height,
            latitudeByRow: sample.thermalLatitude,
            elevation,
            landMask,
            windU: member.windU,
            windV: member.windV,
            humidityF32: moisture.humidity,
            perlinSeed,
          },
          stepConfig.computePrecipitation
        );
      });

      seasonalRainfall.push(
        meanOfU8Fields(weatherPrecipitation.map((member) => member.rainfall))
      );
      seasonalHumidity.push(
        meanOfU8Fields(weatherPrecipitation.map((member) => member.humidity))
      );
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

      meanRainfall[i] = Math.max(0, Math.min(200, Math.round(rainSum / seasonCount)));
      meanHumidity[i] = Math.max(0, Math.min(255, Math.round(humidSum / seasonCount)));
      rainfallAmplitude[i] = Math.max(0, Math.min(255, Math.round((rainMax - rainMin) / 2)));
      humidityAmplitude[i] = Math.max(0, Math.min(255, Math.round((humidMax - humidMin) / 2)));
    }

    const baselineClimateField = deps.artifacts.baselineClimateField.publish({
      rainfall: meanRainfall,
      humidity: meanHumidity,
    });
    const seasonalAmplitudes = {
      rainfallAmplitude,
      humidityAmplitude,
    };
    const pressureField = deps.artifacts.pressureField.publish({
      pressure: meanPressure,
    });
    const windField = deps.artifacts.windField.publish({
      windU: meanWindU,
      windV: meanWindV,
    });
    const currentField = {
      currentU: meanCurrentU,
      currentV: meanCurrentV,
    };
    return {
      baselineClimateField,
      seasonalAmplitudes,
      pressureField,
      windField,
      currentField,
      seasonalRainfall,
      seasonalHumidity,
      seasonalPressure,
      seasonalWindU,
      seasonalWindV,
      seasonalCurrentU,
      seasonalCurrentV,
      oceanGeometry,
      oceanThermal,
    };
  },
  viz: ({ observation, dimensions }) => buildClimateBaselineVizProjections(observation, dimensions),
});
