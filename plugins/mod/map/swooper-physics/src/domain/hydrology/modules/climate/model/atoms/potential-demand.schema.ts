import { type Static, Type } from "@swooper/mapgen-core/authoring/schema";

/** Shared empirical demand calibration, authored at baseline and carried into refinement. */
export const PotentialDemandParametersSchema = Type.Object(
  {
    tMinC: Type.Number({
      default: 0,
      minimum: -60,
      maximum: 40,
      description: "Minimum temperature for PET scaling (C).",
    }),
    tMaxC: Type.Number({
      default: 35,
      minimum: -10,
      maximum: 80,
      description: "Maximum temperature for PET scaling (C).",
    }),
    petBase: Type.Number({
      default: 18,
      minimum: 0,
      maximum: 200,
      description: "Baseline PET value (rainfall units).",
    }),
    petTemperatureWeight: Type.Number({
      default: 75,
      minimum: 0,
      maximum: 400,
      description: "Temperature contribution to PET scaling.",
    }),
    humidityDampening: Type.Number({
      default: 0.55,
      minimum: 0,
      maximum: 1,
      description: "How much humidity reduces PET (0..1).",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Climate-owned empirical potential demand in rainfall units; not a calibrated open-water evaporation law.",
  }
);

/** Admitted physical demand parameters, independent of any step or operation envelope. */
export type PotentialDemandParameters = Static<typeof PotentialDemandParametersSchema>;
