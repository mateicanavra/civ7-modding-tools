import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Numerical periodic sampling resolution, separate from the requested observation count. */
export default defineStrategy({
  id: "periodic-cycle",
  config: Type.Object({
    phaseCount: Type.Union([Type.Literal(12), Type.Literal(24), Type.Literal(48), Type.Literal(96)], {
      default: 24,
      description: "Numerical atmospheric quadrature resolution for qualification, not a physical seasonality control.",
    }),
  }, {
    additionalProperties: false,
    description: "Uniform orbital-phase integration resolution with separate two- or four-phase observations.",
  }),
});
