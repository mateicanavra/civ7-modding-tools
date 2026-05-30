import { Type, type Static } from "@swooper/mapgen-core/authoring";

/**
 * Plate-aware weighting for bay/fjord odds based on boundary closeness.
 */
export const CoastlinePlateBiasConfigSchema = Type.Object({
  /** Normalized closeness where coastline edits begin to respond to plate boundaries (0..1). */
  threshold: Type.Number({
    description:
      "Normalized closeness where coastline edits begin to respond to plate boundaries (0..1).",
    default: 0.45,
    minimum: 0,
    maximum: 1,
  }),
  /**
   * Exponent shaping how quickly bias ramps after the threshold.
   * Values >1 concentrate effects near boundaries; <1 spreads them wider.
   */
  power: Type.Number({
    description:
      "Exponent shaping how quickly bias ramps after the threshold; >1 concentrates effects near boundaries.",
    default: 1.25,
    minimum: 0,
  }),
  /** Bias multiplier for convergent boundaries; positive values encourage dramatic coasts and fjords. */
  convergent: Type.Number({
    description:
      "Bias multiplier for convergent boundaries; positive values encourage dramatic coasts and fjords.",
    default: 1.0,
  }),
  /** Bias multiplier for transform boundaries; lower values soften edits along shear zones. */
  transform: Type.Number({
    description:
      "Bias multiplier for transform boundaries; lower values soften edits along shear zones.",
    default: 0.4,
  }),
  /** Bias multiplier for divergent boundaries; negative values discourage ruggedization along rifts. */
  divergent: Type.Number({
    description:
      "Bias multiplier for divergent boundaries; negative values discourage ruggedization along rifts.",
    default: -0.6,
  }),
  /** Residual bias for interior coasts away from boundaries; typically near zero. */
  interior: Type.Number({
    description: "Residual bias for interior coasts away from boundaries; typically near zero.",
    default: 0,
  }),
  /** Strength applied to bay denominators; higher values increase bay carving where bias is positive. */
  bayWeight: Type.Number({
    description:
      "Strength applied to bay denominators; higher values increase bay carving where bias is positive.",
    default: 0.35,
    minimum: 0,
  }),
  /** Extra noise gate reduction when bias is positive, allowing smaller bays near active margins. */
  bayNoiseBonus: Type.Number({
    description:
      "Extra noise gate reduction when bias is positive, allowing smaller bays near active margins.",
    default: 1.0,
    minimum: 0,
  }),
  /** Strength applied to fjord denominators; higher values create more fjords along favored coasts. */
  fjordWeight: Type.Number({
    description:
      "Strength applied to fjord denominators; higher values create more fjords along favored coasts.",
    default: 0.8,
    minimum: 0,
  }),
});

/**
 * Bay configuration (gentle coastal indentations).
 */
export const CoastlineBayConfigSchema = Type.Object({
  /** Extra noise threshold on larger maps; higher values reduce bay frequency while keeping size larger. */
  noiseGateAdd: Type.Number({
    description:
      "Extra noise threshold on larger maps; higher values reduce bay frequency while keeping size larger.",
    default: 0,
  }),
  /** Bay frequency on active margins; lower denominators produce more bays along energetic coasts. */
  rollDenActive: Type.Number({
    description:
      "Bay frequency on active margins; lower denominators produce more bays along energetic coasts.",
    default: 4,
    minimum: 1,
  }),
  /** Bay frequency on passive margins; lower denominators carve more bays in calm regions. */
  rollDenDefault: Type.Number({
    description:
      "Bay frequency on passive margins; lower denominators carve more bays in calm regions.",
    default: 5,
    minimum: 1,
  }),
});

/**
 * Fjord configuration (deep, narrow inlets along steep margins).
 */
export const CoastlineFjordConfigSchema = Type.Object({
  /** Base fjord frequency; smaller values increase fjord count across the map. */
  baseDenom: Type.Number({
    description: "Base fjord frequency; smaller values increase fjord count across the map.",
    default: 12,
    minimum: 1,
  }),
  /** Bonus applied on active convergent margins; subtracts from baseDenom to amplify fjord density. */
  activeBonus: Type.Number({
    description:
      "Bonus applied on active convergent margins; subtracts from baseDenom to amplify fjord density.",
    default: 1,
    minimum: 0,
  }),
  /** Bonus applied on passive shelves; subtracts from baseDenom for gentler fjords. */
  passiveBonus: Type.Number({
    description: "Bonus applied on passive shelves; subtracts from baseDenom for gentler fjords.",
    default: 2,
    minimum: 0,
  }),
});

export const CoastConfigSchema = Type.Object({
  bay: CoastlineBayConfigSchema,
  fjord: CoastlineFjordConfigSchema,
  plateBias: CoastlinePlateBiasConfigSchema,
});

export const CoastlineMetricsConfigSchema = Type.Object(
  {
    coast: CoastConfigSchema,
  },
  {
    description: "Coastline carving controls.",
  }
);

export type CoastConfig = Static<typeof CoastConfigSchema>;

export type CoastlinePlateBiasConfig = Static<
  (typeof CoastConfigSchema)["properties"]["plateBias"]
>;

export type CoastlineBayConfig = Static<(typeof CoastConfigSchema)["properties"]["bay"]>;

export type CoastlineFjordConfig = Static<(typeof CoastConfigSchema)["properties"]["fjord"]>;
