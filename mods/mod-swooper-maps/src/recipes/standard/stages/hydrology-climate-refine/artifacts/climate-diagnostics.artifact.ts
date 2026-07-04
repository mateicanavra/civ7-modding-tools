import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

export const HydrologyClimateDiagnosticsSchema = Type.Object(
  {
    /** Advisory rain shadow proxy (0..1); used for debugging and optional downstream narrative biasing. */
    rainShadowIndex: TypedArraySchemas.f32({
      description:
        "Advisory rain shadow proxy (0..1) per tile (diagnostic projection; not Hydrology internal truth).",
    }),
    /** Advisory continentality proxy (0..1); higher values imply more interior/continental climate. */
    continentalityIndex: TypedArraySchemas.f32({
      description:
        "Advisory continentality proxy (0..1) per tile (diagnostic projection; not Hydrology internal truth).",
    }),
    /** Advisory convergence proxy (0..1); indicates likely convergence zones / storm tracks. */
    convergenceIndex: TypedArraySchemas.f32({
      description:
        "Advisory convergence proxy (0..1) per tile (diagnostic projection; not Hydrology internal truth).",
    }),
  },
  {
    description:
      "Hydrology refinement diagnostics (advisory indices; not Hydrology internal truth).",
  }
);

export const Schema = HydrologyClimateDiagnosticsSchema;

export const artifact = defineArtifact({
  name: "climateDiagnostics",
  id: "artifact:hydrology.climateDiagnostics",
  schema: Schema,
});
