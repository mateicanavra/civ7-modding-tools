import { artifacts as climateArtifacts } from "../../../../../../../../domain/hydrology/modules/climate/artifacts/index.js";
import type { ArtifactReadValueOf } from "@swooper/mapgen-core/authoring";
import { estimateCurlZOddQ, estimateDivergenceOddQ } from "@swooper/mapgen-core/lib/grid";
import {
  buildScalarFieldProjections,
  buildVectorFieldProjections,
  type VizDims,
  type VizProjection,
  type VizScalarSource,
} from "@swooper/mapgen-viz";
import { defineStandardVizMeta } from "../../../../../../viz.js";

const GROUP_SEASONALITY = "Hydrology / Seasonality";
const GROUP_CLIMATE = "Hydrology / Climate";
const GROUP_WIND = "Hydrology / Wind";
const GROUP_CURRENT = "Hydrology / Currents";
const GROUP_OCEAN = "Hydrology / Ocean";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

type BaselineClimateField = ArtifactReadValueOf<typeof climateArtifacts.baselineClimateField>;
type WindField = ArtifactReadValueOf<typeof climateArtifacts.windField>;
type Uint8VizValues = Extract<VizScalarSource, { format: "u8" }>["values"];
type Int8VizValues = Extract<VizScalarSource, { format: "i8" }>["values"];
type Uint16VizValues = Extract<VizScalarSource, { format: "u16" }>["values"];
type Int32VizValues = Extract<VizScalarSource, { format: "i32" }>["values"];
type Float32VizValues = Extract<VizScalarSource, { format: "f32" }>["values"];

/** Completed baseline-climate evidence observed by the optional visualization facet. */
type ClimateBaselineVizEvidence = Readonly<{
  baselineClimateField: BaselineClimateField;
  seasonalAmplitudes: Readonly<{
    rainfallAmplitude: Uint8VizValues;
    humidityAmplitude: Uint8VizValues;
  }>;
  windField: WindField;
  currentField: Readonly<{
    currentU: Int8VizValues;
    currentV: Int8VizValues;
  }>;
  seasonalRainfall: readonly Uint8VizValues[];
  seasonalHumidity: readonly Uint8VizValues[];
  seasonalWindU: readonly Int8VizValues[];
  seasonalWindV: readonly Int8VizValues[];
  seasonalCurrentU: readonly Int8VizValues[];
  seasonalCurrentV: readonly Int8VizValues[];
  oceanGeometry: Readonly<{
    basinId: Int32VizValues;
    coastDistance: Uint16VizValues;
    coastTangentU: Int8VizValues;
    coastTangentV: Int8VizValues;
  }> | null;
  oceanThermal: Readonly<{
    sstC: Float32VizValues;
    seaIceMask: Uint8VizValues;
  }> | null;
}>;

function toFloat32(values: ArrayLike<number>): Float32Array {
  const projected = new Float32Array(values.length);
  for (let index = 0; index < values.length; index += 1) projected[index] = values[index] ?? 0;
  return projected;
}

/**
 * Projects completed baseline climate evidence without observing the runtime context or artifact
 * store. Producer arrays remain authoritative; only sampled and diagnostic views allocate.
 */
