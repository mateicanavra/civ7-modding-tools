import { type Static, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

/** Origin mesh-cell index carried by every advected tracer in one tectonic era. */
export const TracerIndexSchema = TypedArraySchemas.u32({
  cardinality: "constructor-only",
  description: "Origin mesh-cell index carried by every advected tracer in one tectonic era.",
});

/** Source-cell lineage for every mesh cell in one reconstructed era. */
export type TracerIndex = Static<typeof TracerIndexSchema>;
