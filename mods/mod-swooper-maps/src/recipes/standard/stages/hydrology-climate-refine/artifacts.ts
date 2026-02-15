import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring";

/**
 * Indices derived from climate signals intended for downstream consumption (Ecology/Narrative/Placement).
 *
 * These are advisory indices: consumers should treat them as derived products and not re-derive ad hoc indices from
 * raw rainfall/temperature unless they own the semantics and have tests locking the contract.
 */
export const HydrologyClimateIndicesSchema = Type.Object(
  {
    /** Surface temperature proxy (C); used for biome gating, freeze logic, and “cold/warm” narrative bias. */
    surfaceTemperatureC: TypedArraySchemas.f32({ description: "Surface temperature proxy (C)." }),
    /**
     * Effective moisture advisory index in "moisture units" (similar scale to rainfall/humidity u8 signals).
     *
     * Semantics are intentionally stable for Ecology consumers:
     * `effectiveMoisture = rainfall + 0.35 * humidity + riparianBonus` where riparianBonus is 0/4/8 for
     * none/minor/major rivers within radius 1.
     */
    effectiveMoisture: TypedArraySchemas.f32({
      description:
        "Effective moisture advisory index (rainfall + 0.35 * humidity + riparian bonus; radius=1; minor=4, major=8).",
    }),
    /** Potential evapotranspiration proxy (rainfall units); advisory signal used for aridity. */
    pet: TypedArraySchemas.f32({ description: "Potential evapotranspiration proxy (rainfall units)." }),
    /** Aridity index (0..1) derived from P vs PET; higher values indicate drier climates. */
    aridityIndex: TypedArraySchemas.f32({ description: "Aridity index (0..1) derived from P vs PET." }),
    /** Freeze persistence index (0..1); higher values indicate more persistent freezing conditions. */
    freezeIndex: TypedArraySchemas.f32({ description: "Freeze persistence index (0..1)." }),
  },
  {
    description: "Hydrology climate indices derived from rainfall/temperature and related proxies.",
  }
);

/**
 * Cryosphere state products (snow/sea-ice/albedo proxies).
 *
 * When `cryosphere` knob is `"off"`, these layers are still published but intentionally neutralized by config.
 */
export const HydrologyCryosphereSchema = Type.Object(
  {
    /** Snow cover fraction (0..255) per tile. */
    snowCover: TypedArraySchemas.u8({ description: "Snow cover fraction (0..255) per tile." }),
    /** Sea ice cover fraction (0..255) per tile. */
    seaIceCover: TypedArraySchemas.u8({ description: "Sea ice cover fraction (0..255) per tile." }),
    /** Albedo proxy (0..255) per tile; may feed bounded albedo feedback into temperature refinement. */
    albedo: TypedArraySchemas.u8({ description: "Albedo proxy (0..255) per tile." }),
    /** Ground ice persistence proxy (0..1) per tile; land-only. */
    groundIce01: TypedArraySchemas.f32({ description: "Ground ice persistence proxy (0..1) per tile; land-only." }),
    /** Permafrost proxy (0..1) per tile; land-only. */
    permafrost01: TypedArraySchemas.f32({ description: "Permafrost proxy (0..1) per tile; land-only." }),
    /** Melt potential proxy (0..1) per tile; land-only and snow-weighted. */
    meltPotential01: TypedArraySchemas.f32({ description: "Melt potential proxy (0..1) per tile; land-only." }),
  },
  {
    description: "Hydrology cryosphere state products (snow/sea-ice/albedo + cryosphere truth proxies).",
  }
);

/**
 * Diagnostics derived during Hydrology refinement.
 *
 * These are explicitly *not* Hydrology internal truth; they are projections that support debugging, tuning, and
 * downstream heuristics.
 */
export const HydrologyClimateDiagnosticsSchema = Type.Object(
  {
    /** Advisory rain shadow proxy (0..1); used for debugging and optional downstream narrative biasing. */
    rainShadowIndex: TypedArraySchemas.f32({
      description: "Advisory rain shadow proxy (0..1) per tile (diagnostic projection; not Hydrology internal truth).",
    }),
    /** Advisory continentality proxy (0..1); higher values imply more interior/continental climate. */
    continentalityIndex: TypedArraySchemas.f32({
      description: "Advisory continentality proxy (0..1) per tile (diagnostic projection; not Hydrology internal truth).",
    }),
    /** Advisory convergence proxy (0..1); indicates likely convergence zones / storm tracks. */
    convergenceIndex: TypedArraySchemas.f32({
      description: "Advisory convergence proxy (0..1) per tile (diagnostic projection; not Hydrology internal truth).",
    }),
  },
  {
    description: "Hydrology refinement diagnostics (advisory indices; not Hydrology internal truth).",
  }
);

export const hydrologyClimateRefineArtifacts = {
  climateIndices: defineArtifact({
    name: "climateIndices",
    id: "artifact:hydrology.climateIndices",
    schema: HydrologyClimateIndicesSchema,
  }),
  cryosphere: defineArtifact({
    name: "cryosphere",
    id: "artifact:hydrology.cryosphere",
    schema: HydrologyCryosphereSchema,
  }),
  climateDiagnostics: defineArtifact({
    name: "climateDiagnostics",
    id: "artifact:hydrology.climateDiagnostics",
    schema: HydrologyClimateDiagnosticsSchema,
  }),
} as const;