export function buildClimateBaselineVizProjections(
  observation: ClimateBaselineVizEvidence,
  dimensions: VizDims
): readonly VizProjection[] {
  const projections: VizProjection[] = [];
  const { baselineClimateField, seasonalAmplitudes, windField, currentField } = observation;

  if (observation.oceanGeometry) {
    projections.push(
      ...buildScalarFieldProjections({
        dataTypeKey: "hydrology.ocean.basinId",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "i32", values: observation.oceanGeometry.basinId },
        meta: defineStandardVizMeta("hydrology.ocean.basinId", "category.distinct", {
          label: "Ocean Basin Id",
          group: GROUP_OCEAN,
          visibility: "debug",
        }),
        points: {},
      }),
      ...buildScalarFieldProjections({
        dataTypeKey: "hydrology.ocean.coastDistance",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "u16", values: observation.oceanGeometry.coastDistance },
        meta: defineStandardVizMeta("hydrology.ocean.coastDistance", "water.depth", {
          label: "Ocean Coast Distance (Water)",
          group: GROUP_OCEAN,
          visibility: "debug",
        }),
        points: {},
      }),
      ...buildVectorFieldProjections({
        dataTypeKey: "hydrology.ocean.coastFrame",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        u: { format: "i8", values: observation.oceanGeometry.coastTangentU },
        v: { format: "i8", values: observation.oceanGeometry.coastTangentV },
        meta: defineStandardVizMeta("hydrology.ocean.coastFrame", "field.intensity", {
          label: "Coast Tangent (Advisory)",
          group: GROUP_OCEAN,
          visibility: "debug",
        }),
        arrows: { maxArrowLengthTiles: 1.25 },
        points: {},
      })
    );
  }

  if (observation.oceanThermal) {
    projections.push(
      ...buildScalarFieldProjections({
        dataTypeKey: "hydrology.ocean.sstC",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "f32", values: observation.oceanThermal.sstC },
        meta: defineStandardVizMeta("hydrology.ocean.sstC", "climate.temperature", {
          label: "Ocean SST (C)",
          group: GROUP_OCEAN,
          visibility: "debug",
        }),
        points: {},
      }),
      ...buildScalarFieldProjections({
        dataTypeKey: "hydrology.ocean.seaIceMask",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "u8", values: observation.oceanThermal.seaIceMask },
        meta: defineStandardVizMeta("hydrology.ocean.seaIceMask", "category.distinct", {
          label: "Ocean Sea Ice Mask",
          group: GROUP_OCEAN,
          visibility: "debug",
        }),
        points: {},
      })
    );
  }

  const windU = toFloat32(windField.windU);
  const windV = toFloat32(windField.windV);
  const currentU = toFloat32(currentField.currentU);
  const currentV = toFloat32(currentField.currentV);
  projections.push(
    ...buildScalarFieldProjections({
      dataTypeKey: "hydrology.wind.divergence",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: {
        format: "f32",
        values: estimateDivergenceOddQ(dimensions.width, dimensions.height, windU, windV),
      },
      meta: defineStandardVizMeta("hydrology.wind.divergence", "field.signed", {
        label: "Wind Divergence (Proxy)",
        group: GROUP_WIND,
        visibility: "debug",
      }),
      points: {},
    }),
    ...buildScalarFieldProjections({
      dataTypeKey: "hydrology.wind.curlZ",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: {
        format: "f32",
        values: estimateCurlZOddQ(dimensions.width, dimensions.height, windU, windV),
      },
      meta: defineStandardVizMeta("hydrology.wind.curlZ", "field.signed", {
        label: "Wind Curl Z (Proxy)",
        group: GROUP_WIND,
        visibility: "debug",
      }),
      points: {},
    }),
    ...buildScalarFieldProjections({
      dataTypeKey: "hydrology.current.divergence",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: {
        format: "f32",
        values: estimateDivergenceOddQ(dimensions.width, dimensions.height, currentU, currentV),
      },
      meta: defineStandardVizMeta("hydrology.current.divergence", "field.signed", {
        label: "Current Divergence (Proxy)",
        group: GROUP_CURRENT,
        visibility: "debug",
      }),
      points: {},
    }),
    ...buildScalarFieldProjections({
      dataTypeKey: "hydrology.current.curlZ",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: {
        format: "f32",
        values: estimateCurlZOddQ(dimensions.width, dimensions.height, currentU, currentV),
      },
      meta: defineStandardVizMeta("hydrology.current.curlZ", "field.signed", {
        label: "Current Curl Z (Proxy)",
        group: GROUP_CURRENT,
        visibility: "debug",
      }),
      points: {},
    }),
    ...buildScalarFieldProjections({
      dataTypeKey: "hydrology.climate.rainfall",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: baselineClimateField.rainfall },
      meta: defineStandardVizMeta("hydrology.climate.rainfall", "climate.moisture", {
        label: "Rainfall (Baseline)",
        group: GROUP_CLIMATE,
      }),
      points: {},
    }),
    ...buildScalarFieldProjections({
      dataTypeKey: "hydrology.climate.humidity",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: baselineClimateField.humidity },
      meta: defineStandardVizMeta("hydrology.climate.humidity", "climate.moisture", {
        label: "Humidity (Baseline)",
        group: GROUP_CLIMATE,
        visibility: "debug",
      }),
    }),
    {
      kind: "grid",
      dataTypeKey: "hydrology.climate.seasonality.rainfallAmplitude",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: seasonalAmplitudes.rainfallAmplitude },
      meta: defineStandardVizMeta(
        "hydrology.climate.seasonality.rainfallAmplitude",
        "field.intensity",
        { label: "Rainfall Amplitude", group: GROUP_SEASONALITY }
      ),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.climate.seasonality.humidityAmplitude",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: seasonalAmplitudes.humidityAmplitude },
      meta: defineStandardVizMeta(
        "hydrology.climate.seasonality.humidityAmplitude",
        "field.intensity",
        { label: "Humidity Amplitude", group: GROUP_SEASONALITY }
      ),
    }
  );

  for (let season = 0; season < observation.seasonalRainfall.length; season += 1) {
    const rainfall = observation.seasonalRainfall[season];
    const humidity = observation.seasonalHumidity[season];
    if (!rainfall || !humidity) continue;
    projections.push(
      ...buildScalarFieldProjections({
        dataTypeKey: "hydrology.climate.rainfall",
        variantKey: `season:${season}`,
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "u8", values: rainfall },
        meta: defineStandardVizMeta("hydrology.climate.rainfall", "climate.moisture", {
          label: `Rainfall (Season ${season + 1})`,
          group: GROUP_SEASONALITY,
          visibility: "debug",
        }),
      }),
      ...buildScalarFieldProjections({
        dataTypeKey: "hydrology.climate.humidity",
        variantKey: `season:${season}`,
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "u8", values: humidity },
        meta: defineStandardVizMeta("hydrology.climate.humidity", "climate.moisture", {
          label: `Humidity (Season ${season + 1})`,
          group: GROUP_SEASONALITY,
          visibility: "debug",
        }),
      })
    );
  }

  projections.push(
    {
      kind: "grid",
      dataTypeKey: "hydrology.wind.windU",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "i8", values: windField.windU },
      meta: defineStandardVizMeta("hydrology.wind.windU", "field.signed", {
        label: "Wind U",
        group: GROUP_WIND,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.wind.windV",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "i8", values: windField.windV },
      meta: defineStandardVizMeta("hydrology.wind.windV", "field.signed", {
        label: "Wind V",
        group: GROUP_WIND,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.current.currentU",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "i8", values: currentField.currentU },
      meta: defineStandardVizMeta("hydrology.current.currentU", "field.signed", {
        label: "Current U",
        group: GROUP_CURRENT,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.current.currentV",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "i8", values: currentField.currentV },
      meta: defineStandardVizMeta("hydrology.current.currentV", "field.signed", {
        label: "Current V",
        group: GROUP_CURRENT,
        visibility: "debug",
      }),
    },
    ...buildVectorFieldProjections({
      dataTypeKey: "hydrology.wind.wind",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      u: { format: "i8", values: windField.windU },
      v: { format: "i8", values: windField.windV },
      meta: defineStandardVizMeta("hydrology.wind.wind", "field.intensity", {
        label: "Wind",
        group: GROUP_WIND,
      }),
      magnitude: { debugOnly: true },
      arrows: { maxArrowLengthTiles: 1.25 },
      points: { debugOnly: true },
    }),
    ...buildVectorFieldProjections({
      dataTypeKey: "hydrology.current.current",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      u: { format: "i8", values: currentField.currentU },
      v: { format: "i8", values: currentField.currentV },
      meta: defineStandardVizMeta("hydrology.current.current", "field.intensity", {
        label: "Current",
        group: GROUP_CURRENT,
      }),
      magnitude: { debugOnly: true },
      arrows: { maxArrowLengthTiles: 1.25 },
      points: { debugOnly: true },
    })
  );

  for (let season = 0; season < observation.seasonalWindU.length; season += 1) {
    const windSeasonU = observation.seasonalWindU[season];
    const windSeasonV = observation.seasonalWindV[season];
    const currentSeasonU = observation.seasonalCurrentU[season];
    const currentSeasonV = observation.seasonalCurrentV[season];
    if (!windSeasonU || !windSeasonV || !currentSeasonU || !currentSeasonV) continue;
    projections.push(
      ...buildVectorFieldProjections({
        dataTypeKey: "hydrology.wind.wind",
        variantKey: `season:${season}`,
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        u: { format: "i8", values: windSeasonU },
        v: { format: "i8", values: windSeasonV },
        meta: defineStandardVizMeta("hydrology.wind.wind", "field.intensity", {
          label: "Wind",
          group: GROUP_WIND,
          visibility: "debug",
        }),
        arrows: { maxArrowLengthTiles: 1.25 },
        points: {},
      }),
      ...buildVectorFieldProjections({
        dataTypeKey: "hydrology.current.current",
        variantKey: `season:${season}`,
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        u: { format: "i8", values: currentSeasonU },
        v: { format: "i8", values: currentSeasonV },
        meta: defineStandardVizMeta("hydrology.current.current", "field.intensity", {
          label: "Current",
          group: GROUP_CURRENT,
          visibility: "debug",
        }),
        arrows: { maxArrowLengthTiles: 1.25 },
        points: {},
      })
    );
  }

  return projections;
}
