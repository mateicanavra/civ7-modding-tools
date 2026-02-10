import { ctxRandom, ctxRandomLabel, defineVizMeta, dumpScalarFieldVariants, writeClimateField } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import ClimateRefineStepContract from "./climateRefine.contract.js";
import { hydrologyClimateRefineArtifacts } from "../artifacts.js";
import { computeRiverAdjacencyMaskFromRiverClass } from "../../hydrology-hydrography/river-adjacency.js";
import {
  HYDROLOGY_DRYNESS_WETNESS_SCALE,
  HYDROLOGY_TEMPERATURE_BASE_TEMPERATURE_C,
} from "@mapgen/domain/hydrology/shared/knob-multipliers.js";
import type {
  HydrologyCryosphereKnob,
  HydrologyDrynessKnob,
  HydrologyTemperatureKnob,
} from "@mapgen/domain/hydrology/shared/knobs.js";

type ArtifactValidationIssue = Readonly<{ message: string }>;

const GROUP_CLIMATE = "Hydrology / Climate";
const GROUP_INDICES = "Hydrology / Climate Indices";
const GROUP_CRYOSPHERE = "Hydrology / Cryosphere";
const GROUP_DIAGNOSTICS = "Hydrology / Diagnostics";
const TILE_SPACE_ID = "tile.hexOddR" as const;

const EFFECTIVE_MOISTURE_HUMIDITY_WEIGHT = 0.35;
const EFFECTIVE_MOISTURE_RIPARIAN_RADIUS = 1;
const EFFECTIVE_MOISTURE_MINOR_RIVER_BONUS = 4;
const EFFECTIVE_MOISTURE_MAJOR_RIVER_BONUS = 8;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function expectedSize(width: number, height: number): number {
  return Math.max(0, (width | 0) * (height | 0));
}

function validateTypedArray(
  errors: ArtifactValidationIssue[],
  label: string,
  value: unknown,
  ctor: { new (...args: any[]): { length: number } },
  expectedLength?: number
): void {
  if (!(value instanceof ctor)) {
    errors.push({ message: `Expected ${label} to be ${ctor.name}.` });
    return;
  }
  if (expectedLength != null && value.length !== expectedLength) {
    errors.push({ message: `Expected ${label} length ${expectedLength} (received ${value.length}).` });
  }
}

