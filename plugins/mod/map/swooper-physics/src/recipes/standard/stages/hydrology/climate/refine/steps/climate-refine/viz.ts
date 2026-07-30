import { artifacts as climateArtifacts } from "../../../../../../../../domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as cryosphereArtifacts } from "../../../../../../../../domain/hydrology/modules/cryosphere/artifacts/index.js";
import type { ArtifactReadValueOf } from "@swooper/mapgen-core/authoring";
import {
  buildScalarFieldProjections,
  type VizDims,
  type VizProjection,
  type VizScalarSource,
} from "@swooper/mapgen-viz";
import { defineStandardVizMeta } from "../../../../../../viz.js";

const GROUP_CLIMATE = "Hydrology / Climate";
const GROUP_INDICES = "Hydrology / Climate Indices";
const GROUP_CRYOSPHERE = "Hydrology / Cryosphere";
const GROUP_DIAGNOSTICS = "Hydrology / Diagnostics";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

type ClimateField = ArtifactReadValueOf<typeof climateArtifacts.climateField>;
type ClimateIndices = ArtifactReadValueOf<typeof climateArtifacts.climateIndices>;
type Cryosphere = ArtifactReadValueOf<typeof cryosphereArtifacts.cryosphere>;
type Float32VizValues = Extract<VizScalarSource, { format: "f32" }>["values"];

/** Refined physical products and admitted inputs observed by the visualization facet. */
type ClimateRefineVizEvidence = Readonly<{
  climateField: ClimateField;
  climateIndices: ClimateIndices;
  cryosphere: Cryosphere;
  diagnostics: Readonly<{
    rainShadowIndex: Float32VizValues;
    continentalityIndex: Float32VizValues;
    convergenceIndex: Float32VizValues;
  }>;
}>;

/**
 * Projects admitted refined-climate products and ephemeral diagnostics after providers succeed.
 * No projector path can rerun climate operations or promote advisory evidence into pipeline state.
 */
export function buildClimateRefineVizProjections(
  observation: ClimateRefineVizEvidence,
  dimensions: VizDims
): readonly VizProjection[] {
  const diagnostics = observation.diagnostics;
  return [
    ...buildScalarFieldProjections({
      dataTypeKey: "hydrology.climate.rainfall",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: observation.climateField.rainfall },
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
      field: { format: "u8", values: observation.climateField.humidity },
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
      field: { format: "f32", values: observation.climateIndices.surfaceTemperatureC },
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
      field: { format: "f32", values: observation.climateIndices.pet },
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
      field: { format: "f32", values: observation.climateIndices.effectiveMoisture },
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
      field: { format: "f32", values: observation.climateIndices.aridityIndex },
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
      field: { format: "f32", values: observation.climateIndices.freezeIndex },
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
      field: { format: "u8", values: observation.cryosphere.snowCover },
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
      field: { format: "u8", values: observation.cryosphere.seaIceCover },
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
      field: { format: "u8", values: observation.cryosphere.albedo },
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
      field: { format: "f32", values: observation.cryosphere.groundIce01 },
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
      field: { format: "f32", values: observation.cryosphere.permafrost01 },
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
      field: { format: "f32", values: observation.cryosphere.meltPotential01 },
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
      field: { format: "f32", values: diagnostics.rainShadowIndex },
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
      field: { format: "f32", values: diagnostics.continentalityIndex },
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
      field: { format: "f32", values: diagnostics.convergenceIndex },
      meta: defineStandardVizMeta(
        "hydrology.climate.diagnostics.convergenceIndex",
        "field.signed",
        { label: "Convergence Index", group: GROUP_DIAGNOSTICS, visibility: "debug" }
      ),
    },
  ];
}
