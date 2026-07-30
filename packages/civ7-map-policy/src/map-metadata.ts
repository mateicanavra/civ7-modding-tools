import { type TSchema, type TSchemaOptions, Type } from "typebox";
import { Value } from "typebox/value";
import {
  CIV7_MAP_INFO_COLUMN_DESCRIPTORS,
  CIV7_STANDARD_MAP_INFO_ROWS,
} from "./map-metadata.gen.js";

export {
  CIV7_MAP_INFO_BOOLEAN_KEYS,
  CIV7_MAP_INFO_COLUMN_DESCRIPTORS,
  CIV7_MAP_INFO_KEYS,
  CIV7_MAP_INFO_NULLABLE_KEYS,
  CIV7_MAP_INFO_NUMBER_KEYS,
  CIV7_MAP_INFO_STRING_KEYS,
  CIV7_STANDARD_MAP_METADATA_SOURCE,
} from "./map-metadata.gen.js";

type Civ7MapInfoColumnDescriptor = (typeof CIV7_MAP_INFO_COLUMN_DESCRIPTORS)[number];
type Civ7MapInfoColumnKey = Civ7MapInfoColumnDescriptor["name"];
type Civ7MapInfoSqlValue<Descriptor extends Civ7MapInfoColumnDescriptor> =
  Descriptor["sqlType"] extends "BOOLEAN"
    ? boolean
    : Descriptor["sqlType"] extends "INTEGER"
      ? number
      : string;
type Civ7MapInfoColumnValue<Descriptor extends Civ7MapInfoColumnDescriptor> =
  Descriptor["nullable"] extends true
    ? Civ7MapInfoSqlValue<Descriptor> | null
    : Civ7MapInfoSqlValue<Descriptor>;

type Civ7MapInfoProperties = Readonly<{
  [Descriptor in Civ7MapInfoColumnDescriptor as Descriptor["name"]]: Civ7MapInfoColumnValue<Descriptor>;
}>;

const Civ7MapInfoSchemaProperties = Object.fromEntries(
  CIV7_MAP_INFO_COLUMN_DESCRIPTORS.map((descriptor) => [
    descriptor.name,
    mapInfoColumnSchema(descriptor),
  ])
) as Record<Civ7MapInfoColumnKey, TSchema>;

const Civ7MapInfoObjectSchema = Type.Object(Civ7MapInfoSchemaProperties, {
  additionalProperties: false,
  description:
    "Complete detached Civ7 GameInfo.Maps row admitted as static map-generation policy evidence.",
});

/** Complete detached Civ7 `GameInfo.Maps` row admitted by map policy. */
export type Civ7MapInfo = Civ7MapInfoProperties;

/** Complete detached Civ7 `GameInfo.Maps` row admitted by map policy. */
export const Civ7MapInfoSchema = Type.Unsafe<Civ7MapInfo>(Type.Immutable(Civ7MapInfoObjectSchema));

/** Official Standard map-size identity derived from the current Civ7 resource catalog. */
export type Civ7StandardMapSizeId = (typeof CIV7_STANDARD_MAP_INFO_ROWS)[number]["MapSizeType"];

const CIV7_STANDARD_MAP_SIZE_IDS = Object.freeze(
  CIV7_STANDARD_MAP_INFO_ROWS.map(({ MapSizeType }) => MapSizeType)
);

/** Official Standard map-size identities admitted by the generated policy catalog. */
export const Civ7StandardMapSizeIdSchema = Type.Enum(CIV7_STANDARD_MAP_SIZE_IDS, {
  description: "Official Civ7 Standard map-size identity.",
});

/** Complete official Standard `GameInfo.Maps` row. */
export type Civ7StandardMapInfo = Readonly<
  Omit<Civ7MapInfo, "MapSizeType"> & { MapSizeType: Civ7StandardMapSizeId }
>;

/** Complete official Standard `GameInfo.Maps` row. */
export const Civ7StandardMapInfoSchema = Type.Unsafe<Civ7StandardMapInfo>(
  Type.Immutable(
    Type.Object(
      {
        ...Civ7MapInfoObjectSchema.properties,
        MapSizeType: Civ7StandardMapSizeIdSchema,
      },
      {
        additionalProperties: false,
        description:
          "Complete static map metadata for one selectable official Civ7 Standard map size.",
      }
    )
  )
);

