import { type Static, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

/** Plate identifier for every mesh cell in one reconstructed tectonic era. */
export const PlateMembershipSchema = TypedArraySchemas.i16({
  cardinality: null,
  description: "Plate identifier for every mesh cell in one reconstructed tectonic era.",
});

/** Mesh-cell plate membership for one reconstructed tectonic era. */
export type PlateMembership = Static<typeof PlateMembershipSchema>;
