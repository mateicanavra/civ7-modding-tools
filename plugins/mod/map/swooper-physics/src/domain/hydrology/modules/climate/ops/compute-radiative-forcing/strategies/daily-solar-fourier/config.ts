import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Circular-orbit daily solar geometry; quadrature resolution is numerical policy, not tuning. */
export default defineStrategy({
  id: "daily-solar-fourier",
  config: Type.Object({}, { additionalProperties: false }),
});