/** Admits and detaches one complete official-shape Standard `GameInfo.Maps` row. */
export function admitCiv7StandardMapInfo(value: unknown): Civ7StandardMapInfo {
  if (!Value.Check(Civ7StandardMapInfoSchema, value)) {
    throw new TypeError("Civ7 Standard map info must match the complete generated column schema.");
  }
  return Object.freeze(Value.Clone(value)) as Civ7StandardMapInfo;
}

/** South-to-north interpolation endpoints used by Civ7's row-coordinate latitude API. */
export type Civ7RowLatitudeEndpoints = Readonly<{
  firstRowLatitude: number;
  exclusiveEndLatitude: number;
}>;

/** Source-backed Standard map-size row plus convenient derived generation facts. */
export type Civ7StandardMapSizePreset = Readonly<{
  id: Civ7StandardMapSizeId;
  label: string;
  dimensions: Readonly<{ width: number; height: number }>;
  defaultPlayers: number;
  rowLatitudeEndpoints: Civ7RowLatitudeEndpoints;
  mapInfo: Civ7StandardMapInfo;
}>;

/** Civ7's south-to-north row-latitude interpolation endpoints for Standard maps. */
export const CIV7_STANDARD_ROW_LATITUDE_ENDPOINTS: Civ7RowLatitudeEndpoints = Object.freeze({
  firstRowLatitude: -90,
  exclusiveEndLatitude: 90,
});

const STANDARD_84X54_ROW_LATITUDES = Object.freeze([
  -90, -89, -85, -81, -78, -74, -71, -69, -65, -62, -58, -54, -51, -47, -45, -42, -38, -35, -31,
  -27, -24, -22, -18, -15, -11, -8, -4, 0, 1, 5, 9, 12, 16, 19, 21, 25, 28, 32, 36, 39, 43, 45, 48,
  52, 55, 59, 63, 66, 68, 72, 75, 79, 82, 86,
] as const);

const HUGE_106X66_ROW_LATITUDES = Object.freeze([
  -90, -89, -85, -83, -80, -78, -74, -72, -69, -67, -63, -62, -58, -56, -53, -51, -47, -45, -42,
  -40, -36, -35, -31, -29, -26, -24, -20, -18, -15, -13, -9, -8, -4, 0, 1, 5, 7, 10, 12, 16, 18, 21,
  23, 27, 28, 32, 34, 37, 39, 43, 45, 48, 50, 54, 55, 59, 61, 64, 66, 70, 72, 75, 77, 81, 82, 86,
] as const);

/** Canonical Civ7 standard map-size presets in game selection order. */
export const CIV7_STANDARD_MAP_SIZE_PRESETS: readonly Civ7StandardMapSizePreset[] = Object.freeze(
  CIV7_STANDARD_MAP_INFO_ROWS.map((mapInfo) =>
    Object.freeze({
      id: mapInfo.MapSizeType,
      label: formatStandardMapSizeLabel(mapInfo.MapSizeType),
      dimensions: Object.freeze({ width: mapInfo.GridWidth, height: mapInfo.GridHeight }),
      defaultPlayers: mapInfo.DefaultPlayers,
      rowLatitudeEndpoints: CIV7_STANDARD_ROW_LATITUDE_ENDPOINTS,
      mapInfo,
    })
  )
);

function formatStandardMapSizeLabel(id: Civ7StandardMapSizeId): string {
  return id
    .slice("MAPSIZE_".length)
    .toLowerCase()
    .replace(
      /(^|_)([a-z])/g,
      (_, prefix: string, letter: string) => `${prefix ? " " : ""}${letter.toUpperCase()}`
    );
}

/** Resolves metadata for a validated Civ7 standard map-size id. */
export function getCiv7StandardMapSizePreset(id: Civ7StandardMapSizeId): Civ7StandardMapSizePreset {
  const preset = CIV7_STANDARD_MAP_SIZE_PRESETS.find((candidate) => candidate.id === id);
  if (!preset) throw new RangeError(`Unknown Civ7 Standard map-size id: ${id}`);
  return preset;
}

/** Finds standard map metadata for a runtime id, or null when the id is not in the catalog. */
export function findCiv7StandardMapSizePreset(
  id: string | number
): Civ7StandardMapSizePreset | null {
  if (typeof id !== "string") return null;
  return CIV7_STANDARD_MAP_SIZE_PRESETS.find((preset) => preset.id === id) ?? null;
}

/** Resolves the official preset named by a detached `GameInfo.Maps` row. */
export function findCiv7StandardMapSizePresetForMapInfo(
  mapInfo: Readonly<{ MapSizeType?: unknown }> | null | undefined
): Civ7StandardMapSizePreset | null {
  return typeof mapInfo?.MapSizeType === "string"
    ? findCiv7StandardMapSizePreset(mapInfo.MapSizeType)
    : null;
}

