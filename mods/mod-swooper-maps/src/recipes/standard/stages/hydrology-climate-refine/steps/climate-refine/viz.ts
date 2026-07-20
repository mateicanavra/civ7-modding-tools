import { buildScalarFieldProjections, type VizDims, type VizProjection } from "@swooper/mapgen-viz";
import { defineStandardVizMeta } from "../../../../viz.js";

const GROUP_CLIMATE = "Hydrology / Climate";
const GROUP_INDICES = "Hydrology / Climate Indices";
const GROUP_CRYOSPHERE = "Hydrology / Cryosphere";
const GROUP_DIAGNOSTICS = "Hydrology / Diagnostics";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/** Published refined-climate artifacts observed by the optional visualization facet. */
export type ClimateRefineVizEvidence = Readonly<{
  climateField: Readonly<{ rainfall: Uint8Array; humidity: Uint8Array }>;
  climateIndices: Readonly<{
    surfaceTemperatureC: Float32Array;
    effectiveMoisture: Float32Array;
    pet: Float32Array;
    aridityIndex: Float32Array;
    freezeIndex: Float32Array;
  }>;
  cryosphere: Readonly<{
    snowCover: Uint8Array;
    seaIceCover: Uint8Array;
    albedo: Uint8Array;
    groundIce01: Float32Array;
    permafrost01: Float32Array;
    meltPotential01: Float32Array;
  }>;
  diagnostics: Readonly<{
    rainShadowIndex: Float32Array;
    continentalityIndex: Float32Array;
    convergenceIndex: Float32Array;
  }>;
}>;

/**
 * Projects the four published refined-climate artifacts after their artifact providers succeed.
 * No projector path can rerun climate operations or observe mutable runtime state.
 */
export function buildClimateRefineVizProjections(
  result: ClimateRefineVizEvidence,
  dimensions: VizDims
): readonly VizProjection[] {
  return [
    ...buildScalarFieldProjections({
      dataTypeKey: "hydrology.climate.rainfall",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: result.climateField.rainfall },
      meta: defineStandardVizMeta("hydrology.climate.rainfall", "climate.moisture", {
        label: "Rainfall",
        group: GROUP_CLIMATE,
      }),
      points: {},
    }),
    {
      kind: "grid",
      dataTypeKey: "hydrology.climate.humidity",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: result.climateField.humidity },
      meta: defineStandardVizMeta("hydrology.climate.humidity", "climate.moisture", {
        label: "Humidity",
        group: GROUP_CLIMATE,
        visibility: "debug",
      }),
    },
    ...buildScalarFieldProjections({
      dataTypeKey: "hydrology.climate.indices.surfaceTemperatureC",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "f32", values: result.climateIndices.surfaceTemperatureC },
      meta: defineStandardVizMeta(
        "hydrology.climate.indices.surfaceTemperatureC",
        "climate.temperature",
        { label: "Surface Temperature (C)", group: GROUP_INDICES }
      ),
      points: {},
    }),
    {
      kind: "grid",
      dataTypeKey: "hydrology.climate.indices.pet",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "f32", values: result.climateIndices.pet },
      meta: defineStandardVizMeta("hydrology.climate.indices.pet", "field.intensity", {
        label: "Potential Evapotranspiration",
        group: GROUP_INDICES,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.climate.indices.effectiveMoisture",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "f32", values: result.climateIndices.effectiveMoisture },
      meta: defineStandardVizMeta(
        "hydrology.climate.indices.effectiveMoisture",
        "climate.moisture",
        { label: "Effective Moisture", group: GROUP_INDICES, visibility: "debug" }
      ),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.climate.indices.aridityIndex",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "f32", values: result.climateIndices.aridityIndex },
      meta: defineStandardVizMeta("hydrology.climate.indices.aridityIndex", "field.intensity", {
        label: "Aridity Index",
        group: GROUP_INDICES,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.climate.indices.freezeIndex",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "f32", values: result.climateIndices.freezeIndex },
      meta: defineStandardVizMeta("hydrology.climate.indices.freezeIndex", "field.intensity", {
        label: "Freeze Index",
        group: GROUP_INDICES,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.cryosphere.snowCover",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: result.cryosphere.snowCover },
      meta: defineStandardVizMeta("hydrology.cryosphere.snowCover", "field.intensity", {
        label: "Snow Cover",
        group: GROUP_CRYOSPHERE,
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.cryosphere.seaIceCover",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: result.cryosphere.seaIceCover },
      meta: defineStandardVizMeta("hydrology.cryosphere.seaIceCover", "water.depth", {
        label: "Sea Ice Cover",
        group: GROUP_CRYOSPHERE,
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.cryosphere.albedo",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: result.cryosphere.albedo },
      meta: defineStandardVizMeta("hydrology.cryosphere.albedo", "field.intensity", {
        label: "Albedo",
        group: GROUP_CRYOSPHERE,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.cryosphere.groundIce01",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "f32", values: result.cryosphere.groundIce01 },
      meta: defineStandardVizMeta("hydrology.cryosphere.groundIce01", "field.intensity", {
        label: "Ground Ice (0-1)",
        group: GROUP_CRYOSPHERE,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.cryosphere.permafrost01",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "f32", values: result.cryosphere.permafrost01 },
      meta: defineStandardVizMeta("hydrology.cryosphere.permafrost01", "field.intensity", {
        label: "Permafrost (0-1)",
        group: GROUP_CRYOSPHERE,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.cryosphere.meltPotential01",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "f32", values: result.cryosphere.meltPotential01 },
      meta: defineStandardVizMeta("hydrology.cryosphere.meltPotential01", "field.intensity", {
        label: "Melt Potential (0-1)",
        group: GROUP_CRYOSPHERE,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.climate.diagnostics.rainShadowIndex",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "f32", values: result.diagnostics.rainShadowIndex },
      meta: defineStandardVizMeta("hydrology.climate.diagnostics.rainShadowIndex", "field.signed", {
        label: "Rain Shadow Index",
        group: GROUP_DIAGNOSTICS,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.climate.diagnostics.continentalityIndex",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "f32", values: result.diagnostics.continentalityIndex },
      meta: defineStandardVizMeta(
        "hydrology.climate.diagnostics.continentalityIndex",
        "field.intensity",
        { label: "Continentality Index", group: GROUP_DIAGNOSTICS, visibility: "debug" }
      ),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.climate.diagnostics.convergenceIndex",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "f32", values: result.diagnostics.convergenceIndex },
      meta: defineStandardVizMeta(
        "hydrology.climate.diagnostics.convergenceIndex",
        "field.signed",
        { label: "Convergence Index", group: GROUP_DIAGNOSTICS, visibility: "debug" }
      ),
    },
  ];
}
