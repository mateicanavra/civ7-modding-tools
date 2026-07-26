import { TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

/** Per-tile claims already held by an Ecology feature-family planner. */
export const FeatureOccupancyMaskSchema = TypedArraySchemas.u8({
  description: "0 = unoccupied, nonzero = already claimed by an Ecology feature intent.",
});

/** Per-tile reservations that no Ecology feature-family planner may claim. */
export const FeatureReservationMaskSchema = TypedArraySchemas.u8({
  description: "0 = claimable by Ecology, 1 = permanently reserved.",
});
