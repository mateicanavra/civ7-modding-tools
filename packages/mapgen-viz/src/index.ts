export type VizScalarFormat = "u8" | "i8" | "u16" | "i16" | "i32" | "f32";

export type VizLayerVisibility = "default" | "debug" | "hidden";

export type VizPaletteMode = "auto" | "categorical" | "continuous";

export type VizLayerKind = "grid" | "points" | "segments" | "gridFields";

export type VizSpaceId = "tile.hexOddR" | "tile.hexOddQ" | "mesh.world" | "world.xy";

export type VizScaleType = "categorical" | "linear" | "log" | "symlog" | "quantile";

export type VizNoDataSpec =
  | { kind: "none" }
  | { kind: "sentinel"; value: number }
  | { kind: "nan" };

export type VizValueDomain =
  | { kind: "unit"; min: 0; max: 1 }
  | { kind: "explicit"; min: number; max: number }
  | { kind: "fromStats" };

export type VizValueTransform =
  | { kind: "identity" }
  | { kind: "clamp"; min: number; max: number }
  | { kind: "normalize"; domain: VizValueDomain }
  | { kind: "affine"; scale: number; offset: number }
  | { kind: "piecewise"; points: Array<{ x: number; y: number }> };

export type VizValueSpec = {
  scale: VizScaleType;
  domain: VizValueDomain;
  noData?: VizNoDataSpec;
  transform?: VizValueTransform;
  units?: string;
};

export type VizScalarStats = {
  min: number;
  max: number;
  mean?: number;
  stddev?: number;
};