/** Finds the official Standard preset with the exact admitted grid dimensions. */
export function getCiv7StandardMapSizePresetForDimensions(
  width: number,
  height: number
): Civ7StandardMapSizePreset | null {
  return (
    CIV7_STANDARD_MAP_SIZE_PRESETS.find(
      (preset) => preset.dimensions.width === width && preset.dimensions.height === height
    ) ?? null
  );
}

/** Interpolates one row latitude against Civ7's exclusive northward endpoint. */
export function interpolateCiv7RowLatitude(
  endpoints: Civ7RowLatitudeEndpoints,
  height: number,
  y: number
): number {
  if (height <= 0) return endpoints.firstRowLatitude;
  const row = Math.max(0, Math.min(height - 1, Math.trunc(y)));
  const t = row / height;
  return (
    endpoints.firstRowLatitude + (endpoints.exclusiveEndLatitude - endpoints.firstRowLatitude) * t
  );
}

/** Resolves a row latitude from live-observed Standard tables or bounded interpolation. */
export function getCiv7RowLatitude(
  endpoints: Civ7RowLatitudeEndpoints,
  height: number,
  y: number
): number {
  const row = Math.max(0, Math.min(height - 1, Math.trunc(y)));
  if (
    height === STANDARD_84X54_ROW_LATITUDES.length &&
    endpoints.firstRowLatitude === CIV7_STANDARD_ROW_LATITUDE_ENDPOINTS.firstRowLatitude &&
    endpoints.exclusiveEndLatitude === CIV7_STANDARD_ROW_LATITUDE_ENDPOINTS.exclusiveEndLatitude
  ) {
    return STANDARD_84X54_ROW_LATITUDES[row] ?? 0;
  }
  if (
    height === HUGE_106X66_ROW_LATITUDES.length &&
    endpoints.firstRowLatitude === CIV7_STANDARD_ROW_LATITUDE_ENDPOINTS.firstRowLatitude &&
    endpoints.exclusiveEndLatitude === CIV7_STANDARD_ROW_LATITUDE_ENDPOINTS.exclusiveEndLatitude
  ) {
    return HUGE_106X66_ROW_LATITUDES[row] ?? 0;
  }
  return interpolateCiv7RowLatitude(endpoints, height, y);
}

function mapInfoColumnSchema(descriptor: Civ7MapInfoColumnDescriptor): TSchema {
  const semanticOptions = mapInfoColumnSemanticOptions(descriptor.name);
  const metadataOptions: TSchemaOptions = descriptor.hasDefault
    ? { ...semanticOptions, default: descriptor.defaultValue }
    : semanticOptions;
  const scalarOptions = descriptor.nullable
    ? mapInfoColumnRefinementOptions(descriptor.name)
    : metadataOptions;
  const scalar =
    descriptor.sqlType === "BOOLEAN"
      ? Type.Boolean(scalarOptions)
      : descriptor.sqlType === "INTEGER"
        ? Type.Integer(scalarOptions)
        : Type.String(scalarOptions);
  return descriptor.nullable ? Type.Union([scalar, Type.Null()], metadataOptions) : scalar;
}

function mapInfoColumnSemanticOptions(name: Civ7MapInfoColumnKey): TSchemaOptions {
  const refinement = mapInfoColumnRefinementOptions(name);
  switch (name) {
    case "MapSizeType":
      return {
        ...refinement,
        description: "Stable GameInfo.Maps row identity selected for this map generation.",
      };
    case "GridWidth":
      return { ...refinement, description: "Playable map-grid width in hex columns." };
    case "GridHeight":
      return { ...refinement, description: "Playable map-grid height in hex rows." };
    case "PlayersLandmass1":
      return {
        ...refinement,
        description: "Player-start capacity assigned to Civ7's first homeland landmass.",
      };
    case "PlayersLandmass2":
      return {
        ...refinement,
        description: "Player-start capacity assigned to Civ7's second homeland landmass.",
      };
    case "Description":
      return {
        ...refinement,
        description: "Optional Civ7 localization key describing this map size.",
      };
    default:
      return refinement;
  }
}

function mapInfoColumnRefinementOptions(name: Civ7MapInfoColumnKey): TSchemaOptions {
  switch (name) {
    case "MapSizeType":
    case "Name":
    case "Description":
      return { minLength: 1 };
    case "GridWidth":
    case "GridHeight":
      return { minimum: 1 };
    default:
      return {};
  }
}
