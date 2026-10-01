import { ctxRandom, ctxRandomLabel } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import {
  measureStandardSeasonalRainfall,
  STANDARD_SEASONAL_RAINFALL_METRIC_KEY,
} from "../../../../../../metrics/families/hydrology/climate-structure.js";
import {
  HYDROLOGY_DRYNESS_WETNESS_SCALE,
  HYDROLOGY_OCEAN_COUPLING_CURRENT_STRENGTH,
  HYDROLOGY_OCEAN_COUPLING_MOISTURE_TRANSPORT_ITERATIONS,
  HYDROLOGY_OCEAN_COUPLING_WATER_GRADIENT_RADIUS,
  HYDROLOGY_OCEAN_COUPLING_WIND_JET_STRENGTH,
  HYDROLOGY_SEASONALITY_DEFAULTS,
  HYDROLOGY_SEASONALITY_PRECIP_NOISE_AMPLITUDE,
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
const TRANSIENT_POLARITIES = [1, -1] as const;

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

    const computeThermalState = {
      ...stepConfig.computeThermalState,
      config: {
        ...stepConfig.computeThermalState.config,
        annualOffsetC: stepConfig.computeThermalState.config.annualOffsetC + temperatureDeltaC,
      },
    };

    const circulation = stepConfig.computeAtmosphericCirculation.config;
    const computeAtmosphericCirculation = {
      ...stepConfig.computeAtmosphericCirculation,
      config: {
        ...circulation,
        // Ocean coupling controls the circulation backbone; seasonality controls the
        // decorrelated weather budget. Keeping those axes separate preserves the authored
        // zonal-to-meridional ratio and avoids double-scaling transient pressure texture.
        zonalStrength: clampNumber(circulation.zonalStrength * jetStrengthFactor, 0, 300),
        meridionalStrength: clampNumber(circulation.meridionalStrength * jetStrengthFactor, 0, 200),
        pressureDrivenRms: clampNumber(circulation.pressureDrivenRms * varianceFactor, 0, 400),
      },
    };

    const computeOceanSurfaceCurrents = {
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

    const computeEvaporationSources = {
      ...stepConfig.computeEvaporationSources,
      config: {
        ...stepConfig.computeEvaporationSources.config,
        oceanStrength: stepConfig.computeEvaporationSources.config.oceanStrength * wetnessScale,
        landStrength: stepConfig.computeEvaporationSources.config.landStrength * wetnessScale,
      },
    };

    const transportMoisture = {
      ...stepConfig.transportMoisture,
      config: {
        ...stepConfig.transportMoisture.config,
        iterations: Math.max(
          0,
          Math.round(stepConfig.transportMoisture.config.iterations + transportIterationsDelta)
        ),
      },
    };

    const waterGradientRadiusDelta =
      HYDROLOGY_OCEAN_COUPLING_WATER_GRADIENT_RADIUS[oceanCoupling] -
      HYDROLOGY_OCEAN_COUPLING_WATER_GRADIENT_RADIUS.earthlike;
    const perRingBonusDelta =
      HYDROLOGY_WATER_GRADIENT_PER_RING_BONUS_BASE[oceanCoupling] -
      HYDROLOGY_WATER_GRADIENT_PER_RING_BONUS_BASE.earthlike;
    const computePrecipitation = {
      ...stepConfig.computePrecipitation,
      config: {
        ...stepConfig.computePrecipitation.config,
        rainfallScale: stepConfig.computePrecipitation.config.rainfallScale * wetnessScale,
        noiseAmplitude: stepConfig.computePrecipitation.config.noiseAmplitude * noiseAmplitudeFactor,
        waterGradient: {
          ...stepConfig.computePrecipitation.config.waterGradient,
          radius: Math.max(
            1,
            Math.round(
              stepConfig.computePrecipitation.config.waterGradient.radius + waterGradientRadiusDelta
            )
          ),
          perRingBonus: Math.max(
            0,
            Math.round(
              (stepConfig.computePrecipitation.config.waterGradient.perRingBonus + perRingBonusDelta) *
                wetnessScale
            )
          ),
          lowlandBonus: Math.max(
            0,
            Math.round(stepConfig.computePrecipitation.config.waterGradient.lowlandBonus * wetnessScale)
          ),
        },
      },
    };

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
    const sampling = ops.computeSeasonalSampling(
      { width, height, topLatitude, bottomLatitude, modeCount, axialTiltDeg, rngSeed },
      stepConfig.computeSeasonalSampling
    );
    const { latitudeByRow } = sampling;

    const seasonalRainfall: Uint8Array[] = [];
    const seasonalHumidity: Uint8Array[] = [];
    const seasonalDemand: number[][] = [];
    const seasonalSurfaceTemperatureC: Float32Array[] = [];

    const oceanGeometry = ops.computeOceanGeometry(
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

    // Solar forcing is fixed across coupling vintages; the domain sampling plan separately
    // owns the circulation and moisture latitude frames.
    const solar = ops.computeRadiativeForcing(
      { model: "daily-solar-fourier", width, height, latitudeByRow, axialTiltDeg },
      stepConfig.computeRadiativeForcing
    );

    const computeSeasonalAtmosphere = (sstC: Float32Array) => {
      const periodicThermal = ops.computeThermalState(
        {
          model: "periodic-response",
          width,
          height,
          solarByRow: solar.solarByRow,
          phases: sampling.phases,
          weights: sampling.weights,
          elevation,
          seaLevel: topography.seaLevel,
          landMask,
          sstC,
        },
        stepConfig.computeThermalState
      );
      const thermalSamples = sampling.frames.map((frame, index) => ({
        ...frame,
        seaLevelTemperatureC: periodicThermal.samples[index]!.seaLevelTemperatureC,
        groundTemperatureC: periodicThermal.samples[index]!.surfaceTemperatureC,
      }));
      const meanSeaLevelTemperatureC = periodicThermal.meanSeaLevelTemperatureC;

      const samples = thermalSamples.map((sample) => {
        const weatherMembers = TRANSIENT_POLARITIES.map((transientPolarity) => {
          const pressure = ops.computePressureField(
            {
              width,
              height,
              latitudeByRow: sample.circulationLatitude,
              surfaceTemperatureC: sample.seaLevelTemperatureC,
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
              basinId: oceanGeometry.basinId,
              coastDistance: oceanGeometry.coastDistance,
              coastTangentU: oceanGeometry.coastTangentU,
              coastTangentV: oceanGeometry.coastTangentV,
            },
            stepConfig.computeOceanSurfaceCurrents
          );
          return {
            pressure,
            windU: winds.windU,
            windV: winds.windV,
            currentU: currents.currentU,
            currentV: currents.currentV,
          };
        });
        const aggregate = ops.computeAtmosphericAggregate(
          { reduction: "weather-members", width, height, samples: weatherMembers },
          stepConfig.computeAtmosphericAggregate
        );
        if (aggregate.reduction !== "weather-members")
          throw new Error("Expected weather-member reduction.");
        return {
          ...sample,
          weatherMembers,
          ...aggregate,
        };
      });
      const aggregate = ops.computeAtmosphericAggregate(
        {
          reduction: "annual",
          width,
          height,
          model: sampling.model,
          weights: sampling.weights,
          samples: samples.map(({ pressure, windU, windV, currentU, currentV }) => ({
            pressure,
            windU,
            windV,
            currentU,
            currentV,
          })),
        },
        stepConfig.computeAtmosphericAggregate
      );
      if (aggregate.reduction !== "annual")
        throw new Error("Expected annual atmosphere reduction.");
      return {
        samples,
        meanWindU: aggregate.windU,
        meanWindV: aggregate.windV,
        meanCurrentU: aggregate.currentU,
        meanCurrentV: aggregate.currentV,
        meanPressure: aggregate.pressure,
        periodicThermal,
      };
    };

    let oceanThermal = ops.computeOceanThermalState(
      {
        width,
        height,
        latitudeByRow,
        isWaterMask,
        shelfMask: shelf.shelfMask,
        currentU: new Int8Array(size),
        currentV: new Int8Array(size),
      },
      stepConfig.computeOceanThermalState
    );
    let carriedSstC = oceanThermal.sstC;

    // Fixed-point passes update the prescribed annual SST. The final atmosphere consumes it
    // without another ocean advance, preserving one vintage for pressure and moisture.
    for (let iteration = 0; iteration < stepConfig.coupling.iterations; iteration++) {
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
    const { meanWindU, meanWindV, meanCurrentU, meanCurrentV, meanPressure } = atmosphere;

    // Moisture and precipitation consume the same final atmosphere and prescribed SST vintage.
    for (const sample of atmosphere.samples) {
      const surfaceTemperatureC = sample.groundTemperatureC;
      seasonalSurfaceTemperatureC.push(surfaceTemperatureC);
      const weatherPrecipitation = sample.weatherMembers.map((member) => {
        const evaporation = ops.computeEvaporationSources(
          {
            width,
            height,
            landMask,
            surfaceTemperatureC,
            windU: member.windU,
            windV: member.windV,
            sstC: oceanThermal.sstC,
            seaIceMask: oceanThermal.seaIceMask,
          },
          stepConfig.computeEvaporationSources
        );
        const moisture = ops.transportMoisture(
          {
            width,
            height,
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

      const precipitation = ops.computeMoistureAggregate(
        { reduction: "weather-members", width, height, samples: weatherPrecipitation },
        stepConfig.computeMoistureAggregate
      );
      if (precipitation.reduction !== "weather-members")
        throw new Error("Expected weather precipitation reduction.");
      seasonalRainfall.push(precipitation.rainfall);
      const humidity = precipitation.humidity;
      seasonalHumidity.push(humidity);
      seasonalDemand.push(
        ops.computePotentialDemand(
          {
            width,
            height,
            landMask,
            surfaceTemperatureC,
            humidity,
            parameters: stepConfig.potentialDemand,
          },
          stepConfig.computePotentialDemand
        ).pet
      );
    }

    const annualMoisture = ops.computeMoistureAggregate(
      {
        reduction: "annual",
        width,
        height,
        model: sampling.model,
        weights: sampling.weights,
        samples: seasonalRainfall.map((rainfall, index) => ({
          rainfall,
          humidity: seasonalHumidity[index]!,
          potentialDemand: seasonalDemand[index]!,
        })),
      },
      stepConfig.computeMoistureAggregate
    );
    if (annualMoisture.reduction !== "annual")
      throw new Error("Expected annual moisture reduction.");

    const baselineClimateField = deps.artifacts.baselineClimateField.publish({
      rainfall: annualMoisture.rainfall,
      humidity: annualMoisture.humidity,
      potentialDemand: annualMoisture.potentialDemand,
      demandParameters: { ...stepConfig.potentialDemand },
    });
    const seasonalAmplitudes = {
      rainfallAmplitude: annualMoisture.rainfallAmplitude,
      humidityAmplitude: annualMoisture.humidityAmplitude,
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
    const thermalField = deps.artifacts.thermalField.publish({
      surfaceTemperatureC: atmosphere.periodicThermal.annualSurfaceTemperatureC,
    });
    const observe = <T>(samples: readonly T[]): T[] =>
      sampling.observationIndices.map((index) => samples[index]!);
    return {
      baselineClimateField,
      thermalField,
      landMask,
      seasonalAmplitudes,
      pressureField,
      windField,
      currentField,
      seasonalRainfall: observe(seasonalRainfall),
      seasonalHumidity: observe(seasonalHumidity),
      seasonalSurfaceTemperatureC: observe(seasonalSurfaceTemperatureC),
      seasonalPressure: observe(seasonalPressure),
      seasonalWindU: observe(seasonalWindU),
      seasonalWindV: observe(seasonalWindV),
      seasonalCurrentU: observe(seasonalCurrentU),
      seasonalCurrentV: observe(seasonalCurrentV),
      seasonalIntegration: {
        model: sampling.model,
        phaseOrigin: "northward-equinox" as const,
        phases: sampling.phases,
        weights: sampling.weights,
        observationIndices: sampling.observationIndices,
        rainfall: seasonalRainfall,
        humidity: seasonalHumidity,
        potentialDemand: seasonalDemand,
        surfaceTemperatureC: seasonalSurfaceTemperatureC,
        pressure: seasonalPressure,
        windU: seasonalWindU,
        windV: seasonalWindV,
        currentU: seasonalCurrentU,
        currentV: seasonalCurrentV,
      },
      thermalResponse: {
        annualUnclippedSurfaceTemperatureC:
          atmosphere.periodicThermal.annualUnclippedSurfaceTemperatureC,
        annualClippingDeltaC: atmosphere.periodicThermal.annualClippingDeltaC,
      },
      oceanGeometry,
      oceanThermal,
    };
  },
  metrics: ({ observation }) => ({
    [STANDARD_SEASONAL_RAINFALL_METRIC_KEY]: measureStandardSeasonalRainfall(observation),
  }),
  viz: ({ observation, dimensions }) => buildClimateBaselineVizProjections(observation, dimensions),
});