export default createStep(ClimateRefineStepContract, {
  artifacts: implementArtifacts(
    [
      hydrologyClimateRefineArtifacts.climateIndices,
      hydrologyClimateRefineArtifacts.cryosphere,
      hydrologyClimateRefineArtifacts.climateDiagnostics,
    ],
    {
      climateIndices: {
        validate: (value, context) => {
          const errors: ArtifactValidationIssue[] = [];
          const size = expectedSize(context.dimensions.width, context.dimensions.height);
          if (!isRecord(value)) return [{ message: "Missing hydrology climate indices artifact payload." }];
          const candidate = value as {
            surfaceTemperatureC?: unknown;
            effectiveMoisture?: unknown;
            pet?: unknown;
            aridityIndex?: unknown;
            freezeIndex?: unknown;
          };
          validateTypedArray(errors, "climateIndices.surfaceTemperatureC", candidate.surfaceTemperatureC, Float32Array, size);
          validateTypedArray(errors, "climateIndices.effectiveMoisture", candidate.effectiveMoisture, Float32Array, size);
          validateTypedArray(errors, "climateIndices.pet", candidate.pet, Float32Array, size);
          validateTypedArray(errors, "climateIndices.aridityIndex", candidate.aridityIndex, Float32Array, size);
          validateTypedArray(errors, "climateIndices.freezeIndex", candidate.freezeIndex, Float32Array, size);
          return errors;
        },
      },
      cryosphere: {
        validate: (value, context) => {
          const errors: ArtifactValidationIssue[] = [];
          const size = expectedSize(context.dimensions.width, context.dimensions.height);
          if (!isRecord(value)) return [{ message: "Missing hydrology cryosphere artifact payload." }];
          const candidate = value as { snowCover?: unknown; seaIceCover?: unknown; albedo?: unknown };
          validateTypedArray(errors, "cryosphere.snowCover", candidate.snowCover, Uint8Array, size);
          validateTypedArray(errors, "cryosphere.seaIceCover", candidate.seaIceCover, Uint8Array, size);
          validateTypedArray(errors, "cryosphere.albedo", candidate.albedo, Uint8Array, size);
          return errors;
        },
      },
      climateDiagnostics: {
        validate: (value, context) => {
          const errors: ArtifactValidationIssue[] = [];
          const size = expectedSize(context.dimensions.width, context.dimensions.height);
          if (!isRecord(value)) return [{ message: "Missing hydrology climate diagnostics artifact payload." }];
          const candidate = value as {
            rainShadowIndex?: unknown;
            continentalityIndex?: unknown;
            convergenceIndex?: unknown;
          };
          validateTypedArray(errors, "climateDiagnostics.rainShadowIndex", candidate.rainShadowIndex, Float32Array, size);
          validateTypedArray(errors, "climateDiagnostics.continentalityIndex", candidate.continentalityIndex, Float32Array, size);
          validateTypedArray(errors, "climateDiagnostics.convergenceIndex", candidate.convergenceIndex, Float32Array, size);
          return errors;
        },
      },
    }
  ),
  normalize: (config, ctx) => {
    const { dryness, temperature, cryosphere } = ctx.knobs as {
      dryness: HydrologyDrynessKnob;
      temperature: HydrologyTemperatureKnob;
      cryosphere: HydrologyCryosphereKnob;
    };

    const wetnessScale = HYDROLOGY_DRYNESS_WETNESS_SCALE[dryness];
    const baseTemperatureC = HYDROLOGY_TEMPERATURE_BASE_TEMPERATURE_C[temperature];

    const next = { ...config };

    if (next.computeThermalState.strategy === "default") {
      const deltaC = baseTemperatureC - HYDROLOGY_TEMPERATURE_BASE_TEMPERATURE_C.temperate;
      if (deltaC !== 0) {
        next.computeThermalState = {
          ...next.computeThermalState,
          config: {
            ...next.computeThermalState.config,
            // Temperature knobs should not simply warm/cool the whole world uniformly (that erases tundra/snow).
            // Instead, bias the baseline modestly and put most of the adjustment into the equator-to-pole contrast.
            baseTemperatureC: next.computeThermalState.config.baseTemperatureC + deltaC * 0.5,
            insolationScaleC: Math.max(0, Math.min(80, next.computeThermalState.config.insolationScaleC + deltaC * 2)),
          },
        };
      }
    }

    if (next.computePrecipitation.strategy === "refine") {
      const cur = next.computePrecipitation.config;
      next.computePrecipitation = {
        ...next.computePrecipitation,
        config: {
          ...cur,
          riverCorridor: {
            ...cur.riverCorridor,
            lowlandAdjacencyBonus: Math.round(cur.riverCorridor.lowlandAdjacencyBonus * wetnessScale),
            highlandAdjacencyBonus: Math.round(cur.riverCorridor.highlandAdjacencyBonus * wetnessScale),
          },
          lowBasin: {
            ...cur.lowBasin,
            delta: Math.round(cur.lowBasin.delta * wetnessScale),
          },
        },
      };
    }

    if (cryosphere === "off") {
      if (next.applyAlbedoFeedback.strategy === "default") {
        next.applyAlbedoFeedback = {
          ...next.applyAlbedoFeedback,
          config: { ...next.applyAlbedoFeedback.config, iterations: 0 },
        };
      }

      if (next.computeCryosphereState.strategy === "default") {
        next.computeCryosphereState = {
          ...next.computeCryosphereState,
          config: {
            ...next.computeCryosphereState.config,
            landSnowStartC: -60,
            landSnowFullC: -80,
            seaIceStartC: -60,
            seaIceFullC: -80,
            freezeIndexStartC: -60,
            freezeIndexFullC: -80,
            precipitationInfluence: 0,
            snowAlbedoBoost: 0,
            seaIceAlbedoBoost: 0,
          },
        };
      }
    }

    return next;
  },
  run: (context, config, ops, deps) => {
    const { width, height } = context.dimensions;
    const windField = deps.artifacts.windField.read(context);
    const hydrography = deps.artifacts.hydrography.read(context) as { riverClass: Uint8Array };
    const topography = deps.artifacts.topography.read(context) as {
      elevation: Int16Array;
      landMask: Uint8Array;
    };

    const climateField = deps.artifacts.climateField.read(context) as {
      rainfall: Uint8Array;
      humidity: Uint8Array;
    };

    const { topLatitude, bottomLatitude } = context.env.latitudeBounds;
    const latitudeByRow = new Float32Array(height);
    if (height <= 1) {
      const mid = (topLatitude + bottomLatitude) / 2;
      for (let y = 0; y < height; y++) latitudeByRow[y] = mid;
    } else {
      const step = (bottomLatitude - topLatitude) / (height - 1);
      for (let y = 0; y < height; y++) {
        latitudeByRow[y] = topLatitude + step * y;
      }
    }

    const size = width * height;
    const humidityF32 = new Float32Array(size);
    for (let i = 0; i < size; i++) humidityF32[i] = (climateField.humidity[i] ?? 0) / 255;

    const stepId = `${ClimateRefineStepContract.phase}/${ClimateRefineStepContract.id}`;
    const perlinSeed = ctxRandom(
      context,
      ctxRandomLabel(stepId, "hydrology/compute-precipitation/noise"),
      2_147_483_647
    );

    const riverAdjacency = computeRiverAdjacencyMaskFromRiverClass({
      width,
      height,
      riverClass: hydrography.riverClass,
      radius: 1,
    });

    const refined = ops.computePrecipitation(
      {
        width,
        height,
        latitudeByRow,
        elevation: topography.elevation,
        landMask: topography.landMask,
        windU: windField.windU,
        windV: windField.windV,
        humidityF32,
        rainfallIn: climateField.rainfall,
        humidityIn: climateField.humidity,
        riverAdjacency,
        perlinSeed,
      },
      config.computePrecipitation
    );

    const riparianBonusByTile = new Float32Array(size);
    for (let y = 0; y < height; y++) {
      const y0 = Math.max(0, y - EFFECTIVE_MOISTURE_RIPARIAN_RADIUS);
      const y1 = Math.min(height - 1, y + EFFECTIVE_MOISTURE_RIPARIAN_RADIUS);
      const yOffset = y * width;
      for (let x = 0; x < width; x++) {
        const x0 = Math.max(0, x - EFFECTIVE_MOISTURE_RIPARIAN_RADIUS);
        const x1 = Math.min(width - 1, x + EFFECTIVE_MOISTURE_RIPARIAN_RADIUS);

        let maxClass = 0;
        for (let yy = y0; yy <= y1; yy++) {
          const yyOffset = yy * width;
          for (let xx = x0; xx <= x1; xx++) {
            const cls = hydrography.riverClass[yyOffset + xx] ?? 0;
            if (cls > maxClass) maxClass = cls;
            if (maxClass >= 2) break;
          }
          if (maxClass >= 2) break;
        }

        const idx = yOffset + x;
        if (maxClass >= 2) riparianBonusByTile[idx] = EFFECTIVE_MOISTURE_MAJOR_RIVER_BONUS;
        else if (maxClass >= 1) riparianBonusByTile[idx] = EFFECTIVE_MOISTURE_MINOR_RIVER_BONUS;
      }
    }

    const effectiveMoisture = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      if (topography.landMask[i] === 0) {
        effectiveMoisture[i] = 0;
        continue;
      }
      const rainfall = refined.rainfall[i] ?? 0;
      const humidity = refined.humidity[i] ?? 0;
      const riparianBonus = riparianBonusByTile[i] ?? 0;
      effectiveMoisture[i] = rainfall + EFFECTIVE_MOISTURE_HUMIDITY_WEIGHT * humidity + riparianBonus;
    }

    const forcing = ops.computeRadiativeForcing({ width, height, latitudeByRow }, config.computeRadiativeForcing);
    const thermal = ops.computeThermalState(
      {
        width,
        height,
        insolation: forcing.insolation,
        elevation: topography.elevation,
        landMask: topography.landMask,
      },
      config.computeThermalState
    );

    const albedoFeedback = ops.applyAlbedoFeedback(
      {
        width,
        height,
        landMask: topography.landMask,
        rainfall: refined.rainfall,
        surfaceTemperatureC: thermal.surfaceTemperatureC,
      },
      config.applyAlbedoFeedback
    );

    const cryosphere = ops.computeCryosphereState(
      {
        width,
        height,
        landMask: topography.landMask,
        surfaceTemperatureC: albedoFeedback.surfaceTemperatureC,
        rainfall: refined.rainfall,
      },
      config.computeCryosphereState
    );

    const waterBudget = ops.computeLandWaterBudget(
      {
        width,
        height,
        landMask: topography.landMask,
        rainfall: refined.rainfall,
        humidity: refined.humidity,
        surfaceTemperatureC: albedoFeedback.surfaceTemperatureC,
      },
      config.computeLandWaterBudget
    );

    const diagnostics = ops.computeClimateDiagnostics(
      {
        width,
        height,
        latitudeByRow,
        elevation: topography.elevation,
        landMask: topography.landMask,
        windU: windField.windU,
        windV: windField.windV,
        rainfall: refined.rainfall,
        humidity: refined.humidity,
      },
      config.computeClimateDiagnostics
    );

    dumpScalarFieldVariants(context.trace, context.viz, {
      dataTypeKey: "hydrology.climate.rainfall",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      field: { format: "u8", values: refined.rainfall },
      label: "Rainfall",
      group: GROUP_CLIMATE,
      palette: "continuous",
      points: {},
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.climate.humidity",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: refined.humidity,
      meta: defineVizMeta("hydrology.climate.humidity", {
        label: "Humidity",
        group: GROUP_CLIMATE,
        visibility: "debug",
      }),
    });
    dumpScalarFieldVariants(context.trace, context.viz, {
      dataTypeKey: "hydrology.climate.indices.surfaceTemperatureC",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      field: { format: "f32", values: albedoFeedback.surfaceTemperatureC },
      label: "Surface Temperature (C)",
      group: GROUP_INDICES,
      palette: "continuous",
      points: {},
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.climate.indices.pet",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: waterBudget.pet,
      meta: defineVizMeta("hydrology.climate.indices.pet", {
        label: "Potential Evapotranspiration",
        group: GROUP_INDICES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.climate.indices.effectiveMoisture",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: effectiveMoisture,
      meta: defineVizMeta("hydrology.climate.indices.effectiveMoisture", {
        label: "Effective Moisture",
        group: GROUP_INDICES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.climate.indices.aridityIndex",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: waterBudget.aridityIndex,
      meta: defineVizMeta("hydrology.climate.indices.aridityIndex", {
        label: "Aridity Index",
        group: GROUP_INDICES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.climate.indices.freezeIndex",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: cryosphere.freezeIndex,
      meta: defineVizMeta("hydrology.climate.indices.freezeIndex", {
        label: "Freeze Index",
        group: GROUP_INDICES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.cryosphere.snowCover",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: cryosphere.snowCover,
      meta: defineVizMeta("hydrology.cryosphere.snowCover", {
        label: "Snow Cover",
        group: GROUP_CRYOSPHERE,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.cryosphere.seaIceCover",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: cryosphere.seaIceCover,
      meta: defineVizMeta("hydrology.cryosphere.seaIceCover", {
        label: "Sea Ice Cover",
        group: GROUP_CRYOSPHERE,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.cryosphere.albedo",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: cryosphere.albedo,
      meta: defineVizMeta("hydrology.cryosphere.albedo", {
        label: "Albedo",
        group: GROUP_CRYOSPHERE,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.cryosphere.groundIce01",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: cryosphere.groundIce01,
      meta: defineVizMeta("hydrology.cryosphere.groundIce01", {
        label: "Ground Ice (0-1)",
        group: GROUP_CRYOSPHERE,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.cryosphere.permafrost01",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: cryosphere.permafrost01,
      meta: defineVizMeta("hydrology.cryosphere.permafrost01", {
        label: "Permafrost (0-1)",
        group: GROUP_CRYOSPHERE,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.cryosphere.meltPotential01",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: cryosphere.meltPotential01,
      meta: defineVizMeta("hydrology.cryosphere.meltPotential01", {
        label: "Melt Potential (0-1)",
        group: GROUP_CRYOSPHERE,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.climate.diagnostics.rainShadowIndex",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: diagnostics.rainShadowIndex,
      meta: defineVizMeta("hydrology.climate.diagnostics.rainShadowIndex", {
        label: "Rain Shadow Index",
        group: GROUP_DIAGNOSTICS,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.climate.diagnostics.continentalityIndex",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: diagnostics.continentalityIndex,
      meta: defineVizMeta("hydrology.climate.diagnostics.continentalityIndex", {
        label: "Continentality Index",
        group: GROUP_DIAGNOSTICS,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "hydrology.climate.diagnostics.convergenceIndex",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: diagnostics.convergenceIndex,
      meta: defineVizMeta("hydrology.climate.diagnostics.convergenceIndex", {
        label: "Convergence Index",
        group: GROUP_DIAGNOSTICS,
        visibility: "debug",
      }),
    });

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const i = rowOffset + x;
        writeClimateField(context, x, y, {
          rainfall: refined.rainfall[i],
          humidity: refined.humidity[i],
        });
      }
    }

    deps.artifacts.climateIndices.publish(context, {
      surfaceTemperatureC: albedoFeedback.surfaceTemperatureC,
      effectiveMoisture,
      pet: waterBudget.pet,
      aridityIndex: waterBudget.aridityIndex,
      freezeIndex: cryosphere.freezeIndex,
    });
    deps.artifacts.cryosphere.publish(context, {
      snowCover: cryosphere.snowCover,
      seaIceCover: cryosphere.seaIceCover,
      albedo: cryosphere.albedo,
      groundIce01: cryosphere.groundIce01,
      permafrost01: cryosphere.permafrost01,
      meltPotential01: cryosphere.meltPotential01,
    });
    deps.artifacts.climateDiagnostics.publish(context, {
      rainShadowIndex: diagnostics.rainShadowIndex,
      continentalityIndex: diagnostics.continentalityIndex,
      convergenceIndex: diagnostics.convergenceIndex,
    });

  },
});
