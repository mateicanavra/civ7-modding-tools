import { type Static, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

/** Coeval pressure, winds and currents from one weather member or reduced phase. */
export const AtmosphericSampleSchema = Type.Object({
  pressure: TypedArraySchemas.f32({ description: "Pressure anomaly in hPa." }),
  windU: TypedArraySchemas.i8({ description: "Zonal atmospheric vector component." }),
  windV: TypedArraySchemas.i8({ description: "Meridional atmospheric vector component." }),
  currentU: TypedArraySchemas.i8({ description: "Zonal ocean-current vector component." }),
  currentV: TypedArraySchemas.i8({ description: "Meridional ocean-current vector component." }),
}, { additionalProperties: false });
export type AtmosphericSample = Static<typeof AtmosphericSampleSchema>;
