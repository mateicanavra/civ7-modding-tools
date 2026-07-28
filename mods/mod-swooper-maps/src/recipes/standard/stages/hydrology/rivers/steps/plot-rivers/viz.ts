import type { VizDims, VizProjection, VizScalarSource } from "@swooper/mapgen-viz";
import { defineStandardVizMeta } from "../../../../../viz.js";

const GROUP_MAP_RIVERS = "Map / Rivers (Engine)";
const TILE_SPACE_ID = "tile.hexOddQ" as const;
type Uint8VizValues = Extract<VizScalarSource, { format: "u8" }>["values"];
type Float32VizValues = Extract<VizScalarSource, { format: "f32" }>["values"];

/** Completed Hydrology intent and Civ7 river readback observed by the visualization facet. */
export type PlotRiversVizEvidence = Readonly<{
  riverClass: Uint8VizValues;
  discharge: Float32VizValues;
  materialized: Readonly<{
    riverMask: Uint8VizValues;
    plannedMinorRiverMask: Uint8VizValues;
    plannedMajorRiverMask: Uint8VizValues;
  }>;
  topographyLandMask: Uint8VizValues;
  engineEvidence: Readonly<{
    riverReadback: Readonly<{
      terrainNavigableRiverMask: Uint8VizValues;
      engineNavigableRiverMask: Uint8VizValues;
      navigableRiverMismatchMask: Uint8VizValues;
      engineMinorRiverMask: Uint8VizValues;
    }>;
  }>;
}>;

/**
 * Projects completed river intent and readback evidence without touching Civ7.
 */
export function buildPlotRiversVizProjections(
  observation: PlotRiversVizEvidence,
  dimensions: VizDims
): readonly VizProjection[] {
  const projections: VizProjection[] = [
    {
      kind: "grid",
      dataTypeKey: "map.rivers.riverClass",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: observation.riverClass },
      meta: defineStandardVizMeta("map.rivers.riverClass", "category.distinct", {
        label: "River Class (Hydrology)",
        group: GROUP_MAP_RIVERS,
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "map.rivers.discharge",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "f32", values: observation.discharge },
      meta: defineStandardVizMeta("map.rivers.discharge", "field.intensity", {
        label: "River Discharge (Hydrology)",
        group: GROUP_MAP_RIVERS,
        visibility: "debug",
      }),
    },
  ];
  const { riverReadback } = observation.engineEvidence;
  projections.push(
    {
      kind: "grid",
      dataTypeKey: "map.rivers.projectedRiverMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: observation.materialized.riverMask },
      meta: defineStandardVizMeta("map.rivers.projectedRiverMask", "category.distinct", {
        label: "Navigable River Mask (Projected)",
        group: GROUP_MAP_RIVERS,
        role: "projection",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "map.rivers.plannedMinorRiverMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: observation.materialized.plannedMinorRiverMask },
      meta: defineStandardVizMeta("map.rivers.plannedMinorRiverMask", "category.distinct", {
        label: "Minor River Mask (Hydrology Intent)",
        group: GROUP_MAP_RIVERS,
        role: "physics",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "map.rivers.plannedMajorRiverMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: observation.materialized.plannedMajorRiverMask },
      meta: defineStandardVizMeta("map.rivers.plannedMajorRiverMask", "category.distinct", {
        label: "Major River Mask (Hydrology Intent)",
        group: GROUP_MAP_RIVERS,
        role: "physics",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "map.rivers.engineRiverMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: riverReadback.terrainNavigableRiverMask },
      meta: defineStandardVizMeta("map.rivers.engineRiverMask", "category.distinct", {
        label: "Navigable River Terrain (Engine)",
        group: GROUP_MAP_RIVERS,
        role: "engine",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "map.rivers.engineNavigableRiverMetadataMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: riverReadback.engineNavigableRiverMask },
      meta: defineStandardVizMeta(
        "map.rivers.engineNavigableRiverMetadataMask",
        "category.distinct",
        {
          label: "Navigable River Metadata (Engine)",
          group: GROUP_MAP_RIVERS,
          visibility: "debug",
          role: "engine",
        }
      ),
    },
    {
      kind: "grid",
      dataTypeKey: "map.rivers.riverMismatchMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: riverReadback.navigableRiverMismatchMask },
      meta: defineStandardVizMeta("map.rivers.riverMismatchMask", "category.distinct", {
        label: "River Mismatch Mask",
        group: GROUP_MAP_RIVERS,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "map.rivers.engineMinorRiverMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: riverReadback.engineMinorRiverMask },
      meta: defineStandardVizMeta("map.rivers.engineMinorRiverMask", "category.distinct", {
        label: "Minor River Mask (Engine Readback)",
        group: GROUP_MAP_RIVERS,
        visibility: "debug",
        role: "engine",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "morphology.topography.landMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: observation.topographyLandMask },
      meta: defineStandardVizMeta("morphology.topography.landMask", "category.distinct", {
        label: "Land Mask (Final Morphology)",
        group: GROUP_MAP_RIVERS,
        role: "physics",
        visibility: "debug",
      }),
    }
  );
  return projections;
}
