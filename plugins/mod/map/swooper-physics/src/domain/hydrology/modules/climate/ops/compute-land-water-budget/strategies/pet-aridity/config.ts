import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Balances supplied Climate demand against precipitation; calibration is owned by baseline climate. */
export default defineStrategy({
  id: "pet-aridity",
  config: Type.Object({}, {
    additionalProperties: false,
    description: "Balances supplied precipitation and potential demand into terrestrial moisture and aridity.",
  }),
});
