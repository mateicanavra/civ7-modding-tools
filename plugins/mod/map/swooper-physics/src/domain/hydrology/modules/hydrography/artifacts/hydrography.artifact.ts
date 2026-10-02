import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/** Physical water-network truth; native observations never replace this product. */
export const artifact = defineArtifact({
  name: "hydrography",
  id: "artifact:hydrology.hydrography",
  schema: Type.Object({
    model: Type.Literal("certified-sill-spill"),
    exposedLandMask: TypedArraySchemas.u8({
      cardinality: "map-grid",
      description: "Resolved dry finite ground: excludes prescribed external water and every stationary finite wet cell. Initial wetness does not determine final exposure.",
    }),
    riverClass: TypedArraySchemas.u8({
      cardinality: "map-grid",
      description: "Physical river class: 0 none, 1 minor, 2 major; not native navigability.",
    }),
    flowDir: TypedArraySchemas.i32({
      cardinality: "map-grid",
      description: "Ordinary/principal receiver: adjacent channel, -1 terminal/marine, or certified -2 component-internal sentinel. Complete hydraulic exchange belongs to lakePlan, not this grid.",
    }),
    basinId: TypedArraySchemas.i32({
      cardinality: "map-grid",
      description: "Deterministic final terminal-catchment identity; -1 on marine cells, never depression leaf or wet body identity.",
    }),
    terminalType: TypedArraySchemas.u8({
      cardinality: "map-grid",
      description: "Resolved source role: 0 marine/non-source, 1 marine, 2 boundary export, 3 closed wet, 4 subtile, 5 dry.",
    }),
    runoff: Type.Array(Type.Number({ minimum: 0 }), {
      description: "Map-grid local precipitation-attributed runoff at Number precision; zero on prescribed external water. Finite wet cells replace this supply with their wet budget.",
    }),
    discharge: Type.Array(Type.Number({ minimum: 0 }), {
      description: "Map-grid Number-precision ordinary/principal dry-edge flux, not a junction's total transfers. Zero wet/marine entries are sentinels; lakePlan owns complete exchange and boundary export.",
    }),
  }, { additionalProperties: false }),
  refine: (value, { issues }) => {
    if (value.exposedLandMask.some((cell) => cell !== 0 && cell !== 1))
      issues.add("Expected binary hydrography.exposedLandMask.");
    for (const key of ["runoff", "discharge"] as const) {
      if (value[key].length !== value.flowDir.length)
        issues.add(`Expected map-grid hydrography.${key} length.`);
      if (value[key].some((cell) => !Number.isFinite(cell) || cell < 0))
        issues.add(`Expected finite nonnegative hydrography.${key}.`);
    }
    if (value.riverClass.some((cell) => cell > 2)) issues.add("Invalid hydrography.riverClass.");
    if (
      value.flowDir.some((dest, cell) => dest < 0 && value.riverClass[cell] !== 0)
    )
      issues.add("Certified river classes require an adjacent principal edge.");
    if (value.terminalType.some((cell) => cell > 5))
      issues.add("Invalid hydrography.terminalType.");
  },
});
